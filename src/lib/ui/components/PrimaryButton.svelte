<script lang="ts">
  export let href: string | undefined = undefined;
  export let type: "submit" | "reset" | "button" = "button";
  let className = "";
  export { className as class };
  export let tabindex = 0;
</script>

{#if href}
  <a
    on:click
    {href}
    class="inline-block bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700 {className}"
    {tabindex}
  >
    <slot />
  </a>
{:else}
  <button
    on:click
    {type}
    class="bg-blue-600 text-white p-1.5 rounded-2xl hover:enabled:bg-blue-700 disabled:opacity-60 {className}"
    {tabindex}
  >
    <slot />
  </button>
{/if}
