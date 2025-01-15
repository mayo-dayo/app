import {
  defineConfig,
} from "astro/config";

import bun from "@nurodev/astro-bun";

import solidJs from "@astrojs/solid-js";

import tailwind from "@astrojs/tailwind";

export default defineConfig({
  output: "server",

  adapter: bun(),

  integrations: [solidJs(), tailwind()],
});
