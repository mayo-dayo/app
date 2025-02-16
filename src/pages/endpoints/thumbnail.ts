import {
  id,
} from "@/lib/server/schema/id";

import type {
  audio,
} from "@/lib/server/types/audio";

import {
  audio_get_file_path_thumbnail,
  audio_thumbnail_sizes,
} from "@/lib/server/types/audio";

import type {
  APIRoute,
} from "astro";

import {
  z,
} from "astro:schema";

export const GET: APIRoute =
  //
  async ({
    url,

    locals,
  }) => {
    let params;

    try {
      params =
        //
        z
          //
          .object({
            id,

            size:
              //
              z.enum(audio_thumbnail_sizes),
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
          status: 400,
        },
      );
    }

    const audio =
      //
      locals.context.database
        //
        .query(`
          select

            has_thumbnail

          from 

            audio

          where 

            id = ?1;
        `)
        //
        .get(params.id) as Pick<audio, "has_thumbnail"> | null;

    if (
      audio?.has_thumbnail !== 1
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

    const path =
      //
      audio_get_file_path_thumbnail(
        //
        {
          id:
            //
            params.id,
        },
        //
        params.size,
      );

    const stream =
      //
      Bun
        //
        .file(path)
        //
        .stream();

    return new Response(
      //
      stream,
      //
      {
        headers:
          //
          {
            "content-type":
              //
              "image/avif",

            "cache-control":
              //
              "public, max-age=31536000, immutable",
          },
      },
    );
  };
