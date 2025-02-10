import {
  wrap,
} from "comlink";

import type {
  Remote,
} from "comlink";

import type {
  search_api,
} from "./search_api";

import type {
  search_remove,
  search_search,
} from "./search_rpc";

import {
  SEARCH_REMOVE,
  SEARCH_SEARCH,
} from "./search_rpc";

const worker = new Worker(new URL("./search.ts", import.meta.url), {
  type: "module",
});

const search_api: Remote<search_api> =
  //
  wrap(worker);

const handle_search =
  //
  (
    //
    event:
      //
      search_search,
  ) => {
    search_api
      //
      .search(
        //
        event.detail.input.query,
        //
        event.detail.input.offset,
        //
        event.detail.input.limit,
      )
      //
      .then(result =>
        //
        event.detail.resolve(
          //
          result,
        )
      )
      //
      .catch(error =>
        //
        event.detail.reject(
          //
          error,
        )
      );
  };

const handle_remove =
  //
  (
    //
    event:
      //
      search_remove,
  ) => {
    search_api.remove(event.detail);
  };

window.addEventListener(
  //
  SEARCH_SEARCH,
  //
  handle_search as EventListener,
);

window.addEventListener(
  //
  SEARCH_REMOVE,
  //
  handle_remove as EventListener,
);
