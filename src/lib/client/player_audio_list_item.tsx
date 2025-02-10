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

import {
  use_player_audio_menu,
} from "./player_audio_menu";

import {
  PlayerAudio,
} from "./PlayerAudio";

export const player_audio_list_item_render =
  //
  (
    //
    item:
      //
      player_audio,
    //
    index:
      //
      () => number,
  ): JSX.Element => {
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
                () => player_audio.refetch(),
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
          window.dispatchEvent(
            new CustomEvent(
              //
              "play_now",
              //
              { detail: player_audio },
            ),
          );
        }
      };

    const player_audio_menu =
      //
      use_player_audio_menu()!;

    const player_audio_menu_open =
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
        player_audio_menu.set_context(
          {
            player_audio_signal:
              //
              [
                latest,

                set_latest,
              ],

            x,

            y,
          },
        );

    let ref!: HTMLLIElement;

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

          player_audio_menu_open(
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

    const handle_contextmenu =
      //
      (
        e:
          //
          MouseEvent,
      ) => {
        e.preventDefault();

        e.stopPropagation();

        player_audio_menu_open(
          //
          e.clientX,
          //
          e.clientY,
        );
      };

    // @ts-ignore
    import("long-press-event");

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
        <li
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
          <PlayerAudio
            //
            player_audio={latest()!}
            //
            with_duration
          />
        </li>
      </Show>
    );
  };
