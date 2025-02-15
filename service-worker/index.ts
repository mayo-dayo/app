import type {
  AstroIntegration,
} from "astro";

import path from "node:path";

import {
  rolldown,
} from "rolldown";

export default function(): AstroIntegration {
  return {
    name:
      //
      "service-worker",

    hooks:
      //
      {
        "astro:build:done":
          //
          async ({ dir }) => {
            const directory_path =
              //
              Bun.fileURLToPath(dir);

            const glob =
              //
              new Bun.Glob("_astro/*");

            const urls =
              //
              [];

            for await (const url of glob.scan(directory_path)) {
              urls.push({ url, revision: null });
            }

            const sw =
              //
              `
                import {
                  precacheAndRoute,
                } from "workbox-precaching";

                import {
                  registerRoute,
                } from "workbox-routing";

                import {
                  NetworkFirst,
                } from "workbox-strategies";

                import {
                  skipWaiting,
                  clientsClaim,
                } from "workbox-core";

                skipWaiting();

                clientsClaim();

                precacheAndRoute(${JSON.stringify(urls)});

                registerRoute(({ url }) => !url.pathname.startsWith("/_") && !url.pathname.startsWith("/endpoints/stream"), new NetworkFirst());
              `;

            const temporary_file_path =
              //
              "./.sw.ts";

            const temporary_file =
              //
              Bun.file(temporary_file_path);

            await Bun.write(
              //
              temporary_file,
              //
              sw,
            );

            try {
              const bundle =
                //
                await rolldown(
                  {
                    input:
                      //
                      temporary_file_path,
                  },
                );

              await bundle.write(
                {
                  file:
                    //
                    path.join(
                      //
                      directory_path,
                      //
                      "sw.js",
                    ),

                  minify:
                    //
                    true,
                },
              );
            } finally {
              await temporary_file.delete();
            }
          },
      },
  };
}
