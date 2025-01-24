import {
  z,
} from "astro:schema";

import {
  ActionError,
  defineAction,
} from "astro:actions";

import fs from "node:fs/promises";

import {
  incoming_id,
} from "@/mayo/server/incoming";

import {
  perms_can_upload,
} from "@/mayo/common/perms";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

import {
  database_audio_page_size,
} from "@/mayo/common/database_audio";

import {
  audio_processor_run,
} from "@/mayo/server/audio_processor";

import {
  database_audio_get_directory_path,
  database_audio_get_original_file_path,
} from "@/mayo/server/database_audio";

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

            if (
              user === undefined
              //
              || (
                  user.perms & perms_can_upload
                ) === 0
            ) {
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

                const uploader_id =
                  //
                  user.id;

                const time_uploaded =
                  //
                  Date.now();

                const file_name =
                  //
                  file.name;

                try {
                  await Bun.write(
                    //
                    database_audio_get_original_file_path({
                      id,

                      file_name,
                    }),
                    //
                    file,
                  );

                  database
                    //
                    .query(`
                      insert into audio

                        (
                          id, 

                          uploader_id, 

                          time_uploaded,

                          file_name
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
                      id,
                      //
                      uploader_id,
                      //
                      time_uploaded,
                      //
                      file_name,
                    );

                  audio_processor_run(
                    audio_processor,
                  );
                } catch (e) {
                  console.log(
                    `failed to create an audio: ${e}`,
                  );

                  fs
                    //
                    .rm(
                      //
                      database_audio_get_directory_path({
                        id,
                      }),
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

            await Promise.all(
              tasks,
            );
          },
      }),

    get_one:
      //
      defineAction({
        input:
          //
          incoming_id,

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

                    uploader_id,

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
                .get(input) as database_audio | null;

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

                    uploader_id,

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
                  database_audio_page_size,
                  //
                  database_audio_page_size * input,
                ) as database_audio[];

            return page;
          },
      }),
  };
