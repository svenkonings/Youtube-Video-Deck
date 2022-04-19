<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";
  import {listAllChannels, listAllPlaylistItems, listAllSubscriptions} from "../api/YouTube";
  import {editorVisible, settingsStore, subscriptionsStore} from "../util/stores";
  import {NOT_MODIFIED} from "../api/Gapi";
  import {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {readSettings} from "../api/Drive";
  import {Settings} from "../model/Settings";
  import Center from "./components/Center.svelte";
  import {onDestroy} from "svelte";
  import {fade} from "../util/fade";

  let initialised = false;
  let settings: Settings;
  let subscriptions: Subscriptions;
  let subscriptionGroups: SubscriptionGroup[];

  async function init(): Promise<void> {
    await Promise.all([getSettings(), getSubscriptions()]) as [Settings, Subscriptions];
    $settingsStore = settings;
    await updateGroups(settings, subscriptions, true);
    initialised = true;
  }

  onDestroy(settingsStore.subscribe(newSettings => initialised && updateGroups(newSettings, $subscriptionsStore)));

  async function getSubscriptions(): Promise<Subscriptions> {
    subscriptions = $subscriptionsStore;
    try {
      const subscriptionsList = await listAllSubscriptions(subscriptions?.etag);
      const channelMap = await listAllChannels(subscriptionsList.items);
      subscriptions = Subscriptions(subscriptionsList, channelMap);
    } catch (e) {
      if (subscriptions && e === NOT_MODIFIED) return;
      throw e;
    }
  }

  async function getSettings(): Promise<Settings> {
    settings = await readSettings();
    if (!settings) {
      settings = Settings();
    }
  }

  function subscriptionsChanged(newSettings: Settings): boolean {
    const subscriptionIds = new Set(settings.subscriptionGroups.flatMap(s => s.subscriptionIds));
    const newSubscriptionIds = new Set(newSettings.subscriptionGroups.flatMap(s => s.subscriptionIds));
    if (subscriptionIds.size !== newSubscriptionIds.size) return true;
    for (const id of subscriptionIds) if (!newSubscriptionIds.has(id)) return true;
    return false;
  }

  async function updateGroups(newSettings: Settings, subscriptions: Subscriptions, init: boolean = false): Promise<void> {
    if (init || subscriptionsChanged(newSettings)) {
      await listAllPlaylistItems(subscriptions, settings);
      $subscriptionsStore = subscriptions;
    }
    settings = newSettings;
    const subscriptionMap = new Map(subscriptions.items.map(s => [s.channelId, s]));
    subscriptionGroups = await Promise.all(settings.subscriptionGroups.map(s => SubscriptionGroup(s.name, s.expanded, s.subscriptionIds.map(id => subscriptionMap.get(id)))));
  }
</script>
{#await init()}
  <Center>
    <Spinner/>
  </Center>
{:then _}
  {#if subscriptionGroups.length === 0}
    <Center>
      <p>No subscriptions to display</p>
      <br/>
      <p>Click the "Edit" button to add subscriptions</p>
    </Center>
  {:else}
    <div class="w-full h-[calc(100%-6px)]" use:fade={{visible: !$editorVisible, initial: true}}>
      <HorizontalScroll>
        <div class="w-max h-full">
          {#each subscriptionGroups as subscriptionGroup, index}
            <SubscriptionOverview {subscriptionGroup} {index}/>
          {/each}
        </div>
      </HorizontalScroll>
    </div>
  {/if}
{:catch error}
  <p class="text-center">{JSON.stringify(error)}</p>
{/await}
