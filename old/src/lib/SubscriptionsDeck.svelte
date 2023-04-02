<script lang="ts">
  import {Subscriptions, subscriptionsModelVersion} from "../model/Subscriptions";
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
  import {errorString} from "../util/error";

  let initialised = false;
  let subscriptionGroups: SubscriptionGroup[];

  async function init(): Promise<void> {
    const [settings, subscriptions] = await Promise.all([getSettings(), getSubscriptions()]) as [Settings, Subscriptions];
    filterSettings(settings, subscriptions);
    $settingsStore = settings;
    await updateGroups(settings, subscriptions);
    initialised = true;
  }

  onDestroy(settingsStore.subscribe(settings => initialised && updateGroups(settings, $subscriptionsStore)));

  async function getSubscriptions(): Promise<Subscriptions> {
    let storedSubscriptions = $subscriptionsStore;
    if (storedSubscriptions && storedSubscriptions.version !== subscriptionsModelVersion) {
      storedSubscriptions = null;
    }
    try {
      const subscriptionsList = await listAllSubscriptions(storedSubscriptions?.etag);
      const channelMap = await listAllChannels(subscriptionsList.items);
      return Subscriptions(subscriptionsList, channelMap);
    } catch (e) {
      if (storedSubscriptions && e === NOT_MODIFIED) return storedSubscriptions;
      throw e;
    }
  }

  async function getSettings(): Promise<Settings> {
    let settings = await readSettings();
    if (!settings) {
      settings = Settings();
    }
    return settings;
  }

  function filterSettings(settings: Settings, subscriptions: Subscriptions): void {
    const subscriptionMap = new Map(subscriptions.items.map(s => [s.channelId, s]));
    settings.subscriptionGroups.forEach(g => g.subscriptionIds = g.subscriptionIds.filter(id => subscriptionMap.has(id)));
    settings.subscriptionGroups = settings.subscriptionGroups.filter(g => g.subscriptionIds.length > 0);
  }

  async function updateGroups(settings: Settings, subscriptions: Subscriptions): Promise<void> {
    await listAllPlaylistItems(subscriptions, settings);
    $subscriptionsStore = subscriptions;
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
  <p class="text-center">{errorString(error)}</p>
{/await}
