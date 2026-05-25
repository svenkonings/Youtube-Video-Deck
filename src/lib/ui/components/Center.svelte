<svelte:options runes />

<script lang="ts">
  import type {Snippet} from "svelte";

  type Props = {before?: Snippet; children?: Snippet; after?: Snippet};

  let {before, children, after}: Props = $props();
</script>

<div class="relative h-full w-full">
  {@render before?.()}
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
    {@render children?.()}
  </div>
  {@render after?.()}
</div>
