import type {
  AstroIntegration,
} from "astro";

import {
  Buffer,
} from "node:buffer";

import path from "node:path";

import zlib from "node:zlib";

import file_extensions_for_compression from "../../file-extensions-for-compression";

export default function(): AstroIntegration {
  return {
    name:
      //
      "compression",

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
              new Bun.Glob(`**/*.{${file_extensions_for_compression.join(",")}}`);

            for await (const relative_path of glob.scan(directory_path)) {
              const file_path = 
                //
                path.join(directory_path, relative_path);

              const file =
                //
                Bun.file(file_path);

              const compressed =
                //
                zlib.brotliCompressSync(
                  //
                  Buffer.from(await file.arrayBuffer()),
                  //
                  {
                    params:
                      //
                      {
                        [zlib.constants.BROTLI_PARAM_MODE]:
                          //
                          zlib.constants.BROTLI_MODE_TEXT,

                        [zlib.constants.BROTLI_PARAM_QUALITY]:
                          //
                          zlib.constants.BROTLI_MAX_QUALITY,

                        [zlib.constants.BROTLI_PARAM_SIZE_HINT]:
                          //
                          file.size,
                      },
                  },
                );

              await Bun.write(
                //
                file_path,
                //
                compressed,
              );
            }
          },
      },
  };
}
