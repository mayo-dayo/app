import type {
  audio,
} from "@/lib/server/types/audio";

// can't import lol Rollup failed to resolve import "@/lib/server/types/audio"
// import {
//   audio_page_size,
// } from "@/lib/server/types/audio";
const audio_page_size =
  //
  32;

export type storage_item =
  //
  {
    audio:
      //
      audio;

    time_created:
      //
      number;

    is_downloaded:
      //
      boolean;
  };

const OBJECT_STORE_NAME = "storage-item";

export class Storage {
  private connection:
    //
    IDBDatabase;

  private constructor(
    connection:
      //
      IDBDatabase,
  ) {
    this.connection =
      //
      connection;
  }

  static open() {
    return (
      new Promise<Storage>((
        //
        resolve,
        //
        reject,
      ) => {
        const request =
          //
          indexedDB.open(
            //
            `audio`,
            //
            1,
          );

        request.onerror =
          //
          () =>
            reject(
              //
              request.error,
            );

        request.onsuccess =
          //
          () =>
            resolve(
              //
              new Storage(request.result),
            );

        request.onupgradeneeded =
          //
          (e) => {
            let version =
              //
              e.oldVersion;

            while (
              version
                // `newVersion` is null if the database is being deleted
                < e.newVersion!
            ) {
              switch (
                version++
              ) {
                case 0:
                  const store =
                    //
                    request.result.createObjectStore(
                      //
                      OBJECT_STORE_NAME,
                      //
                      {
                        keyPath:
                          //
                          "audio.id",
                      },
                    );

                  store.createIndex(
                    //
                    "time_created",
                    //
                    "time_created",
                  );

                  break;

                default:
                  throw new Error("unreachable");
              }
            }
          };
      })
    );
  }

  close() {
    this.connection.close();
  }

  get(
    id:
      //
      string,
  ) {
    return (
      new Promise<storage_item | null>(resolve => {
        const request =
          //
          this.connection
            //
            .transaction(OBJECT_STORE_NAME)
            //
            .objectStore(OBJECT_STORE_NAME)
            //
            .get(id);

        request.onerror =
          //
          () =>
            resolve(
              null,
            );

        request.onsuccess =
          //
          () =>
            resolve(
              request.result
                //
                ? request.result as storage_item
                //
                : null,
            );
      })
    );
  }

  get_all(
    ids:
      //
      string[],
  ) {
    return (
      new Promise<Array<storage_item | null>>(resolve => {
        const store =
          //
          this.connection
            //
            .transaction(OBJECT_STORE_NAME)
            //
            .objectStore(OBJECT_STORE_NAME);

        const result: Array<storage_item | null> =
          //
          Array(
            ids.length,
          )
            //
            .fill(null);

        let count = 0;

        ids.forEach((id, index) => {
          const request =
            //
            store.get(id);

          request.onerror =
            //
            () => {
              count += 1;

              if (count === ids.length) {
                resolve(result);
              }
            };

          request.onsuccess =
            //
            () => {
              if (request.result) {
                result[index] =
                  //
                  request.result as storage_item;
              }

              count += 1;

              if (count === ids.length) {
                resolve(result);
              }
            };
        });
      })
    );
  }

  put(
    storage_item:
      //
      storage_item,
  ) {
    return (
      new Promise(
        (
          //
          resolve,
          //
          reject,
        ) => {
          const request =
            //
            this.connection
              //
              .transaction(OBJECT_STORE_NAME, "readwrite")
              //
              .objectStore(OBJECT_STORE_NAME)
              //
              .put(storage_item);

          request.onerror =
            //
            () =>
              reject(
                request.error,
              );

          request.onsuccess =
            //
            () =>
              resolve(
                undefined,
              );
        },
      )
    );
  }

  get_page(
    number:
      //
      number,
  ) {
    return (
      new Promise<storage_item[]>(
        (
          //
          resolve,
          //
          reject,
        ) => {
          const result: storage_item[] =
            //
            [];

          let skipped =
            //
            false;

          const request =
            //
            this.connection
              //
              .transaction(OBJECT_STORE_NAME)
              //
              .objectStore(OBJECT_STORE_NAME)
              //
              .index("time_created")
              //
              .openCursor(undefined, "prev");

          request.onerror =
            //
            () =>
              reject(
                request.error,
              );

          request.onsuccess =
            //
            () => {
              const cursor =
                //
                request.result;

              if (cursor) {
                if (
                  number > 0 && !skipped
                ) {
                  cursor.advance(
                    number * audio_page_size,
                  );

                  skipped = true;

                  return;
                }

                if (result.length < audio_page_size) {
                  result.push(
                    cursor.value as storage_item,
                  );

                  cursor.continue();
                } else {
                  resolve(
                    result,
                  );
                }
              } else {
                resolve(
                  result,
                );
              }
            };
        },
      )
    );
  }

  get_next_not_downloaded() {
    return (
      new Promise<storage_item | null>(resolve => {
        const request =
          //
          this.connection
            //
            .transaction(OBJECT_STORE_NAME)
            //
            .objectStore(OBJECT_STORE_NAME)
            //
            .index("time_created")
            //
            .openCursor();

        request.onerror =
          //
          () =>
            resolve(
              null,
            );

        request.onsuccess =
          //
          () => {
            const cursor =
              //
              request.result;

            if (cursor) {
              const item =
                //
                cursor.value as storage_item;

              if (item.is_downloaded) {
                cursor.continue();
              } else {
                resolve(
                  item,
                );
              }
            } else {
              resolve(
                null,
              );
            }
          };
      })
    );
  }

  remove(
    id:
      //
      string,
  ) {
    return (
      new Promise((
        //
        resolve,
        //
        reject,
      ) => {
        const request =
          //
          this.connection
            //
            .transaction(OBJECT_STORE_NAME, "readwrite")
            //
            .objectStore(OBJECT_STORE_NAME)
            //
            .delete(id);

        request.onerror =
          //
          () =>
            reject(
              request.error,
            );

        request.onsuccess =
          //
          () =>
            resolve(
              undefined,
            );
      })
    );
  }
}

export const get_audio_file_handle = (
  id:
    //
    string,
) =>
  navigator.storage.getDirectory()
    //
    .then(directory =>
      directory.getDirectoryHandle(
        //
        "audio",
        //
        { create: true },
      )
    )
    //
    .then(directory =>
      directory.getFileHandle(
        //
        id,
        //
        { create: true },
      )
    );
