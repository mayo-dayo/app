import {
  actions,
} from "astro:actions";

import {
  makeAudio,
} from "@solid-primitives/audio";

import {
  createContextProvider,
  MultiProvider,
} from "@solid-primitives/context";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import {
  createInfiniteScroll,
} from "@solid-primitives/pagination";

import type {
  Accessor,
  Component,
  JSX,
} from "solid-js";

import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
  For,
  Match,
  onCleanup,
  Show,
  Switch,
} from "solid-js";

import FadeIn from "@/mayo/client/FadeIn";

import {
  offline_audio_get,
  offline_audio_get_download_state,
} from "@/mayo/client/offline_audio";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

import {
  database_audio_get_stream_endpoint_path,
  database_audio_get_thumbnail_endpoint_path,
  database_audio_is_playable,
  database_audio_thumbnail_sizes,
} from "@/mayo/common/database_audio";

type player_audio =
  //
  {
    database_audio:
      //
      database_audio;

    duration?:
      //
      string;

    artist?:
      //
      string;

    album?:
      //
      string;

    title?:
      //
      string;
  };

const player_audio_create =
  //
  (
    database_audio:
      //
      database_audio,
  ): player_audio => {
    let artist;

    let album;

    let title;

    if (
      database_audio.tags
    ) {
      const tags =
        //
        new Map(
          //
          (JSON.parse(
            database_audio.tags,
          ) as string[][])
            //
            .map(([
              k,

              v,
            ]) => [
              k.toLowerCase(),

              v,
            ]),
        );

      artist =
        //
        tags.get(
          "artist",
        );

      album =
        //
        tags.get(
          "album",
        );

      title =
        //
        tags.get(
          "title",
        );
    }

    if (title === undefined) {
      title =
        //
        database_audio.file_name;
    }

    let duration;

    if (
      database_audio.duration
    ) {
      const h =
        //
        Math.floor(database_audio.duration / 3600);

      const m =
        //
        Math.floor((database_audio.duration % 3600) / 60);

      const s =
        //
        database_audio.duration % 60;

      const pad =
        //
        (
          number:
            //
            number,
        ) => String(number).padStart(2, "0");

      duration =
        //
        h > 0
          //
          ? `${pad(h)}:${pad(m)}:${pad(s)}`
          //
          : `${pad(m)}:${pad(s)}`;
    }

    return {
      database_audio,

      artist,

      album,

      title,

      duration,
    };
  };

const player_audio_render =
  //
  (
    //
    player_audio:
      //
      player_audio,
  ): JSX.Element => {
    const {
      database_audio,

      title,

      artist,
    } = player_audio;

    const {
      processing,

      processing_state,
    } = database_audio;

    return (
      <div class="flex gap-3">
        <div class="w-9 h-9 flex-none">
          <Switch>
            <Match
              when={
                //
                database_audio.has_thumbnail === 1
              }
            >
              <img
                //
                class="w-full h-full rounded"
                //
                src={
                  //
                  database_audio_get_thumbnail_endpoint_path(
                    //
                    database_audio,
                    //
                    "64",
                  )
                }
                //
                alt=""
                //
                decoding="async"
              />
            </Match>

            <Match
              when={
                //
                database_audio.has_thumbnail === 0
              }
            >
              <svg
                //
                class="w-full h-full fill-zinc-300"
                //
                viewBox="0 -960 960 960"
              >
                <path d="M430-200q38 0 64-26t26-64v-150h120v-80H480v155q-11-8-23.5-11.5T430-380q-38 0-64 26t-26 64q0 38 26 64t64 26ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z" />
              </svg>
            </Match>
          </Switch>
        </div>

        <div class="my-auto">
          <div class="line-clamp-1 break-all">
            {title}
          </div>

          <div class="line-clamp-1 break-all text-zinc-400">
            {
              //
              processing === 0
                //
                ? processing_state === 1
                  //
                  ? <>Unable to process this file.</>
                  //
                  : artist
                //
                : artist ?? <>Processing...</>
            }
          </div>
        </div>
      </div>
    );
  };

