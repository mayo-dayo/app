/// <reference path="../.astro/types.d.ts" />

declare module "bun" {
  interface Env {
    MAYO_DATA_PATH:
      //
      string;
  }
}

declare module App {
  interface Locals {
    context:
      //
      import("@/context").context;

    user?:
      //
      Pick<
        //
        import("@/database").database_user,
        //
        "id" | "name" | "perms"
      >;
  }
}
