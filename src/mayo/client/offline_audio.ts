import type {
  locals_user,
} from "@/mayo/common/locals_user";

import type {
  database_audio,
} from "@/mayo/common/database_audio";

const offline_storage_open =
  //
  (
    user:
      //
      locals_user,
  ): Promise<
    IDBDatabase
  > =>
    new Promise((
      //
      resolve,
      //
      reject,
    ) => {
      const request =
        //
        indexedDB.open(
          //
          `offline-audio-${user.id}`,
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
            request.result,
          );

      request.onupgradeneeded =
        //
        (
          e,
        ) => {
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
                    "offline-audio",
                    //
                    {
                      keyPath:
                        //
                        "database_audio.id",
                    },
                  );

                store.createIndex(
                  //
                  "database_audio.time_uploaded",
                  //
                  "database_audio.time_uploaded",
                );

                store.createIndex(
                  //
                  "time_created",
                  //
                  "time_created",
                );

                break;

              default:
                throw new Error(
                  "unexpected database version",
                );
            }
          }
        };
    });

export type offline_audio =
  //
  {
    database_audio:
      //
      database_audio;

    time_created:
      //
      number;

    download_error:
      //
      boolean;
  };

export const offline_audio_get =
  //
  (
    //
    user:
      //
      locals_user,
    //
    database_audio:
      //
      database_audio,
  ): Promise<
    offline_audio | null
  > =>
    offline_storage_open(
      user,
    )
      //
      .then(offline_storage =>
        new Promise<
          offline_audio | null
        >((
          //
          resolve,
          //
          reject,
        ) => {
          const request =
            //
            offline_storage
              //
              .transaction("offline-audio")
              //
              .objectStore("offline-audio")
              //
              .get(
                database_audio.id,
              );

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
                request.result
                  //
                  ? request.result as offline_audio
                  //
                  : null,
              );
        })
          //
          .finally(() => offline_storage.close())
      );

export const offline_audio_create =
  //
  (
    //
    user:
      //
      locals_user,
    //
    database_audio:
      //
      database_audio,
  ) =>
    offline_storage_open(
      user,
    )
      //
      .then(offline_storage =>
        new Promise((
          //
          resolve,
          //
          reject,
        ) => {
          const time_created =
            //
            Date.now();

          const download_error =
            //
            false;

          const offline_audio: offline_audio =
            //
            {
              database_audio,

              time_created,

              download_error,
            };

          const request =
            //
            offline_storage
              //
              .transaction(
                //
                "offline-audio",
                //
                "readwrite",
              )
              //
              .objectStore("offline-audio")
              //
              .put(offline_audio);

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
          .finally(() => offline_storage.close())
      );
