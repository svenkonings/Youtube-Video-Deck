<svelte:options immutable/>
<script lang="ts">
  import {onDestroy} from "svelte";
  import {editorVisible, playerStore} from "../util/stores";
  import type {PlayerInput} from "../types/PlayerInput";
  import Spinner from "./components/Spinner.svelte";
  import {fade} from "../util/fade";

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
    let width = Math.min(document.body.clientWidth, 16 * document.body.clientHeight / 9);
    let height = Math.min(document.body.clientHeight, 9 * document.body.clientWidth / 16);
    if (width > 0.9 * document.body.clientWidth && height > 0.9 * document.body.clientHeight) {
      width *= 0.9;
      height *= 0.9;
    }
    return [width, height];
  }

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
          onReady: () => {
            console.log('playerReady');
            playerInitState = PlayerInitState.INITIALISED;
            playerVisible = true;
          },
          onStateChange: state => {
            console.log('playerState', state);
            if (state.data === YT.PlayerState.BUFFERING || state.data === YT.PlayerState.PLAYING) {
              playerVisible = true;
            }
          },
          onError: e => {
            console.error('playerError', e);
            if (player.getPlaylist()) {
              player.nextVideo();
            }
          }
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
      backgroundVisible = true;
      if (!input.loading) {
        play(input);
      }
    }
  }));

  $: if (!backgroundVisible) {
    playerVisible = false;
  }

  $: if (playerInitState === PlayerInitState.INITIALISED && !backgroundVisible) {
    player.stopVideo();
  }
</script>
<svelte:window on:resize={() => player && player.setSize(...calcPlayerSize())}/>
<div class="fixed inset-0 z-10 bg-black/80" use:fade={{visible: backgroundVisible && !$editorVisible, initial: false}} on:click|self={() => backgroundVisible = false}>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20" class:invisible={!backgroundVisible || playerVisible}>
    <Spinner/>
  </div>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30" class:invisible={!backgroundVisible || !playerVisible}>
    <div id="player"></div>
  </div>
</div>
