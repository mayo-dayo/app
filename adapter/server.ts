import type {
  SSRManifest,
} from "astro";

import {
  App,
} from "astro/app";

import mime from "mime-types";

import path from "node:path";

import file_extensions_for_compression from "../file-extensions-for-compression";

export const createExports =
  //
  (
    //
    manifest:
      //
      SSRManifest,
  ) => {
    return {
      start:
        //
        () =>
          start(
            manifest,
          ),
    };
  };

export const start =
  //
  (
    manifest:
      //
      SSRManifest,
  ) => {
    const client_directory_path =
      //
      path.join(path.dirname(Bun.main), "client");

    const app =
      //
      new App(manifest);

    const tls =
      //
      (Bun.env.MAYO_TLS_CRT && Bun.env.MAYO_TLS_KEY)
        //
        ? { cert: Bun.env.MAYO_TLS_CRT, key: Bun.env.MAYO_TLS_KEY }
        //
        : undefined;

    Bun.serve({
      error(error) {
        return (
          new Response(
            //
            `<pre>${error}\n${error.stack}</pre>`,
            //
            {
              headers:
                //
                {
                  "content-type":
                    //
                    "text/html",
                },
            },
          )
        );
      },

      tls,

      async fetch(req, server) {
        const routeData =
          //
          app.match(req);

        if (routeData) {
          return (
            app.render(
              //
              req,
              //
              {
                addCookieHeader:
                  //
                  true,

                clientAddress:
                  //
                  server.requestIP(req)?.address,

                routeData,
              },
            )
          );
        }

        const url =
          //
          new URL(req.url);

        const file_path =
          //
          path.join(client_directory_path, url.pathname);

        const file =
          //
          Bun.file(file_path);

        if (await file.exists() === false) {
          return (
            new Response(
              //
              null,
              //
              {
                status:
                  //
                  404,
              },
            )
          );
        }

        const headers =
          //
          new Headers();

        const extension =
          //
          path.extname(url.pathname).slice(1);

        headers.set(
          //
          "content-type",
          //
          mime.lookup(extension) || "application/octet-stream",
        );

        if (file_extensions_for_compression.includes(extension)) {
          headers.set(
            //
            "content-encoding",
            //
            "br",
          );
        }

        if (url.pathname.startsWith("/_astro/")) {
          headers.set(
            //
            "cache-control",
            //
            "public, immutable, max-age=31536000",
          );
        }

        return (
          new Response(
            //
            file,
            //
            {
              headers,
            },
          )
        );
      },
    });
  };
