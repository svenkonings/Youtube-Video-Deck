<script lang="ts">
  import {tweened} from "svelte/motion";
  import {onDestroy, onMount} from "svelte";

  let container: HTMLDivElement;
  const duration = 100;
  const scroll = tweened(0, {duration: duration});
  let scrollWheelActive = false;
  let scrollSyncTimeout;

  onMount(() => {
    const unsubscribe = scroll.subscribe(value => {
      if (scrollWheelActive) container.scrollLeft = value;
    });
    onDestroy(unsubscribe);
  });

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
