import type {
  JSX,
} from "solid-js";

import {
  createSignal,
  Show,
} from "solid-js";

import type {
  player_audio,
} from "./player_audio";

const render_default_thumbnail =
  //
  (): JSX.Element => (
    <svg
      //
      class="w-9 h-9 rounded fill-zinc-300"
      //
      viewBox="0 -960 960 960"
    >
      <path d="M430-200q38 0 64-26t26-64v-150h120v-80H480v155q-11-8-23.5-11.5T430-380q-38 0-64 26t-26 64q0 38 26 64t64 26ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z" />
    </svg>
  );

const render_thumbnail =
  //
  (
    //
    player_audio:
      //
      player_audio,
  ): JSX.Element => {
    const [
      error,

      set_error,
    ] = createSignal(
      false,
    );

    return (
      <Show
        //
        when={!error()}
        //
        fallback={render_default_thumbnail()}
      >
        <img
          //
          class="w-9 h-9 rounded"
          //
          src={`/endpoints/thumbnail?id=${player_audio.audio.id}&size=64`}
          //
          onError={() => set_error(true)}
          //
          alt=""
          //
          decoding="async"
        />
      </Show>
    );
  };

const format_duration =
  //
  (
    seconds:
      //
      number,
  ) => {
    const h = Math.floor(seconds / 3600);

    const m = Math.floor((seconds % 3600) / 60);

    const s = Math.floor(seconds % 60);

    const p = (num: number) => String(num).padStart(2, "0");

    return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
  };

export const render_player_audio =
  //
  (
    //
    player_audio:
      //
      player_audio,
    //
    with_duration:
      //
      boolean = false,
  ): JSX.Element => (
    <div class="flex grow gap-3 p-3">
      <Show
        //
        when={player_audio.audio.has_thumbnail === 1}
        //
        fallback={render_default_thumbnail()}
      >
        {render_thumbnail(player_audio)}
      </Show>

      <div class="w-0 grow my-auto">
        <div class="line-clamp-1 break-all">
          <Show
            //
            when={player_audio.audio.title}
            //
            fallback={player_audio.audio.file_name}
          >
            {player_audio.audio.title}
          </Show>
        </div>

        <div class="line-clamp-1 break-all text-zinc-400">
          <Show
            //
            when={player_audio.audio.processing === 0}
            //
            fallback={player_audio.audio.artist ?? "Retrieving metadata..."}
          >
            <Show
              //
              when={player_audio.audio.processing_state !== 1}
              //
              fallback={"An error occured while attempting to process this file."}
            >
              {player_audio.audio.artist}
            </Show>
          </Show>
        </div>
      </div>

      <Show
        //
        when={
          //
          with_duration
            //
            ? player_audio.audio.duration
            //
            : null
        }
      >
        {duration => (
          <div class="ml-auto my-auto text-zinc-500">
            {format_duration(duration())}
          </div>
        )}
      </Show>
    </div>
  );
