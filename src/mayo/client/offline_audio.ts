import type {
  database_audio,
} from "@/mayo/common/database_audio";

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

const idb_open =
  //
  (): Promise<
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
          "offline-audio",
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

export const offline_audio_create =
  //
  (
    database_audio:
      //
      database_audio,
  ) =>
    idb_open()
      //
      .then(idb =>
        new Promise((
          //
          resolve,
          //
          reject,
        ) => {
          const offline_audio: offline_audio =
            //
            {
              database_audio,

              time_created:
                //
                Date.now(),

              download_error:
                //
                false,
            };

          const request =
            //
            idb
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
          .finally(() => idb.close())
      );

export const offline_audio_get_local_file_handle =
  //
  (
    {
      database_audio: {
        id,
      },
    }:
      //
      offline_audio,
  ): Promise<
    FileSystemFileHandle
  > =>
    navigator.storage.getDirectory()
      //
      .then(directory =>
        directory
          //
          .getDirectoryHandle(
            //
            "offline_audio",
            //
            {
              create:
                //
                true,
            },
          )
      )
      //
      .then(directory =>
        directory
          //
          .getFileHandle(
            //
            id,
            //
            {
              create:
                //
                true,
            },
          )
      );

export const offline_audio_get_local_file_size =
  //
  (
    offline_audio:
      //
      offline_audio,
  ): Promise<
    number
  > =>
    offline_audio_get_local_file_handle(
      offline_audio,
    )
      //
      .then(handle =>
        //
        handle.getFile()
      )
      //
      .then(file =>
        //
        file.size
      );

export const offline_audio_get =
  //
  (
    {
      id,
    }:
      //
      database_audio,
  ): Promise<
    offline_audio | null
  > =>
    idb_open()
      //
      .then(idb =>
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
            idb
              //
              .transaction("offline-audio")
              //
              .objectStore("offline-audio")
              //
              .get(id);

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
          .finally(() => {
            idb.close();
          })
      );

export const offline_audio_get_download_state =
  //
  async (
    offline_audio:
      //
      offline_audio,
  ): Promise<
    //
    | "pending"
    //
    | "finished"
    //
    | "error"
  > => {
    if (
      offline_audio.download_error
    ) {
      return "error";
    }

    const local_file_size =
      //
      await offline_audio_get_local_file_size(
        offline_audio,
      );

    const {
      database_audio,
    } = offline_audio;

    return (
      database_audio.size === local_file_size
        //
        ? "finished"
        //
        : "pending"
    );
  };
