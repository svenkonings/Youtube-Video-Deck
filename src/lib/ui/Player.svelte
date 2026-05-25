<svelte:options runes />

<script module lang="ts">
  let playerInput: PlayerInput | undefined = $state();

  export function play(input: PlayerInput): void {
    playerInput = input;
  }
</script>

<script lang="ts">
  import type {PlayerInput} from "$lib/types/PlayerInput";
  import {isEditorVisible} from "$lib/ui/ChannelGroupsEditor.svelte";
  import Comments from "$lib/ui/Comments.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import Description from "$lib/ui/Description.svelte";
  import {fade} from "$lib/util/fade.svelte";
  import {trapFocus} from "$lib/util/trapFocus.svelte";

  import {faClone, faXmark} from "@fortawesome/free-solid-svg-icons";
  import {Fa} from "svelte-fa";
  import {self} from "svelte/legacy";

  enum PlayerInitState {
    UNINITIALISED,
    INITIALISING,
    INITIALISED,
  }

  let backgroundVisible = $state(false);
  let playerVisible = $state(false);
  let playerPiP = $state(false);
  let player: YT.Player | undefined = $state();
  let playerInitState = $state(PlayerInitState.UNINITIALISED);
  let currentVideo: string | undefined = $state();

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
            if (!player) return;
            if (state.data === YT.PlayerState.BUFFERING || state.data === YT.PlayerState.PLAYING) {
              if (!playerPiP) playerVisible = true;
            } else if ((backgroundVisible || playerPiP) && state.data === YT.PlayerState.CUED) {
              setTimeout(() => player?.playVideo());
            }
            const playlist = player.getPlaylist();
            if (playlist) currentVideo = playlist[player.getPlaylistIndex()];
          },
          onError: e => {
            console.error("playerError", e);
            if (!player) return;
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
      playerArgs.playerVars = {autohide: 1, autoplay: 1, playsinline: 1};
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
      if (!player) return;
      if (input.videoId) {
        player.loadVideoById(input.videoId);
        currentVideo = input.videoId;
      } else if (input.playlistId) {
        player.loadPlaylist({listType: "playlist", list: input.playlistId});
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

  $effect(() => {
    if (playerInput) {
      if (!playerPiP) backgroundVisible = true;
      if (!playerInput.loading) {
        play(playerInput);
      }
    }
  });

  $effect(() => {
    if (playerInitState === PlayerInitState.INITIALISED && !backgroundVisible && !playerPiP) {
      player?.stopVideo();
    }
  });
</script>

<svelte:window onresize={resizePlayer} />
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  class="fixed inset-0 z-10 hidden bg-black/80"
  {@attach fade(() => backgroundVisible && !isEditorVisible())}
  onclick={self(hide)}>
</div>
<div
  class="fixed top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
  class:invisible={!backgroundVisible || playerVisible}>
  <Spinner />
</div>
<div
  id="playerContainer"
  class={`fixed z-30 ${playerPiP ? "right-0 bottom-3" : "y-scroll top-1/2 left-1/2 max-h-full max-w-full -translate-x-1/2 -translate-y-1/2 overflow-y-auto"}`}
  class:invisible={!(backgroundVisible && playerVisible) && !playerPiP}
  {@attach trapFocus(() => backgroundVisible && playerVisible)}>
  <div id="playerControls" class="absolute top-0 right-0 rounded-bl-2xl bg-black/40 p-1">
    <button type="button" class="cursor-pointer p-1" onclick={togglePiP}>
      <Fa icon={faClone} flip="vertical" />
    </button>

    <button type="button" class="cursor-pointer p-1" onclick={hide}>
      <Fa icon={faXmark} />
    </button>
  </div>
  <!-- TODO: Add external close button so player can be closed using keyboard controls -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div id="player" class="mx-auto" tabindex="0"></div>
  {#if currentVideo && !playerPiP}
    <div class="rounded-b-2xl bg-neutral-800 p-1">
      <Description videoId={currentVideo} />
      <Comments videoId={currentVideo} />
    </div>
  {/if}
</div>

<style>
  #playerControls {
    opacity: 0;
    transition: opacity 300ms;
  }

  #playerContainer:hover #playerControls {
    opacity: 1;
  }
</style>
