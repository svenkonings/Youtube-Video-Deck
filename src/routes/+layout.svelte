<script lang="ts">
  import "../app.css";

  import type {Snippet} from "svelte";

  type Props = {children?: Snippet};

  let {children}: Props = $props();
</script>

<main class="x-scroll h-full w-full overflow-x-auto bg-neutral-700 text-white">
  <div class="h-full w-full min-w-88">
    {@render children?.()}
  </div>
</main>
