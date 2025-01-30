import type {
  database_user,
} from "@/mayo/common/database_user";

export type locals_user =
  //
  Pick<
    //
    database_user,
    //
    | "id"
    //
    | "name"
    //
    | "perms"
  >;
