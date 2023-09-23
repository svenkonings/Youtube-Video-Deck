<script lang="ts">
  import type { PlayerInput } from "$lib/types/PlayerInput";
  import Comments from "$lib/ui/Comments.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { fade } from "$lib/util/fade";
  import { trapFocus } from "$lib/util/trapFocus";

  import Description from "./Description.svelte";
  import { faClone, faXmark } from "@fortawesome/free-solid-svg-icons";
  import { getContext, onDestroy } from "svelte";
  import Fa from "svelte-fa/src/fa.svelte";
  import type { Writable } from "svelte/store";

  const editorVisible: Writable<boolean | undefined> = getContext("editorVisible");
  const playerStore: Writable<PlayerInput | undefined> = getContext("playerStore");

  enum PlayerInitState {
    UNINITIALISED,
    INITIALISING,
    INITIALISED,
  }

  let backgroundVisible = false;
  let playerVisible = false;
  let playerPiP = false;
  let player: YT.Player;
  let playerInitState = PlayerInitState.UNINITIALISED;
  let currentVideo: string | undefined;

  function calcPlayerSize(): [number, number] {
    let width = Math.min(document.body.clientWidth, (16 * document.body.clientHeight) / 9);
    let height = Math.min(document.body.clientHeight, (9 * document.body.clientWidth) / 16);
    if (playerPiP) {
      // Minimum size 240p
      if (0.2 * width < 352 || 0.2 * height < 240) {
        width = 352;
        height = 240;
      } else {
        width *= 0.2;
        height *= 0.2;
      }
    } else if (width > 0.9 * document.body.clientWidth) {
      width *= 0.9;
      height *= 0.9;
    }
    return [width, height];
  }

  function play(input: PlayerInput, retries = 3): void {
    if (playerInitState === PlayerInitState.UNINITIALISED) {
      playerInitState = PlayerInitState.INITIALISING;
      const [width, height] = calcPlayerSize();
      const playerArgs: YT.PlayerOptions = {
        width,
        height,
        events: {
          onReady: () => {
            console.log("playerReady");
            playerInitState = PlayerInitState.INITIALISED;
            if (!playerPiP) playerVisible = true;
          },
          onStateChange: state => {
            console.log("playerState", state);
            if (state.data === YT.PlayerState.BUFFERING || state.data === YT.PlayerState.PLAYING) {
              if (!playerPiP) playerVisible = true;
            } else if ((backgroundVisible || playerPiP) && state.data === YT.PlayerState.CUED) {
              setTimeout(() => player.playVideo());
            }
            const playlist = player.getPlaylist();
            if (playlist) currentVideo = playlist[player.getPlaylistIndex()];
          },
          onError: e => {
            console.error("playerError", e);
            if (retries > 0) {
              play(input, retries - 1);
            } else {
              if (player.getPlaylist()) {
                player.nextVideo();
              }
            }
          },
        },
      };
      playerArgs.playerVars = {
        autohide: 1,
        autoplay: 1,
        playsinline: 1,
      };
      if (input.videoId) {
        playerArgs.videoId = input.videoId;
        currentVideo = input.videoId;
      } else if (input.playlistId) {
        playerArgs.playerVars.listType = "playlist";
        playerArgs.playerVars.list = input.playlistId;
      } else if (input.customPlaylist) {
        playerArgs.playerVars.playlist = input.customPlaylist.join(",");
      }
      player = new YT.Player("player", playerArgs);
    } else if (playerInitState === PlayerInitState.INITIALISING) {
      setTimeout(() => play(input), 100);
    } else if (playerInitState === PlayerInitState.INITIALISED) {
      if (input.videoId) {
        player.loadVideoById(input.videoId);
        currentVideo = input.videoId;
      } else if (input.playlistId) {
        player.loadPlaylist({
          listType: "playlist",
          list: input.playlistId,
        });
      } else if (input.customPlaylist) {
        player.loadPlaylist(input.customPlaylist);
      }
    }
  }

  function resizePlayer() {
    if (player) player.setSize(...calcPlayerSize());
  }

  function togglePiP() {
    if (playerPiP) {
      backgroundVisible = true;
      playerVisible = true;
      playerPiP = false;
    } else {
      playerPiP = true;
      playerVisible = false;
      backgroundVisible = false;
    }
    resizePlayer();
  }

  function hide() {
    playerPiP = false;
    playerVisible = false;
    backgroundVisible = false;
    resizePlayer();
  }

  onDestroy(
    playerStore.subscribe((input: PlayerInput | undefined) => {
      if (input) {
        playerStore.set(undefined);
        if (!playerPiP) backgroundVisible = true;
        if (!input.loading) {
          play(input);
        }
      }
    }),
  );

  $: if (playerInitState === PlayerInitState.INITIALISED && !backgroundVisible && !playerPiP) {
    player.stopVideo();
  }
</script>

<svelte:window on:resize={resizePlayer} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="fixed inset-0 z-10 bg-black/80"
  use:fade={{ visible: backgroundVisible && !$editorVisible, initial: false }}
  on:click|self={hide}
/>
<div
  class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
  class:invisible={!backgroundVisible || playerVisible}
>
  <Spinner />
</div>
<div
  id="playerContainer"
  class={`fixed z-30 ${
    playerPiP
      ? "bottom-3 right-0"
      : "max-w-full max-h-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto y-scroll"
  }`}
  class:invisible={!(backgroundVisible && playerVisible) && !playerPiP}
  use:trapFocus={backgroundVisible && playerVisible}
>
  <div id="playerControls" class="absolute top-0 right-0 p-1 bg-black/40 rounded-bl-2xl">
    <button type="button" class="p-1" on:click={togglePiP}>
      <Fa icon={faClone} flip="vertical" />
    </button>

    <button type="button" class="p-1" on:click={hide}>
      <Fa icon={faXmark} />
    </button>
  </div>
  <!-- TODO: Add external close button so player can be closed using keyboard controls -->
  <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
  <div id="player" tabindex="0" />
  {#if currentVideo && !playerPiP}
    <div class="bg-neutral-800 p-1 rounded-b-2xl">
      <Description videoId={currentVideo} />
      <Comments videoId={currentVideo} />
    </div>
  {/if}
</div>

<style lang="postcss">
  #playerControls {
    opacity: 0;
    transition: opacity 300ms;
  }

  #playerContainer:hover #playerControls {
    opacity: 1;
  }
</style>
