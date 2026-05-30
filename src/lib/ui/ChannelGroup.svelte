<script module lang="ts">
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const playlistCache: Map<string, PlaylistCache> = new Map<string, PlaylistCache>();

  function getPlaylistCache(playlistId: string): PlaylistCache {
    const existingCache = playlistCache.get(playlistId);
    if (existingCache !== undefined) return existingCache;
    const newCache = PlaylistCache();
    playlistCache.set(playlistId, newCache);
    return newCache;
  }
</script>

<script lang="ts">
  import {channelGroupFromChannel, type ChannelGroup} from "$lib/model/ChannelGroup";
  import {getPlaylistId} from "$lib/model/Playlist";
  import {PlaylistCache} from "$lib/model/PlaylistCache";
  import type {Video} from "$lib/model/Video";
  import type {PlayerInput} from "$lib/types/PlayerInput";
  import type {VideosResponse} from "$lib/types/VideosResponse";
  import Self from "$lib/ui/ChannelGroup.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import {play} from "$lib/ui/Player.svelte";
  import VideoCard from "$lib/ui/VideoCard.svelte";
  import {objectToErrorMessage, responseToErrorMessage} from "$lib/util/error";

  import {faCircle, faCompressAlt, faExpandAlt, faPlay, faUsers} from "@fortawesome/free-solid-svg-icons";
  import Fa, {FaLayers} from "svelte-fa";
  import {inview} from "svelte-inview";
  import {backOut} from "svelte/easing";
  import {fly} from "svelte/transition";

  const maxPlaylistLength = 200;

  type Props = {channelGroup: ChannelGroup; index: number};
  type GroupPlaylist = Pick<PlayerInput, "playlistId" | "customPlaylist">;
  type DerivedProps = {
    videos: Video[]; // The merged list of videos from all active playlists
    playlistIndices: Map<string, number>; // Mapping from playlistId to the index of the next video to be merged
    groupPlaylist?: GroupPlaylist; // playlistId in case of sinlge playlist, custom list of video ids otherwise
  };

  let {channelGroup = $bindable(), index}: Props = $props();
  // Reset when channelGroup changes
  let {videos, playlistIndices, groupPlaylist}: DerivedProps = $derived.by(() => {
    const videos: Video[] = $state([]);
    const playlistIndices = new Map<string, number>();
    if (channelGroup.channels.length === 1) {
      const channel = channelGroup.channels[0];
      if (channel.playlists.length === 1) {
        const playlist = channel.playlists[0];
        return {videos, playlistIndices, groupPlaylist: {playlistId: playlist.playlistPrefix + channel.channelId}};
      }
    }
    return {videos, playlistIndices};
  });

  function allVideosLoaded(): boolean {
    return channelGroup.channels.every(channel =>
      channel.playlists.every(playlist => {
        const playlistId = getPlaylistId(channel, playlist);
        const playlistCache = getPlaylistCache(playlistId);
        const playlistIndex = playlistIndices.get(playlistId);
        return playlistCache.videos.length === playlistIndex && playlistCache.nextPageToken === false;
      }),
    );
  }

  async function loadCustomPlaylist(): Promise<void> {
    if (videos.length < maxPlaylistLength) {
      await loadMoreVideos(maxPlaylistLength - videos.length);
    }
    groupPlaylist = {customPlaylist: videos.slice(0, maxPlaylistLength).map(v => v.videoId)};
  }

  async function loadMoreVideos(maxAmount = 10): Promise<void> {
    for (let i = 0; i < maxAmount; i++) {
      let nextVideo: Video | undefined;
      let nextPlaylistId: string | undefined;
      let nextIndex: number | undefined;
      for (const channel of channelGroup.channels) {
        for (const playlist of channel.playlists) {
          const playlistId = getPlaylistId(channel, playlist);
          const playlistCache = getPlaylistCache(playlistId);
          const playlistIndex = playlistIndices.get(playlistId) ?? 0;
          if (playlistIndex === playlistCache.videos.length) {
            if (playlistCache.nextPageToken === false) {
              continue;
            }
            await loadPlaylist(playlistId, playlistCache);
            if (playlistIndex === playlistCache.videos.length) {
              playlistCache.nextPageToken = false;
              continue;
            }
          }
          const video = playlistCache.videos[playlistIndex];
          if (nextVideo === undefined || video.publishedAt > nextVideo.publishedAt) {
            nextVideo = video;
            nextPlaylistId = playlistId;
            nextIndex = playlistIndex;
          }
        }
      }
      if (nextVideo === undefined || nextPlaylistId === undefined || nextIndex === undefined) {
        break;
      }
      videos.push(nextVideo);
      playlistIndices.set(nextPlaylistId, nextIndex + 1);
    }
  }

  async function loadPlaylist(playlistId: string, playlistCache: PlaylistCache): Promise<void> {
    const response = await fetch(
      "/api/videos?" +
        new URLSearchParams({playlistId, ...(playlistCache.nextPageToken && {pageToken: playlistCache.nextPageToken})}),
    );
    if (!response.ok) throw await responseToErrorMessage(response);
    const videosResponse: VideosResponse = await response.json();
    playlistCache.videos.push(...videosResponse.videos);
    playlistCache.nextPageToken = videosResponse.nextPageToken == null ? false : videosResponse.nextPageToken;
  }

  function toggleExpanded(): void {
    channelGroup.expanded = !channelGroup.expanded;
    fetch("/api/settings/channelGroups/expanded", {
      method: "PUT",
      body: JSON.stringify({groupIndex: index, expanded: channelGroup.expanded}),
      headers: {"content-type": "application/json"},
    });
  }

  async function playAll(event: MouseEvent) {
    event.preventDefault();
    if (!groupPlaylist) {
      play({loading: true});
      await loadCustomPlaylist();
    }
    play(groupPlaylist as PlayerInput);
  }

  let inView = $state(false);
  let isLoading = false;
  let errorCount = $state(0);
  let lastError: unknown = $state();

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
        await loadMoreVideos();
        errorCount = 0;
      } catch (e) {
        console.error("Error loading subscriptions", e);
        errorCount++;
        lastError = e;
      }
      isLoading = false;
    }
  }

  $effect(() => {
    if (inView && errorCount < 3) {
      loadWhileInView();
    }
  });
