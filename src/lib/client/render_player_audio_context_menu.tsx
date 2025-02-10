import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import type {
  JSX,
} from "solid-js";

import {
  batch,
  createSignal,
  For,
  getOwner,
  onCleanup,
  onMount,
  runWithOwner,
} from "solid-js";

import type {
  player_audio_context_menu,
} from "./player_audio_context_menu";

import {
  queue_play_later,
  queue_play_next,
  queue_play_now,
  queue_shuffle_in,
} from "./queue_rpc";

export const render_player_audio_context_menu =
  //
  (
    {
      player_audio_signal: [
        get,

        set,
      ],

      x,

      y,

      close,
    }:
      //
      player_audio_context_menu,
  ): JSX.Element => {
    const items =
      //
      () => {
        const player_audio =
          //
          get();

        const items =
          //
          [];

        if (
          player_audio
        ) {
          const {
            can_play,

            can_download,

            can_remove,

            download,

            remove,
          } = player_audio;

          if (
            can_play
          ) {
            items.push(
              {
                handler:
                  //
                  () => {
                    queue_play_now(player_audio);

                    close();
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
                    queue_play_next(player_audio);

                    close();
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
                    queue_play_later(player_audio);

                    close();
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
                    queue_shuffle_in(player_audio);

                    close();
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
                    batch(() => {
                      set({ ...player_audio, can_download: false });

                      close();
                    });

                    download();
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
                    batch(() => {
                      set(null);

                      close();
                    });

                    remove();
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
        }

        return items;
      };

    let ref: HTMLMenuElement | undefined;

    const handle_click =
      //
      (
        e:
          //
          MouseEvent,
      ) => {
        if (ref?.contains(e.target as Node) === false) {
          close();
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

    type position =
      //
      {
        left:
          //
          string;

        top:
          //
          string;
      };

    const [
      position,

      set_position,
    ] = createSignal<
      position | undefined
    >();

    const owner =
      //
      getOwner();

    onMount(async () => {
      if (
        ref
      ) {
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

        const {
          autoUpdate,

          computePosition,

          flip,

          offset,

          shift,
        } = await import(
          "@floating-ui/dom"
        );

        const update =
          //
          async () => {
            if (
              ref
            ) {
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

                        shift({ padding: 10 }),
                      ],
                  },
                );

              set_position({
                left:
                  //
                  `${position.x}px`,

                top:
                  //
                  `${position.y}px`,
              });
            }
          };

        update();

        const cleanup =
          //
          autoUpdate(
            //
            virtual_element,
            //
            ref,
            //
            update,
          );

        runWithOwner(
          //
          owner,
          //
          () => onCleanup(cleanup),
        );
      }
    });

    return (
      <menu
        //
        class={`absolute w-max grid rounded bg-zinc-950 ${position() ? "" : "hidden left-0 top-0".trim()}`}
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
  };
