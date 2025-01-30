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
      import("@/mayo/common/locals_user").locals_user;
  }
}
