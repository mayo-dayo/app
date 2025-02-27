import type {
  audio,
} from "@/lib/server/types/audio";

export type storage_audio =
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
      0 | 1;

    is_indexed:
      //
      0 | 1;
  };

export type storage_connection =
  //
  IDBDatabase;

const OBJECT_STORE_AUDIO =
  //
  "audio";

const INDEX_TIME_CREATED =
  //
  "time_created";

const INDEX_IS_DOWNLOADED_TIME_CREATED =
  //
  "is_downloaded.time_created";

const INDEX_IS_DOWNLOADED_IS_INDEXED_TIME_CREATED =
  //
  "is_downloaded.is_indexed.time_created";

export const storage_connect =
  //
  () =>
    new Promise<
      storage_connection
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          indexedDB.open(
            //
            "audio",
            //
            1,
          );

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () =>
            resolve(
              req.result,
            );

        req.onupgradeneeded =
          //
          (
            //
            event:
              //
              IDBVersionChangeEvent,
          ) => {
            if (event.newVersion === null) {
              return;
            }

            let current_version =
              //
              event.oldVersion;

            while (current_version < event.newVersion) {
              const connection =
                //
                req.result;

              switch (current_version++) {
                case 0:
                  const object_store =
                    //
                    connection.createObjectStore(
                      //
                      OBJECT_STORE_AUDIO,
                      //
                      {
                        keyPath:
                          //
                          "audio.id",
                      },
                    );

                  object_store.createIndex(
                    //
                    INDEX_TIME_CREATED,
                    //
                    "time_created",
                  );

                  object_store.createIndex(
                    //
                    INDEX_IS_DOWNLOADED_TIME_CREATED,
                    //
                    ["is_downloaded", "time_created"],
                  );

                  object_store.createIndex(
                    //
                    INDEX_IS_DOWNLOADED_IS_INDEXED_TIME_CREATED,
                    //
                    ["is_downloaded", "is_indexed", "time_created"],
                  );

                  break;

                default:
                  throw new Error("unreachable");
              }
            }
          };
      },
    );

const audio_get_by_id =
  //
  (
    //
    object_store:
      //
      IDBObjectStore,
    //
    id:
      //
      string,
  ) =>
    new Promise<
      storage_audio | null
    >(resolve => {
      const req = object_store.get(id);

      req.onerror =
        //
        () =>
          resolve(
            null,
          );

      req.onsuccess =
        //
        () =>
          resolve(
            req.result
              //
              ? req.result as storage_audio
              //
              : null,
          );
    });

export const storage_audio_get_by_id =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
    //
    id:
      //
      string,
  ) =>
    audio_get_by_id(
      //
      storage_connection
        //
        .transaction(OBJECT_STORE_AUDIO)
        //
        .objectStore(OBJECT_STORE_AUDIO),
      //
      id,
    );

export const storage_audio_get_by_id_array =
  //
  (
    storage_connection:
      //
      storage_connection,
    //
    id_array:
      //
      string[],
  ) => {
    const object_store =
      //
      storage_connection
        //
        .transaction(OBJECT_STORE_AUDIO)
        //
        .objectStore(OBJECT_STORE_AUDIO);

    return (
      Promise.all(
        Array.from(
          //
          id_array,
          //
          id =>
            audio_get_by_id(
              //
              object_store,
              //
              id,
            ),
        ),
      )
    );
  };

export const storage_audio_put =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
    //
    storage_audio:
      //
      storage_audio,
  ) =>
    new Promise(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO, "readwrite")
            //
            .objectStore(OBJECT_STORE_AUDIO)
            //
            .put(storage_audio);

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () =>
            resolve(
              undefined,
            );
      },
    );

export const storage_audio_get_paginated =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
    //
    offset:
      //
      number,
    //
    limit:
      //
      number,
  ) =>
    new Promise<
      storage_audio[]
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO)
            //
            .objectStore(OBJECT_STORE_AUDIO)
            //
            .index(INDEX_TIME_CREATED)
            //
            .openCursor(undefined, "prev");

        const result: storage_audio[] =
          //
          [];

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () => {
            const cursor =
              //
              req.result as IDBCursorWithValue;

            if (cursor) {
              if (offset > 0) {
                cursor.advance(offset);

                offset = 0;

                return;
              }

              if (result.length < limit) {
                result.push(cursor.value as storage_audio);

                cursor.continue();

                return;
              }
            }

            resolve(
              result,
            );
          };
      },
    );

export const storage_audio_get_next_not_downloaded =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
  ) =>
    new Promise<
      storage_audio | null
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO)
            //
            .objectStore(OBJECT_STORE_AUDIO)
            //
            .index(INDEX_IS_DOWNLOADED_TIME_CREATED)
            //
            .get(IDBKeyRange.bound([0, -Infinity], [0, Infinity]));

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () => {
            const value =
              //
              req.result;

            if (value) {
              resolve(
                value as storage_audio,
              );
            } else {
              resolve(
                null,
              );
            }
          };
      },
    );

export const storage_audio_get_next_downloaded_not_indexed =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
  ) =>
    new Promise<
      storage_audio | null
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO)
            //
            .objectStore(OBJECT_STORE_AUDIO)
            //
            .index(INDEX_IS_DOWNLOADED_IS_INDEXED_TIME_CREATED)
            //
            .get(IDBKeyRange.bound([1, 0, -Infinity], [1, 0, Infinity]));

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () => {
            const value =
              //
              req.result;

            if (value) {
              resolve(
                value as storage_audio,
              );
            } else {
              resolve(
                null,
              );
            }
          };
      },
    );

export const storage_audio_update =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
    //
    id:
      //
      string,
    //
    update_fn:
      //
      (
        //
        storage_audio:
          //
          storage_audio,
      ) => storage_audio,
  ) =>
    new Promise(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const object_store =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO, "readwrite")
            //
            .objectStore(OBJECT_STORE_AUDIO);

        const get =
          //
          object_store.get(id);

        get.onerror =
          //
          () =>
            reject(
              get.error,
            );

        get.onsuccess =
          //
          () => {
            const storage_audio =
              //
              get.result
                //
                ? get.result as storage_audio
                //
                : null;

            if (storage_audio === null) {
              resolve(
                undefined,
              );
            } else {
              const put =
                //
                object_store.put(update_fn(storage_audio));

              put.onerror =
                //
                () =>
                  reject(
                    put.error,
                  );

              put.onsuccess =
                //
                () =>
                  resolve(
                    undefined,
                  );
            }
          };
      },
    );

export const storage_audio_remove =
  //
  (
    //
    storage_connection:
      //
      storage_connection,
    //
    id:
      //
      string,
  ) =>
    new Promise<
      void
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const req =
          //
          storage_connection
            //
            .transaction(OBJECT_STORE_AUDIO, "readwrite")
            //
            .objectStore(OBJECT_STORE_AUDIO)
            //
            .delete(id);

        req.onerror =
          //
          () =>
            reject(
              req.error,
            );

        req.onsuccess =
          //
          () =>
            resolve(
              undefined,
            );
      },
    );
