<script lang="ts">
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { objectToErrorMessage, responseToErrorMessage } from "$lib/util/error";

  export let videoId: string;
  let descriptionPromise: Promise<string>;

  $: if (videoId) {
    descriptionPromise = loadDescription(videoId);
  }

  async function loadDescription(videoId: string): Promise<string> {
    let url = `/api/description?videoId=${videoId}`;
    const response = await fetch(url);
    if (!response.ok) throw await responseToErrorMessage(response);
    return await response.text();
  }
</script>

<div class="bg-neutral-700 m-2 p-2 rounded-2xl">
  {#await descriptionPromise}
    <Spinner text="Loading description…" />
  {:then description}
    <span class="whitespace-pre-wrap">{description}</span>
  {:catch error}
    <code class="text-red-500 whitespace-pre-wrap">{objectToErrorMessage(error)}</code>
  {/await}
</div>
