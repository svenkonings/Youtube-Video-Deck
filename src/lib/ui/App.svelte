<script lang="ts">
  import type {Settings} from "$lib/model/Settings";
  import ChannelGroups from "$lib/ui/ChannelGroups.svelte";
  import ChannelGroupsEditor from "$lib/ui/ChannelGroupsEditor.svelte";
  import Player from "$lib/ui/Player.svelte";
  import {isEditorVisible} from "$lib/util/shared.svelte";

  type Props = {settings: Settings};

  let {settings = $bindable()}: Props = $props();
</script>

<ChannelGroups bind:channelGroups={settings.channelGroups} />
<Player />
{#if isEditorVisible()}
  <ChannelGroupsEditor bind:channelGroups={settings.channelGroups} />
{/if}
