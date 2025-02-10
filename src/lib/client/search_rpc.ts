type Resolvable<I, O> =
  //
  {
    input:
      //
      I;

    resolve:
      //
      (
        //
        value:
          //
          O,
      ) => void;

    reject:
      //
      (
        //
        reason:
          //
          any,
      ) => void;
  };

export const SEARCH_SEARCH =
  //
  "search.search";

export const SEARCH_REMOVE =
  //
  "search.remove";

export type search_search =
  //
  CustomEvent<Resolvable<{ query: string; offset: number; limit: number }, string[]>>;

export type search_remove =
  //
  CustomEvent<string>;

export const search_search =
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
  ) =>
    new Promise<
      string[]
    >(
      (
        //
        resolve,
        //
        reject,
      ) => {
        const event: search_search =
          //
          new CustomEvent(
            //
            SEARCH_SEARCH,
            //
            {
              detail:
                //
                {
                  input:
                    //
                    {
                      query,

                      offset,

                      limit,
                    },

                  resolve,

                  reject,
                },
            },
          );

        window.dispatchEvent(event);
      },
    );

export const search_remove =
  //
  (
    //
    id:
      //
      string,
  ) => {
    const event: search_remove =
      //
      new CustomEvent(
        //
        SEARCH_REMOVE,
        //
        {
          detail:
            //
            id,
        },
      );

    window.dispatchEvent(event);
  };
