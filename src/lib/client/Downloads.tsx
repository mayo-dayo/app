import {
  createInfiniteScroll,
} from "@solid-primitives/pagination";

import type {
  Component,
} from "solid-js";

import {
  For,
  Show,
} from "solid-js";

import {
  Entrypoint,
} from "./Entrypoint";

import {
  player_audio_list_item_render,
} from "./player_audio_list_item";

import {
  use_player_audio_menu,
} from "./player_audio_menu";

import {
  get_page,
} from "./player_audio_storage";

const Downloads: Component =
  //
  () => {
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
      <>
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
      </>
    );
  };

export const List = Entrypoint(Downloads);
