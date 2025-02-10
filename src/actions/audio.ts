import {
  perms_can_remove,
  perms_can_upload,
} from "@/lib/perms";

import {
  id,
} from "@/lib/server/schema/id";

import type {
  audio as audio_ty,
} from "@/lib/server/types/audio";

import {
  audio_get_directory_path,
  audio_get_file_path_original,
  audio_page_size,
} from "@/lib/server/types/audio";

import {
  ActionError,
  defineAction,
} from "astro:actions";

import {
  z,
} from "astro:schema";

import fs from "node:fs/promises";

export const audio =
  //
  {
    create:
      //
      defineAction({
        accept:
          //
          "form",

        input:
          //
          z.object({
            data:
              //
              z
                //
                .instanceof(File)
                //
                .array()
                //
                .nonempty(),
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
              context: {
                database,

                audio_processor,
              },

              user,
            } = request.locals;

            if (user === undefined || (user.perms & perms_can_upload) === 0) {
              throw new ActionError({
                code: "UNAUTHORIZED",

                message: "Unauthorized.",
              });
            }

            const tasks =
              //
              input.data.map(async file => {
                const id =
                  //
                  Bun.randomUUIDv7();

                const time_uploaded =
                  //
                  Date.now();

                const file_name =
                  //
                  file.name;

                try {
                  await Bun.write(
                    //
                    audio_get_file_path_original(
                      {
                        id,

                        file_name,
                      },
                    ),
                    //
                    file,
                  );

                  database
                    //
                    .query(`
                      insert into 
                      
                        audio

                        (
                          id, 

                          time_uploaded,

                          file_name
                        ) 

                      values 

                        (
                          ?1,

                          ?2,

                          ?3
                        );
                    `)
                    //
                    .run(
                      //
                      id,
                      //
                      time_uploaded,
                      //
                      file_name,
                    );

                  audio_processor.run();
                } catch (e) {
                  console.log(
                    `failed to create an audio: ${e}`,
                  );

                  fs.rm(
                    //
                    audio_get_directory_path(
                      {
                        id,
                      },
                    ),
                    //
                    {
                      recursive:
                        //
                        true,

                      force:
                        //
                        true,
                    },
                  );
                }
              });

            await Promise.all(tasks);
          },
      }),

    get_one:
      //
      defineAction({
        input:
          //
          id,

        handler:
          //
          (
            //
            input,
            //
            request,
          ) => {
            const {
              context: {
                database,
              },
            } = request.locals;

            const audio =
              //
              database
                //
                .query(`
                  select

                    id,

                    time_uploaded,

                    file_name,

                    processing,

                    processing_state,

                    has_thumbnail,

                    duration,

                    size,

                    tags

                  from 

                    audio

                  where 

                    id = ?1
                `)
                //
                .get(input) as audio_ty | null;

            return audio;
          },
      }),

    get_page:
      //
      defineAction({
        input:
          //
          z
            //
            .number()
            //
            .nonnegative(),

        handler:
          //
          (
            //
            input,
            //
            request,
          ) => {
            const {
              context: {
                database,
              },
            } =
              //
              request.locals;

            const page =
              //
              database
                //
                .query(`
                  select

                    id,

                    time_uploaded,

                    file_name,

                    processing,

                    processing_state,

                    has_thumbnail,

                    duration,

                    size,

                    tags

                  from

                    audio

                  order by 

                    time_uploaded desc

                  limit 

                    ?1 

                  offset 

                    ?2;
                `)
                //
                .all(
                  //
                  audio_page_size,
                  //
                  audio_page_size * input,
                ) as audio_ty[];

            return page;
          },
      }),

    remove:
      //
      defineAction({
        input:
          //
          id,

        handler:
          //
          async (
            //
            input,
            //
            request,
          ) => {
            const {
              context: {
                database,
              },

              user,
            } = request.locals;

            if (user === undefined || (user.perms & perms_can_remove) === 0) {
              throw new ActionError({
                code: "UNAUTHORIZED",

                message: "Unauthorized.",
              });
            }

            try {
              await fs.rm(
                //
                audio_get_directory_path(
                  {
                    id:
                      //
                      input,
                  },
                ),
                //

                {
                  recursive:
                    //
                    true,

                  force:
                    //
                    true,
                },
              );

              database
                //
                .query(`
                  delete from

                    audio

                  where

                    id = ?1;
                `)
                //
                .run(input);
            } catch (e) {
              console.log(
                `failed to remove an audio: ${e}`,
              );

              throw new ActionError({
                code: "INTERNAL_SERVER_ERROR",

                message: "Internal server error.",
              });
            }
          },
      }),
  };
