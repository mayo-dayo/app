import {
  createInfiniteScroll,
} from "@solid-primitives/pagination";

import type {
  Component,
} from "solid-js";

import {
  For,
  Match,
  Show,
  Switch,
} from "solid-js";

import {
  Entrypoint,
} from "./Entrypoint";

import {
  use_network_error,
} from "./network_error";

import {
  player_audio_list_item_render,
} from "./player_audio_list_item";

import {
  use_player_audio_menu,
} from "./player_audio_menu";

import {
  get_page,
} from "./player_audio_network";

const All: Component =
  //
  () => {
    const network_error =
      //
      use_network_error()!;

    const player_audio_menu =
      //
      use_player_audio_menu()!;

    const [
      pages,

      setEl,

      { end },
    ] = createInfiniteScroll(
      get_page,
    );

    return (
      <Switch>
        <Match when={network_error() === false}>
          <ol class="grid gap-1 pb-15">
            <For each={pages()}>
              {player_audio_list_item_render}
            </For>

            <Show when={!end()}>
              <div
                // @ts-ignore
                ref={setEl}
              />
            </Show>
          </ol>

          {player_audio_menu.render()}
        </Match>

        <Match when={network_error() === true}>
          <div class="p-4 text-center">
            It seems you are offline 😔
          </div>
        </Match>
      </Switch>
    );
  };

export const List = Entrypoint(All);
