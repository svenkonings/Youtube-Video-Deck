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
<div class="inline-block h-full w-[32rem] bg-neutral-800 p-1 pb-4 ml-1 mr-1 rounded-2xl">
  <p class="text-center font-bold h-9">
    {#if subscriptionGroup.subscriptions.length === 1}
      <a href="https://www.youtube.com/channel/{subscriptionGroup.subscriptions[0].subscription.channelId}">
        <img class="inline-block h-8 w-8 rounded-2xl" src={subscriptionGroup.subscriptions[0].subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
        {subscriptionGroup.name}
      </a>
      {#if subscriptionGroup.videos.length > 0}
        <a class="float-right pl-2 pr-2 -ml-8 text-[2rem] leading-[0.75]" href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup.subscriptions[0].subscription.uploadsPlaylistId}" on:click|preventDefault={play}>▸</a>
      {/if}
    {:else}
      <span class="cursor-default">{subscriptionGroup.name}</span>
      {#if subscriptionGroup.videos.length > 0}
        <span class="float-right pl-2 pr-2 -ml-8 text-[2rem] leading-[0.75] cursor-pointer" on:click={play}>▸</span>
      {/if}
    {/if}
  </p>
  <div class="overflow-y-scroll overflow-x-hidden" style="height: calc(100% - 2.25rem);" on:wheel|stopPropagation|passive on:scroll={loadMoreOnBottom}>
    {#each subscriptionGroup.videos as video}
      <VideoCard {video}/>
    {/each}
  </div>
</div>
<style>
  /* Firefox scrollbar styles */
  .overflow-y-scroll {
    scrollbar-width: thin;
    scrollbar-color: #262626 #262626;
  }

  .overflow-y-scroll:hover {
    scrollbar-color: #FF3D00 #262626;
  }

  @media (any-hover: none) {
    .overflow-y-scroll {
      scrollbar-color: #FF3D00 #262626;
    }
  }

  /* Webkit scrollbar styles */
  .overflow-y-scroll::-webkit-scrollbar {
    width: 5px;
  }

  .overflow-y-scroll:hover::-webkit-scrollbar-thumb {
    background: #FF3D00;
    border-radius: 1rem;
  }

  @media (any-hover: none) {
    .overflow-y-scroll::-webkit-scrollbar-thumb {
      background: #FF3D00;
      border-radius: 1rem;
    }
  }
</style>
