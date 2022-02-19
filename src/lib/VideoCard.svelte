<script lang="ts">
  import type {Video} from "../model/Video";
  import {timeAgo} from "../util/TimeAgo.js";

  export let video: Video;
</script>
<div class="w-128 bg-neutral-600 p-2 m-2 rounded-2xl">
  <div class="inline-block w-32 self-center p-1">
    <img src="{video.thumbnailUrl}" alt=""/>
  </div>
  <div class="inline-block w-88 text-sm">
    <p class="font-bold w-88 truncate-line" title="{video.title}">{video.title}</p>
    <p class="text-neutral-400">{timeAgo.format(new Date(video.publishedAt))}</p>
    <p class="text-ellipsis truncate-lines">{video.description}</p>
  </div>
</div>
<style lang="postcss">
  .w-128 {
    width: 32rem;
  }

  .w-88 {
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
