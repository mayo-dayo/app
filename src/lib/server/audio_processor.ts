import type {
  audio,
} from "@/lib/server/types/audio";

import {
  audio_get_file_path_original,
  audio_get_file_path_stream,
  audio_get_file_path_thumbnail,
  audio_thumbnail_sizes,
} from "@/lib/server/types/audio";

import {
  z,
} from "astro:schema";

import type {
  Database,
} from "bun:sqlite";

import os from "node:os";

type item =
  //
  Pick<
    //
    audio,
    //
    | "id"
    //
    | "file_name"
    //
    | "processing_state"
  >;

export class audio_processor {
  private concurrency:
    //
    number;

  private database:
    //
    Database;

  private in_flight:
    //
    Set<string>;

  private run_later:
    //
    boolean;

  constructor(
    database:
      //
      Database,
  ) {
    this.database =
      //
      database;

    this.in_flight =
      //
      new Set();

    this.concurrency =
      //
      os.cpus().length;

    this.run_later =
      //
      false;
  }

  run() {
    const limit =
      //
      this.concurrency
      - this.in_flight.size;

    if (limit < 1) {
      this.run_later = true;

      return;
    }

    let items: item[];

    try {
      const exclude =
        //
        this.in_flight
          //
          .values()
          //
          .map(id => `'${id}'`)
          //
          .toArray()
          //
          .join(", ");

      items =
        //
        this.database
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
          .all() as item[];
    } catch (e) {
      console.log(`failed to access the database: ${e}`);

      return;
    }

    if (this.run_later === false) {
      this.run_later =
        //
        limit
          < items.length;
    }

    for (const item of items.slice(0, limit)) {
      this.in_flight.add(item.id);

      (async () => {
        try {
          if (await this.dispatch(item)) {
            this.run_later = true;
          }
        } catch (e) {
          console.log(
            `error processing ${item.file_name} (\`id\`: ${item.id}, \`processing_state\`: ${item.processing_state}): ${e}`,
          );
        } finally {
          this.in_flight.delete(item.id);

          if (this.run_later) {
            this.run_later = false;

            this.run();
          }
        }
      })();
    }
  }

  async dispatch(
    item:
      //
      item,
  ) {
    switch (item.processing_state) {
      case 0:
        await this.get_metadata(
          item,
        );

        return true;

      case 2:
        await this.get_thumbnail(
          item,
        );

        return true;

      case 3:
        await this.transcode(
          item,
        );

        return false;

      default:
        throw new Error(`unexpected \`processing_state\`: ${item.processing_state}`);
    }
  }

  set_processing_state_to_error(
    id:
      //
      item["id"],
  ) {
    this.database
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
      .run(id);
  }

  async get_metadata(
    //
    item:
      //
      item,
  ) {
    const probe =
      //
      z.object({
        streams:
          //
          z
            //
            .object({
              codec_type:
                //
                z.string(),
            })
            //
            .array(),

        format:
          //
          z.object({
            duration:
              //
              z
                //
                .string()
                //
                .transform(value => Math.round(parseFloat(value))),

            tags:
              //
              z
                //
                .record(z.string())
                //
                .transform(value => JSON.stringify(Object.entries(value)))
                //
                .optional(),
          }),
      });

    // dprint-ignore
    const proc = Bun.spawn(
      [
        "ffprobe",

        "-v", "quiet",

        "-of", "json",

        "-show_entries", "format:stream_tags:stream=codec_type",

        audio_get_file_path_original(item),
      ]
    );

    switch (await proc.exited) {
      case 0:
        //

        break;

      case 1:
        this.set_processing_state_to_error(item.id);

        return;

      default:
        throw new Error("unexpected `ffprobe` exit code");
    }

    let output;

    try {
      output =
        //
        probe.parse(
          await Bun.readableStreamToJSON(proc.stdout),
        );
    } catch (e) {
      this.set_processing_state_to_error(item.id);

      return;
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
      this.set_processing_state_to_error(item.id);

      return;
    }

    let album = null, artist = null, composer = null, genre = null, performer = null, title = null;

    if (output.format.tags) {
      let tags;

      try {
        tags = z
          //
          .tuple([z.string(), z.string()])
          //
          .array()
          //
          .parse(JSON.parse(output.format.tags));
      } catch (e) {
        //
      }

      if (tags) {
        for (
          const [
            key,

            value,
          ] of tags
        ) {
          switch (key.toLowerCase()) {
            case "album":
              album =
                //
                value;

              break;

            case "artist":
              artist =
                //
                value;

              break;

            case "composer":
              composer =
                //
                value;

              break;

            case "genre":
              genre =
                //
                value;

              break;

            case "performer":
              performer =
                //
                value;

              break;

            case "title":
              title =
                //
                value;

              break;
          }
        }
      }
    }

    this.database
      //
      .query(`
         update

           audio

         set

           processing_state = ?1,

           duration         = ?2,

           album            = ?3,

           artist           = ?4,

           composer         = ?5,

           genre            = ?6,

           performer        = ?7,

           title            = ?8

         where

           id = ?9;
       `)
      //
      .run(
        //
        has_video ? 2 : 3,
        //
        output.format.duration,
        //
        album,
        //
        artist,
        //
        composer,
        //
        genre,
        //
        performer,
        //
        title,
        //
        item.id,
      );
  }

  async get_thumbnail(
    item:
      //
      item,
  ) {
    const [
      first,

      ...other
    ] = audio_thumbnail_sizes;

    // dprint-ignore
    const proc = Bun.spawn(
      [
        "ffmpeg",

        "-loglevel", "quiet",

        "-i", audio_get_file_path_original(item),

        "-y",

        "-frames", "1",

        "-vf", `crop='if(gt(iw,ih),ih,iw)':'if(gt(iw,ih),ih,iw)',scale=${first}:${first}`,

        audio_get_file_path_thumbnail(
          //
          item, 
          //
          first
        )
      ]
    );

    let exit_code = await proc.exited;

    if (exit_code === 0) {
      for (
        const [
          index,

          size,
        ] of other.entries()
      ) {
        // dprint-ignore
        const proc = Bun.spawn(
          [ 
            "ffmpeg",

            "-loglevel", "quiet",

            "-i", audio_get_file_path_thumbnail(
                    //
                    item, 
                    //
                    audio_thumbnail_sizes[index]
                  ),

            "-y",

            "-vf", `scale=${size}:${size}`,

            audio_get_file_path_thumbnail(
              //
              item, 
              //
              size
            )
          ]
        );

        exit_code = await proc.exited;

        if (exit_code === 1) {
          break;
        }
      }
    }

    this.database
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
        item.id,
      );
  }

  async transcode(
    item:
      //
      item,
  ) {
    const file_path_stream =
      //
      audio_get_file_path_stream(item);

    // dprint-ignore
    const proc = Bun.spawn([
      "ffmpeg",

      "-loglevel", "quiet",

      "-i", audio_get_file_path_original(item),

      "-y",

      "-map", "0:a",

      "-c:a", "aac",

      "-b:a", "256k",

      "-ar", "44100",

      "-movflags", "+faststart",

      file_path_stream
   ]);

    switch (await proc.exited) {
      case 0:
        const file =
          //
          Bun.file(file_path_stream);

        this.database
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
            item.id,
          );

        break;

      case 1:
        this.set_processing_state_to_error(item.id);

        break;

      default:
        throw new Error("unexpected `ffmpeg` exit code");
    }
  }
}
