/// <reference path="../.astro/types.d.ts" />

declare module "bun" {
  interface Env {
    MAYO_DATA_PATH: string;

    MAYO_AUTHENTICATION: string;
  }
}

declare module App {
  interface Locals {
    context:
      //
      import("@/lib/server/context/context").context;

    user?:
      //
      Pick<
        //
        import("@/lib/server/user").user,
        //
        "id" | "name" | "perms"
      >;
  }
}
