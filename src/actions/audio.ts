import {
  ActionError,
  defineAction,
} from "astro:actions";

import {
  z,
} from "astro:schema";

import path from "node:path";

import fs from "node:fs/promises";

import {
  audio_processor_run,
} from "@/audio_processor";

import {
  incoming_id,
} from "@/schema";

import type {
  database_audio,
} from "@/database";

export type read_audio =
  //
  Pick<
    //
    database_audio,
    //
    | "id"
    //
    | "file_name"
    //
    | "processing"
    //
    | "processing_state"
    //
    | "has_thumbnail"
    //
    | "duration"
    //
    | "size"
    //
    | "tags"
  >;

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

            if (user === undefined) {
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

                const directory_path =
                  //
                  path.join(
                    //
                    process.env.MAYO_DATA_PATH,
                    //
                    id,
                  );

                const file_path =
                  //
                  path.join(
                    //
                    directory_path,
                    //
                    file.name,
                  );

                try {
                  await Bun.write(
                    //
                    file_path,
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

                  fs.rm(
                    //
                    directory_path,
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
            } =
              //
              request.locals;

            const audio =
              //
              database
                //
                .query(`
                  select

                    id,

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
                .get(input) as read_audio | null;

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

            const page_size =
              //
              32;

            const page =
              //
              database
                //
                .query(`
                  select

                    id,

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
                  page_size,
                  //
                  page_size * input,
                ) as read_audio[];

            return page;
          },
      }),
  };
