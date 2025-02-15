import {
  makeAudio,
} from "@solid-primitives/audio";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import type {
  Component,
  JSX,
} from "solid-js";

import {
  batch,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  Match,
  onCleanup,
  Switch,
} from "solid-js";

import {
  createMutable,
} from "solid-js/store";

import type {
  player_audio,
} from "./player_audio";

import {
  get_metadata,
} from "./player_audio";

import {
  PlayerAudio,
} from "./PlayerAudio";

export const Queue: Component =
  //
  () => {
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
        if (index() > queue.length) {
          set_index(
            0,
          );
        }
      },
    );

    const [
      repeat,

      set_repeat,
    ] = createSignal<
      "repeat" | "repeat-one" | undefined
    >();

    const cycle_repeat =
      //
      () =>
        set_repeat(repeat => {
          switch (repeat) {
            case "repeat":
              return "repeat-one";

            case "repeat-one":
              return undefined;

            case undefined:
              return "repeat";
          }
        });

    const has_next_track =
      //
      () => {
        switch (repeat()) {
          case "repeat":
          case "repeat-one":
            return queue.length > 1;

          case undefined:
            return index() < queue.length - 1;
        }
      };

    const has_previous_track =
      //
      () => {
        switch (repeat()) {
          case "repeat":
          case "repeat-one":
            return queue.length > 1;

          case undefined:
            return index() > 0;
        }
      };

    const play_next_track =
      //
      () => {
        switch (repeat()) {
          case "repeat":
          case "repeat-one":
            set_index(index =>
              //
              (index + 1) % queue.length
            );

            return;

          case undefined:
            set_index(index =>
              //
              index + 1
            );

            return;
        }
      };

    const play_previous_track =
      //
      () => {
        switch (repeat()) {
          case "repeat":
          case "repeat-one":
            set_index(index =>
              //
              (index - 1 + queue.length) % queue.length
            );

            return;

          case undefined:
            set_index(index =>
              //
              index - 1
            );

            return;
        }
      };

    if ("mediaSession" in navigator) {
      createEffect(() => {
        navigator.mediaSession.setActionHandler(
          //
          "previoustrack",
          //
          has_previous_track()
            //
            ? play_previous_track
            //
            : null,
        );

        navigator.mediaSession.setActionHandler(
          //
          "nexttrack",
          //
          has_next_track()
            //
            ? play_next_track
            //
            : null,
        );
      });
    }

    const shuffle_queue =
      //
      () => {
        batch(() => {
          if (queue.length > 1) {
            //
            for (let i = queue.length - 1; i > 0; i--) {
              const j =
                //
                Math.floor(
                  Math.random() * (i + 1),
                );

              [queue[i], queue[j]] = [queue[j], queue[i]];
            }

            let new_index;

            do {
              new_index = Math.floor(Math.random() * queue.length);
            } while (new_index === index());

            set_index(new_index);
          }
        });
      };

    const track =
      //
      createMemo(() => {
        const player_audio =
          //
          queue[
            index()
          ];

        if (player_audio === undefined) {
          return;
        }

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

        const [
          stream_url,
        ] = createResource(
          () => player_audio.create_stream_url(),
        );

        const audio_element =
          //
          createMemo(() => {
            const current_stream_url =
              //
              stream_url();

            if (current_stream_url) {
              onCleanup(() =>
                URL.revokeObjectURL(
                  current_stream_url,
                )
              );

              const audio_element =
                //
                makeAudio(
                  //
                  current_stream_url,
                  //
                  {
                    ended:
                      //
                      () => {
                        switch (repeat()) {
                          case "repeat-one":
                            audio_element.currentTime = 0;
                            audio_element.play();
                            break;
                          case "repeat":
                            if (queue.length === 1) {
                              audio_element.currentTime = 0;
                              audio_element.play();
                            } else {
                              if (has_next_track()) {
                                play_next_track();
                              } else {
                                queue.length = 0;
                              }
                            }
                            break;

                          default:
                            if (has_next_track()) {
                              play_next_track();
                            } else {
                              queue.length = 0;
                            }
                        }
                      },

                    timeupdate:
                      //
                      () =>
                        set_progress(
                          (audio_element.currentTime / audio_element.duration) * 100,
                        ),

                    pause:
                      //
                      () => {
                        set_paused(
                          true,
                        );

                        if ("mediaSession" in navigator) {
                          navigator.mediaSession.playbackState = "paused";
                        }
                      },

                    play:
                      //
                      () => {
                        set_paused(
                          false,
                        );

                        if ("mediaSession" in navigator) {
                          navigator.mediaSession.playbackState = "playing";
                        }
                      },
                  },
                );

              if ("mediaSession" in navigator) {
                navigator.mediaSession.setActionHandler(
                  //
                  "play",
                  //
                  () => audio_element.play(),
                );

                navigator.mediaSession.setActionHandler(
                  //
                  "pause",
                  //
                  () => audio_element.pause(),
                );

                navigator.mediaSession.setActionHandler(
                  //
                  "seekbackward",
                  //
                  (
                    details,
                  ) =>
                    audio_element.currentTime =
                      //
                      Math.max(
                        //
                        audio_element.currentTime - (details.seekOffset || 10),
                        //
                        0,
                      ),
                );

                navigator.mediaSession.setActionHandler(
                  //
                  "seekforward",
                  //
                  (
                    details,
                  ) =>
                    audio_element.currentTime =
                      //
                      Math.min(
                        //
                        audio_element.currentTime + (details.seekOffset || 10),
                        //
                        audio_element.duration,
                      ),
                );

                navigator.mediaSession.setActionHandler(
                  //
                  "seekto",
                  //
                  (
                    details,
                  ) =>
                    (details.fastSeek
                        //
                        && "fastSeek" in audio_element)
                      //
                      ? (
                        audio_element.fastSeek(
                          details.seekTime!,
                        )
                      )
                      //
                      : (
                        audio_element.currentTime =
                          //
                          details.seekTime!
                      ),
                );

                navigator.mediaSession.metadata =
                  //
                  get_metadata(
                    player_audio,
                  );
              }

              audio_element.play();

              return audio_element;
            }
          });

        const render =
          //
          (): JSX.Element => (
            <div class="fixed w-full left-0 bottom-0 select-none bg-zinc-950">
              <div
                //
                class="absolute h-px bg-zinc-800"
                //
                style={{ width: `${progress()}%` }}
              />

              <div class="border-t border-zinc-900">
                <div class="mx-auto max-w-md flex px-4 py-2">
                  <PlayerAudio
                    //
                    player_audio={player_audio}
                  />

                  <menu class="ml-auto my-auto flex gap-2">
                    <li>
                      <button
                        //
                        class="w-8 h-8 flex cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        onClick={shuffle_queue}
                      >
                        <svg
                          class="w-4 h-4 m-auto fill-zinc-300"
                          viewBox="0 -960 960 960"
                        >
                          <path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z" />
                        </svg>
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class="w-8 h-8 flex cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        onClick={cycle_repeat}
                      >
                        <svg
                          //
                          class={
                            //
                            `w-4 h-4 m-auto transition ${
                              //
                              repeat() === undefined
                                //
                                ? "fill-zinc-500"
                                //
                                : "fill-zinc-300"}`
                          }
                          //
                          viewBox="0 -960 960 960"
                        >
                          <Switch>
                            <Match when={repeat() === undefined}>
                              <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                            </Match>

                            <Match when={repeat() === "repeat"}>
                              <path d="M280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                            </Match>

                            <Match when={repeat() === "repeat-one"}>
                              <path d="M460-360v-180h-60v-60h120v240h-60ZM280-80 120-240l160-160 56 58-62 62h406v-160h80v240H274l62 62-56 58Zm-80-440v-240h486l-62-62 56-58 160 160-160 160-56-58 62-62H280v160h-80Z" />
                            </Match>
                          </Switch>
                        </svg>
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class={
                          //
                          `w-8 h-8 flex ${
                            //
                            has_previous_track()
                              //
                              ? "cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800"
                              //
                              : ""}`.trim()
                        }
                        //
                        onClick={
                          //
                          has_previous_track()
                            //
                            ? play_previous_track
                            //
                            : undefined
                        }
                      >
                        <svg
                          //
                          class={
                            //
                            `w-4 h-4 m-auto transition ${
                              //
                              has_previous_track()
                                //
                                ? "fill-zinc-300"
                                //
                                : "fill-zinc-500"}`
                          }
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
                        onClick={() =>
                          paused()
                            //
                            ? audio_element()?.play()
                            //
                            : audio_element()?.pause()}
                      >
                        <svg
                          //
                          class="w-4 h-4 m-auto fill-zinc-300"
                          //
                          viewBox="0 0 24 24"
                        >
                          {
                            //
                            paused()
                              //
                              ? <path d="M8 5v14l11-7z"></path>
                              //
                              : <path d="M6 19h4V5H6zm8-14v14h4V5z"></path>
                          }
                        </svg>
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class={
                          //
                          `w-8 h-8 flex ${
                            //
                            has_next_track()
                              //
                              ? "cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800"
                              //
                              : ""}`.trim()
                        }
                        //
                        onClick={
                          //
                          has_next_track()
                            //
                            ? play_next_track
                            //
                            : undefined
                        }
                      >
                        <svg
                          //
                          class={
                            //
                            `w-4 h-4 m-auto transition ${
                              //
                              has_next_track()
                                //
                                ? "fill-zinc-300"
                                //
                                : "fill-zinc-500"}`
                          }
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
          render,
        };
      });

    const handle_play_now =
      //
      (
        event:
          //
          CustomEvent<player_audio>,
      ) => {
        queue.length = 0;

        queue.push(event.detail);

        set_index(0);
      };

    const handle_play_next =
      //
      (
        event:
          //
          CustomEvent<player_audio>,
      ) => {
        if (track() === undefined) {
          handle_play_now(
            { detail: event.detail } as CustomEvent<player_audio>,
          );
        } else {
          queue.splice(index() + 1, 0, event.detail);
        }
      };

    const handle_play_later =
      //
      (
        event:
          //
          CustomEvent<player_audio>,
      ) => {
        if (track() === undefined) {
          handle_play_now(
            { detail: event.detail } as CustomEvent<player_audio>,
          );
        } else {
          queue.push(event.detail);
        }
      };

    const handle_shuffle_in =
      //
      (
        event:
          //
          CustomEvent<player_audio>,
      ) => {
        if (track() === undefined) {
          handle_play_now(
            { detail: event.detail } as CustomEvent<player_audio>,
          );
        } else {
          let random_index;
          if (queue.length <= 1) {
            random_index = 1;
          } else {
            do {
              random_index =
                //
                Math.floor(
                  //
                  Math.random() * (queue.length + 1),
                );
            } while (random_index === index());
          }

          queue.splice(
            //
            random_index,
            //
            0,
            //
            event.detail,
          );
        }
      };

    makeEventListener(
      //
      window,
      //
      "play_now",
      //
      handle_play_now as EventListener,
      //
      { passive: true },
    );

    makeEventListener(
      //
      window,
      //
      "play_next",
      //
      handle_play_next as EventListener,
      //
      { passive: true },
    );

    makeEventListener(
      //
      window,
      //
      "play_later",
      //
      handle_play_later as EventListener,
      //
      { passive: true },
    );

    makeEventListener(
      //
      window,
      //
      "shuffle_in",
      //
      handle_shuffle_in as EventListener,
      //
      { passive: true },
    );

    return (
      <>
        {track()?.render()}
      </>
    );
  };
