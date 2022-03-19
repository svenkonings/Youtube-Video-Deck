<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";
  import {listAllChannels, listAllPlaylistItems, listAllSubscriptions} from "../api/YouTube";

  async function init(): Promise<Subscriptions> {
    const subscriptions = await getSubscriptions();
    await listAllPlaylistItems(subscriptions);
    return subscriptions;
  }

  async function getSubscriptions(): Promise<Subscriptions> {
    const subscriptionsList = await listAllSubscriptions();
    const channelMap = await listAllChannels(subscriptionsList.items);
    return new Subscriptions(subscriptionsList, channelMap);
  }
</script>
{#await init()}
  <Spinner/>
{:then subscriptions}
  <div class="w-full" style="height: calc(100% - 6px);">
    <HorizontalScroll>
      <div class="w-max h-full">
        {#each subscriptions.items as subscription (subscription.uploadsPlaylistId)}
          <SubscriptionOverview {subscription}/>
        {/each}
      </div>
    </HorizontalScroll>
  </div>
{:catch error}
  <p class="text-center">{error}</p>
{/await}
