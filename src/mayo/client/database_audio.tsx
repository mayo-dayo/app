import type {
  JSX,
} from "solid-js";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

import {
  database_audio_get_thumbnail_endpoint_path,
} from "@/mayo/common/database_audio";

export const database_audio_render_thumbnail =
  //
  (
    database_audio:
      //
      database_audio,
  ): JSX.Element =>
    database_audio.has_thumbnail
      //
      ? (
        <img
          //
          class="w-8 h-8 flex-none rounded"
          //
          src={
            //
            database_audio_get_thumbnail_endpoint_path(
              //
              database_audio,
              //
              "64",
            )
          }
          //
          alt=""
          //
          decoding="async"
        />
      )
      //
      : (
        <svg
          //
          class="w-8 h-8 flex-none fill-zinc-300"
          //
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 11h-3v3.75c0 1.24-1.01 2.25-2.25 2.25S8.5 17.99 8.5 16.75s1.01-2.25 2.25-2.25c.46 0 .89.14 1.25.38V11h4zm-3-4V3.5L18.5 9z">
          </path>
        </svg>
      );