</script>

{#snippet header()}
  <p class="mb-1 h-8 text-center font-bold">
    <!-- Show icon and link for single channel, show group icon and name otherwise -->
    {#if channelGroup.channels.length === 1}
      <a href="https://www.youtube.com/channel/UC{channelGroup.channels[0].channelId}">
        <img
          class="inline-block h-8 w-8 rounded-2xl align-middle"
          src={channelGroup.channels[0].thumbnailUrl}
          alt=""
          loading="lazy"
          width="88"
          height="88" />
        <span class="inline-block h-8 max-w-104 truncate align-text-top" title={channelGroup.name}>
          {channelGroup.name}
        </span>
      </a>
    {:else}
      <span class="inline-block h-8 align-middle">
        <FaLayers size="2x" class="-mx-1">
          <Fa icon={faCircle} color="rgb(82 82 82)" />
          <Fa icon={faUsers} scale={0.5} />
        </FaLayers>
      </span>
      <span class="inline-block h-8 max-w-104 cursor-default truncate align-text-top" title={channelGroup.name}>
        {channelGroup.name}
      </span>
    {/if}

    <!-- Show expand/collapse button when there are multiple channels -->
    {#if channelGroup.channels.length > 1}
      {#if channelGroup.expanded}
        <button
          type="button"
          class="float-left -mr-8 h-8 w-8 cursor-pointer px-2"
          title="Collapse"
          onclick={toggleExpanded}>
          <Fa icon={faCompressAlt} />
        </button>
      {:else}
        <button
          type="button"
          class="float-left -mr-8 h-8 w-8 cursor-pointer px-2"
          title="Expand"
          onclick={toggleExpanded}>
          <Fa icon={faExpandAlt} />
        </button>
      {/if}
    {/if}

    <!-- Show play all button if there are any videos -->
    {#if videos.length > 0}
      <!-- Use link for single playlists, and button for custom playlists -->
      {#if groupPlaylist?.playlistId}
        <a
          class="float-right -ml-8 h-8 w-8 px-2"
          title="Play all"
          href="https://www.youtube.com/watch?v={videos[0].videoId}&list={groupPlaylist.playlistId}"
          onclick={playAll}>
          <Fa icon={faPlay} translateY={0.5} />
        </a>
      {:else}
        <button type="button" class="float-right -ml-8 h-8 w-8 cursor-pointer px-2" title="Play all" onclick={playAll}>
          <Fa icon={faPlay} />
        </button>
      {/if}
    {/if}
  </p>
{/snippet}

{#if channelGroup.expanded && channelGroup.channels.length > 1}
  <div
    in:fly={{x: 100, easing: backOut}}
    class="mr-1 ml-1 inline-block h-full w-max rounded-2xl bg-neutral-900 p-1 pb-4 align-top">
    {@render header()}
    <div class="h-[calc(100%-2.25rem)]">
      {#each channelGroup.channels as channel (channel)}
        <Self channelGroup={channelGroupFromChannel(channel)} {index} />
      {/each}
    </div>
  </div>
{:else}
  <div
    in:fly={{x: 100, easing: backOut}}
    class="mr-1 ml-1 inline-block h-full w-screen max-w-lg min-w-88 rounded-2xl bg-neutral-800 p-1 pb-4 align-top">
    {@render header()}
    <div class="y-scroll-hover h-[calc(100%-2.25rem)] overflow-x-hidden overflow-y-scroll">
      {#each videos as video (video)}
        <VideoCard {video} />
      {/each}
      {#if !allVideosLoaded()}
        {#if errorCount < 3}
          <div use:inview oninview_change={e => (inView = e.detail.inView)}>
            <Spinner />
          </div>
        {:else}
          <div class="w-full text-center">
            <p>Error loading subscriptions:</p>
            <code class="whitespace-pre-wrap text-red-500">{objectToErrorMessage(lastError)}</code>
            <PrimaryButton class="m-1 w-20" onclick={() => (errorCount = 0)}>Retry</PrimaryButton>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{/if}
