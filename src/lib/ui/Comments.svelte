<script lang="ts">
  import type {Comment} from "$lib/model/Comment";
  import CommentCard from "$lib/ui/CommentCard.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import {objectToErrorMessage, responseToErrorMessage} from "$lib/util/error";

  type Props = {videoId: string};

  let {videoId}: Props = $props();
  let commentsPromise: Promise<Comment[]> = $derived(loadComments(videoId));

  async function loadComments(videoId: string, pageToken?: string): Promise<Comment[]> {
    let url = `/api/comments?videoId=${videoId}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    const response = await fetch(url);
    if (!response.ok) throw await responseToErrorMessage(response);
    return await response.json();
  }
</script>

{#await commentsPromise}
  <Spinner text="Loading comments…" />
{:then comments}
  {#each comments as comment (comment)}
    <CommentCard {comment} />
  {/each}
{:catch error}
  <code class="whitespace-pre-wrap text-red-500">{objectToErrorMessage(error)}</code>
{/await}
