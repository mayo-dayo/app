import type {
  AstroIntegration,
} from "astro";

import path from "node:path";

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
                  clientsClaim,
                } from "workbox-core";

                self.skipWaiting();

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
              const {
                outputs,
              } = await Bun.build(
                //
                {
                  entrypoints:
                    //
                    [temporary_file_path],

                  minify:
                    //
                    true,
                },
              );

              if (outputs.length !== 1) {
                throw new Error(`unexpected output length: ${outputs.length}`);
              }

              const dest =
                //
                path.join(
                  //
                  directory_path,
                  //
                  "sw.js",
                );

              await Bun.write(
                //
                dest,
                //
                outputs[0],
              );
            } finally {
              await temporary_file.delete();
            }
          },
      },
  };
}
