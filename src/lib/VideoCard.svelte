<script lang="ts">
  import {DateTime, Duration} from "luxon";
  import type {Video} from "../model/Video";
  import {playerStore} from "../util/stores";

  export let video: Video;

  function play(): void {
    playerStore.set({videoId: video.videoId});
  }
</script>
<a class="block w-[calc(100%-1rem)] bg-neutral-600 p-2 m-2 first:mt-0 last:mb-0 rounded-2xl" href="https://www.youtube.com/watch?v={video.videoId}" on:click|preventDefault={play}>
  <div class="inline-block relative w-[11rem] align-text-bottom p-1">
    <img src={video.thumbnailUrl} alt="" loading="lazy" width="320" height="180"/>
    <span class="absolute right-0 bottom-0 m-1.5 px-0.5 rounded bg-black/80 text-sm">{Duration.fromISO(video.duration).toFormat('m:ss')}</span>
  </div>
  <div class="inline-block w-[calc(100%-11.5rem)] align-top text-sm">
    <p class="font-bold truncate" title={video.title}>{video.title}</p>
    <p class="text-neutral-400 truncate">{DateTime.fromISO(video.publishedAt).toRelative({locale: 'en'})} - {video.channelTitle}</p>
    <p class="text-ellipsis line-clamp-3">{video.description}</p>
  </div>
</a>
