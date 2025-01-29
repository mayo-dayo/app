import type {
  JSX,
} from "solid-js";

import {
  createEffect,
  createResource,
  createSignal,
} from "solid-js";

import {
  createContextProvider,
} from "@solid-primitives/context";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import {
  computePosition,
  offset,
} from "@floating-ui/dom";

import type {
  player_audio,
} from "@/mayo/client/player_audio";

import {
  use_player_queue,
} from "@/mayo/client/player_queue";

export type player_audio_menu_context =
  //
  {
    player_audio:
      //
      player_audio;

    x:
      //
      number;

    y:
      //
      number;
  };

const [
  PlayerAudioMenuProvider,

  use_player_audio_menu,
] = createContextProvider(() => {
  const [
    context,

    set_context,
  ] = createSignal<
    player_audio_menu_context | "undefined"
  >(
    "undefined",
  );

  let ref: HTMLDivElement | undefined;

  createEffect(() => {
    const current_context =
      //
      context();

    if (
      current_context !== "undefined"
    ) {
      const handle_click =
        //
        (
          e:
            //
            MouseEvent,
        ) => {
          if (
            ref
            //
            && !ref.contains(
              e.target as Node,
            )
          ) {
            set_context(
              "undefined",
            );
          }
        };

      makeEventListener(
        //
        document,
        //
        "click",
        //
        handle_click,
        //
        { passive: true },
      );
    }
  });

  const [
    position,
  ] =
    //
    createResource(
      //
      context,
      //
      (
        current_context,
      ) => {
        if (
          current_context
            //
            === "undefined"
        ) {
          return;
        }

        const {
          x,

          y,
        } = current_context;

        if (
          ref
            //
            === undefined
        ) {
          return;
        }

        const virtual_element =
          //
          {
            getBoundingClientRect:
              //
              () => ({
                x,

                y,

                width:
                  //
                  0,

                height:
                  //
                  0,

                left:
                  //
                  x,

                top:
                  //
                  y,

                right:
                  //
                  x,

                bottom:
                  //
                  y,
              }),
          };

        return (
          computePosition(
            //
            virtual_element,
            //
            ref,
            //
            {
              placement:
                //
                "right-start",

              middleware:
                //
                [
                  offset(
                    10,
                  ),
                ],
            },
          )
            //
            .then(
              ({
                x,

                y,
              }) => {
                const left =
                  //
                  `${x}px`;

                const top =
                  //
                  `${y}px`;

                return {
                  left,

                  top,
                };
              },
            )
        );
      },
    );
  const player_queue =
    //
    use_player_queue()!;

  const handle_play_now =
    //
    () => {
      const current_context =
        //
        context();

      if (
        current_context !== "undefined"
      ) {
        const {
          player_audio,
        } = current_context;

        player_queue
          //
          .play_now(
            player_audio,
          );

        set_context(
          "undefined",
        );
      }
    };

  const handle_play_next =
    //
    () => {
      const current_context =
        //
        context();

      if (
        current_context !== "undefined"
      ) {
        const {
          player_audio,
        } = current_context;

        player_queue
          //
          .play_next(
            player_audio,
          );

        set_context(
          "undefined",
        );
      }
    };

  const handle_play_later =
    //
    () => {
      const current_context =
        //
        context();

      if (
        current_context !== "undefined"
      ) {
        const {
          player_audio,
        } = current_context;

        player_queue.play_later(
          player_audio,
        );

        set_context(
          "undefined",
        );
      }
    };

  const render =
    //
    (): JSX.Element => (
      <div
        //
        class={
          //
          position()
            //
            ? "absolute w-max"
            //
            : "absolute w-max hidden left-0 top-0"
        }
        //
        style={position()}
        //
        ref={ref}
        //
        onClick={(e) => e.stopPropagation()}
      >
        <menu class="grid divide-y divide-zinc-900 rounded bg-zinc-950">
          <li>
            <button
              //
              class="w-full p-3 flex justify-center items-center gap-1 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded-t"
              //
              onClick={handle_play_now}
            >
              <svg
                //
                class="w-4 h-4 fill-zinc-300"
                //
                viewBox="0 -960 960 960"
              >
                <path d="M120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Zm520 520v-320l240 160-240 160Z" />
              </svg>

              Play now
            </button>
          </li>

          <li>
            <button
              //
              class="w-full p-3 flex justify-center items-center gap-1 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800"
              //
              onClick={handle_play_next}
            >
              <svg
                //
                class="w-4 h-4 fill-zinc-300"
                //
                viewBox="0 -960 960 960"
              >
                <path d="M640-160q-50 0-85-35t-35-85q0-50 35-85t85-35q11 0 21 1.5t19 6.5v-328h200v80H760v360q0 50-35 85t-85 35ZM120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Z" />
              </svg>

              Play next
            </button>
          </li>

          <li>
            <button
              //
              class="w-full p-3 flex justify-center items-center gap-1 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded-b"
              //
              onClick={handle_play_later}
            >
              <svg
                //
                class="w-4 h-4 fill-zinc-300"
                //
                viewBox="0 -960 960 960"
              >
                <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />
              </svg>

              Play later
            </button>
          </li>
        </menu>
      </div>
    );

  return {
    context,

    set_context,

    render,
  };
});

export {
  //
  PlayerAudioMenuProvider,
  //
  use_player_audio_menu,
};
