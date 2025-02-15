import {
  createContextProvider,
} from "@solid-primitives/context";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import type {
  Signal,
} from "solid-js";

import {
  batch,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
} from "solid-js";

import type {
  player_audio,
} from "./player_audio";

import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
} from "@floating-ui/dom";

type context =
  //
  {
    player_audio_signal:
      //
      Signal<player_audio | null>;

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
    context | undefined
  >();

  const items =
    //
    createMemo(() => {
      const items =
        //
        [];

      const current_context =
        //
        context();

      if (!current_context) {
        return [];
      }

      const {
        player_audio_signal: [
          get,

          set,
        ],
      } = current_context;

      const current_player_audio =
        //
        get();

      if (!current_player_audio) {
        return [];
      }

      const {
        can_play,

        can_download,

        can_remove,

        download,

        remove,
      } = current_player_audio;

      if (
        can_play
      ) {
        items.push(
          {
            handler:
              //
              () => {
                window.dispatchEvent(
                  new CustomEvent(
                    //
                    "play_now",
                    //
                    { detail: get() },
                  ),
                );

                set_context(
                  undefined,
                );
              },

            icon:
              //
              <path d="M120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Zm520 520v-320l240 160-240 160Z" />,

            label:
              //
              "Play now",
          },
          {
            handler:
              //
              () => {
                window.dispatchEvent(
                  new CustomEvent(
                    //
                    "play_next",
                    //
                    { detail: get() },
                  ),
                );

                set_context(
                  undefined,
                );
              },

            icon:
              //
              <path d="M640-160q-50 0-85-35t-35-85q0-50 35-85t85-35q11 0 21 1.5t19 6.5v-328h200v80H760v360q0 50-35 85t-85 35ZM120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Z" />,

            label:
              //
              "Play next",
          },
          {
            handler:
              //
              () => {
                window.dispatchEvent(
                  new CustomEvent(
                    //
                    "play_later",
                    //
                    { detail: get() },
                  ),
                );

                set_context(
                  undefined,
                );
              },

            icon:
              //
              <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />,

            label:
              //
              "Play later",
          },
          {
            handler:
              //
              () => {
                window.dispatchEvent(
                  new CustomEvent(
                    //
                    "shuffle_in",
                    //
                    { detail: get() },
                  ),
                );

                set_context(
                  undefined,
                );
              },

            icon:
              //
              <path d="M560-160v-80h104L537-367l57-57 126 126v-102h80v240H560Zm-344 0-56-56 504-504H560v-80h240v240h-80v-104L216-160Zm151-377L160-744l56-56 207 207-56 56Z" />,

            label:
              //
              "Shuffle in",
          },
        );
      }

      if (
        can_download
      ) {
        items.push(
          {
            handler:
              //
              () => {
                download();

                batch(() => {
                  set(
                    {
                      ...current_player_audio,

                      can_download:
                        //
                        false,
                    },
                  );

                  set_context(
                    undefined,
                  );
                });
              },

            icon:
              //
              <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />,

            label:
              //
              "Download",
          },
        );
      }

      if (
        can_remove
      ) {
        items.push(
          {
            handler:
              //
              () => {
                remove();

                batch(() => {
                  set(
                    null,
                  );

                  set_context(
                    undefined,
                  );
                });
              },

            icon:
              //
              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />,

            label:
              //
              "Remove",
          },
        );
      }

      return items;
    });

  const render =
    //
    createMemo(() => {
      const current_context =
        //
        context();

      if (current_context === undefined) {
        return;
      }

      let ref!: HTMLMenuElement;

      const handle_click =
        //
        (
          e:
            //
            MouseEvent,
        ) => {
          if (ref.contains(e.target as Node) === false) {
            set_context(
              undefined,
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

      const [
        position,

        set_position,
      ] = createSignal<
        {
          left:
            //
            string;

          top:
            //
            string;
        } | undefined
      >(
        undefined,
      );

      onMount(() => {
        const {
          x,

          y,
        } = current_context;

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

        const update_position =
          //
          async () => {
            const position =
              //
              await computePosition(
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
                      offset(10),

                      flip(),

                      shift({
                        padding: 10,
                      }),
                    ],
                },
              );

            set_position(
              {
                left:
                  //
                  `${position.x}px`,

                top:
                  //
                  `${position.y}px`,
              },
            );
          };

        const cleanup =
          //
          autoUpdate(
            //
            virtual_element,
            //
            ref,
            //
            update_position,
          );

        onCleanup(cleanup);

        update_position();
      });

      return (
        <menu
          //
          class={
            //
            position()
              //
              ? "grid rounded bg-zinc-950 absolute w-max"
              //
              : "grid rounded bg-zinc-950 absolute w-max hidden left-0 top-0"
          }
          //
          style={position()}
          //
          ref={ref}
        >
          <For each={items()}>
            {item => (
              <li class="first:rounded-t last:rounded-b transition hover:bg-zinc-900 active:bg-zinc-800">
                <button
                  //
                  class="w-full p-3 flex items-center gap-1 outline-none select-none cursor-pointer"
                  //
                  onClick={item.handler}
                >
                  <svg
                    //
                    class="w-4 h-4 fill-zinc-300"
                    //
                    viewBox="0 -960 960 960"
                  >
                    {item.icon}
                  </svg>

                  <div class="grow text-center">
                    {item.label}
                  </div>
                </button>
              </li>
            )}
          </For>
        </menu>
      );
    });

  return {
    context,

    set_context,

    render,
  };
});

export { PlayerAudioMenuProvider, use_player_audio_menu };
