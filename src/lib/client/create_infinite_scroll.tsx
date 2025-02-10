import {
  noop,
  tryOnCleanup,
} from "@solid-primitives/utils";
import {
  Accessor,
  batch,
  createComputed,
  createResource,
  createSignal,
  onCleanup,
  Setter,
} from "solid-js";
import {
  isServer,
} from "solid-js/web";

export function createInfiniteScroll<T>(fetcher: (page: number) => Promise<T[]>): [
  pages: Accessor<T[]>,
  loader: (el: Element) => void,
  options: {
    page: Accessor<number>;
    setPage: Setter<number>;
    setPages: Setter<T[]>;
    end: Accessor<boolean>;
    setEnd: Setter<boolean>;
    refetch: () => void; // Added refetch function
  },
] {
  const [pages, setPages] = createSignal<T[]>([]);
  const [page, setPage] = createSignal(0);
  const [end, setEnd] = createSignal(false);

  let add: (el: Element) => void = noop;
  if (!isServer) {}
  const io = new IntersectionObserver(e => {
    if (e.length > 0 && e[0]!.isIntersecting && !end() && !contents.loading) {
      setPage(p => p + 1);
    }
  });
  onCleanup(() => io.disconnect());
  add = (el: Element) => {
    io.observe(el);
    tryOnCleanup(() => io.unobserve(el));
  };

  const [contents, { refetch }] = createResource(page, fetcher); // Destructure refetch from createResource

  createComputed(() => {
    const content = contents.latest;
    if (!content) return;
    batch(() => {
      if (content.length === 0) setEnd(true);
      setPages(p => [...p, ...content]);
    });
  });

  const manualRefetch = () => {
    batch(() => {
      setPages([]); // Clear existing pages
      setPage(0); // Reset page to start from the beginning
      setEnd(false); // Reset end state
    });
    refetch(); // Trigger the resource refetch
  };

  return [
    pages,
    add,
    {
      page: page,
      setPage: setPage,
      setPages: setPages,
      end: end,
      setEnd: setEnd,
      refetch: manualRefetch, // Expose manualRefetch as refetch option
    },
  ];
}
