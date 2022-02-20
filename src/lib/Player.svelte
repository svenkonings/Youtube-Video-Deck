<script lang="ts">
  // 3. This function creates an <iframe> (and YouTube player)
  //    after the API code downloads.
  import {onDestroy} from "svelte";
  import {fade} from 'svelte/transition';
  import {playlistIdStore, videoIdStore} from "../util/stores.js";

  enum PlayerInitState {
    UNINITIALISED,
    INITIALISING,
    INITIALISED,
  }

  let hidden = true;
  let player: YT.Player;
  let playerInitState = PlayerInitState.UNINITIALISED;

  function play(args: {
    videoId?: string,
    playlistId?: string,
  }): void {
    if (playerInitState === PlayerInitState.UNINITIALISED) {
      playerInitState = PlayerInitState.INITIALISING;
      const playerArgs: YT.PlayerOptions = {
        width: '1280',
        height: '720',
        playerVars: {
          autohide: 1,
          autoplay: 1,
          playsinline: 1,
        },
        events: {
          onReady: () => playerInitState = PlayerInitState.INITIALISED,
        },
      }
      if (args.videoId) {
        playerArgs.videoId = args.videoId;
      } else if (args.playlistId) {
        playerArgs.playerVars.listType = 'playlist';
        playerArgs.playerVars.list = args.playlistId;
      }
      player = new YT.Player('player', playerArgs);
    } else if (playerInitState === PlayerInitState.INITIALISING) {
      setTimeout(() => play(args), 100);
    } else if (playerInitState === PlayerInitState.INITIALISED) {
      if (args.videoId) {
        player.loadVideoById(args.videoId);
      } else if (args.playlistId) {
        player.loadPlaylist({
          listType: 'playlist',
          list: args.playlistId,
        });
      }
    }
  }

  onDestroy(videoIdStore.subscribe((videoId: string) => {
    if (videoId) {
      videoIdStore.set(null);
      play({videoId: videoId});
      hidden = false;
    }
  }));

  onDestroy(playlistIdStore.subscribe((playlistId: string) => {
    if (playlistId) {
      playlistIdStore.set(null);
      play({playlistId: playlistId});
      hidden = false;
    }
  }));

  $: if (playerInitState === PlayerInitState.INITIALISED && hidden) {
    player.stopVideo();
  }
</script>
<div class="fixed top-0 bottom-0 left-0 right-0 z-10" class:visuallyHidden="{hidden}" style="background-color: rgba(0, 0, 0, 0.8)" transition:fade={{duration: 100}} on:click|self={() => hidden = true}>
  <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
    <div id="player"></div>
  </div>
</div>
<style>
  .visuallyHidden:not(:focus):not(:active) {
    width: 0;
    height: 0;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
  }
</style>
