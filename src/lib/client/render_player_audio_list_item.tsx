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
  batch,
  createEffect,
  createSignal,
  For,
  getOwner,
  onCleanup,
  onMount,
  runWithOwner,
  Show,
} from "solid-js";

import {
  use_context_menu,
} from "./context_menu";

import type {
  player_audio,
} from "./player_audio";

import {
  queue_play_later,
  queue_play_next,
  queue_play_now,
  queue_shuffle_in,
} from "./queue_rpc";

import {
  render_player_audio,
} from "./render_player_audio";

type set_error =
  //
  (
    any:
      //
      any,
  ) => void;

export const render_player_audio_list_item =
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

    const context_menu =
      //
      use_context_menu()!;

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
        context_menu.set_state(
          //
          {
            coordinates:
              //
              {
                x,

                y,
              },

            body:
              //
              () => {
                const player_audio =
                  //
                  latest();

                if (player_audio === null) {
                  return;
                }

                const items =
                  //
                  [];

                if (player_audio.can_play) {
                  items.push(
                    {
                      handler:
                        //
                        () => {
                          queue_play_now(player_audio);

                          context_menu.set_state(undefined);
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

                          context_menu.set_state(undefined);
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

                          context_menu.set_state(undefined);
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

                          context_menu.set_state(undefined);
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

                if (player_audio.can_download) {
                  items.push(
                    //
                    {
                      handler:
                        //
                        () => {
                          batch(() => {
                            set_latest(player_audio => {
                              return (
                                player_audio === null
                                  //
                                  ? null
                                  //
                                  : {
                                    ...player_audio,

                                    can_download:
                                      //
                                      false,

                                    is_downloaded:
                                      //
                                      true,
                                  }
                              );
                            });

                            context_menu.set_state(undefined);
                          });

                          player_audio.download();
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

                if (player_audio.can_remove) {
                  items.push(
                    //
                    {
                      handler:
                        //
                        () => {
                          batch(() => {
                            close();

                            set_latest(null);
                          });

                          player_audio.remove();
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

                return (
                  <For each={items}>
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
                );
              },
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

    const render =
      //
      (): JSX.Element | null => {
        let ref!: HTMLLIElement;

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
              {render_player_audio(
                //
                latest()!,
                //
                true,
              )}
            </li>
          </Show>
        );
      };

    return render();
  };
