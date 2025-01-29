import type {
  JSX,
} from "solid-js";

import {
  Match,
  Switch,
} from "solid-js";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

import {
  database_audio_get_thumbnail_endpoint_path,
} from "@/mayo/common/database_audio";

export type player_audio =
  //
  {
    database_audio:
      //
      database_audio;

    duration?:
      //
      string;

    artist?:
      //
      string;

    album?:
      //
      string;

    title?:
      //
      string;
  };

export const player_audio_create =
  //
  (
    database_audio:
      //
      database_audio,
  ): player_audio => {
    let artist;

    let album;

    let title;

    if (
      database_audio.tags
    ) {
      const tags =
        //
        new Map(
          //
          (JSON.parse(
            database_audio.tags,
          ) as string[][])
            //
            .map(([
              k,

              v,
            ]) => [
              k.toLowerCase(),

              v,
            ]),
        );

      artist =
        //
        tags.get(
          "artist",
        );

      album =
        //
        tags.get(
          "album",
        );

      title =
        //
        tags.get(
          "title",
        );
    }

    if (title === undefined) {
      title =
        //
        database_audio.file_name;
    }

    let duration;

    if (
      database_audio.duration
    ) {
      const h =
        //
        Math.floor(database_audio.duration / 3600);

      const m =
        //
        Math.floor((database_audio.duration % 3600) / 60);

      const s =
        //
        database_audio.duration % 60;

      const pad =
        //
        (number: number) => String(number).padStart(2, "0");

      duration =
        //
        h > 0
          //
          ? `${pad(h)}:${pad(m)}:${pad(s)}`
          //
          : `${pad(m)}:${pad(s)}`;
    }

    return {
      database_audio,

      artist,

      album,

      title,

      duration,
    };
  };

export const player_audio_render =
  //
  (
    {
      database_audio,

      title,

      artist,
    }:
      //
      player_audio,
  ): JSX.Element => (
    <div class="flex gap-3 p-3">
      <div class="w-9 h-9 flex-none">
        <Switch>
          <Match when={database_audio.has_thumbnail === 1}>
            <img
              //
              class="w-full h-full rounded"
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
          </Match>

          <Match when={database_audio.has_thumbnail === 0}>
            <svg
              //
              class="w-full h-full rounded fill-zinc-300"
              //
              viewBox="0 -960 960 960"
            >
              <path d="M430-200q38 0 64-26t26-64v-150h120v-80H480v155q-11-8-23.5-11.5T430-380q-38 0-64 26t-26 64q0 38 26 64t64 26ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z" />
            </svg>
          </Match>
        </Switch>
      </div>

      <div class="my-auto">
        <div class="line-clamp-1 break-all">
          {title}
        </div>

        <div class="line-clamp-1 break-all text-zinc-400">
          {
            //
            database_audio.processing === 0
              //
              ? database_audio.processing_state === 1
                //
                ? <>Unable to process this file.</>
                //
                : artist
              //
              : artist ?? <>Processing...</>
          }
        </div>
      </div>
    </div>
  );
