<script lang="ts">
  import type { PlayerInput } from "$lib/types/PlayerInput";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { fade } from "$lib/util/fade";
  import { trapFocus } from "$lib/util/trapFocus";

  import { getContext, onDestroy } from "svelte";
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
  let player: YT.Player;
  let playerInitState = PlayerInitState.UNINITIALISED;

  function calcPlayerSize(): [number, number] {
    let width = Math.min(document.body.clientWidth, (16 * document.body.clientHeight) / 9);
    let height = Math.min(document.body.clientHeight, (9 * document.body.clientWidth) / 16);
    if (width > 0.9 * document.body.clientWidth && height > 0.9 * document.body.clientHeight) {
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
        width: width,
        height: height,
        events: {
          onReady: () => {
            console.log("playerReady");
            playerInitState = PlayerInitState.INITIALISED;
            playerVisible = true;
          },
          onStateChange: state => {
            console.log("playerState", state);
            if (state.data === YT.PlayerState.BUFFERING || state.data === YT.PlayerState.PLAYING) {
              playerVisible = true;
            } else if (backgroundVisible && state.data === YT.PlayerState.CUED) {
              setTimeout(() => player.playVideo());
            }
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

  onDestroy(
    playerStore.subscribe((input: PlayerInput | undefined) => {
      if (input) {
        playerStore.set(undefined);
        backgroundVisible = true;
        if (!input.loading) {
          play(input);
        }
      }
    })
  );

  $: if (!backgroundVisible) {
    playerVisible = false;
  }

  $: if (playerInitState === PlayerInitState.INITIALISED && !backgroundVisible) {
    player.stopVideo();
  }
</script>

<svelte:window on:resize={() => player && player.setSize(...calcPlayerSize())} />
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  class="fixed inset-0 z-10 bg-black/80"
  use:fade={{ visible: backgroundVisible && !$editorVisible, initial: false }}
  on:click|self={() => (backgroundVisible = false)}
>
  <div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
    class:invisible={!backgroundVisible || playerVisible}
  >
    <Spinner />
  </div>
  <div
    class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
    class:invisible={!backgroundVisible || !playerVisible}
    use:trapFocus={backgroundVisible && playerVisible}
  >
    <!-- TODO: Add external close button so player can be closed using keyboard controls -->
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div id="player" tabindex="0" />
  </div>
</div>
