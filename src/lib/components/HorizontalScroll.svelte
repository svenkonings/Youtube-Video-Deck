<script lang="ts">
  import {tweened} from "svelte/motion";
  import {onDestroy} from "svelte";

  let container: HTMLDivElement;
  const duration = 100;
  const scroll = tweened(0, {duration: duration});
  let scrollWheelActive = false;
  let scrollSyncTimeout;

  onDestroy(scroll.subscribe(value => {
    if (scrollWheelActive) container.scrollLeft = value;
  }));

  function updateScroll(event: WheelEvent): void {
    scrollWheelActive = true;
    scroll.update(value => Math.max(0, Math.min(value + event.deltaY, container.scrollWidth - container.clientWidth)));
  }

  function scrollSync() {
    clearTimeout(scrollSyncTimeout);
    scrollSyncTimeout = setTimeout(() => {
      scrollWheelActive = false;
      scroll.set(container.scrollLeft, {duration: 0});
    }, duration);
  }
</script>
<div bind:this={container} class="w-full h-full overflow-x-scroll" on:wheel|preventDefault={updateScroll} on:scroll={scrollSync}>
  <slot/>
</div>
<style>
  .overflow-x-scroll {
    padding-bottom: 2px;
  }

  .overflow-x-scroll::-webkit-scrollbar {
    height: 5px;
  }

  .overflow-x-scroll::-webkit-scrollbar-thumb {
    background: #FF3D00;
    border-radius: 1rem;
  }
</style>
