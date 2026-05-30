<script lang="ts">
  import type {ChannelGroup as ChannelGroupModel} from "$lib/model/ChannelGroup";
  import ChannelGroup from "$lib/ui/ChannelGroup.svelte";
  import Center from "$lib/ui/components/Center.svelte";
  import HorizontalScroll from "$lib/ui/components/HorizontalScroll.svelte";
  import {fade} from "$lib/util/fade.svelte";
  import {isEditorVisible} from "$lib/util/shared.svelte";

  type Props = {channelGroups: ChannelGroupModel[]};

  let {channelGroups = $bindable()}: Props = $props();
</script>

{#if channelGroups.length === 0}
  <Center>
    <p>No channels to display</p>
    <br />
    <p>Click the "Edit" button to add channels</p>
  </Center>
{:else}
  <div class="h-[calc(100%-6px)] w-full" {@attach fade(() => !isEditorVisible())}>
    <HorizontalScroll>
      <div class="h-full w-max">
        {#each channelGroups as channelGroup, index (channelGroup)}
          <ChannelGroup bind:channelGroup={channelGroups[index]} {index} />
        {/each}
      </div>
    </HorizontalScroll>
  </div>
{/if}
