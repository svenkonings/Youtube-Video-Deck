<script lang="ts">
  import type {Subscription} from "../model/Subscription";
  import VideoCard from "./VideoCard.svelte";
  import {playlistIdStore} from "../util/stores";
  import {listPlaylistItems} from "../api/YouTube";

  export let subscription: Subscription
  let currentPageLoadToken: string;

  function play(): void {
    playlistIdStore.set(subscription.uploadsPlaylistId);
  }

  function loadMoreOnBottom(event: Event) {
    const element = event.target as HTMLDivElement;
    if (element.scrollHeight - element.scrollTop - 122 <= element.clientHeight) {
      loadNextPage();
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
  <p class="text-center font-bold h-8" title="{subscription.description}">
    {subscription.title}
    <span class="float-right cursor-pointer pl-2 pr-2 -ml-8" title="" on:click={play}>🞂</span>
  </p>
  <div class="overflow-y-scroll overflow-x-hidden" style="height: calc(100% - 1.5rem);" on:wheel|stopPropagation|passive on:scroll={loadMoreOnBottom}>
    {#each subscription.uploads as video (video.videoId)}
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
