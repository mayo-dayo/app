import {
  z,
} from "astro:schema";

import {
  ActionError,
  defineAction,
} from "astro:actions";

import {
  type database_invite,
} from "@/mayo/common/database_invite";

import {
  type database_user,
} from "@/mayo/common/database_user";

import {
  sign,
} from "@/mayo/server/crypto";

import {
  incoming_id,
  incoming_password,
  incoming_username,
} from "@/mayo/server/incoming";

const make_token =
  //
  (
    //
    secret:
      //
      string,
    //
    user_id:
      //
      database_user["id"],
  ): string =>
    JSON.stringify({
      user_id,

      signature:
        //
        sign(
          //
          secret,
          //
          user_id,
        ),
    });

export const authentication =
  //
  {
    sign_in:
      //
      defineAction({
        accept:
          //
          "form",

        input: //
          z.object({
            username:
              //
              incoming_username,

            password:
              //
              incoming_password,
          }),

        handler:
          //
          async (
            //
            input,
            //
            request,
          ) => {
            const {
              database,

              secret,
            } = request.locals.context;

            const {
              username,

              password,
            } = input;

            const user = database
              //
              .query(`
                select 

                  id, 

                  password_hash 

                from 

                  users 

                where 

                  name = ?1;
              `)
              //
              .get(username) as Pick<database_user, "id" | "password_hash"> | null;

            if (user === null) {
              throw new ActionError({
                code:
                  //
                  "PRECONDITION_FAILED",

                message:
                  //
                  "Invalid username or password.",
              });
            }

            const is_verified =
              //
              await Bun.password.verify(
                //
                password,
                //
                user.password_hash,
              );

            if (is_verified === false) {
              throw new ActionError({
                code:
                  //
                  "PRECONDITION_FAILED",

                message:
                  //
                  "Invalid username or password.",
              });
            }

            return make_token(
              //
              secret,
              //
              user.id,
            );
          },
      }),

    sign_up:
      //
      defineAction({
        accept:
          //
          "form",

        input:
          //
          z.object(
            {
              invite_id:
                //
                incoming_id,

              username:
                //
                incoming_username,

              password:
                //
                incoming_password,
            },
          ),

        handler:
          //
          async (
            //
            input,
            //
            request,
          ) => {
            const {
              database,

              secret,
            } = request.locals.context;

            const {
              invite_id,

              username,

              password,
            } = input;

            const user_id =
              //
              Bun.randomUUIDv7();

            const password_hash =
              //
              await Bun.password.hash(password);

            database.transaction(() => {
              const invite =
                //
                database
                  //
                  .query(`
                    select 

                      perms,

                      uses 

                    from 

                      invites 

                    where 

                      id = ?1
                  `)
                  //
                  .get(invite_id) as Pick<database_invite, "perms" | "uses"> | null;

              if (invite === null) {
                throw new ActionError({
                  code:
                    //
                    "PRECONDITION_FAILED",

                  message:
                    //
                    "The specified invitation does not exist.",
                });
              }

              try {
                database
                  //
                  .query(`
                    insert into users

                      (
                        id,

                        name,

                        password_hash,

                        perms
                      ) 

                    values 

                      (
                        ?1,

                        ?2,

                        ?3,

                        ?4
                      );
                  `)
                  //
                  .run(
                    //
                    user_id,
                    //
                    username,
                    //
                    password_hash,
                    //
                    invite.perms,
                  );
              } catch (e: any) {
                if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
                  throw new ActionError({
                    code:
                      //
                      "PRECONDITION_FAILED",

                    message:
                      //
                      "The specified username is already taken.",
                  });
                }

                throw e;
              }

              if (invite.uses) {
                const remaining_uses =
                  //
                  invite.uses - 1;

                if (remaining_uses < 1) {
                  database
                    //
                    .query(`
                      delete from 

                        invites 

                      where 

                        id = ?1;
                    `)
                    //
                    .run(
                      //
                      invite_id,
                    );
                } else {
                  database
                    //
                    .query(`
                      update 

                        invites 

                      set 

                        uses = ?1 

                      where 

                        id = ?2;
                    `)
                    //
                    .run(
                      //
                      remaining_uses,
                      //
                      invite_id,
                    );
                }
              }
            })();

            return make_token(
              //
              secret,
              //
              user_id,
            );
          },
      }),
  };
