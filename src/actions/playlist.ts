import {
  perms_can_playlist,
} from "@/lib/perms";

import {
  get_random_name,
} from "@/lib/server/names";

import {
  ActionError,
  defineAction,
} from "astro:actions";

export const playlist =
  //
  {
    create:
      //
      defineAction({
        handler:
          //
          (
            //
            _,
            //
            request,
          ) => {
            const {
              context: {
                database,
              },

              user,
            } = request.locals;

            if (user === undefined || (user.perms & perms_can_playlist) === 0) {
              throw new ActionError({
                code:
                  //
                  "UNAUTHORIZED",

                message:
                  //
                  "Unauthorized.",
              });
            }

            const id =
              //
              Bun.randomUUIDv7();

            const user_id =
              //
              user.id;

            const name =
              //
              get_random_name();

            const time_created =
              //
              Date.now();

            try {
              database
                //
                .query(`
                  insert into 

                    playlists

                    (
                      id,

                      user_id,

                      name,

                      time_created
                    )

                  values

                    (
                      ?1,

                      ?2,

                      ?3,

                      ?4
                    );
                `)
                .run(
                  //
                  id,
                  //
                  user_id,
                  //
                  name,
                  //
                  time_created,
                );

              console.log(`user ${user_id} created a playlist ${id}`);
            } catch (e) {
              console.log(`failed to create a playlist: ${e}`);
            }
          },
      }),
  };
