<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";
  import {listAllChannels, listAllPlaylistItems, listAllSubscriptions} from "../api/YouTube";
  import {settingsStore, subscriptionsStore} from "../util/stores";
  import {NOT_MODIFIED} from "../api/Gapi";
  import {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {readSettings} from "../api/Drive";
  import {Settings} from "../model/Settings";
  import Center from "./components/Center.svelte";
  import {onDestroy} from "svelte";

  let initialised = false;
  let subscriptionGroups: SubscriptionGroup[];

  async function init(): Promise<void> {
    const [settings, subscriptions] = await Promise.all([getSettings(), getSubscriptions()]) as [Settings, Subscriptions];
    $settingsStore = settings;
    await updateGroups(settings, subscriptions);
    initialised = true;
  }

  onDestroy(settingsStore.subscribe(settings => initialised && updateGroups(settings, $subscriptionsStore)));

  async function getSubscriptions(): Promise<Subscriptions> {
    const storedSubscriptions = $subscriptionsStore;
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

  async function updateGroups(settings: Settings, subscriptions: Subscriptions): Promise<void> {
    await listAllPlaylistItems(subscriptions, settings);
    $subscriptionsStore = subscriptions;
    const subscriptionMap = new Map(subscriptions.items.map(s => [s.channelId, s]));
    subscriptionGroups = await Promise.all(settings.subscriptionGroups.map(s => SubscriptionGroup(s.name, s.subscriptionIds.map(id => subscriptionMap.get(id)))));
  }
</script>
{#await init()}
  <Spinner/>
{:then _}
  {#if subscriptionGroups.length === 0}
    <Center>
      <p>No subscriptions to display</p>
      <br/>
      <p>Click the "Edit" button to add subscriptions</p>
    </Center>
  {:else}
    <div class="w-full" style="height: calc(100% - 6px);">
      <HorizontalScroll>
        <div class="w-max h-full">
          {#each subscriptionGroups as subscriptionGroup}
            <SubscriptionOverview {subscriptionGroup}/>
          {/each}
        </div>
      </HorizontalScroll>
    </div>
  {/if}
{:catch error}
  <p class="text-center">{JSON.stringify(error)}</p>
{/await}
