<svelte:options runes />

<script lang="ts">
  import type {Settings} from "$lib/model/Settings";
  import ChannelGroups from "$lib/ui/ChannelGroups.svelte";
  import ChannelGroupsEditor from "$lib/ui/ChannelGroupsEditor.svelte";
  import Player from "$lib/ui/Player.svelte";

  type Props = {settings: Settings};

  let {settings}: Props = $props();
</script>

<ChannelGroups channelGroups={settings.channelGroups} />
<Player />
<ChannelGroupsEditor bind:channelGroups={settings.channelGroups} />
