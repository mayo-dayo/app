import type {
  Database,
} from "bun:sqlite";

const migrations = import.meta.glob("./migrations/*.sql", { eager: true, query: "?raw" }) as Record<string, string>;

export const database_migrate =
  //
  (
    database:
      //
      Database,
  ) => {
    database.exec("pragma journal_mode = wal;");

    database.exec("pragma foreign_keys = on;");

    const {
      user_version,
    } = database
      //
      .query("pragma user_version;")
      //
      .get() as { user_version: number };

    database.transaction(() => {
      let current_version = user_version;

      const new_version = 1;

      while (current_version < new_version) {
        const migration = migrations[`./migrations/${current_version}.sql`] as any;

        database.exec(typeof migration === "string" ? migration : migration.default);

        current_version++;
      }

      database.exec("insert into audio_fts(audio_fts) values ('optimize');");

      database.exec("pragma optimize;");

      database.exec(`pragma user_version = ${new_version};`);
    })();
  };
