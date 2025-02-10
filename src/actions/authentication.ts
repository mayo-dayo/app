import {
  id,
} from "@/lib/server/schema/id";

import {
  password,
} from "@/lib/server/schema/password";

import {
  username,
} from "@/lib/server/schema/username";

import {
  sign,
} from "@/lib/server/sign";

import type {
  invite,
} from "@/lib/server/types/invite";

import type {
  user,
} from "@/lib/server/types/user";

import {
  ActionError,
  defineAction,
} from "astro:actions";

import {
  z,
} from "astro:schema";

const create_token =
  //
  (
    //
    secret:
      //
      string,
    //
    user_id:
      //
      user["id"],
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
            username,

            password,
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

            const user =
              //
              database
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
                .get(username) as Pick<user, "id" | "password_hash"> | null;

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

            const token =
              //
              create_token(
                //
                secret,
                //
                user.id,
              );

            return token;
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
                id,

              username,

              password,
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
                  .get(invite_id) as Pick<invite, "perms" | "uses"> | null;

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
                    insert into 

                    users

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

            const token =
              //
              create_token(
                //
                secret,
                //
                user_id,
              );

            return token;
          },
      }),
  };
