import {
  z,
} from "astro:schema";

import type {
  Database,
} from "bun:sqlite";

import type {
  database_audio,
} from "@/database";

import {
  database_audio_get_filesystem_directory_path,
  database_audio_thumbnail_sizes,
} from "@/database";

import os from "node:os";

import path from "node:path";

export type audio_processor =
  //
  {
    database:
      //
      Database;

    in_flight:
      //
      Set<string>;

    concurrency:
      //
      number;

    run_later:
      //
      boolean;
  };

export const audio_processor_create =
  //
  (
    database:
      //
      Database,
  ): audio_processor => {
    return {
      database,

      in_flight:
        //
        new Set(),

      concurrency:
        //
        os.cpus().length,

      run_later:
        //
        false,
    };
  };

type processor_audio =
  //
  Pick<
    //
    database_audio,
    //
    | "id"
    //
    | "file_name"
    //
    | "processing_state"
  >;

export const audio_processor_run =
  //
  (
    self:
      //
      audio_processor,
  ) => {
    const limit =
      //
      self.concurrency - self.in_flight.size;

    if (limit < 1) {
      self.run_later = true;

      return;
    }

    let audios: processor_audio[];

    try {
      const exclude =
        //
        self.in_flight
          //
          .values()
          //
          .map(audio_id => `'${audio_id}'`)
          //
          .toArray()
          //
          .join(", ");

      audios =
        //
        self.database
          //
          .query(`
             select

               id,

               file_name,

               processing_state

             from

               audio

             where

               processing = 1

               and

               id not in (${exclude})

             order by

               time_uploaded;
         `)
          //
          .all() as processor_audio[];
    } catch (e) {
      console.log(
        `failed to access the database: ${e}`,
      );

      return;
    }

    if (limit < audios.length) {
      self.run_later = true;
    }

    for (
      const audio of audios.slice(0, limit)
    ) {
      self.in_flight.add(audio.id);

      (async () => {
        try {
          const run_later =
            //
            await audio_processor_dispatch(
              //
              self,
              //
              audio,
            );

          if (run_later) {
            self.run_later = true;
          }
        } catch (e) {
          console.log(
            `failed to process ${audio.file_name} (id: ${audio.id}, state: ${audio.processing_state}): ${e}`,
          );
        } finally {
          self.in_flight.delete(audio.id);

          if (self.run_later) {
            self.run_later = false;

            audio_processor_run(
              self,
            );
          }
        }
      })();
    }
  };

const audio_processor_dispatch =
  //
  async (
    //
    self:
      //
      audio_processor,
    //
    audio:
      //
      processor_audio,
  ): Promise<boolean> => {
    switch (audio.processing_state) {
      case 0:
        await audio_processor_get_metadata(
          //
          self,
          //
          audio,
        );

        return true;

      case 2:
        await audio_processor_get_thumbnail(
          //
          self,
          //
          audio,
        );

        return true;

      case 3:
        await audio_processor_transcode(
          //
          self,
          //
          audio,
        );

        return false;

      default:
        throw new Error("unexpected processing state");
    }
  };

const audio_processor_set_processing_state_error =
  //
  (
    //
    self:
      //
      audio_processor,
    //
    audio_id:
      //
      processor_audio["id"],
  ) => {
    self.database
      //
      .query(`
        update

          audio

        set
          processing        = 0,

          processing_state  = 1

        where

          id = ?1;
      `)
      //
      .run(
        audio_id,
      );
  };

