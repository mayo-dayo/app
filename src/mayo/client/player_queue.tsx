import type {
  JSX,
} from "solid-js";

import {
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";

import {
  createMutable,
} from "solid-js/store";

import {
  makeAudio,
} from "@solid-primitives/audio";

import {
  createContextProvider,
} from "@solid-primitives/context";

import {
  database_audio_get_stream_endpoint_path,
} from "@/mayo/common/database_audio";

import type {
  player_audio,
} from "@/mayo/client/player_audio";

import {
  player_audio_render,
} from "@/mayo/client/player_audio";

const [
  PlayerQueueProvider,

  use_player_queue,
] =
  //
  createContextProvider(() => {
    const queue =
      //
      createMutable<
        player_audio[]
      >(
        [],
      );

    const [
      index,

      set_index,
    ] = createSignal(
      0,
    );

    createEffect(
      () => {
        if (
          index()
            //
            > queue.length
        ) {
          set_index(
            0,
          );
        }
      },
    );

    const has_next_track =
      //
      createMemo(
        () =>
          index()
            //
            < queue.length - 1,
      );

    const has_previous_track =
      //
      createMemo(
        () =>
          index()
            //
            > 0,
      );

    const play_next_track =
      //
      () =>
        set_index(
          index => index + 1,
        );

    const play_previous_track =
      //
      () =>
        set_index(
          index => index - 1,
        );

    const track =
      //
      createMemo(() => {
        const player_audio =
          //
          queue[
            index()
          ];

        if (
          player_audio === undefined
        ) {
          return;
        }

        const {
          database_audio,
        } = player_audio;

        const [
          progress,

          set_progress,
        ] = createSignal(
          0,
        );

        const [
          paused,

          set_paused,
        ] = createSignal(
          false,
        );

        const audio_element =
          //
          makeAudio(
            database_audio_get_stream_endpoint_path(
              database_audio,
            ),
            //
            {
              ended:
                //
                () => {
                  has_next_track()
                    //
                    ? play_next_track()
                    //
                    : queue.length = 0;
                },

              timeupdate:
                //
                () =>
                  set_progress(
                    (audio_element.currentTime / audio_element.duration) * 100,
                  ),

              pause:
                //
                () =>
                  set_paused(
                    true,
                  ),

              play:
                //
                () =>
                  set_paused(
                    false,
                  ),
            },
          );

        audio_element.play();

        const render =
          //
          (): JSX.Element => (
            <div class="fixed w-full left-0 bottom-0 select-none bg-zinc-950">
              <div
                //
                class="absolute h-px bg-zinc-800"
                //
                style={{
                  width: `${progress()}%`,
                }}
              />

              <div class="border-t border-zinc-900">
                <div class="mx-auto max-w-md flex gap-4">
                  {player_audio_render(player_audio)}

                  <menu class="ml-auto my-auto flex gap-2">
                    <li>
                      <button
                        // dprint-ignore
                        class={`w-8 h-8 flex ${has_previous_track() ? "cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800" : ""}`.trim()}
                        //
                        onClick={has_previous_track() ? play_previous_track : undefined}
                      >
                        <svg
                          // dprint-ignore
                          class={`w-4 h-4 m-auto transition ${has_previous_track() ? "fill-zinc-300" : "fill-zinc-500"}`}
                          //
                          viewBox="0 0 24 24"
                        >
                          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"></path>
                        </svg>
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class="w-8 h-8 flex cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        onClick={() => paused() ? audio_element.play() : audio_element.pause()}
                      >
                        <svg
                          //
                          class="w-4 h-4 m-auto fill-zinc-300"
                          //
                          viewBox="0 0 24 24"
                        >
                          {paused() ? <path d="M8 5v14l11-7z"></path> : <path d="M6 19h4V5H6zm8-14v14h4V5z"></path>}
                        </svg>
                      </button>
                    </li>

                    <li>
                      <button
                        // dprint-ignore
                        class={`w-8 h-8 flex ${has_next_track() ? "cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800" : ""}`.trim()}
                        //
                        onClick={has_next_track() ? play_next_track : undefined}
                      >
                        <svg
                          // dprint-ignore
                          class={`w-4 h-4 m-auto transition ${has_next_track() ? "fill-zinc-300" : "fill-zinc-500"}`}
                          //
                          viewBox="0 0 24 24"
                        >
                          <path d="m6 18 8.5-6L6 6zM16 6v12h2V6z"></path>
                        </svg>
                      </button>
                    </li>
                  </menu>
                </div>
              </div>
            </div>
          );

        return {
          player_audio,

          progress,

          paused,

          audio_element,

          render,
        };
      });

    const render =
      //
      (): JSX.Element => {
        const current_track = track();

        if (
          current_track === undefined
        ) {
          return;
        }

        return (
          current_track.render()
        );
      };

    const is_empty =
      //
      createMemo(
        () =>
          queue.length
            //
            === 0,
      );

    const play_now =
      //
      (
        player_audio:
          //
          player_audio,
      ) =>
        queue.splice(
          //
          0,
          //
          queue.length,
          //
          player_audio,
        );

    const play_next =
      //
      (
        player_audio:
          //
          player_audio,
      ) => {
        if (
          track() === undefined
        ) {
          play_now(
            player_audio,
          );
        } else {
          queue.splice(
            //
            index() + 1,
            //
            0,
            //
            player_audio,
          );
        }
      };

    const play_later =
      //
      (
        player_audio:
          //
          player_audio,
      ) => {
        if (
          track() === undefined
        ) {
          play_now(
            player_audio,
          );
        } else {
          queue.push(
            player_audio,
          );
        }
      };

    return {
      is_empty,

      play_now,

      play_next,

      play_later,

      render,
    };
  });

export {
  //
  PlayerQueueProvider,
  //
  use_player_queue,
};
