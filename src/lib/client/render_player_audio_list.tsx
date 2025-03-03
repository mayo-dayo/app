import {
  createScheduled,
  debounce,
} from "@solid-primitives/scheduled";

import type {
  JSX,
} from "solid-js";

import {
  createEffect,
  createSignal,
  For,
  Match,
  Show,
  Switch,
  untrack,
} from "solid-js";

import {
  createInfiniteScroll,
} from "./create_infinite_scroll";

import type {
  player_audio,
} from "./player_audio";

import {
  render_player_audio_list_item,
} from "./render_player_audio_list_item";

export const render_player_audio_list =
  //
  (
    get_page:
      //
      (
        //
        number:
          //
          number,
        //
        query?:
          //
          string,
      ) => Promise<player_audio[]>,
  ): JSX.Element => {
    const [
      error,

      set_error,
    ] = createSignal<
      any | undefined
    >();

    const [
      query,

      set_query,
    ] = createSignal(
      "",
    );

    const [
      pages,

      setEl,

      {
        end,

        refetch,
      },
    ] = createInfiniteScroll(number =>
      get_page(
        //
        number,
        //
        query(),
      )
        //
        .catch(e => {
          set_error(
            e,
          );

          return [];
        })
    );

    const scheduled =
      //
      createScheduled(fn =>
        debounce(
          //
          fn,
          //
          100,
        )
      );

    createEffect(
      //
      (
        //
        previous_query?:
          //
          string,
      ) => {
        const current_query =
          //
          query();

        if (
          //
          (current_query && current_query.length > 2 && current_query.length < 70)
          //
          || (previous_query && previous_query.length > 1 && previous_query.length < 71)
          //
          || (current_query === "" && previous_query === "")
        ) {
          if (scheduled()) {
            untrack(refetch);
          }
        }

        return current_query;
      },
    );

    return (
      <Switch>
        <Match when={error() === undefined}>
          <input
            //
            class="px-4 py-2 rounded-2xl outline-none transition border border-zinc-900 focus:border-zinc-800 placeholder:text-zinc-600"
            //
            type="search"
            //
            placeholder="Search"
            //
            value={query()}
            //
            onInput={e => set_query(e.target.value)}
            //
            spellcheck={false}
          />

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
                )}
            </For>
          </ol>

          <Show when={!end()}>
            <div
              // @ts-ignore
              ref={setEl}
            />
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
