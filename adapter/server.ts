import type {
  SSRManifest,
} from "astro";

import {
  App,
} from "astro/app";

import mime from "mime-types";

import path from "node:path";

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
      Bun.env.CLIENT_DIRECTORY_PATH;

    if (client_directory_path === undefined) {
      throw new Error(
        "`CLIENT_DIRECTORY_PATH` is not set",
      );
    }

    const app =
      //
      new App(manifest);

    const tls_crt_path =
      //
      Bun.env.TLS_CRT_PATH;

    const tls_key_path =
      //
      Bun.env.TLS_KEY_PATH;

    const tls =
      //
      (tls_crt_path !== undefined && tls_key_path !== undefined)
        //
        ? {
          cert:
            //
            Bun.file(tls_crt_path),

          key:
            //
            Bun.file(tls_key_path),
        }
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
                  server.requestIP(req)?.address ?? undefined,

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
          path.join(
            //
            client_directory_path,
            //
            url.pathname,
          );

        const file =
          //
          Bun.file(
            file_path,
          );

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

        const content_type =
          //
          mime.lookup(
            path
              //
              .extname(url.pathname)
              //
              .slice(1),
          ) || "application/octet-stream";

        headers.set(
          //
          "content-type",
          //
          content_type,
        );

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
