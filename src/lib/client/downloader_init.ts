import {
  wrap,
} from "comlink";

import type {
  Remote,
} from "comlink";

import type {
  downloader_api,
} from "./downloader_api";

import type {
  downloader_remove,
  downloader_run,
} from "./downloader_rpc";

import {
  DOWNLOADER_REMOVE,
  DOWNLOADER_RUN,
} from "./downloader_rpc";

const worker = new Worker(new URL("./downloader.ts", import.meta.url), {
  type: "module",
});

const downloader_api: Remote<downloader_api> =
  //
  wrap(worker);

downloader_api.run();

const handle_run =
  //
  (
    //
    _e:
      //
      downloader_run,
  ) => {
    downloader_api.run();
  };

const handle_remove =
  //
  (
    //
    e:
      //
      downloader_remove,
  ) => {
    downloader_api.remove(e.detail);
  };

window.addEventListener(
  //
  DOWNLOADER_RUN,
  //
  handle_run as EventListener,
);

window.addEventListener(
  //
  DOWNLOADER_REMOVE,
  //
  handle_remove as EventListener,
);
