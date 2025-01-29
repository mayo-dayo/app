import {
  actions,
} from "astro:actions";

import "long-press-event";

import type {
  JSX,
  Signal,
} from "solid-js";

import {
  createEffect,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

import {
  createInfiniteScroll,
} from "@solid-primitives/pagination";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

import {
  database_audio_is_playable,
  database_audio_page_size,
} from "@/mayo/common/database_audio";

import type {
  player_audio,
} from "@/mayo/client/player_audio";

import {
  player_audio_create,
  player_audio_render,
} from "@/mayo/client/player_audio";

import {
  use_player_queue,
} from "@/mayo/client/player_queue";

import {
  use_player_audio_menu,
} from "@/mayo/client/player_audio_menu";

export const player_audio_list_render =
  //
  (): JSX.Element => {
    const fetch_page =
      //
      (
        number:
          //
          number,
      ): Promise<
        Signal<player_audio>[]
      > =>
        actions.audio.get_page.orThrow(
          number,
        )
          //
          .then(page =>
            page
              //
              .map(database_audio =>
                createSignal(
                  player_audio_create(
                    database_audio,
                  ),
                )
              )
          );

    const [
      pages,

      setEl,

      {
        end,

        setPages,
      },
    ] = createInfiniteScroll(
      fetch_page,
    );

    // Swap occurs when the upload form is submitted.
    const handle_swap =
      //
      () =>
        fetch_page(0)
          //
          .then(page =>
            setPages(
              page,
            )
          );

    makeEventListener(
      //
      document,
      //
      "astro:after-swap",
      //
      handle_swap,
      //
      { passive: true },
    );

    const timers =
      //
      new Map();

    onCleanup(() =>
      timers.forEach(
        clearInterval,
      )
    );

    createEffect(() =>
      pages()
        //
        .filter(
          (
            [
              current,
            ],
          ) => {
            const {
              database_audio: {
                id,

                processing,
              },
            }: player_audio = current();

            return (
              //
              processing === 1
              //
              && timers.has(id) === false
            );
          },
        )
        //
        .forEach(
          (
            [
              current,

              update,
            ],
          ) => {
            const poll =
              //
              async () => {
                const {
                  database_audio: {
                    id,

                    processing,

                    processing_state,
                  },
                } = current();

                const fresh: database_audio | null =
                  //
                  await actions.audio.get_one.orThrow(
                    id,
                  );

                if (
                  fresh === null
                  //
                  || fresh.processing === 0
                ) {
                  clearInterval(
                    timer,
                  );

                  timers.delete(
                    id,
                  );
                }

                if (
                  fresh !== null
                  //
                  && (
                    fresh.processing !== processing
                    //
                    || fresh.processing_state !== processing_state
                  )
                ) {
                  update(
                    player_audio_create(
                      fresh,
                    ),
                  );
                }
              };

            const {
              database_audio: {
                id,
              },
            }: player_audio = current();

            const timer =
              //
              setInterval(
                //
                poll,
                //
                1000,
              );

            timers.set(
              //
              id,
              //
              timer,
            );
          },
        )
    );

    const player_queue =
      //
      use_player_queue()!;

    const player_audio_menu =
      //
      use_player_audio_menu()!;

    return (
      <>
        <ol
          //
          class={
            //
            player_queue.is_empty()
              //
              ? "grid gap-1"
              //
              : "grid gap-1 pb-14"
          }
        >
          <For
            //
            each={
              //
              pages()
            }
          >
            {(
              //
              [
                item,
              ],
              //
              index,
            ) => {
              let ref: HTMLLIElement | undefined;

              onMount(() => {
                if (ref) {
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
                            (index() % database_audio_page_size) * 25,

                          fill:
                            //
                            "forwards",

                          easing:
                            //
                            "ease-in",
                        },
                      );

                  onCleanup(() => animation.cancel());
                }
              });

              const is_playable =
                //
                (): boolean => {
                  const {
                    database_audio,
                  } = item();

                  return (
                    database_audio_is_playable(
                      database_audio,
                    )
                  );
                };

              const open_menu =
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
                ) => {
                  if (
                    is_playable()
                  ) {
                    player_audio_menu.set_context(
                      {
                        player_audio:
                          //
                          item(),

                        x,

                        y,
                      },
                    );
                  }
                };

              onMount(() => {
                if (ref) {
                  const handle_long_press =
                    //
                    (
                      e:
                        //
                        any,
                    ) =>
                      open_menu(
                        //
                        e.detail.clientX as number,
                        //
                        e.detail.clientY as number,
                      );

                  makeEventListener(
                    //
                    ref,
                    //
                    "long-press",
                    //
                    handle_long_press,
                    //
                    { passive: true },
                  );
                }
              });

              const handle_click =
                //
                () => {
                  if (
                    is_playable()
                  ) {
                    player_queue.play_now(
                      item(),
                    );
                  }
                };

              const handle_contextmenu =
                //
                (
                  e:
                    //
                    MouseEvent,
                ) => {
                  e.preventDefault();

                  open_menu(
                    //
                    e.clientX,
                    //
                    e.clientY,
                  );
                };

              return (
                <li
                  //
                  class={
                    //
                    `opacity-0 select-none ${
                      is_playable()
                        //
                        ? "cursor-pointer rounded transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        : "brightness-60"
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
                  {player_audio_render(item())}
                </li>
              );
            }}
          </For>

          <Show when={!end()}>
            <div
              // @ts-ignore
              ref={setEl}
            />
          </Show>
        </ol>

        {player_queue.render()}

        {player_audio_menu.render()}
      </>
    );
  };
