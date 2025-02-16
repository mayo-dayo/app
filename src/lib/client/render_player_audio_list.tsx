import {
  createInfiniteScroll,
} from "@solid-primitives/pagination";

import type {
  JSX,
} from "solid-js";

import {
  createSignal,
  For,
  Match,
  Show,
  Switch,
} from "solid-js";

import type {
  player_audio,
} from "./player_audio";

import type {
  player_audio_context_menu,
} from "./player_audio_context_menu";

import {
  render_player_audio_context_menu,
} from "./render_player_audio_context_menu";

import {
  render_player_audio_list_item,
} from "./render_player_audio_list_item";

type optional<T> =
  //
  | T
  //
  | undefined;

export const render_player_audio_list =
  //
  (
    get_page:
      //
      (
        number:
          //
          number,
      ) => Promise<player_audio[]>,
  ): JSX.Element => {
    const [
      error,

      set_error,
    ] = createSignal<
      optional<
        any
      >
    >();

    const [
      context_menu,

      set_context_menu,
    ] = createSignal<
      optional<
        player_audio_context_menu
      >
    >();

    const [
      pages,

      setEl,

      { end },
    ] = createInfiniteScroll(
      (
        number,
      ) =>
        get_page(
          number,
        )
          //
          .catch(e => {
            set_error(
              e,
            );

            return [];
          }),
    );

    return (
      <Switch>
        <Match when={error() === undefined}>
          <ol class="grid gap-1 pb-16">
            <For each={pages()}>
              {(
                //
                item,
                //
                index,
              ) =>
                render_player_audio_list_item(
                  //
                  item,
                  //
                  index,
                  //
                  set_error,
                  //
                  set_context_menu,
                )}
            </For>
          </ol>

          <Show when={!end()}>
            <div
              // @ts-ignore
              ref={setEl}
            />
          </Show>

          <Show when={context_menu()}>
            {render_player_audio_context_menu(
              context_menu()!,
            )}
          </Show>
        </Match>

        <Match when={error() !== undefined}>
          <div class="p-4 text-center">
            There was an error loading songs 😔
          </div>
        </Match>
      </Switch>
    );
  };
