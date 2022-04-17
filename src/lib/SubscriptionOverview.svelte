<script lang="ts">
  import VideoCard from "./VideoCard.svelte";
  import {playerStore} from "../util/stores";
  import type {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {getPlaylist, loadMoreVideos} from "../model/SubscriptionGroup";
  import Fa from "svelte-fa/src/fa.svelte"
  import FaLayers from "svelte-fa/src/fa-layers.svelte"
  import {faCircle, faPlay, faUsers} from "@fortawesome/free-solid-svg-icons";

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
  <p class="text-center font-bold h-8 mb-1">
    {#if subscriptionGroup.subscriptions.length === 1}
      <a href="https://www.youtube.com/channel/{subscriptionGroup.subscriptions[0].subscription.channelId}">
        <img class="inline-block h-8 w-8 rounded-2xl align-middle" src={subscriptionGroup.subscriptions[0].subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
        <span class="inline-block h-8 max-w-[26rem] align-text-top truncate" title={subscriptionGroup.name}>{subscriptionGroup.name}</span>
      </a>
      {#if subscriptionGroup.videos.length > 0}
        <a class="float-right h-8 w-8 pl-2 pr-2 -ml-8" href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup.subscriptions[0].subscription.uploadsPlaylistId}" on:click|preventDefault={play}>
          <Fa icon={faPlay} translateY={0.5}/>
        </a>
      {/if}
    {:else}
      <span class="inline-block h-8 align-middle">
        <FaLayers size="2x" class="-mx-1">
          <Fa icon={faCircle} color="rgb(82 82 82)"/>
          <Fa icon={faUsers} scale={0.5}/>
        </FaLayers>
      </span>
      <span class="inline-block h-8 max-w-[26rem] align-text-top truncate cursor-default" title={subscriptionGroup.name}>{subscriptionGroup.name}</span>
      {#if subscriptionGroup.videos.length > 0}
        <span class="float-right inline-block h-8 w-8 px-2 -ml-8 cursor-pointer" on:click={play}>
          <Fa icon={faPlay} translateY={0.5}/>
        </span>
      {/if}
    {/if}
  </p>
  <div class="overflow-y-scroll y-scroll-hover overflow-x-hidden" style="height: calc(100% - 2.25rem);" on:wheel|stopPropagation|passive on:scroll={loadMoreOnBottom}>
    {#each subscriptionGroup.videos as video}
      <VideoCard {video}/>
    {/each}
  </div>
</div>
