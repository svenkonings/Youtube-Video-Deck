<script lang="ts">
  export let type: "submit" | "reset" | "button" = "button";
  let className = "";
  export { className as class };
  export let tabindex = 0;
</script>

<button
  on:click
  {type}
  class="cursor-pointer rounded-2xl bg-blue-600 p-1.5 text-white hover:enabled:bg-blue-700 disabled:opacity-60 {className}"
  {tabindex}
>
  <slot />
</button>
