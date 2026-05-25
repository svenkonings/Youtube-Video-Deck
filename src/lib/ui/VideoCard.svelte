<svelte:options runes />

<script lang="ts">
  import type {Video} from "$lib/model/Video";
  import {play} from "$lib/ui/Player.svelte";
  import {formatDuration, relativeDate} from "$lib/util/dates";
  import {abbreviate} from "$lib/util/numbers";

  type Props = {video: Video};

  let {video}: Props = $props();

  let duration = $derived(formatDuration(video.duration));
  let viewCount = $derived(abbreviate(video.viewCount));
  let publishedAt = $derived(relativeDate(video.publishedAt));

  function onclick(event: Event): void {
    event.preventDefault();
    play({videoId: video.videoId});
  }
</script>

<a
  class="m-2 block w-[calc(100%-1rem)] rounded-2xl bg-neutral-600 p-2 first:mt-0 last:mb-0"
  href="https://www.youtube.com/watch?v={video.videoId}"
  {onclick}>
  <div class="relative inline-block w-44 p-1 align-text-bottom">
    <img src={video.thumbnailUrl} alt="" loading="lazy" width="320" height="180" />
    <span class="absolute right-0 bottom-0 m-1.5 rounded bg-black/80 px-0.5 text-sm">{duration}</span>
  </div>
  <div class="inline-block w-[calc(100%-11.5rem)] align-top text-sm">
    <p class="truncate font-bold" title={video.title}>{video.title}</p>
    <p class="truncate text-neutral-400" title="{viewCount} views - {publishedAt} - {video.channelTitle}">
      {viewCount} views - {publishedAt} - {video.channelTitle}
    </p>
    <!-- Maximum length measured by maximum number of | characters displayed -->
    <p class="line-clamp-3 text-ellipsis" title={video.description}>{video.description.substring(0, 275)}</p>
  </div>
</a>
