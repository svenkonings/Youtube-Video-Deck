<script lang="ts">
  import type {Subscription} from "../model/Subscription";
  import VideoCard from "./VideoCard.svelte";
  import {playerStore} from "../util/stores";
  import {listPlaylistItems} from "../api/YouTube";
  import type {Video} from "../model/Video";

  export let subscription: Subscription
  let videos: Video[] = subscription.uploads.slice(0, 10);
  let currentPageLoadToken: string;

  function play(): void {
    playerStore.set({playlistId: subscription.uploadsPlaylistId});
  }

  function loadMoreOnBottom(event: Event): void {
    const element = event.target as HTMLDivElement;
    if (element.scrollHeight - element.scrollTop - 122 <= element.clientHeight) {
      loadMore();
    }
  }

  async function loadMore(): Promise<void> {
    if (subscription.uploads.length === videos.length) {
      await loadNextPage();
    }
    if (subscription.uploads.length > videos.length) {
      videos = videos.concat(subscription.uploads.slice(videos.length, videos.length + 10));
    }
  }

  async function loadNextPage(): Promise<void> {
    if (subscription.nextUploadPageToken && subscription.nextUploadPageToken !== currentPageLoadToken) {
      currentPageLoadToken = subscription.nextUploadPageToken;
      await listPlaylistItems(subscription);
      subscription.uploads = subscription.uploads // Trigger refresh
    }
  }

</script>
<div class="inline-block h-full bg-neutral-800 p-1 ml-1 mr-1 rounded-2xl">
  <p class="text-center font-bold h-8">
    <a href="https://www.youtube.com/channel/{subscription.channelId}">{subscription.title}</a>
    {#if videos.length > 0}
      <a class="float-right pl-2 pr-2 -ml-8" href="https://www.youtube.com/watch?v={videos[0].videoId}&list={subscription.uploadsPlaylistId}" on:click|preventDefault={play}>🞂</a>
    {/if}
  </p>
  <div class="overflow-y-scroll overflow-x-hidden" style="height: calc(100% - 1.5rem);" on:wheel|stopPropagation|passive on:scroll={loadMoreOnBottom}>
    {#each videos as video (video.videoId)}
      <VideoCard {video}/>
    {/each}
  </div>
</div>
<style>
  .p-1 {
    padding-bottom: 1rem;
  }

  .overflow-y-scroll::-webkit-scrollbar {
    width: 0;
  }

  .overflow-y-scroll:hover::-webkit-scrollbar {
    width: 5px;
  }

  .overflow-y-scroll:hover::-webkit-scrollbar-thumb {
    background: #FF3D00;
    border-radius: 1rem;
  }
</style>
