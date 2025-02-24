import {
  audio_page_size,
} from "@/lib/server/types/audio";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import {
  makeTimer,
} from "@solid-primitives/timer";

import type {
  JSX,
} from "solid-js";

import {
  createEffect,
  createSignal,
  getOwner,
  onCleanup,
  onMount,
  runWithOwner,
  Show,
} from "solid-js";

import type {
  player_audio,
} from "./player_audio";

import type {
  player_audio_context_menu,
} from "./player_audio_context_menu";

import {
  queue_play_now,
} from "./queue_rpc";

const render_default_thumbnail =
  //
  (): JSX.Element => (
    <svg
      //
      class="w-full h-full rounded fill-zinc-300"
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
          class="w-full h-full object-cover rounded"
          //
          src={`/endpoints/thumbnail?id=${player_audio.audio.id}&size=160`}
          //
          onError={() => set_error(true)}
          //
          alt=""
          //
          decoding="async"
          //
          loading="lazy"
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

type set_error =
  //
  (
    any:
      //
      any,
  ) => void;

type set_context_menu =
  //
  (
    //
    context_menu:
      //
      player_audio_context_menu | undefined,
  ) => void;

export const render_player_audio_grid_item =
  //
  (
    item:
      //
      player_audio,
    //
    index:
      //
      () => number,
    //
    set_error:
      //
      set_error,
    //
    set_context_menu:
      //
      set_context_menu,
  ): JSX.Element | null => {
    const [
      latest,

      set_latest,
    ] = createSignal<
      player_audio | null
    >(
      item,
    );

    createEffect(() => {
      const player_audio =
        //
        latest();

      if (
        player_audio?.should_poll
      ) {
        const owner =
          //
          getOwner();

        const refetch =
          //
          async () => {
            const fresh =
              //
              await runWithOwner(
                //
                owner,
                //
                () =>
                  player_audio
                    //
                    .refetch()
                    //
                    .catch(e =>
                      set_error(
                        e,
                      )
                    ),
              );

            if (fresh !== undefined) {
              set_latest(
                fresh,
              );
            }
          };

        makeTimer(
          //
          refetch,
          //
          1000,
          //
          setTimeout,
        );
      }
    });

    const handle_click =
      //
      () => {
        const player_audio =
          //
          latest();

        if (
          player_audio?.can_play
        ) {
          queue_play_now(
            player_audio,
          );
        }
      };

    const context_menu_open =
      //
      (
        //
        x:
          //
          number,
        //
        y:
          //
          number,
      ) =>
        set_context_menu(
          {
            player_audio_signal:
              //
              [
                latest,

                set_latest,
              ],

            x,

            y,

            close:
              //
              () =>
                set_context_menu(
                  undefined,
                ),
          },
        );

    const handle_contextmenu =
      //
      (
        e:
          //
          MouseEvent,
      ) => {
        e.preventDefault();

        e.stopPropagation();

        context_menu_open(
          //
          e.clientX,
          //
          e.clientY,
        );
      };

    const render =
      //
      (): JSX.Element | null => {
        let ref!: HTMLDivElement;

        // @ts-ignore
        import("long-press-event");

        onMount(() => {
          const handle_long_press =
            //
            (
              e:
                //
                CustomEvent<{
                  clientX:
                    //
                    number;

                  clientY:
                    //
                    number;
                }>,
            ) => {
              e.preventDefault();

              e.stopPropagation();

              context_menu_open(
                //
                e.detail.clientX,
                //
                e.detail.clientY,
              );
            };

          makeEventListener(
            //
            ref,
            //
            "long-press",
            //
            handle_long_press as EventListener,
          );
        });

        onMount(() => {
          const animation =
            //
            ref
              //
              .animate(
                //
                [
                  { opacity: 0 },

                  { opacity: 1 },
                ],
                //
                {
                  duration:
                    //
                    750,

                  delay:
                    //
                    (index() % audio_page_size) * 25,

                  fill:
                    //
                    "forwards",

                  easing:
                    //
                    "ease-in",
                },
              );

          onCleanup(() => animation.cancel());
        });

        return (
          <Show when={latest()}>
            <div
              //
              class={
                //
                `opacity-0 select-none rounded ${
                  latest()!.can_play
                    //
                    ? "cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800"
                    //
                    : "brightness-75"
                }`
              }
              //
              ref={ref}
              //
              onClick={handle_click}
              //
              oncontextmenu={handle_contextmenu}
              //
              data-long-press-delay="500"
            >
              <div class="aspect-square relative overflow-hidden mb-2 rounded">
                <Show
                  //
                  when={latest()!.audio.has_thumbnail === 1}
                  //
                  fallback={render_default_thumbnail()}
                >
                  {render_thumbnail(latest()!)}
                </Show>
              </div>

              <div class="px-2 pb-3">
                <div class="line-clamp-1 break-all">
                  <Show
                    //
                    when={latest()!.audio.title}
                    //
                    fallback={latest()!.audio.file_name}
                  >
                    {latest()!.audio.title}
                  </Show>
                </div>

                <div class="line-clamp-1 break-all text-zinc-400">
                  <Show
                    //
                    when={latest()!.audio.processing === 0}
                    //
                    fallback={latest()!.audio.artist ?? "Retrieving metadata..."}
                  >
                    <Show
                      //
                      when={latest()!.audio.processing_state !== 1}
                      //
                      fallback={"An error occured while attempting to process this file."}
                    >
                      {latest()!.audio.artist}
                    </Show>
                  </Show>
                </div>

                <Show
                  //
                  when={latest()!.audio.duration}
                >
                  {duration => (
                    <div class="text-zinc-400 mt-1">
                      {format_duration(duration())}
                    </div>
                  )}
                </Show>
              </div>
            </div>
          </Show>
        );
      };

    return render();
  };