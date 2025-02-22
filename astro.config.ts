import solidJs from "@astrojs/solid-js";

import tailwindcss from "@tailwindcss/vite";

import {
  defineConfig,
  passthroughImageService,
} from "astro/config";

import adapter from "./adapter";

import compression from "./integrations/compression";

import fatServer from "./integrations/fat-server";

import serviceWorker from "./integrations/service-worker";

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
        solidJs(),

        serviceWorker(),

        compression(),

        fatServer(),
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
        worker:
          //
          {
            format:
              //
              "es",
          },

        plugins:

          //
          [
            // @ts-ignore
            tailwindcss(),
          ],
      },
  },
);
