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

            const {
              outputs,
            } = await Bun.build(
              //
              {
                entrypoints:
                  //
                  [entrypoint],

                minify:
                  //
                  true,

                target:
                  //
                  "bun",
              },
            );

            if (outputs.length !== 1) {
              throw new Error(`unexpected output length: ${outputs.length}`);
            }

            const dest =
              //
              path.resolve(
                //
                directory_path,
                //
                "..",
                //
                "server.js",
              );

            await Bun.write(
              //
              dest,
              //
              outputs[0],
            );
          },
      },
  };
}
