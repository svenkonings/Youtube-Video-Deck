<script lang="ts">
  import type {Video} from "../model/Video";
  import {timeAgo} from "../util/TimeAgo.js";
  import {videoIdStore} from "../util/stores";

  export let video: Video;

  function play(): void {
    videoIdStore.set(video.videoId);
  }
</script>
<div class="w-card bg-neutral-600 p-2 m-2 rounded-2xl" on:click={play}>
  <div class="inline-block w-image align-text-bottom p-1">
    <img src="{video.thumbnailUrl}" alt=""/>
  </div>
  <div class="inline-block w-text text-sm">
    <p class="font-bold w-text truncate-line" title="{video.title}">{video.title}</p>
    <p class="text-neutral-400">{timeAgo.format(new Date(video.publishedAt))}</p>
    <p class="text-ellipsis truncate-lines">{video.description}</p>
  </div>
</div>
<style>
  .m-2:first-child {
    margin-top: 0;
  }

  .m-2:last-child {
    margin-bottom: 0;
  }

  .w-card {
    width: 35rem;
    cursor: pointer;
  }

  .w-image {
    width: 11rem;
  }

  .w-text {
    width: 22rem;
  }

  .truncate-line {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .truncate-lines {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
  }
</style>
