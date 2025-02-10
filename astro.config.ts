import solidJs from "@astrojs/solid-js";

import tailwindcss from "@tailwindcss/vite";

import {
  defineConfig,
  passthroughImageService,
} from "astro/config";

import adapter from "./adapter";

import serviceWorker from "./service-worker";

export default defineConfig(
  {
    srcDir:
      //
      "src",

    output:
      //
      "server",

    adapter:
      //
      adapter(),

    integrations:
      //
      [
        serviceWorker(),

        solidJs(),
      ],

    image:
      //
      {
        service:
          //
          passthroughImageService(),
      },

    vite:
      //
      {
        plugins:

          //
          [
            // @ts-ignore
            tailwindcss(),
          ],
      },
  },
);
