<script lang="ts">
  let className = '';
  export {className as class};
  export let tabindex = 0;
</script>
<button on:click class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700 disabled:bg-blue-600 disabled:opacity-60 {className}" tabindex={tabindex}>
  <slot/>
</button>
