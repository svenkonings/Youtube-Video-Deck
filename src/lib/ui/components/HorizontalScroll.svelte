<script lang="ts">
  import { onDestroy } from "svelte";
  import { tweened } from "svelte/motion";

  let container: HTMLDivElement;
  const duration = 100;
  const scroll = tweened(0, { duration: duration });
  let scrollWheelActive = false;
  let scrollSyncTimeout: number;

  onDestroy(
    scroll.subscribe(value => {
      if (scrollWheelActive) container.scrollLeft = value;
    }),
  );

  function updateScroll(event: WheelEvent): void {
    if (event.deltaX) {
      scrollWheelActive = false;
      scroll.update(value => clampToContainer(value + event.deltaX), { duration: 0 });
    } else if (event.deltaY) {
      scrollWheelActive = true;
      scroll.update(value => clampToContainer(value + event.deltaY));
    }
  }

  function clampToContainer(value: number): number {
    return Math.max(0, Math.min(value, container.scrollWidth - container.clientWidth));
  }

  function scrollSync() {
    clearTimeout(scrollSyncTimeout);
    scrollSyncTimeout = setTimeout(() => {
      scrollWheelActive = false;
      scroll.set(container.scrollLeft, { duration: 0 });
    }, duration);
  }
</script>

<div
  bind:this={container}
  class="w-full h-full pb-[2px] overflow-x-scroll x-scroll"
  on:wheel|passive={updateScroll}
  on:scroll={scrollSync}
>
  <slot />
</div>
