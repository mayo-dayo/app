export type search_api =
  //
  {
    search:
      //
      (
        //
        query:
          //
          string,
        //
        offset:
          //
          number,
        //
        limit:
          //
          number,
      ) => string[];

    remove:
      //
      (
        //
        id:
          //
          string,
      ) => void;
  };
