import type {
  APIRoute,
} from "astro";

import {
  z,
} from "astro:schema";

import path from "node:path";

import {
  incoming_id,
} from "@/schema";

import type {
  database_audio,
} from "@/database";

import {
  database_audio_thumbnail_sizes,
} from "@/database";

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
            id:
              //
              incoming_id,

            size:
              //
              z.enum(
                database_audio_thumbnail_sizes,
              ),
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
        .get(params.id) as Pick<database_audio, "has_thumbnail"> | null;

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

    const stream =
      //
      Bun
        //
        .file(
          //
          path.join(
            //
            path.join(
              //
              process.env.MAYO_DATA_PATH,
              //
              params.id,
            ),
            //
            `thumbnail-${params.size}.webp`,
          ),
        )
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
              "image/webp",

            "cache-control":
              //
              "max-age=31536000, immutable",
          },
      },
    );
  };
