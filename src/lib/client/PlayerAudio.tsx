import type {
  Component,
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

import {
  get_effective_title,
} from "./player_audio";

type Props =
  //
  {
    //
    player_audio:
      //
      player_audio;
    //
    with_duration?:
      //
      boolean;
  };

export const PlayerAudio: Component<Props> =
  //
  (props) => {
    const render_default_thumbnail =
      //
      () => (
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
      () => {
        const [
          error,

          set_error,
        ] = createSignal(
          false,
        );

        return (
          <Switch>
            <Match when={!error()}>
              <img
                //
                class="w-9 h-9 rounded"
                //
                src={`/endpoints/thumbnail?id=${props.player_audio.audio.id}&size=64`}
                //
                onError={() => set_error(true)}
                //
                alt=""
                //
                decoding="async"
              />
            </Match>

            <Match when={error()}>
              {render_default_thumbnail()}
            </Match>
          </Switch>
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

        const pad = (num: number) => String(num).padStart(2, "0");

        return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
      };

    const artist =
      //
      () => props.player_audio.tags?.get("artist");

    return (
      <div class="flex grow gap-3 p-3">
        <Switch>
          <Match when={props.player_audio.audio.has_thumbnail === 1}>
            {render_thumbnail()}
          </Match>

          <Match when={props.player_audio.audio.has_thumbnail === 0}>
            {render_default_thumbnail()}
          </Match>
        </Switch>

        <div class="w-0 grow my-auto">
          <div class="line-clamp-1 break-all">
            {get_effective_title(props.player_audio)}
          </div>

          <div class="line-clamp-1 break-all text-zinc-400">
            {props.player_audio.audio.processing === 0
              //
              ? props.player_audio.audio.processing_state === 1
                //
                ? "Unable to process this file."
                //
                : artist()
              //
              : artist() ?? "Processing..."}
          </div>
        </div>

        <Show when={props.with_duration}>
          <Show when={props.player_audio.audio.duration}>
            {duration => (
              <div class="ml-auto my-auto text-zinc-500">
                {format_duration(duration())}
              </div>
            )}
          </Show>
        </Show>
      </div>
    );
  };
