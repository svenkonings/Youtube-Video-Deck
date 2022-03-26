<script lang="ts">
  import {onDestroy} from "svelte";
  import {playerStore} from "../util/stores.js";

  export type PlayerInput = {
    videoId?: string,
    playlistId?: string,
    customPlaylist?: string[],
  };

  enum PlayerInitState {
    UNINITIALISED,
    INITIALISING,
    INITIALISED,
  }

  let hidden = true;
  let player: YT.Player;
  let playerInitState = PlayerInitState.UNINITIALISED;

  function calcPlayerSize(): number[] {
    let width = Math.min(document.body.clientWidth, 16 * document.body.clientHeight / 9);
    let height = Math.min(document.body.clientHeight, 9 * document.body.clientWidth / 16);
    if (width > 0.9 * document.body.clientWidth && height > 0.9 * document.body.clientHeight) {
      width *= 0.9;
      height *= 0.9;
    }
    return [width, height];
  }

  window.addEventListener('resize', () => {
    if (player) {
      player.setSize(...calcPlayerSize());
    }
  });

  function play(input: PlayerInput): void {
    if (playerInitState === PlayerInitState.UNINITIALISED) {
      playerInitState = PlayerInitState.INITIALISING;
      const [width, height] = calcPlayerSize();
      const playerArgs: YT.PlayerOptions = {
        width: width,
        height: height,
        playerVars: {
          autohide: 1,
          autoplay: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => playerInitState = PlayerInitState.INITIALISED,
          onStateChange: state => {
            if (hidden && (state.data === YT.PlayerState.BUFFERING || state.data === YT.PlayerState.PLAYING)) {
              hidden = false;
            }
          },
        },
      }
      if (input.videoId) {
        playerArgs.videoId = input.videoId;
      } else if (input.playlistId) {
        playerArgs.playerVars.listType = 'playlist';
        playerArgs.playerVars.list = input.playlistId;
      } else if (input.customPlaylist) {
        playerArgs.playerVars.playlist = input.customPlaylist.join(',');
      }
      player = new YT.Player('player', playerArgs);
      hidden = false;
    } else if (playerInitState === PlayerInitState.INITIALISING) {
      setTimeout(() => play(input), 100);
    } else if (playerInitState === PlayerInitState.INITIALISED) {
      if (input.videoId) {
        player.loadVideoById(input.videoId);
      } else if (input.playlistId) {
        player.loadPlaylist({
          listType: 'playlist',
          list: input.playlistId,
        });
      } else if (input.customPlaylist) {
        player.loadPlaylist(input.customPlaylist);
      }
    }
  }

  onDestroy(playerStore.subscribe((input: PlayerInput) => {
    if (input) {
      playerStore.set(null);
      play(input);
    }
  }));

  $: if (playerInitState === PlayerInitState.INITIALISED && hidden) {
    player.stopVideo();
  }
</script>
<div class="fixed top-0 bottom-0 left-0 right-0 z-10" class:fadeIn={!hidden} class:fadeOut="{hidden}" style="background-color: rgba(0, 0, 0, 0.8)" on:click|self={() => hidden = true}>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" class:invisible={hidden}>
    <div id="player"></div>
  </div>
</div>
<style>
  .fadeIn {
    visibility: visible;
    opacity: 1;
    transition: visibility 0s linear 0s, opacity 300ms;
  }

  .fadeOut {
    visibility: hidden;
    opacity: 0;
    transition: visibility 0s linear 300ms, opacity 300ms;
  }
</style>