const [
  PlayerProvider,

  use_player,
] =
  //
  createContextProvider(() => {
    const [
      queue,

      set_queue,
    ] =
      //
      createSignal<
        player_audio[]
      >(
        [],
      );

    const cursor =
      //
      createMemo(() => {
        const current_queue =
          //
          queue();

        const [
          index,

          set_index,
        ] =
          //
          createSignal(
            //
            0,
            //
            {
              equals:
                //
                false,
            },
          );

        const [
          has_next_track,

          set_has_next_track,
        ] =
          //
          createSignal(
            false,
          );

        const [
          has_previous_track,

          set_has_previous_track,
        ] =
          //
          createSignal(
            false,
          );

        const sync_has_next_track =
          //
          (
            index:
              //
              number,
          ) =>
            set_has_next_track(
              index < queue().length - 1,
            );

        const sync_has_previous_track =
          //
          (
            index:
              //
              number,
          ) =>
            set_has_previous_track(
              index > 0,
            );

        const next_track =
          //
          () =>
            set_index(
              index => index + 1,
            );

        const previous_track =
          //
          () =>
            set_index(
              index => index - 1,
            );

        createEffect(() => {
          const current_index =
            //
            index();

          sync_has_next_track(
            current_index,
          );

          sync_has_previous_track(
            current_index,
          );
        });

        const media_session =
          //
          navigator.mediaSession;

        if (media_session) {
          createEffect(() => {
            media_session.setActionHandler(
              //
              "nexttrack",
              //
              has_next_track()
                //
                ? next_track
                //
                : null,
            );
          });

          createEffect(() => {
            media_session.setActionHandler(
              //
              "previoustrack",
              //
              has_previous_track()
                //
                ? previous_track
                //
                : null,
            );
          });

          onCleanup(() => {
            media_session.playbackState =
              //
              "none";

            media_session.metadata =
              //
              null;

            media_session.setActionHandler(
              //
              "nexttrack",
              //
              null,
            );

            media_session.setActionHandler(
              //
              "previoustrack",
              //
              null,
            );
          });
        }

        const current_track =
          //
          createMemo(() => {
            const current_index =
              //
              index();

            const player_audio =
              //
              current_queue[
                current_index
              ];

            if (player_audio === undefined) {
              return;
            }

            const {
              database_audio,

              title,

              artist,

              album,
            } = player_audio;

            const [
              progress,

              set_progress,
            ] =
              //
              createSignal(
                0,
              );

            const [
              paused,

              set_paused,
            ] =
              //
              createSignal(
                false,
              );

            const handle_ended =
              //
              () =>
                has_next_track()
                  //
                  ? next_track()
                  //
                  : set_queue([]);

            const handle_timeupdate =
              //
              () =>
                set_progress(
                  (audio_element.currentTime / audio_element.duration) * 100,
                );

            const handle_pause =
              //
              () =>
                set_paused(
                  true,
                );

            const handle_play =
              //
              () =>
                set_paused(
                  false,
                );

            const audio_element =
              //
              makeAudio(
                //
                database_audio_get_stream_endpoint_path(
                  database_audio,
                ),
                //
                {
                  ended:
                    //
                    handle_ended,

                  timeupdate:
                    //
                    handle_timeupdate,

                  pause:
                    //
                    handle_pause,

                  play:
                    //
                    handle_play,
                },
              );

            if (media_session) {
              media_session.setActionHandler(
                //
                "play",
                //
                () =>
                  //
                  audio_element.play(),
              );

              media_session.setActionHandler(
                //
                "pause",
                //
                () =>
                  //
                  audio_element.pause(),
              );

              media_session.setActionHandler(
                //
                "stop",
                //
                () =>
                  //
                  set_queue([]),
              );

              onCleanup(() => {
                media_session.setActionHandler(
                  //
                  "pause",
                  //
                  null,
                );

                media_session.setActionHandler(
                  //
                  "play",
                  //
                  null,
                );

                media_session.setActionHandler(
                  //
                  "stop",
                  //
                  null,
                );
              });

              createEffect(() => {
                media_session.playbackState =
                  //
                  paused()
                    //
                    ? "paused"
                    //
                    : "playing";
              });

              media_session.playbackState =
                //
                "playing";

              const artwork =
                //
                database_audio.has_thumbnail
                  //
                  ? database_audio_thumbnail_sizes
                    //
                    .map(size => {
                      const src =
                        //
                        database_audio_get_thumbnail_endpoint_path(
                          //
                          database_audio,
                          //
                          size,
                        );

                      const sizes =
                        //
                        `${size}x${size}`;

                      return {
                        src,

                        sizes,
                      };
                    })
                  //
                  : [];

              media_session.metadata =
                //
                new MediaMetadata({
                  title,

                  artist,

                  album,

                  artwork,
                });
            }

            audio_element.play();

            return {
              player_audio,

              progress,

              paused,

              audio_element,
            };
          });

        return {
          index,

          current_track,

          has_next_track,

          has_previous_track,

          next_track,

          previous_track,

          sync_has_next_track,

          sync_has_previous_track,
        };
      });

    const render =
      //
      () => {
        const {
          current_track,

          has_next_track,

          has_previous_track,

          next_track,

          previous_track,
        } = cursor();

        const tmp =
          //
          current_track();

        if (tmp === undefined) {
          return;
        }

        const {
          player_audio,

          progress,

          paused,

          audio_element,
        } = tmp;

        return (
          <div class="fixed relaitve w-full left-0 bottom-0 select-none bg-zinc-950">
            <div
              //
              class="absolute h-px bg-zinc-800"
              //
              style={{
                width: `${progress()}%`,
              }}
            />

            <div class="px-4 py-3 border-t border-zinc-900">
              <div class="px-3 max-w-md mx-auto flex gap-4">
                {player_audio_render(
                  player_audio,
                )}

                <menu class="ml-auto my-auto flex gap-2">
                  <li>
                    <button
                      // dprint-ignore
                      class={`w-8 h-8 flex ${has_previous_track() ? "cursor-pointer rounded-full transition hover:bg-zinc-900 active:bg-zinc-800" : ""}`.trim()}
                      //
                      onClick={has_previous_track() ? previous_track : undefined}
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
                      onClick={has_next_track() ? next_track : undefined}
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
      };

    const idle =
      //
      (): boolean =>
        cursor()
          //
          .current_track() === undefined;

    const play =
      //
      (
        audio:
          //
          player_audio,
      ) =>
        set_queue(
          [audio],
        );

    const play_next =
      //
      (
        audio:
          //
          player_audio,
      ) => {
        if (
          idle()
        ) {
          return play(
            audio,
          );
        }

        const current_index =
          //
          cursor()
            //
            .index();

        queue()
          //
          .splice(
            //
            current_index + 1,
            //
            0,
            //
            audio,
          );

        cursor()
          //
          .sync_has_next_track(
            current_index,
          );
      };

    const play_later =
      //
      (
        audio:
          //
          player_audio,
      ) => {
        if (
          idle()
        ) {
          return play(
            audio,
          );
        }

        const current_index =
          //
          cursor()
            //
            .index();

        queue()
          //
          .push(
            audio,
          );

        cursor()
          //
          .sync_has_next_track(
            //
            current_index,
          );
      };

    return {
      render,

      idle,

      play,

      play_next,

      play_later,
    };
  });

const use_definite_player =
  //
  () => use_player()!;

const [
  MenuProvider,

  use_menu,
] =
  //
  createContextProvider(() => {
    const [
      open,

      set_open,
    ] =
      //
      createSignal<
        Accessor<player_audio> | undefined
      >();

    const render =
      //
      () => {
        let ref: HTMLDialogElement | undefined;

        createEffect(() =>
          open() === undefined
            //
            ? ref?.close()
            //
            : ref?.showModal()
        );

        const content =
          //
          createMemo(() => {
            const player_audio =
              //
              open();

            if (player_audio === undefined) {
              return;
            }

            const [
              offline_audio_download_state,
            ] =
              //
              createResource(() => {
                const {
                  database_audio,
                } = player_audio();

                return (
                  offline_audio_get(
                    database_audio,
                  )
                    //
                    .then(offline_audio =>
                      offline_audio
                        //
                        ? offline_audio_get_download_state(offline_audio)
                        //
                        : null
                    )
                );
              });

            const player =
              //
              use_definite_player();

            const handle_play_now =
              //
              () => {
                set_open(
                  undefined,
                );

                player.play(
                  player_audio(),
                );
              };

            const handle_play_next =
              //
              () => {
                set_open(
                  undefined,
                );

                player.play_next(
                  player_audio(),
                );
              };

            const handle_play_later =
              //
              () => {
                set_open(
                  undefined,
                );

                player.play_later(
                  player_audio(),
                );
              };

            const handle_download =
              //
              () => {
                set_open(
                  undefined,
                );
              };

            const handle_cancel =
              //
              () => {
                set_open(
                  undefined,
                );
              };

            const handle_delete =
              //
              () => {
                set_open(
                  undefined,
                );
              };

            const handle_retry =
              //
              () => {
                set_open(
                  undefined,
                );
              };

            return (
              <div class="space-y-1">
                <div class="rounded bg-zinc-950">
                  <div class="p-3">
                    {player_audio_render(player_audio())}
                  </div>

                  <menu class="grid grid-cols-3 border-t border-zinc-900 divide-x divide-zinc-900">
                    <li>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded-bl"
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

                        Play
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        onClick={handle_play_next}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="M120-320v-80h280v80H120Zm0-160v-80h440v80H120Zm0-160v-80h440v80H120Zm520 480v-160H480v-80h160v-160h80v160h160v80H720v160h-80Z" />
                        </svg>

                        Next
                      </button>
                    </li>

                    <li>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 outline-none select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded-br"
                        //
                        onClick={handle_play_later}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="M640-160q-50 0-85-35t-35-85q0-50 35-85t85-35q11 0 21 1.5t19 6.5v-328h200v80H760v360q0 50-35 85t-85 35ZM120-320v-80h320v80H120Zm0-160v-80h480v80H120Zm0-160v-80h480v80H120Z" />
                        </svg>

                        Later
                      </button>
                    </li>
                  </menu>
                </div>

                <div class="rounded bg-zinc-950 h-10">
                  <Switch>
                    <Match when={offline_audio_download_state() === null}>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded"
                        //
                        onClick={handle_download}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z" />
                        </svg>

                        Download
                      </button>
                    </Match>

                    <Match when={offline_audio_download_state() === "pending"}>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded"
                        //
                        onClick={handle_cancel}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
                        </svg>

                        Cancel
                      </button>
                    </Match>

                    <Match when={offline_audio_download_state() === "finished"}>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded"
                        //
                        onClick={handle_delete}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="M791-55 686-160H240q-33 0-56.5-23.5T160-240v-120h80v120h366L503-343l-23 23-200-200 23-23L55-791l57-57 736 736-57 57ZM617-457l-57-57 64-64 56 58-63 63Zm-97-97-80-80v-166h80v246Zm280 280-80-80v-6h80v86Z" />
                        </svg>

                        Delete
                      </button>
                    </Match>

                    <Match when={offline_audio_download_state() === "error"}>
                      <button
                        //
                        class="flex justify-center items-center gap-1 w-full p-3 select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800 rounded"
                        //
                        onClick={handle_retry}
                      >
                        <svg
                          //
                          class="w-4 h-4 fill-zinc-300"
                          //
                          viewBox="0 -960 960 960"
                        >
                          <path d="M160-160v-80h110l-16-14q-52-46-73-105t-21-119q0-111 66.5-197.5T400-790v84q-72 26-116 88.5T240-478q0 45 17 87.5t53 78.5l10 10v-98h80v240H160Zm400-10v-84q72-26 116-88.5T720-482q0-45-17-87.5T650-648l-10-10v98h-80v-240h240v80H690l16 14q49 49 71.5 106.5T800-482q0 111-66.5 197.5T560-170Z" />
                        </svg>

                        Retry
                      </button>
                    </Match>
                  </Switch>
                </div>
              </div>
            );
          });

        return (
          <dialog
            //
            class="m-auto w-2xs max-h-none text-inherit bg-transparent"
            //
            ref={ref}
            //
            onClick={() => set_open(undefined)}
          >
            <div
              //
              onClick={(e) => e.stopPropagation()}
            >
              {content()}
            </div>
          </dialog>
        );
      };

    return {
      open,

      set_open,

      render,
    };
  });

const use_definite_menu =
  //
  () => use_menu()!;

const ProviderWrapper: Component =
  //
  () => (
    <MultiProvider
      values={[
        PlayerProvider,

        MenuProvider,
      ]}
    >
      <List />
    </MultiProvider>
  );

export default ProviderWrapper;

type fetcher = {
  fetch_one:
    //
    (
      id:
        //
        database_audio["id"],
    ) => Promise<
      //
      database_audio | null
    >;

  fetch_page:
    //
    (
      page:
        //
        number,
    ) => Promise<
      //
      database_audio[]
    >;
};

const fetcher_create_online =
  //
  (): fetcher => {
    return {
      fetch_one:
        //
        (
          id,
        ) =>
          actions.audio.get_one.orThrow(
            id,
          ),

      fetch_page:
        //
        (
          page,
        ) =>
          actions.audio.get_page.orThrow(
            page,
          ),
    };
  };

const List: Component =
  //
  () => {
    const [
      online,

      set_online,
    ] = createSignal(
      navigator.onLine,
    );

    makeEventListener(
      //
      window,
      //
      "online",
      //
      () => set_online(true),
      //
      { passive: true },
    );

    makeEventListener(
      //
      window,
      //
      "offline",
      //
      () => set_online(false),
      //
      { passive: true },
    );

    const fetcher =
      //
      createMemo(() => fetcher_create_online());

    const fetch_page =
      //
      (
        page: number,
      ) =>
        fetcher()
          //
          .fetch_page(page)
          //
          .then(page =>
            page.map(audio =>
              createSignal(
                //
                player_audio_create(
                  //
                  audio,
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
      async () =>
        setPages(
          //
          await fetch_page(0),
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

    createEffect(() => {
      if (
        online()
      ) {
        const timers =
          //
          new Map();

        onCleanup(() =>
          timers.forEach(
            clearInterval,
          )
        );

        createEffect(() => {
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
                const {
                  database_audio: {
                    id,
                  },
                }: player_audio = current();

                const poll =
                  //
                  async () => {
                    const fresh: database_audio | null =
                      //
                      await fetcher()
                        //
                        .fetch_one(
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

                      timers
                        //
                        .delete(
                          id,
                        );
                    }

                    const {
                      database_audio: {
                        processing,

                        processing_state,
                      },
                    }: player_audio = current();

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

                const timer =
                  //
                  setInterval(
                    //
                    poll,
                    //
                    1000,
                  );

                timers
                  //
                  .set(
                    //
                    id,
                    //
                    timer,
                  );
              },
            );
        });
      }
    });

    const menu =
      //
      use_definite_menu();

    const player =
      //
      use_definite_player();

    return (
      <>
        <ol class={`grid gap-1 ${player.idle() ? "" : "pb-14"}`.trim()}>
          <For each={pages()}>
            {(
              //
              [
                player_audio,
              ],
              //
              index,
            ) => {
              const {
                database_audio,
              } = player_audio();

              const is_playable =
                //
                database_audio_is_playable(
                  database_audio,
                );

              const handle_click =
                //
                () => menu.set_open(() => player_audio);

              return (
                <li
                  //
                  class={
                    //
                    `select-none ${
                      is_playable
                        //
                        ? "cursor-pointer rounded transition hover:bg-zinc-900 active:bg-zinc-800"
                        //
                        : "opacity-60"
                    }`
                  }
                  //
                  onClick={
                    //
                    is_playable
                      //
                      ? handle_click
                      //
                      : undefined
                  }
                >
                  <FadeIn
                    //
                    duration={750}
                    //
                    delay={index() * 25}
                  >
                    <div class="flex p-3">
                      {player_audio_render(player_audio())}
                    </div>
                  </FadeIn>
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

        {
          //
          menu
            //
            .render()
        }

        {
          //
          player
            //
            .render()
        }
      </>
    );
  };
