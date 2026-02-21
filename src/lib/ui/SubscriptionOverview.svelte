<script lang="ts">
  import {
    allVideosLoaded,
    loadCustomPlaylist,
    loadMoreVideos,
    SubscriptionGroupChild,
    type SubscriptionGroup,
  } from "$lib/model/SubscriptionGroup";
  import type { PlayerInput } from "$lib/types/PlayerInput";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import VideoCard from "$lib/ui/VideoCard.svelte";
  import { objectToErrorMessage } from "$lib/util/error";

  import { faCircle, faCompressAlt, faExpandAlt, faPlay, faUsers } from "@fortawesome/free-solid-svg-icons";
  import { getContext } from "svelte";
  import { Fa, FaLayers } from "svelte-fa";
  import { inview } from "svelte-inview";
  import { backOut } from "svelte/easing";
  import type { Writable } from "svelte/store";
  import { fly } from "svelte/transition";

  const playerStore: Writable<PlayerInput | undefined> = getContext("playerStore");

  export let subscriptionGroup: SubscriptionGroup;
  export let index: number;
  let inView = false;
  let isLoading = false;
  let errorCount = 0;
  let lastError: unknown;

  async function play(): Promise<void> {
    if (!subscriptionGroup.playlist) {
      $playerStore = { loading: true };
      await loadCustomPlaylist(subscriptionGroup);
    }
    $playerStore = subscriptionGroup.playlist;
  }

  $: if (inView && errorCount < 3) {
    // eslint-disable-next-line svelte/infinite-reactive-loop
    loadWhileInView();
  }

  async function loadWhileInView() {
    if (inView && errorCount < 3) {
      // eslint-disable-next-line svelte/infinite-reactive-loop
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
        // eslint-disable-next-line svelte/infinite-reactive-loop
        errorCount = 0;
      } catch (e) {
        console.error("Error loading subscriptions", e);
        errorCount++;
        lastError = e;
      }
      isLoading = false;
    }
  }

  function toggleExpanded() {
    subscriptionGroup.expanded = !subscriptionGroup.expanded;
    fetch("/api/settings/subscriptionGroups/expanded", {
      method: "PUT",
      body: JSON.stringify({ index, expanded: subscriptionGroup.expanded }),
      headers: {
        "content-type": "application/json",
      },
    });
  }
</script>

{#if subscriptionGroup.expanded && subscriptionGroup.subscriptions.length > 1}
  <div
    in:fly={{ x: 100, easing: backOut }}
    class="mr-1 ml-1 inline-block h-full w-max rounded-2xl bg-neutral-900 p-1 pb-4 align-top"
  >
    <p class="mb-1 h-8 font-bold">
      <span class="inline-block h-8 align-middle">
        <FaLayers size="2x" class="-mx-1">
          <Fa icon={faCircle} color="rgb(82 82 82)" />
          <Fa icon={faUsers} scale={0.5} />
        </FaLayers>
      </span>
      <span class="inline-block h-8 max-w-104 cursor-default truncate align-text-top" title={subscriptionGroup.name}
        >{subscriptionGroup.name}</span
      >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span class="float-left inline-block h-8 w-8 cursor-pointer px-2" title="Collapse" on:click={toggleExpanded}>
        <Fa icon={faCompressAlt} translateY={0.5} />
      </span>
      {#if subscriptionGroup.videos.length > 0}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span class="float-right inline-block h-8 w-8 cursor-pointer px-2" title="Play all" on:click={play}>
          <Fa icon={faPlay} translateY={0.5} />
        </span>
      {/if}
    </p>
    <div class="h-[calc(100%-2.25rem)]">
      <!-- eslint-disable-next-line svelte/require-each-key -->
      {#each subscriptionGroup.subscriptions as groupSubscription}
        <svelte:self subscriptionGroup={SubscriptionGroupChild(groupSubscription.subscription)} {index} />
      {/each}
    </div>
  </div>
{:else}
  <div
    in:fly={{ x: 100, easing: backOut }}
    class="mr-1 ml-1 inline-block h-full w-screen max-w-lg min-w-88 rounded-2xl bg-neutral-800 p-1 pb-4 align-top"
  >
    <p class="mb-1 h-8 text-center font-bold">
      {#if subscriptionGroup.subscriptions.length === 1}
        <a href="https://www.youtube.com/channel/{subscriptionGroup.subscriptions[0].subscription.channelId}">
          <img
            class="inline-block h-8 w-8 rounded-2xl align-middle"
            src={subscriptionGroup.subscriptions[0].subscription.thumbnailUrl}
            alt=""
            loading="lazy"
            width="88"
            height="88"
          />
          <span class="inline-block h-8 max-w-104 truncate align-text-top" title={subscriptionGroup.name}>
            {subscriptionGroup.name}
          </span>
        </a>
        {#if subscriptionGroup.videos.length > 0}
          <a
            class="float-right -ml-8 h-8 w-8 px-2"
            title="Play all"
            href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup
              .subscriptions[0].subscription.uploadsPlaylistId}"
            on:click|preventDefault={play}
          >
            <Fa icon={faPlay} translateY={0.5} />
          </a>
        {/if}
      {:else if subscriptionGroup.subscriptions.length > 1}
        <span class="inline-block h-8 align-middle">
          <FaLayers size="2x" class="-mx-1">
            <Fa icon={faCircle} color="rgb(82 82 82)" />
            <Fa icon={faUsers} scale={0.5} />
          </FaLayers>
        </span>
        <span class="inline-block h-8 max-w-104 cursor-default truncate align-text-top" title={subscriptionGroup.name}
          >{subscriptionGroup.name}</span
        >
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="float-left -mr-8 inline-block h-8 w-8 cursor-pointer px-2"
          title="Expand"
          on:click={toggleExpanded}
        >
          <Fa icon={faExpandAlt} translateY={0.5} />
        </span>
        {#if subscriptionGroup.videos.length > 0}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <span class="float-right -ml-8 inline-block h-8 w-8 cursor-pointer px-2" title="Play all" on:click={play}>
            <Fa icon={faPlay} translateY={0.5} />
          </span>
        {/if}
      {/if}
    </p>
    <div
      class="y-scroll-hover h-[calc(100%-2.25rem)] overflow-x-hidden overflow-y-scroll"
      on:wheel|stopPropagation|passive
    >
      <!-- eslint-disable-next-line svelte/require-each-key -->
      {#each subscriptionGroup.videos as video}
        <VideoCard {video} />
      {/each}
      {#if !allVideosLoaded(subscriptionGroup)}
        {#if errorCount < 3}
          <div use:inview on:inview_change={e => (inView = e.detail.inView)}>
            <Spinner />
          </div>
        {:else}
          <div class="w-full text-center">
            <p>Error loading subscriptions:</p>
            <code class="whitespace-pre-wrap text-red-500">{objectToErrorMessage(lastError)}</code>
            <PrimaryButton class="m-1 w-20" on:click={() => (errorCount = 0)}>Retry</PrimaryButton>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}
