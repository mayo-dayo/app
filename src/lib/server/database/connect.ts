import {
  Database,
} from "bun:sqlite";

export const database_connect =
  //
  (
    path:
      //
      string,
  ) =>
    new Database(
      //
      path,
      //
      {
        create: true,

        strict: true,
      },
    );
