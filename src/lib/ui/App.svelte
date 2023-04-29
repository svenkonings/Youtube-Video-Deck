<script lang="ts">
  import type { Settings } from "$lib/model/Settings";
  import type { Subscription } from "$lib/model/Subscription";
  import type { PlayerInput } from "$lib/types/PlayerInput";
  import Player from "$lib/ui/Player.svelte";
  import SubscriptionsDeck from "$lib/ui/SubscriptionsDeck.svelte";
  import SubscriptionsEditor from "$lib/ui/SubscriptionsEditor.svelte";

  import { getContext, setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  export let settings: Settings;
  export let subscriptions: Subscription[];

  // Transform subscriptions to map
  const subscriptionMap = new Map(subscriptions.map(s => [s.channelId, s]));

  // Ensure subscriptionGroups only contain currently subscribed accounts
  settings.subscriptionGroups.forEach(
    g => (g.subscriptionIds = g.subscriptionIds.filter(id => subscriptionMap.has(id)))
  );
  settings.subscriptionGroups = settings.subscriptionGroups.filter(g => g.subscriptionIds.length > 0);

  // Init settings store
  const settingsStore: Writable<Settings> = writable();
  $: settingsStore.set(settings);
  setContext("settingsStore", settingsStore);

  // Init player store
  const playerStore: Writable<PlayerInput | undefined> = writable(undefined);
  setContext("playerStore", playerStore);

  // Update editor visible store
  const editorVisible: Writable<boolean | undefined> = getContext("editorVisible");
  $editorVisible = false;
</script>

<SubscriptionsDeck {subscriptionMap} />
<Player />
<SubscriptionsEditor {subscriptions} {subscriptionMap} />
