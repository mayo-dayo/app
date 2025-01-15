import type {
  ParentComponent,
} from "solid-js";

import {
  onCleanup,
  onMount,
} from "solid-js";

type Props = {
  duration:
    //
    number;

  delay:
    //
    number;
};

const FadeIn: ParentComponent<Props> =
  //
  (props) => {
    let animation:
      //
      Animation | undefined;

    onCleanup(() => animation?.cancel());

    let ref!:
      //
      HTMLDivElement;

    onMount(() => {
      animation =
        //
        ref.animate(
          //
          [
            { opacity: 0 },

            { opacity: 1 },
          ],
          //
          {
            duration:
              //
              props.duration,

            delay:
              //
              props.delay,

            fill:
              //
              "forwards",

            easing:
              //
              "ease-in",
          },
        );
    });

    return (
      <div
        //
        ref={ref}
        //
        class="opacity-0"
      >
        {props.children}
      </div>
    );
  };

export default FadeIn;
