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
      import("@/mayo/server/context").context;

    user?:
      //
      Pick<
        //
        import("@/mayo/common/database_user").database_user,
        //
        | "id"
        //
        | "name"
        //
        | "perms"
      >;
  }
}