const audio_processor_get_metadata =
  //
  async (
    //
    self:
      //
      audio_processor,
    //
    audio:
      //
      processor_audio,
  ) => {
    const probe = z.object({
      streams: z
        //
        .object({
          codec_type: z.string(),
        })
        //
        .array(),

      format: z.object({
        duration: z
          //
          .string()
          //
          .transform(value =>
            //
            Math.round(parseFloat(value))
          ),

        tags: z
          //
          .record(z.string())
          //
          .transform(value =>
            //
            JSON.stringify(Object.entries(value))
          )
          //
          .optional(),
      }),
    });

    // dprint-ignore
    const proc = Bun.spawn(
      //
      [
        "ffprobe",

        "-v", "quiet",

        "-of", "json",

        "-show_entries", "format:stream_tags:stream=codec_type",

        audio.file_name,
      ], 
      //
      { 
        cwd: 
          //
          database_audio_get_filesystem_directory_path(
            audio
          ),
      }
    );

    switch (await proc.exited) {
      case 0:
        //

        break;

      case 1:
        audio_processor_set_processing_state_error(
          //
          self,
          //
          audio.id,
        );

        return;

      default:
        throw new Error("ffprobe exited with an unexpected code");
    }

    let output;

    try {
      output = probe.parse(
        await Bun.readableStreamToJSON(proc.stdout),
      );
    } catch (e) {
      throw new Error(`failed to parse ffprobe output: ${e}`);
    }

    let has_audio = false, has_video = false;

    for (const stream of output.streams) {
      switch (stream.codec_type) {
        case "audio":
          has_audio = true;

          break;

        case "video":
          has_video = true;

          break;
      }
    }

    if (!has_audio) {
      audio_processor_set_processing_state_error(
        //
        self,
        //
        audio.id,
      );

      return;
    }

    self.database
      //
      .query(`
         update

           audio


         set
           processing_state  = ?1,

           duration          = ?2,

           tags              = ?3

         where

           id = ?4;
       `)
      //
      .run(
        //
        has_video ? 2 : 3,
        //
        output.format.duration,
        //
        output.format.tags ?? null,
        //
        audio.id,
      );
  };

const audio_processor_get_thumbnail =
  //
  async (
    //
    self:
      //
      audio_processor,
    //
    audio:
      //
      processor_audio,
  ) => {
    const [
      first,

      ...remaining
    ] = database_audio_thumbnail_sizes;

    const cwd =
      //
      database_audio_get_filesystem_directory_path(audio);

    // dprint-ignore
    const proc = Bun.spawn(
      [
        "ffmpeg",

        "-loglevel", "quiet",

        "-i", audio.file_name,

        "-y",

        "-frames", "1",

        "-vf", `crop='if(gt(iw,ih),ih,iw)':'if(gt(iw,ih),ih,iw)',scale=${first}:${first}`,

        `thumbnail-${first}.webp`,
      ], { cwd }
    );

    let exit_code =
      //
      await proc.exited;

    if (exit_code === 0) {
      for (
        const [
          index,

          size,
        ] of remaining.entries()
      ) {
        // dprint-ignore
        const proc = Bun.spawn(
          [
            "ffmpeg",

            "-loglevel", "quiet",

            "-i", `thumbnail-${database_audio_thumbnail_sizes[index]}.webp`,

            "-y",

            "-vf", `scale=${size}:${size}`,

            `thumbnail-${size}.webp`,
          ], { cwd }
        );

        exit_code =
          //
          await proc.exited;

        if (exit_code === 1) {
          break;
        }
      }
    }

    self.database
      //
      .query(`
         update

           audio

         set

           processing_state  = ?1,

           has_thumbnail     = ?2

         where

           id = ?3;
       `)
      //
      .run(
        //
        3,
        //
        exit_code === 0 ? 1 : 0,
        //
        audio.id,
      );
  };

const audio_processor_transcode =
  //
  async (
    //
    self:
      //
      audio_processor,
    //
    audio:
      //
      processor_audio,
  ) => {
    const cwd =
      //
      database_audio_get_filesystem_directory_path(audio);

    // dprint-ignore
    const proc = Bun.spawn(
      [
        "ffmpeg",

        "-loglevel", "quiet",

        "-i", audio.file_name,

        "-y",

        "-map", "0:a",

        "-c:a", "aac",

        "-b:a", "256k",

        "-ar", "44100",

        "-movflags", "+faststart",

        "audio.mp4",
     ], { cwd }
   );

    switch (await proc.exited) {
      case 0:
        const file = Bun.file(
          path.join(cwd, "audio.mp4"),
        );

        self.database
          //
          .query(`
             update

               audio

             set

               processing  = ?1,

               size        = ?2

             where

               id = ?3;
           `)
          //
          .run(
            //
            0,
            //
            file.size,
            //
            audio.id,
          );

        break;

      case 1:
        audio_processor_set_processing_state_error(
          //
          self,
          //
          audio.id,
        );

        break;

      default:
        throw new Error("ffmpeg exited with an unexpected code");
    }
  };
