<script lang="ts">
  import {DateTime, Duration} from "luxon";
  import type {Video} from "../model/Video";
  import {abbreviate} from "../util/numbers";
  import {playerStore} from "../util/stores";

  export let video: Video;

  let duration;
  let viewCount;
  let publishedAt;

  $: if (video) {
    const isoDuration = Duration.fromISO(video.duration);
    if (isoDuration.days > 0) {
      duration = isoDuration.toFormat('d:hh:mm:ss');
    } else if (isoDuration.hours > 0) {
      duration = isoDuration.toFormat('h:mm:ss');
    } else {
      duration = isoDuration.toFormat('m:ss');
    }
    viewCount = abbreviate(video.viewCount);
    publishedAt = DateTime.fromISO(video.publishedAt).toRelative({locale: 'en'});
  }

  function play(): void {
    playerStore.set({videoId: video.videoId});
  }
</script>
<a class="block w-[calc(100%-1rem)] bg-neutral-600 p-2 m-2 first:mt-0 last:mb-0 rounded-2xl" href="https://www.youtube.com/watch?v={video.videoId}" on:click|preventDefault={play}>
  <div class="inline-block relative w-[11rem] align-text-bottom p-1">
    <img src={video.thumbnailUrl} alt="" loading="lazy" width="320" height="180"/>
    <span class="absolute right-0 bottom-0 m-1.5 px-0.5 rounded bg-black/80 text-sm">{duration}</span>
  </div>
  <div class="inline-block w-[calc(100%-11.5rem)] align-top text-sm">
    <p class="font-bold truncate" title={video.title}>{video.title}</p>
    <p class="text-neutral-400 truncate" title="{viewCount} views - {publishedAt} - {video.channelTitle}">
      {viewCount} views - {publishedAt} - {video.channelTitle}
    </p>
    <p class="text-ellipsis line-clamp-3">{video.description}</p>
  </div>
</a>
