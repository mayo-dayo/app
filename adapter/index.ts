import type {
  AstroIntegration,
} from "astro";

export default function(): AstroIntegration {
  return {
    name:
      //
      "bun",

    hooks:
      //
      {
        "astro:config:done":
          //
          ({ setAdapter }) =>
            setAdapter(
              {
                name:
                  //
                  "bun",

                serverEntrypoint:
                  //
                  "./adapter/server.ts",

                exports:
                  //
                  ["start"],

                adapterFeatures:
                  //
                  {
                    edgeMiddleware:
                      //
                      false,

                    buildOutput:
                      //
                      "server",
                  },

                supportedAstroFeatures:
                  //
                  {
                    staticOutput:
                      //
                      "stable",

                    hybridOutput:
                      //
                      "unsupported",

                    serverOutput:
                      //
                      "stable",

                    i18nDomains:
                      //
                      "unsupported",

                    envGetSecret:
                      //
                      "unsupported",

                    sharpImageService:
                      //
                      "unsupported",
                  },
              },
            ),
      },
  };
}
