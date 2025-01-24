import {
  actions,
} from "astro:actions";

import type {
  Accessor,
  Component,
  JSX,
} from "solid-js";

import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
} from "solid-js";

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

import Hammer from "hammerjs";

import {
  database_audio_get_stream_endpoint_path,
  database_audio_get_thumbnail_endpoint_path,
  database_audio_thumbnail_sizes,
} from "@/mayo/common/database_audio";

import type {
  read_audio,
} from "@/mayo/common/read_audio";

import {
  read_audio_page_size,
} from "@/mayo/common/read_audio";

import FadeIn from "@/mayo/client/FadeIn";

import Switch from "@/mayo/client/Switch";

type player_audio =
  //
  & Pick<
    //
    read_audio,
    //
    | "id"
    //
    | "has_thumbnail"
    //
    | "processing"
    //
    | "processing_state"
  >
  //
  & {
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
    {
      id,

      has_thumbnail,

      file_name,

      tags,

      duration,

      processing,

      processing_state,
    }:
      //
      read_audio,
  ): player_audio => {
    const parse_tags =
      //
      (): Pick<
        //
        player_audio,
        //
        | "artist"
        //
        | "album"
        //
        | "title"
      > => {
        let artist;

        let album;

        let title;

        if (tags) {
          const map =
            //
            new Map(
              //
              (JSON.parse(
                tags,
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
            map.get(
              "artist",
            );

          album =
            //
            map.get(
              "album",
            );

          title =
            //
            map.get(
              "title",
            );
        }

        if (title === undefined) {
          title =
            //
            file_name;
        }

        return {
          artist,

          album,

          title,
        };
      };

    const format_duration =
      //
      (): Pick<player_audio, "duration"> | undefined => {
        if (duration === null) {
          return;
        }

        const hours =
          //
          Math.floor(
            duration / 3600,
          );

        const minutes =
          //
          Math.floor(
            (duration % 3600) / 60,
          );

        const seconds =
          //
          duration % 60;

        const pad =
          //
          (
            num:
              //
              number,
          ) =>
            String(num)
              //
              .padStart(
                //
                2,
                //
                "0",
              );

        return {
          duration: (
            hours > 0
              //
              ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
              //
              : `${pad(minutes)}:${pad(seconds)}`
          ),
        };
      };

    return {
      id,

      has_thumbnail,

      processing,

      processing_state,

      ...parse_tags(),

      ...format_duration(),
    };
  };

export const player_audio_render_thumbnail =
  //
  (
    audio:
      //
      Pick<
        //
        player_audio,
        //
        | "id"
        //
        | "has_thumbnail"
      >,
  ): JSX.Element => (
    audio.has_thumbnail
      ? (
        <img
          //
          class="w-8 h-8 flex-none rounded"
          //
          src={
            //
            database_audio_get_thumbnail_endpoint_path(
              //
              audio,
              //
              "64",
            )
          }
          //
          alt=""
          //
          decoding="async"
        />
      )
      : (
        <svg
          //
          class="w-8 h-8 flex-none fill-zinc-300"
          //
          viewBox="0 0 24 24"
        >
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8zm2 11h-3v3.75c0 1.24-1.01 2.25-2.25 2.25S8.5 17.99 8.5 16.75s1.01-2.25 2.25-2.25c.46 0 .89.14 1.25.38V11h4zm-3-4V3.5L18.5 9z">
          </path>
        </svg>
      )
  );

const player_audio_render: Component<
  {
    self:
      //
      Accessor<
        player_audio
      >;
  }
> =
  //
  ({
    self,
  }) => {
    const playable =
      //
      () => {
        const {
          processing,

          processing_state,
        } = self();

        return processing === 0 && processing_state !== 1;
      };

    const menu =
      //
      use_definite_menu();

    const player =
      //
      use_definite_player();

    const open_menu =
      //
      (
        position:
          //
          position,
      ) =>
        menu.set_open(
          {
            audio:
              //
              self,

            position,
          },
        );

    const handle_context_menu =
      //
      (
        e:
          //
          MouseEvent,
      ) => {
        if (playable() === false) {
          return;
        }

        e.preventDefault();

        open_menu({
          x:
            //
            e.clientX,

          y:
            //
            e.clientY,
        });
      };

    const handle_press =
      //
      (
        e:
          //
          HammerInput,
      ) => {
        if (playable() === false) {
          return;
        }

        if (
          e.pointerType !== "mouse"
        ) {
          open_menu({
            x:
              //
              e.center.x,

            y:
              //
              e.center.y,
          });
        }
      };

    const handle_tap =
      //
      () => {
        if (playable() === false) {
          return;
        }

        player.play(
          self(),
        );
      };

    const handle_ref =
      //
      (
        ref:
          //
          HTMLDivElement,
      ) => {
        const hammer =
          //
          new Hammer(
            ref,
          );

        onCleanup(() =>
          //
          hammer.destroy()
        );

        hammer.on(
          //
          "press",
          //
          handle_press,
        );

        hammer.on(
          //
          "tap",
          //
          handle_tap,
        );
      };

    const inner =
      //
      () => {
        const {
          id,

          has_thumbnail,

          title,

          processing,

          processing_state,

          artist,

          duration,
        } = self();

        return (
          <div
            // dprint-ignore
            class={`flex gap-3 select-none p-3 ${playable() ? "cursor-pointer rounded transition hover:bg-zinc-900 active:bg-zinc-800" : "opacity-60"}`}
            //
            ref={handle_ref}
            //
            oncontextmenu={handle_context_menu}
          >
            {
              //
              player_audio_render_thumbnail(
                {
                  id,

                  has_thumbnail,
                },
              )
            }

            <div class="mr-auto">
              <h1 class="line-clamp-1 break-all">
                {title}
              </h1>

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

            {duration && (
              <div class="w-8 h-8 flex-none content-center text-zinc-400">
                {duration}
              </div>
            )}
          </div>
        );
      };

    return inner();
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
              id,

              has_thumbnail,

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
                database_audio_get_stream_endpoint_path({
                  id,
                }),
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
                has_thumbnail
                  //
                  ? database_audio_thumbnail_sizes
                    //
                    .map(size => {
                      return {
                        src:
                          //
                          database_audio_get_thumbnail_endpoint_path(
                            //
                            { id },
                            //
                            size,
                          ),

                        sizes: `${size}x${size}`,
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
          player_audio: {
            id,

            has_thumbnail,

            title,

            artist,
          },

          progress,

          paused,

          audio_element,
        } = tmp;

        return (
          <div class="fixed relaitve w-full left-0 bottom-0 select-none bg-zinc-950">
            <div
              //
              class="absolute bg-zinc-800"
              //
              style={{
                width: `${progress()}%`,

                height: "1px",
              }}
            >
            </div>

            <div class="px-4 py-3 border-t border-zinc-900">
              <div class="px-3 max-w-md mx-auto flex gap-4">
                {
                  //
                  player_audio_render_thumbnail(
                    //
                    {
                      //
                      id,
                      //
                      has_thumbnail,
                    },
                  )
                }

                <div>
                  <h1 class="line-clamp-1 break-all">
                    {title}
                  </h1>

                  <div class="line-clamp-1 break-all text-zinc-400">
                    {artist}
                  </div>
                </div>

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

    const enqueue =
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

      enqueue,
    };
  });

const use_definite_player =
  //
  () => use_player()!;

type position =
  //
  {
    x: number;

    y: number;
  };

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
        {
          audio:
            //
            Accessor<
              player_audio
            >;

          position:
            //
            position;
        } | undefined
      >();

    const render =
      //
      () => {
        const tmp =
          //
          open();

        if (tmp === undefined) {
          return;
        }

        const {
          audio,

          position: {
            x,

            y,
          },
        } = tmp;

        const [
          position,

          set_position,
        ] = createSignal(
          {
            left:
              //
              "0px",
            top:
              //
              "0px",
          },
        );

        let ref: HTMLMenuElement | undefined;

        onMount(() => {
          if (ref) {
            const padding_x =
              //
              32;

            const padding_y =
              //
              player.idle()
                //
                ? 16
                //
                : 72;

            const menu_w =
              //
              ref.clientWidth;

            const menu_h =
              //
              ref.clientHeight;

            const normalized_x =
              //
              Math.min(
                //
                x + 6,
                //
                window.innerWidth - padding_x - menu_w,
              );

            const normalized_y =
              //
              Math.min(
                //
                y + 6,
                //
                window.innerHeight - padding_y - menu_h,
              );

            const left =
              //
              `${normalized_x}px`;

            const top =
              //
              `${normalized_y}px`;

            set_position({
              left,

              top,
            });
          }
        });

        const handle_click =
          //
          (
            e:
              //
              MouseEvent,
          ) => {
            if (ref) {
              const rect =
                //
                ref.getBoundingClientRect();

              const distance_y =
                //
                Math.max(
                  //
                  rect.top - e.clientY,
                  //
                  e.clientY - (rect.top + rect.height),
                  //
                  0,
                );

              const distance_x =
                //
                Math.max(
                  //
                  rect.left - e.clientX,
                  //
                  e.clientX - (rect.left + rect.width),
                  //
                  0,
                );

              const distance =
                //
                Math.sqrt(
                  distance_x * distance_x + distance_y * distance_y,
                );

              if (distance > 12) {
                set_open(
                  undefined,
                );
              }
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
          {
            passive:
              //
              true,
          },
        );

        const player =
          //
          use_definite_player();

        const handle_play_next =
          //
          () => {
            player
              //
              .play_next(
                audio(),
              );

            set_open(
              undefined,
            );
          };

        const handle_enqueue =
          //
          () => {
            player
              //
              .enqueue(
                audio(),
              );

            set_open(
              undefined,
            );
          };

        return (
          <menu
            //
            class="fixed bg-zinc-950 border-zinc-900 divide-y divide-zinc-900 rounded"
            //
            style={position()}
            //
            ref={ref}
          >
            <li>
              <button
                //
                class="w-full flex gap-2 py-3 pl-3 pr-4 items-center outline-none rounded-t select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800"
                //
                onClick={handle_play_next}
              >
                <svg
                  //
                  class="w-5 h-5 fill-zinc-300"
                  //
                  viewBox="0 0 24 24"
                >
                  <path d="M3 10h11v2H3zm0-4h11v2H3zm0 8h7v2H3zm13-1v8l6-4z">
                  </path>
                </svg>

                Play next
              </button>
            </li>

            <li>
              <button
                //
                class="w-full flex gap-2 py-3 pl-3 pr-4 items-center outline-none rounded-b select-none cursor-pointer transition hover:bg-zinc-900 active:bg-zinc-800"
                //
                onClick={handle_enqueue}
              >
                <svg
                  //
                  class="w-5 h-5 fill-zinc-300"
                  //
                  viewBox="0 0 24 24"
                >
                  <path d="M15 6H3v2h12zm0 4H3v2h12zM3 16h8v-2H3zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6z">
                  </path>
                </svg>

                Enqueue
              </button>
            </li>
          </menu>
        );
      };

    return {
      open,

      render,

      set_open,
    };
  });

const use_definite_menu =
  //
  () => use_menu()!;

const [
  IdbProvider,

  use_idb,
] =
  //
  createContextProvider((): Promise<
    //
    IDBDatabase
  > => {
    return new Promise((
      //
      resolve,
      //
      reject,
    ) => {
      const req =
        //
        indexedDB.open(
          //
          "player-offline-storage",
          //
          1,
        );

      req.onerror =
        //
        () =>
          reject(
            //
            req.error,
          );

      req.onsuccess =
        //
        () =>
          resolve(
            //
            req.result,
          );

      req.onupgradeneeded =
        //
        (e) => {
          const idb =
            //
            req.result;

          switch (e.oldVersion) {
            case 0:
              const audio_store =
                //
                idb.createObjectStore(
                  //
                  "audio",
                  //
                  {
                    keyPath:
                      //
                      "id",
                  },
                );

              audio_store.createIndex(
                //
                "time_uploaded",
                //
                "time_uploaded",
              );

              break;

            default:
              throw new Error("unexpected idb version");
          }
        };
    });
  });

const use_definite_idb =
  //
  () => use_idb()!;

const ProviderWrapper: Component =
  //
  () => (
    <MultiProvider
      values={[
        IdbProvider,

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
        read_audio["id"],
    ) => Promise<
      //
      read_audio | null
    >;

  fetch_page:
    //
    (
      page:
        //
        number,
    ) => Promise<
      //
      read_audio[]
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

const fetcher_create_offline =
  //
  (): fetcher => {
    return {
      fetch_one:
        //
        (
          id,
        ) =>
          use_definite_idb()
            //
            .then(idb =>
              new Promise((
                //
                resolve,
                //
                reject,
              ) => {
                const req =
                  //
                  idb
                    //
                    .transaction("audio")
                    //
                    .objectStore("audio")
                    //
                    .get(id);

                req.onerror =
                  //
                  () =>
                    reject(
                      //
                      req.error,
                    );

                req.onsuccess =
                  //
                  () =>
                    resolve(
                      //
                      req.result
                        //
                        ? req.result as read_audio
                        //
                        : null,
                    );
              })
            ),

      fetch_page:
        //
        (
          //
          page,
        ) =>
          use_definite_idb()
            //
            .then(idb =>
              new Promise((
                //
                resolve,
                //
                reject,
              ) => {
                const req = idb
                  //
                  .transaction("audio")
                  //
                  .objectStore("audio")
                  //
                  .index("time_uploaded")
                  //
                  .openCursor(null, "prev");

                req.onerror =
                  //
                  () =>
                    reject(
                      //
                      req.error,
                    );

                req.onsuccess =
                  //
                  () => {
                    const result =
                      //
                      [];

                    const cursor =
                      //
                      req.result;

                    if (cursor !== null) {
                      try {
                        cursor.advance(
                          //
                          read_audio_page_size * page,
                        );

                        while (
                          //
                          cursor.value
                          //
                          && result.length < read_audio_page_size
                        ) {
                          result.push(
                            //
                            cursor.value as read_audio,
                          );

                          cursor.continue();
                        }
                      } catch (e) {
                        // Guard against `.advance` or `.continue` throwing
                        // `InvalidStateError` ("thrown if the cursor is being iterated
                        // or has iterated past its end").
                      }
                    }

                    resolve(
                      //
                      result,
                    );
                  };
              })
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
      createMemo(() =>
        online()
          //
          ? fetcher_create_online()
          //
          : fetcher_create_offline()
      );

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
                  id,

                  processing,
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
                  id,
                }: player_audio = current();

                const poll =
                  //
                  async () => {
                    const fresh: read_audio | null =
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
                      processing,

                      processing_state,
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
        <Switch checked={online()} />

        <ol class={`grid gap-1 ${player.idle() ? "" : "pb-14"}`.trim()}>
          <For each={pages()}>
            {(
              //
              [
                audio,
              ],
              //
              index,
            ) => (
              <li>
                <FadeIn
                  //
                  duration={750}
                  //
                  delay={index() * 25}
                >
                  {
                    //
                    player_audio_render({
                      self:
                        //
                        audio,
                    })
                  }
                </FadeIn>
              </li>
            )}
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
