<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import type {Subscription} from "../model/Subscription";
  import type {SubscriptionsList} from "../types/SubscriptionsList";
  import type {ChannelMap} from "../types/ChannelMap";
  import Spinner from "./components/Spinner.svelte";
  import SubscriptionOverview from "./SubscriptionOverview.svelte";
  import HorizontalScroll from "./components/HorizontalScroll.svelte";

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

  async function listAllSubscriptions(): Promise<SubscriptionsList> {
    let subscriptionListResponse = await listSubscriptions();
    const etag = subscriptionListResponse.result.etag;
    const items = [subscriptionListResponse.result.items];
    while (subscriptionListResponse.result.nextPageToken) {
      subscriptionListResponse = await listSubscriptions(subscriptionListResponse.result.nextPageToken);
      items.push(subscriptionListResponse.result.items);
    }
    return {etag, items};
  }

  function listSubscriptions(pageToken?: string): gapi.client.Request<gapi.client.youtube.SubscriptionListResponse> {
    // TODO: Cache response with etags
    return gapi.client.youtube.subscriptions.list({
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,resourceId/channelId)),nextPageToken',
      mine: true,
      maxResults: 50,
      ...pageToken && {pageToken: pageToken}
    });
  }

  async function listAllChannels(subscriptionItems: gapi.client.youtube.Subscription[][]): Promise<ChannelMap> {
    const batchRequest: gapi.client.Batch<gapi.client.youtube.ChannelListResponse> = gapi.client.newBatch()
    subscriptionItems.forEach(subscriptions => batchRequest.add(listChannels(subscriptions)));
    const batchResponse = await batchRequest;
    return new Map(Object.values(batchResponse.result).flatMap(response => response.result.items.map(channel => [channel.id, channel])));
  }

  function listChannels(subscriptions: gapi.client.youtube.Subscription[]): gapi.client.Request<gapi.client.youtube.ChannelListResponse> {
    return gapi.client.youtube.channels.list({
      part: 'contentDetails',
      fields: 'items(id,contentDetails/relatedPlaylists/uploads)',
      id: subscriptions.map(subscription => subscription.snippet.resourceId.channelId).join(','),
      maxResults: 50,
    });
  }

  async function listAllPlaylistItems(subscriptions: Subscriptions): Promise<void> {
    const batchRequest: gapi.client.Batch<gapi.client.youtube.PlaylistItemListResponse> = gapi.client.newBatch();
    // @ts-ignore
    subscriptions.items.forEach(subscription => batchRequest.add(listPlaylistItems(subscription), {id: subscription.uploadsPlaylistId}));
    const batchResponse = await batchRequest;
    subscriptions.items.forEach(subscription => subscription.addUploads(batchResponse.result[subscription.uploadsPlaylistId].result));
  }

  function listPlaylistItems(subscription: Subscription): gapi.client.Request<gapi.client.youtube.PlaylistItemListResponse> {
    // TODO: Cache response with etags
    return gapi.client.youtube.playlistItems.list({
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,publishedAt,thumbnails/default/url,resourceId/videoId)),nextPageToken',
      playlistId: subscription.uploadsPlaylistId,
      // maxResults: 50, FIXME: Use max videos when done testing
      maxResults: 10,
      ...subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    });
  }
</script>
{#await init()}
  <Spinner/>
{:then subscriptions}
  <div class="w-full" style="height: calc(100% - 4px);">
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
