<script lang="ts">
  import type { Video } from "$lib/model/Video";
  import type { PlayerInput } from "$lib/types/PlayerInput";
  import { formatDuration, relativeDate } from "$lib/util/dates";
  import { abbreviate } from "$lib/util/numbers";

  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  export let video: Video;

  const playerStore: Writable<PlayerInput | undefined> = getContext("playerStore");

  let duration: string;
  let viewCount: string;
  let publishedAt: string;

  $: if (video) {
    duration = formatDuration(video.duration);
    viewCount = abbreviate(video.viewCount);
    publishedAt = relativeDate(video.publishedAt);
  }

  function play(): void {
    $playerStore = { videoId: video.videoId };
  }
</script>

<a
  class="block w-[calc(100%-1rem)] bg-neutral-600 p-2 m-2 first:mt-0 last:mb-0 rounded-2xl"
  href="https://www.youtube.com/watch?v={video.videoId}"
  on:click|preventDefault={play}
>
  <div class="inline-block relative w-[11rem] align-text-bottom p-1">
    <img src={video.thumbnailUrl} alt="" loading="lazy" width="320" height="180" />
    <span class="absolute right-0 bottom-0 m-1.5 px-0.5 rounded bg-black/80 text-sm">{duration}</span>
  </div>
  <div class="inline-block w-[calc(100%-11.5rem)] align-top text-sm">
    <p class="font-bold truncate" title={video.title}>{video.title}</p>
    <p class="text-neutral-400 truncate" title="{viewCount} views - {publishedAt} - {video.channelTitle}">
      {viewCount} views - {publishedAt} - {video.channelTitle}
    </p>
    <!-- Maximum length measured by maximum number of | characters displayed -->
    <p class="text-ellipsis line-clamp-3" title={video.description}>{video.description.substring(0, 275)}</p>
  </div>
</a>
