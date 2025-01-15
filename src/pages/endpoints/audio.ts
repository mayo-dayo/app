import type {
  APIRoute,
} from "astro";

import {
  z,
} from "astro:schema";

import parseRange from "range-parser";

import path from "node:path";

import {
  incoming_id,
} from "@/schema";

import type {
  database_audio,
} from "@/database";

import {
  database_audio_get_filesystem_directory_path,
} from "@/database";

export const GET: APIRoute =
  //
  async ({
    request,

    url,

    locals,
  }) => {
    let params;

    try {
      params = z
        //
        .object({
          id:
            //
            incoming_id,
        })
        //
        .parse(
          //
          Object.fromEntries(
            //
            new URL(url).searchParams.entries(),
          ),
        );
    } catch (e) {
      return new Response(
        //
        null,
        //
        {
          status:
            //
            400,
        },
      );
    }

    const audio = locals.context.database
      //
      .query(`
        select

          processing,

          processing_state

        from 

          audio

        where 

          id = ?1;
      `)
      //
      .get(params.id) as Pick<database_audio, "processing" | "processing_state"> | null;

    if (
      audio?.processing !== 0 || audio?.processing_state === 1
    ) {
      return new Response(
        //
        null,
        //
        {
          status: 404,
        },
      );
    }

    const file =
      //
      Bun
        //
        .file(
          //
          path.join(
            //
            database_audio_get_filesystem_directory_path({
              id:
                //
                params.id,
            }),
            //
            "audio.mp4",
          ),
        );

    const range_header =
      //
      request.headers.get("range");

    if (
      range_header === null
    ) {
      return new Response(
        //
        file.stream(),
        //
        {
          headers: {
            "content-type":
              //
              "audio/mp4",

            "content-length":
              //
              String(file.size),

            "accept-ranges":
              //
              "bytes",

            "cache-control":
              //
              "max-age=31536000, immutable",
          },
        },
      );
    }

    const ranges =
      //
      parseRange(file.size, range_header);

    if (
      ranges === -1 || ranges === -2
    ) {
      return new Response(
        //
        null,
        //
        {
          status:
            //
            416,

          headers:
            //
            {
              "content-range": `bytes */${file.size}`,
            },
        },
      );
    }

    const {
      start,

      end,
    } =
      //
      ranges[0];

    const length =
      //
      end - start + 1;

    const stream =
      //
      file
        //
        .slice(
          //
          start,
          //
          end + 1,
        )
        //
        .stream();

    return new Response(
      //
      stream,
      //
      {
        status:
          //
          206,

        headers:
          //
          {
            "content-type":
              //
              "audio/mp4",

            "content-length":
              //
              String(length),

            "content-range":
              //
              `bytes ${start}-${end}/${file.size}`,

            "accept-ranges":
              //
              "bytes",

            "cache-control":
              //
              "max-age=31536000, immutable",
          },
      },
    );
  };
