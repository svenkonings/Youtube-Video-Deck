<script lang="ts">
  import type { Comment } from "$lib/model/Comment";
  import CommentCard from "$lib/ui/CommentCard.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { objectToErrorMessage, responseToErrorMessage } from "$lib/util/error";

  export let videoId: string;
  let commentsPromise: Promise<Comment[]>;

  $: if (videoId) {
    commentsPromise = loadComments(videoId);
  }

  async function loadComments(videoId: string, pageToken?: string): Promise<Comment[]> {
    let url = `/api/comments?videoId=${videoId}`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    const response = await fetch(url);
    if (!response.ok) throw await responseToErrorMessage(response);
    return await response.json();
  }
</script>

<div class="bg-neutral-800 p-1 rounded-b-2xl">
  {#await commentsPromise}
    <Spinner />
  {:then comments}
    {#each comments as comment}
      <CommentCard {comment} />
    {/each}
  {:catch error}
    <code class="text-red-500 whitespace-pre-wrap">{objectToErrorMessage(error)}</code>
  {/await}
</div>
