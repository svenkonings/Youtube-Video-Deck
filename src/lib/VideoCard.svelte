<script lang="ts">
  import type {Video} from "../model/Video";
  import {timeAgo} from "../util/TimeAgo";
  import {playerStore} from "../util/stores";

  export let video: Video;

  function play(): void {
    playerStore.set({videoId: video.videoId});
  }
</script>
<a class="block w-card bg-neutral-600 p-2 m-2 rounded-2xl" href="https://www.youtube.com/watch?v={video.videoId}" on:click|preventDefault={play}>
  <div class="inline-block w-image align-text-bottom p-1">
    <img src={video.thumbnailUrl} alt="" loading="lazy" width="320" height="180"/>
  </div>
  <div class="inline-block w-text align-top text-sm">
    <p class="font-bold truncate-line" title={video.title}>{video.title}</p>
    <p class="text-neutral-400 truncate-line">{timeAgo.format(new Date(video.publishedAt))} - {video.channelTitle}</p>
    <p class="text-ellipsis truncate-lines">{video.description}</p>
  </div>
</a>
<style>
  .m-2:first-child {
    margin-top: 0;
  }

  .m-2:last-child {
    margin-bottom: 0;
  }

  .w-card {
    width: 30rem;
  }

  .w-image {
    width: 11rem;
  }

  .w-text {
    width: 17rem;
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
