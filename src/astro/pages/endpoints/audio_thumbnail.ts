import {
  z,
} from "astro:schema";

import {
  type APIRoute,
} from "astro";

import {
  incoming_id,
} from "@/mayo/server/incoming";

import {
  database_audio_get_thumbnail_file_path,
} from "@/mayo/server/database_audio";

import {
  type database_audio,
  database_audio_thumbnail_sizes,
} from "@/mayo/common/database_audio";

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
              new URL(
                url,
              ).searchParams.entries(),
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
          database_audio_get_thumbnail_file_path(
            //
            {
              id: params.id,
            },
            //
            params.size,
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
