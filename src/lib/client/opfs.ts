export const opfs_audio_get_stream_file_handle =
  //
  (
    //
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

export const opfs_audio_get_stream_file_url =
  //
  (
    id:
      //
      string,
  ) =>
    opfs_audio_get_stream_file_handle(id)
      //
      .then(file =>
        //
        file.getFile()
      )
      //
      .then(file =>
        //
        URL.createObjectURL(file)
      );
