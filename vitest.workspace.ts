import {
  defineWorkspace,
} from "vitest/config";

export default defineWorkspace(
  //
  [
    {
      test:
        //
        {
          include:
            //
            ["src/lib/client/*.test.ts"],

          name:
            //
            "client",

          browser:
            //
            {
              provider:
                //
                "playwright",

              enabled:
                //
                true,

              headless:
                //
                true,

              instances:
                //
                [
                  {
                    browser:
                      //
                      "chromium",
                  },
                ],
            },
        },
    },

    {
      test:
        //
        {
          include:
            //
            ["src/lib/server/*.test.ts"],

          name:
            //
            "server",
        },
    },
  ],
);
