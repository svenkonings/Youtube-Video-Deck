<script lang="ts">
  import {type Snippet} from "svelte";
  import {cubicOut} from "svelte/easing";
  import {Tween} from "svelte/motion";

  type Props = {children?: Snippet};

  let {children}: Props = $props();

  let container: HTMLDivElement;
  const scrollLeft = new Tween(0.0, {duration: 100, easing: cubicOut});
  let scrolling = $state(false);

  function onwheel(e: WheelEvent) {
    // Only trigger on vertical scroll without horizontal scroll or zoom
    if (!e.deltaY || e.deltaX || e.ctrlKey) {
      scrolling = false;
      return;
    }

    // Do not trigger horizontal scroll if there is a scrollable child
    let target = e.target instanceof Element ? e.target : null;
    while (target && target !== container) {
      if (isScrollable(target)) {
        scrolling = false;
        return;
      }
      target = target.parentElement;
    }

    // Reset tween to scrollLeft (element might have scrolled without wheel)
    if (!scrolling) {
      scrollLeft.set(container.scrollLeft, {duration: 0});
      scrolling = true;
    }

    // Update tween to clamped target value
    scrollLeft.target = clampToContainer(scrollLeft.target + e.deltaY);
  }

  $effect(() => {
    // Only trigger after scrolling
    if (!scrolling) return;
    // Update horizontal scroll
    container.scrollLeft = scrollLeft.current;
    // Disable scrolling after reaching target
    if (scrollLeft.current === scrollLeft.target) scrolling = false;
  });

  function isScrollable(element: Element) {
    return (
      element.scrollHeight > element.clientHeight &&
      ["scroll", "auto"].includes(window.getComputedStyle(element).overflowY)
    );
  }

  function clampToContainer(value: number): number {
    return Math.max(0, Math.min(value, container.scrollWidth - container.clientWidth));
  }
</script>

<div bind:this={container} class="x-scroll h-full w-full overflow-x-scroll pb-0.5" {onwheel}>
  {@render children?.()}
</div>
