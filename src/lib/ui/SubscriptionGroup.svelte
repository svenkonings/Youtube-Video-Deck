<script lang="ts">
  import {
    allVideosLoaded,
    loadMoreVideos,
    SubscriptionGroupChild,
    type SubscriptionGroup,
  } from "$lib/model/SubscriptionGroup";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import SubscriptionGroupHeader from "$lib/ui/SubscriptionGroupHeader.svelte";
  import VideoCard from "$lib/ui/VideoCard.svelte";
  import { objectToErrorMessage } from "$lib/util/error";

  import { inview } from "svelte-inview";
  import { backOut } from "svelte/easing";
  import { fly } from "svelte/transition";

  export let subscriptionGroup: SubscriptionGroup;
  export let index: number;
  let inView = false;
  let isLoading = false;
  let errorCount = 0;
  let lastError: unknown;

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
    <SubscriptionGroupHeader {subscriptionGroup} {toggleExpanded} />
    <div class="h-[calc(100%-2.25rem)]">
      <!-- eslint-disable-next-line svelte/require-each-key -->
      {#each subscriptionGroup.subscriptions as subscription}
        <svelte:self subscriptionGroup={SubscriptionGroupChild(subscription)} {index} />
      {/each}
    </div>
  </div>
{:else}
  <div
    in:fly={{ x: 100, easing: backOut }}
    class="mr-1 ml-1 inline-block h-full w-screen max-w-lg min-w-88 rounded-2xl bg-neutral-800 p-1 pb-4 align-top"
  >
    <SubscriptionGroupHeader {subscriptionGroup} {toggleExpanded} />
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
