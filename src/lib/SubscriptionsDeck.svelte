<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";
  import {listAllChannels, listAllPlaylistItems, listAllSubscriptions} from "../api/YouTube";
  import {subscriptionsStore} from "../util/stores";
  import {NOT_MODIFIED} from "../api/Gapi";
  import {SubscriptionGroup} from "../model/SubscriptionGroup";

  async function init(): Promise<SubscriptionGroup[]> {
    const subscriptions = await getSubscriptions();
    await listAllPlaylistItems(subscriptions);
    $subscriptionsStore = subscriptions;
    return Promise.all(subscriptions.items.map(s => SubscriptionGroup(s.title, [s])));
  }

  async function getSubscriptions(): Promise<Subscriptions> {
    const storedSubscriptions = <Subscriptions>$subscriptionsStore;
    try {
      const subscriptionsList = await listAllSubscriptions(storedSubscriptions?.etag);
      const channelMap = await listAllChannels(subscriptionsList.items);
      return Subscriptions(subscriptionsList, channelMap);
    } catch (e) {
      if (storedSubscriptions && e === NOT_MODIFIED) return storedSubscriptions;
      throw e;
    }
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
