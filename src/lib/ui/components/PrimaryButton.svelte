<script lang="ts">
  export let type: "submit" | "reset" | "button" = "button";
  let className = "";
  export { className as class };
  export let tabindex = 0;
</script>

<button
  on:click
  {type}
  class="bg-blue-600 text-white p-1.5 rounded-2xl hover:enabled:bg-blue-700 disabled:opacity-60 {className}"
  {tabindex}
>
  <slot />
</button>
