import {
  createContextProvider,
} from "@solid-primitives/context";

import {
  makeEventListener,
} from "@solid-primitives/event-listener";

import type {
  JSX,
} from "solid-js";

import {
  createSignal,
  getOwner,
  onCleanup,
  onMount,
  runWithOwner,
} from "solid-js";

type position =
  //
  {
    left:
      //
      string;

    top:
      //
      string;
  };

type coordinates =
  //
  {
    x:
      //
      number;

    y:
      //
      number;
  };

type state =
  //
  {
    body:
      //
      () => JSX.Element;

    coordinates:
      //
      coordinates;
  };

const [ContextMenuProvider, use_context_menu] =
  //
  createContextProvider(() => {
    const [
      state,

      set_state,
    ] = createSignal<
      state | undefined
    >();

    const render =
      //
      () => {
        const current_state =
          //
          state();

        if (current_state === undefined) {
          return;
        }

        const {
          body,

          coordinates: {
            x,

            y,
          },
        } = current_state;

        let ref!: HTMLMenuElement;

        const handle_click =
          //
          (e: MouseEvent) => {
            if (ref?.contains(e.target as Node) === false) {
              set_state(undefined);
            }
          };

        makeEventListener(
          //
          document,
          //
          "click",
          //
          handle_click,
          //
          { passive: true },
        );

        const [
          position,

          set_position,
        ] = createSignal<
          position | undefined
        >();

        const owner =
          //
          getOwner();

        onMount(async () => {
          const virtual_element =
            //
            {
              getBoundingClientRect:
                //
                () => ({
                  x,

                  y,

                  width:
                    //
                    0,

                  height:
                    //
                    0,

                  left:
                    //
                    x,

                  top:
                    //
                    y,

                  right:
                    //
                    x,

                  bottom:
                    //
                    y,
                }),
            };

          const {
            autoUpdate,

            computePosition,

            flip,

            offset,

            shift,
          } = await import(
            "@floating-ui/dom"
          );

          const update =
            //
            async () => {
              const position =
                //
                await computePosition(
                  //
                  virtual_element,
                  //
                  ref,
                  //
                  {
                    placement:
                      //
                      "right-start",

                    middleware:
                      //
                      [
                        offset(10),

                        flip(),

                        shift({ padding: 10 }),
                      ],
                  },
                );

              set_position(
                //
                {
                  left:
                    //
                    `${position.x}px`,

                  top:
                    //
                    `${position.y}px`,
                },
              );
            };

          update();

          const cleanup =
            //
            autoUpdate(
              //
              virtual_element,
              //
              ref,
              //
              update,
            );

          runWithOwner(
            //
            owner,
            //
            () => onCleanup(cleanup),
          );
        });

        return (
          <menu
            //
            class={`absolute w-max grid rounded bg-zinc-950 ${position() ? "" : "hidden left-0 top-0".trim()}`}
            //
            style={position()}
            //
            ref={ref}
          >
            {body()}
          </menu>
        );
      };

    return {
      set_state,

      render,
    };
  });

export { ContextMenuProvider, use_context_menu };
