<script lang="ts">
  import VideoCard from "./VideoCard.svelte";
  import {playerStore, settingsStore} from "../util/stores";
  import {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {getPlaylist, loadMoreVideos} from "../model/SubscriptionGroup";
  import Fa from "svelte-fa/src/fa.svelte"
  import FaLayers from "svelte-fa/src/fa-layers.svelte"
  import {faCircle, faCompressAlt, faExpandAlt, faPlay, faUsers} from "@fortawesome/free-solid-svg-icons";
  import Spinner from "./components/Spinner.svelte";
  import {inview} from "svelte-inview";
  import {writeSettings} from "../api/Drive";

  export let subscriptionGroup: SubscriptionGroup;
  export let index: number;
  let inView = false;
  let isLoading = false;
  let errorCount = 0;

  async function play(): Promise<void> {
    $playerStore = {loading: true};
    const playerInput = await getPlaylist(subscriptionGroup);
    subscriptionGroup.videos = subscriptionGroup.videos; // Refresh videos
    $playerStore = playerInput;
  }

  $: if (inView) {
    loadWhileInView();
  }

  async function loadWhileInView() {
    if (inView && errorCount < 3) {
      await loadMore();
      setTimeout(loadWhileInView, 100);
    }
  }

  async function loadMore(): Promise<void> {
    if (!isLoading) {
      isLoading = true;
      try {
        await loadMoreVideos(subscriptionGroup);
        subscriptionGroup.videos = subscriptionGroup.videos; // Refresh videos
        errorCount = 0;
      } catch (e) {
        console.error(e);
        errorCount++;
      }
      isLoading = false;
    }
  }

  function toggleExpanded() {
    subscriptionGroup.expanded = !subscriptionGroup.expanded;
    const settings = $settingsStore;
    settings.subscriptionGroups[index].expanded = subscriptionGroup.expanded;
    $settingsStore = settings;
    writeSettings(settings).then();
  }
</script>
{#if subscriptionGroup.expanded && subscriptionGroup.subscriptions.length > 1}
  <div class="inline-block h-full w-max bg-neutral-900 p-1 pb-4 ml-1 mr-1 rounded-2xl align-top">
    <p class="font-bold h-8 mb-1">
      <span class="inline-block h-8 align-middle">
        <FaLayers size="2x" class="-mx-1">
          <Fa icon={faCircle} color="rgb(82 82 82)"/>
          <Fa icon={faUsers} scale={0.5}/>
        </FaLayers>
      </span>
      <span class="inline-block h-8 max-w-[26rem] align-text-top truncate cursor-default" title={subscriptionGroup.name}>{subscriptionGroup.name}</span>
      <span class="float-left inline-block h-8 w-8 px-2 cursor-pointer" title="Collapse" on:click={toggleExpanded}>
          <Fa icon={faCompressAlt} translateY={0.5}/>
        </span>
      {#if subscriptionGroup.videos.length > 0}
        <span class="float-right inline-block h-8 w-8 px-2 cursor-pointer" title="Play all" on:click={play}>
          <Fa icon={faPlay} translateY={0.5}/>
        </span>
      {/if}
    </p>
    <div style="height: calc(100% - 2.25rem);">
      {#each subscriptionGroup.subscriptions as groupSubscription}
        {#await SubscriptionGroup(groupSubscription.subscription.title, false, [groupSubscription.subscription])}
        {:then subscriptionGroup}
          <svelte:self {subscriptionGroup} {index}/>
        {/await}
      {/each}
    </div>
  </div>
{:else}
  <div class="inline-block h-full w-screen max-w-[32rem] min-w-[22rem] bg-neutral-800 p-1 pb-4 ml-1 mr-1 rounded-2xl align-top">
    <p class="text-center font-bold h-8 mb-1">
      {#if subscriptionGroup.subscriptions.length === 1}
        <a href="https://www.youtube.com/channel/{subscriptionGroup.subscriptions[0].subscription.channelId}">
          <img class="inline-block h-8 w-8 rounded-2xl align-middle" src={subscriptionGroup.subscriptions[0].subscription.thumbnailUrl} alt="" loading="lazy" width="88" height="88"/>
          <span class="inline-block h-8 max-w-[26rem] align-text-top truncate" title={subscriptionGroup.name}>{subscriptionGroup.name}</span>
        </a>
        {#if subscriptionGroup.videos.length > 0}
          <a class="float-right h-8 w-8 px-2 -ml-8" title="Play all" href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup.subscriptions[0].subscription.uploadsPlaylistId}" on:click|preventDefault={play}>
            <Fa icon={faPlay} translateY={0.5}/>
          </a>
        {/if}
      {:else if subscriptionGroup.subscriptions.length > 1}
        <span class="inline-block h-8 align-middle">
          <FaLayers size="2x" class="-mx-1">
            <Fa icon={faCircle} color="rgb(82 82 82)"/>
            <Fa icon={faUsers} scale={0.5}/>
          </FaLayers>
        </span>
        <span class="inline-block h-8 max-w-[26rem] align-text-top truncate cursor-default" title={subscriptionGroup.name}>{subscriptionGroup.name}</span>
        <span class="float-left inline-block h-8 w-8 px-2 -mr-8 cursor-pointer" title="Expand" on:click={toggleExpanded}>
          <Fa icon={faExpandAlt} translateY={0.5}/>
        </span>
        {#if subscriptionGroup.videos.length > 0}
          <span class="float-right inline-block h-8 w-8 px-2 -ml-8 cursor-pointer" title="Play all" on:click={play}>
            <Fa icon={faPlay} translateY={0.5}/>
          </span>
        {/if}
      {/if}
    </p>
    <div class="overflow-y-scroll y-scroll-hover overflow-x-hidden" style="height: calc(100% - 2.25rem);" on:wheel|stopPropagation|passive>
      {#each subscriptionGroup.videos as video}
        <VideoCard {video}/>
      {/each}
      {#if subscriptionGroup.subscriptions.some(s => s.subscription.nextUploadPageToken != null)}
        <div use:inview on:change={e => inView = e.detail.inView}>
          <Spinner/>
        </div>
      {/if}
    </div>
  </div>
{/if}
