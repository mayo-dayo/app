import type {
  JSX,
} from "solid-js";

import {
  createSignal,
} from "solid-js";

type layout_type =
  //
  | "list"
  //
  | "grid";

const local_storage_key = "mayo_layout_preference";

const get_saved_layout = (): layout_type => {
  const saved = localStorage.getItem(local_storage_key);
  return saved === "grid" ? "grid" : "list";
};

const save_layout = (layout: layout_type): void => {
  localStorage.setItem(local_storage_key, layout);
};

export const create_layout_switcher = () => {
  const [
    layout,

    set_layout,
  ] = createSignal<layout_type>(
    get_saved_layout(),
  );

  const toggle_layout = () => {
    const new_layout = layout() === "list" ? "grid" : "list";
    set_layout(new_layout);
    save_layout(new_layout);
  };

  return {
    layout,
    toggle_layout,
  };
};

export const render_layout_switcher = (
  layout: () => layout_type,
  toggle_layout: () => void,
): JSX.Element => {
  return (
    <button
      //
      class="flex items-center justify-center w-8 h-8 rounded-lg transition hover:bg-zinc-900 active:bg-zinc-800"
      //
      onClick={toggle_layout}
      //
      title={`Switch to ${layout() === "list" ? "grid" : "list"} view`}
    >
      {layout() === "list" ? (
        <svg
          //
          class="w-5 h-5 fill-current"
          //
          viewBox="0 0 24 24"
        >
          <path d="M3 3h4v4H3V3zm0 7h4v4H3v-4zm0 7h4v4H3v-4zm7-14h11v4H10V3zm0 7h11v4H10v-4zm0 7h11v4H10v-4z" />
        </svg>
      ) : (
        <svg
          //
          class="w-5 h-5 fill-current"
          //
          viewBox="0 0 24 24"
        >
          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z" />
        </svg>
      )}
    </button>
  );
};