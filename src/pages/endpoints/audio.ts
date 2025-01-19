import type {
  APIRoute,
} from "astro";

import {
  z,
} from "astro:schema";

import parseRange from "range-parser";

import path from "node:path";

import type {
  ReadStream,
} from "node:fs";

import {
  createReadStream,
} from "node:fs";

import {
  stat,
} from "node:fs/promises";

import {
  incoming_id,
} from "@/schema";

import type {
  database_audio,
} from "@/database";

import {
  database_audio_get_filesystem_directory_path,
} from "@/database";

// Helper function to convert Node.js ReadStream to Web ReadableStream
//
// TODO: switch to Bun API when fixed https://github.com/oven-sh/bun/issues/7057
function nodeStreamToWebStream(nodeStream: ReadStream): ReadableStream {
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        controller.enqueue(chunk);
      });
      nodeStream.on("end", () => {
        controller.close();
      });
      nodeStream.on("error", (err) => {
        controller.error(err);
      });
    },
    cancel() {
      nodeStream.destroy();
    },
  });
}

export const GET: APIRoute = async ({
  request,

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
        })
        //
        .parse(
          Object.fromEntries(
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

  const {
    id,
  } = params;

  const audio =
    //
    locals.context.database
      .query(`
        select

          processing,

          processing_state

        from 

          audio

        where 

          id = ?1;
      `)
      .get(id) as Pick<database_audio, "processing" | "processing_state"> | null;

  if (
    audio?.processing !== 0 || audio?.processing_state === 1
  ) {
    return new Response(
      //
      null,
      //
      {
        status:
          //
          404,
      },
    );
  }

  const file_path =
    //
    path.join(
      //
      database_audio_get_filesystem_directory_path(
        //
        {
          id,
        },
      ),
      //
      "audio.mp4",
    );

  const file_stat =
    //
    await stat(file_path);

  const file_size =
    //
    file_stat.size;

  const range_header =
    //
    request.headers.get("range");

  if (
    range_header === null
  ) {
    let stream =
      //
      createReadStream(
        file_path,
      );

    return new Response(
      //
      nodeStreamToWebStream(
        stream,
      ),
      //
      {
        headers: {
          "content-type":
            //
            "audio/mp4",

          "content-length":
            //
            String(file_size),

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
    parseRange(
      //
      file_size,
      //
      range_header,
    );

  if (
    ranges === -1 || ranges === -2
  ) {
    return new Response(
      //
      null,
      //
      {
        //
        status:
          //
          416,
        //
        headers: {
          "content-range":
            //
            `bytes */${file_size}`,
        },
      },
    );
  }

  const {
    start,

    end,
  } = ranges[0];

  const length =
    //
    end - start + 1;

  const stream =
    //
    createReadStream(
      //
      file_path,
      //
      {
        start,

        end,
      },
    );

  return new Response(
    //
    nodeStreamToWebStream(
      stream,
    ),
    //
    {
      status:
        //
        206,

      headers: {
        "content-type":
          //
          "audio/mp4",

        "content-length":
          //
          String(length),

        "content-range":
          //
          `bytes ${start}-${end}/${file_size}`,

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
