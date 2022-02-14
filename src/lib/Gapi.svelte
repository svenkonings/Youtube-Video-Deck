<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import {Subscription} from "../model/Subscription";
  import type {SubscriptionsList} from "../types/SubscriptionsList";
  import type {ChannelMap} from "../types/ChannelMap";

  const scope = 'https://www.googleapis.com/auth/youtube.readonly';

  let googleAuth: gapi.auth2.GoogleAuth = null;
  let isSignedIn: boolean = null;
  let isAuthorized: boolean = null;

  gapi.load('client:auth2', initClient);

  async function initClient(): Promise<void> {
    await gapi.client.init({
      'apiKey': 'AIzaSyBAHcJ9fPTrCjDExl1NZkF4fZd15fICEFI',
      'clientId': '789354109817-qrqoqtfj1k3gvs01gufrpqlv38g0bi9p.apps.googleusercontent.com',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
      'scope': scope,
    });
    googleAuth = gapi.auth2.getAuthInstance();
    isSignedIn = googleAuth.isSignedIn.get();
    googleAuth.isSignedIn.listen(signInStatus => isSignedIn = signInStatus);
    isAuthorized = googleAuth.currentUser.get().hasGrantedScopes(scope);
    googleAuth.currentUser.listen(user => isAuthorized = user.hasGrantedScopes(scope));
  }

  async function logData(): Promise<void> {
    const subscriptions = await getSubscriptions();
    console.log(subscriptions);
    await listAllPlaylistItems(subscriptions);
    console.log(subscriptions);
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
      maxResults: 50,
      ...subscription.nextUploadPageToken && {pageToken: subscription.nextUploadPageToken},
    });
  }
</script>

{#if isAuthorized === false}
  <button id="sign-in-or-authorize-button" on:click={() => googleAuth.signIn()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">{isSignedIn ? 'Authorize' : 'Sign in'}</button>
{/if}
{#if isSignedIn === true}
  <button id="sign-out-button" on:click={() => googleAuth.signOut()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">Sign out</button>
  <button id="revoke-button" on:click={() => googleAuth.disconnect()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">Revoke access</button>
  <button on:click={logData}>List subscriptions</button>
{/if}
