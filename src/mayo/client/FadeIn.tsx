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
  (
    props,
  ) => {
    let ref!:
      //
      HTMLDivElement;

    onMount(() => {
      const animation =
        //
        ref
          //
          .animate(
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

      onCleanup(() => animation?.cancel());
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
