<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";
  import {listAllChannels, listAllPlaylistItems, listAllSubscriptions} from "../api/YouTube";
  import {subscriptionsStore} from "../util/stores";
  import {NOT_MODIFIED} from "../api/Gapi";
  import {SubscriptionGroup} from "../model/SubscriptionGroup";
  import {readSettings} from "../api/Drive";
  import {Settings} from "../model/Settings";

  async function init(): Promise<SubscriptionGroup[]> {
    const [settings, subscriptions] = await Promise.all([getSettings(), getSubscriptions()]) as [Settings, Subscriptions];
    await listAllPlaylistItems(subscriptions, settings);
    $subscriptionsStore = subscriptions;
    const subscriptionMap = new Map(subscriptions.items.map(s => [s.channelId, s]));
    return Promise.all(settings.subscriptionGroups.map(s => SubscriptionGroup(s.name, s.subscriptionIds.map(id => subscriptionMap.get(id)))));
  }

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
</script>
{#await init()}
  <Spinner/>
{:then subscriptionGroups}
  <div class="w-full" style="height: calc(100% - 6px);">
    <HorizontalScroll>
      <div class="w-max h-full">
        {#each subscriptionGroups as subscriptionGroup}
          <SubscriptionOverview {subscriptionGroup}/>
        {/each}
      </div>
    </HorizontalScroll>
  </div>
{:catch error}
  <p class="text-center">{error}</p>
{/await}
