import type {
  JSX,
} from "solid-js";

import {
  createSignal,
  Match,
  Show,
  Switch,
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
              fallback={"An error occurred while attempting to process this file."}
            >
              {player_audio.audio.artist}
            </Show>
          </Show>
        </div>
      </div>

      <Show when={with_duration ? player_audio.audio.duration : null}>
        {duration => (
          <div class="ml-auto my-auto text-zinc-400">
            {format_duration(duration())}
          </div>
        )}
      </Show>

      <svg
        //
        class="w-4 h-4 mx-2 self-center fill-zinc-300"
        //
        viewBox="0 -960 960 960"
      >
        <Switch>
          <Match when={player_audio.is_downloaded}>
            <path d="M120-160v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80-440v-160h720v160H120Zm80-40h80v-80h-80v80Zm-80 280v-160h720v160H120Zm80-40h80v-80h-80v80Z" />
          </Match>

          <Match when={player_audio.is_downloaded === false}>
            <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-82v-78q-33 0-56.5-23.5T360-320v-40L168-552q-3 18-5.5 36t-2.5 36q0 121 79.5 212T440-162Zm276-102q41-45 62.5-100.5T800-480q0-98-54.5-179T600-776v16q0 33-23.5 56.5T520-680h-80v80q0 17-11.5 28.5T400-560h-80v80h240q17 0 28.5 11.5T600-440v120h40q26 0 47 15.5t29 40.5Z" />
          </Match>
        </Switch>
      </svg>
    </div>
  );
