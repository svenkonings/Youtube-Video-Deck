<script lang="ts">
  import VideoCard from "./VideoCard.svelte";
  import {playerStore} from "../util/stores";
  import type {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {getPlaylist, loadMoreVideos} from "../model/SubscriptionGroup";

  export let subscriptionGroup: SubscriptionGroup;
  let isLoading = false;

  async function play(): Promise<void> {
    $playerStore = {loading: true};
    const playerInput = await getPlaylist(subscriptionGroup);
    subscriptionGroup.videos = subscriptionGroup.videos; // Refresh videos
    $playerStore = playerInput;
  }

  async function loadMoreOnBottom(event: Event): Promise<void> {
    const element = event.target as HTMLDivElement;
    if (!isLoading && element.scrollHeight - element.scrollTop - 122 <= element.clientHeight) {
      isLoading = true;
      await loadMoreVideos(subscriptionGroup);
      subscriptionGroup.videos = subscriptionGroup.videos; // Refresh videos
      isLoading = false;
    }
  }

</script>
<div class="inline-block h-full bg-neutral-800 p-1 ml-1 mr-1 rounded-2xl">
  <p class="text-center font-bold h-8">
    {#if subscriptionGroup.subscriptions.length === 1}
      <a href="https://www.youtube.com/channel/{subscriptionGroup.subscriptions[0].subscription.channelId}">{subscriptionGroup.name}</a>
      {#if subscriptionGroup.videos.length > 0}
        <a class="float-right pl-2 pr-2 -ml-8 play-button" href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup.subscriptions[0].subscription.uploadsPlaylistId}" on:click|preventDefault={play}>▸</a>
      {/if}
    {:else}
      <span class="cursor-default">{subscriptionGroup.name}</span>
      {#if subscriptionGroup.videos.length > 0}
        <span class="float-right pl-2 pr-2 -ml-8 play-button cursor-pointer" on:click|preventDefault={play}>▸</span>
      {/if}
    {/if}
  </p>
  <div class="overflow-y-scroll overflow-x-hidden" style="height: calc(100% - 1.5rem);" on:wheel|stopPropagation|passive on:scroll={loadMoreOnBottom}>
    {#each subscriptionGroup.videos as video}
      <VideoCard {video}/>
    {/each}
  </div>
</div>
<style>
  .play-button {
    font-size: 2rem;
    line-height: 0.75;
  }

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
