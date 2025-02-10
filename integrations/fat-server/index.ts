import type {
  AstroIntegration,
} from "astro";

import path from "node:path";

export default function(): AstroIntegration {
  return {
    name: "fat-server",

    hooks:
      //
      {
        "astro:build:done":
          //
          async ({ dir }) => {
            const directory_path =
              //
              Bun.fileURLToPath(dir);

            const entrypoint =
              //
              path.resolve(
                //
                directory_path,
                //
                "..",
                //
                "server",
                //
                "entry.mjs",
              );

            await Bun.build(
              //
              {
                entrypoints:
                  //
                  [entrypoint],

                target:
                  //
                  "bun",

                outdir:
                  //
                  "dist",
              },
            );
          },
      },
  };
}
