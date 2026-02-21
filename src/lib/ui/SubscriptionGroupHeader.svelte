<script lang="ts">
  import { loadCustomPlaylist, type SubscriptionGroup } from "$lib/model/SubscriptionGroup";
  import type { PlayerInput } from "$lib/types/PlayerInput";

  import { faCircle, faCompressAlt, faExpandAlt, faPlay, faUsers } from "@fortawesome/free-solid-svg-icons";
  import { getContext } from "svelte";
  import { Fa, FaLayers } from "svelte-fa";
  import type { Writable } from "svelte/store";

  export let subscriptionGroup: SubscriptionGroup;
  export let toggleExpanded: () => void;

  const playerStore: Writable<PlayerInput | undefined> = getContext("playerStore");

  async function play(): Promise<void> {
    if (!subscriptionGroup.playlist) {
      $playerStore = { loading: true };
      await loadCustomPlaylist(subscriptionGroup);
    }
    $playerStore = subscriptionGroup.playlist;
  }
</script>

<p class="mb-1 h-8 text-center font-bold">
  <!-- Show icon and link for single subscriptions, show group icon and title otherwise -->
  {#if subscriptionGroup.subscriptions.length === 1}
    <a href="https://www.youtube.com/channel/UC{subscriptionGroup.subscriptions[0].id}">
      <img
        class="inline-block h-8 w-8 rounded-2xl align-middle"
        src={subscriptionGroup.subscriptions[0].thumbnailUrl}
        alt=""
        loading="lazy"
        width="88"
        height="88"
      />
      <span class="inline-block h-8 max-w-104 truncate align-text-top" title={subscriptionGroup.name}>
        {subscriptionGroup.name}
      </span>
    </a>
  {:else}
    <span class="inline-block h-8 align-middle">
      <FaLayers size="2x" class="-mx-1">
        <Fa icon={faCircle} color="rgb(82 82 82)" />
        <Fa icon={faUsers} scale={0.5} />
      </FaLayers>
    </span>
    <span class="inline-block h-8 max-w-104 cursor-default truncate align-text-top" title={subscriptionGroup.name}
      >{subscriptionGroup.name}</span
    >
  {/if}

  <!-- Show expand/collapse button when there are multiple subscriptions -->
  {#if subscriptionGroup.subscriptions.length > 1}
    {#if subscriptionGroup.expanded}
      <button
        type="button"
        class="float-left -mr-8 h-8 w-8 cursor-pointer px-2"
        title="Collapse"
        on:click={toggleExpanded}
      >
        <Fa icon={faCompressAlt} />
      </button>
    {:else}
      <button
        type="button"
        class="float-left -mr-8 h-8 w-8 cursor-pointer px-2"
        title="Expand"
        on:click={toggleExpanded}
      >
        <Fa icon={faExpandAlt} />
      </button>
    {/if}
  {/if}

  <!-- Show play all button if there are any videos -->
  {#if subscriptionGroup.videos.length > 0}
    <!-- Use link for single playlists, and button for custom playlists -->
    {#if subscriptionGroup.playlist?.playlistId}
      <a
        class="float-right -ml-8 h-8 w-8 px-2"
        title="Play all"
        href="https://www.youtube.com/watch?v={subscriptionGroup.videos[0].videoId}&list={subscriptionGroup.playlist
          .playlistId}"
        on:click|preventDefault={play}
      >
        <Fa icon={faPlay} translateY={0.5} />
      </a>
    {:else}
      <button type="button" class="float-right -ml-8 h-8 w-8 cursor-pointer px-2" title="Play all" on:click={play}>
        <Fa icon={faPlay} />
      </button>
    {/if}
  {/if}
</p>
