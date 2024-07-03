<script lang="ts">
  import type { Comment } from "$lib/model/Comment";
  import { relativeDate } from "$lib/util/dates";
  import { abbreviate } from "$lib/util/numbers";

  import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
  import { Fa } from "svelte-fa";

  export let comment: Comment;
</script>

<div class="m-3">
  <a class="inline-block align-top mt-2" href={comment.authorChannelUrl} target="_blank">
    <img
      class="inline-block rounded-full"
      src={comment.authorProfileImageUrl}
      width="40"
      height="40"
      alt=""
      loading="lazy"
    />
  </a>
  <div class="inline-block w-[calc(100%-45px)]">
    <a class="font-bold" href={comment.authorChannelUrl} target="_blank">{comment.authorDisplayName}</a>
    <span class="text-sm text-neutral-400">{relativeDate(comment.publishedAt)}</span>
    {#if comment.updatedAt}
      <span class="text-sm text-neutral-400">(edited {relativeDate(comment.publishedAt)})</span>
    {/if}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    <p>{@html comment.textDisplay}</p>
    <p class="text-neutral-300">
      {abbreviate(String(comment.likeCount))}
      <Fa class="inline-block" icon={faThumbsUp} />
    </p>
    {#each comment.replies as reply}
      <svelte:self comment={reply} />
    {/each}
  </div>
</div>
