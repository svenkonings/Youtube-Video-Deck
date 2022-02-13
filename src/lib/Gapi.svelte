<script lang="ts">
  import {Subscriptions} from "../model/Subscriptions";
  import {Subscription} from "../model/Subscription";

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

  async function getSubscriptions(pageToken?: string): Promise<Subscriptions> {
    const subscriptions = await listSubscriptions(pageToken);
    let nextPage: Promise<Subscriptions>;
    if (subscriptions.nextPageToken) {
      nextPage = getSubscriptions(subscriptions.nextPageToken);
    }
    const channels = await listChannels(subscriptions);
    const subscriptionList = new Subscriptions(subscriptions, channels);
    loadUploads(subscriptionList).then();
    if (nextPage) {
      nextPage.then(nextPage => subscriptionList.addSubscriptions(nextPage));
    }
    return subscriptionList;
  }

  async function loadUploads(subscriptions: Subscriptions): Promise<void> {
    const batchRequest: gapi.client.Batch<gapi.client.youtube.PlaylistListResponse> = gapi.client.newBatch();
    const batchSubscriptions = subscriptions.items.map(subscription => {
      // @ts-ignore
      batchRequest.add(listPlaylistItems(subscription), {id: subscription.uploadsPlaylistId});
      return subscription;
    });
    const batchResponse = await batchRequest;
    const batch = batchResponse.result;
    return batchSubscriptions.forEach(subscription => {
      const uploads = batch[subscription.uploadsPlaylistId].result;
      subscription.addUploads(uploads);
    });
  }

  async function listSubscriptions(pageToken?: string): Promise<gapi.client.youtube.SubscriptionListResponse> {
    // TODO: Cache response with etags
    const subscriptionsResponse = await gapi.client.youtube.subscriptions.list({
      part: 'snippet',
      fields: 'etag,items(snippet(title,description,resourceId/channelId)),nextPageToken',
      mine: true,
      maxResults: 50,
      ...pageToken && {pageToken: pageToken}
    });
    return subscriptionsResponse.result;
  }

  async function listChannels(subscriptions: gapi.client.youtube.SubscriptionListResponse): Promise<Map<string, gapi.client.youtube.Channel>> {
    const channelResponse = await gapi.client.youtube.channels.list({
      part: 'contentDetails',
      fields: 'items(id,contentDetails/relatedPlaylists/uploads)',
      id: subscriptions.items.map(subscription => subscription.snippet.resourceId.channelId).join(','),
      maxResults: 50,
    });
    return new Map(channelResponse.result.items.map(channel => [channel.id, channel]))
  }

  function listPlaylistItems(subscription: Subscription): gapi.client.Request<gapi.client.youtube.PlaylistItemListResponse> {
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
  <button on:click={async () => console.log(await getSubscriptions())}>List subscriptions</button>
{/if}
