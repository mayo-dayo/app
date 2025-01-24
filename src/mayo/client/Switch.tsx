import type {
  Component,
} from "solid-js";

type Props =
  //
  {
    checked:
      //
      boolean;
  };

const Switch: Component<Props> =
  //
  (
    props,
  ) => {
    return (
      <button
        //
        type="button"
        //
        role="switch"
        //
        aria-checked={props.checked}
        // dprint-ignore
        class={`${props.checked ? "bg-blue-600" : "bg-gray-200" } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
      >
        <span
          // dprint-ignore
          class={`${props.checked ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition-transform`}
        />
      </button>
    );
  };

export default Switch;
