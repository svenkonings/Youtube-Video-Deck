<script lang="ts">
  import type {Subscription} from "../model/Subscription";
  import VideoCard from "./VideoCard.svelte";

  export let subscription: Subscription
</script>
<div class="inline-block h-full bg-neutral-800 p-1 ml-1 mr-1 rounded-2xl">
  <p class="text-center font-bold h-8">{subscription.title}</p>
  <!--<p>{subscription.description}</p>-->
  <div class="overflow-y-scroll" style="height: calc(100% - 1.5rem);" on:wheel|stopPropagation>
    {#each subscription.uploads as video (video.videoId)}
      <VideoCard {video}/>
    {/each}
  </div>
</div>
<style>
  .p-1 {
    padding-bottom: 1rem;
  }

  .overflow-y-scroll::-webkit-scrollbar {
    width: 0;
  }

  .overflow-y-scroll:hover::-webkit-scrollbar {
    width: 5px;
  }

  .overflow-y-scroll:hover::-webkit-scrollbar-thumb {
    background: #FF3D00;
    border-radius: 1rem;
  }
</style>
