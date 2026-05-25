<svelte:options runes />

<script lang="ts">
  import type {Snippet} from "svelte";
  import type {MouseEventHandler} from "svelte/elements";

  type Props = {
    onclick?: MouseEventHandler<HTMLButtonElement>;
    type?: "submit" | "reset" | "button";
    class?: string;
    tabindex?: number;
    children?: Snippet;
  };

  let {onclick, type = "button", class: className = "", tabindex = 0, children}: Props = $props();
</script>

<button
  {onclick}
  {type}
  class="cursor-pointer rounded-2xl bg-blue-600 p-1.5 text-white hover:enabled:bg-blue-700 disabled:opacity-60 {className}"
  {tabindex}>
  {@render children?.()}
</button>
