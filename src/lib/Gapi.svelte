<script lang="ts">
  import type GoogleAuth = gapi.auth2.GoogleAuth;
  import type Batch = gapi.client.Batch;
  import type PlaylistListResponse = gapi.client.youtube.PlaylistListResponse;

  const scope = 'https://www.googleapis.com/auth/youtube.readonly';

  let googleAuth: GoogleAuth = null;
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

  async function listSubscriptions(pageToken?: string) {
    // TODO: Cache response with etags
    const subscriptionsResponse = await gapi.client.youtube.subscriptions.list({
      part: 'snippet',
      fields: 'items(etag,snippet(title,description,resourceId/channelId)),nextPageToken',
      mine: true,
      maxResults: 50,
      ...pageToken && {pageToken: pageToken}
    });
    const subscriptions = subscriptionsResponse.result;
    let nextPagesPromise;
    if (subscriptions.nextPageToken) {
      nextPagesPromise = listSubscriptions(subscriptions.nextPageToken)
    }
    const channelIds = subscriptions.items.map(subscription => subscription.snippet.resourceId.channelId).join(',');
    const channelResponse = await gapi.client.youtube.channels.list({
      part: 'contentDetails',
      fields: 'items(id,contentDetails/relatedPlaylists/uploads)',
      id: channelIds,
      maxResults: 50,
    })
    const channels = new Map(channelResponse.result.items.map(channel => [channel.id, channel]))
    const subscriptionList = subscriptions.items.map(subscription => {
      return {
        title: subscription.snippet.title,
        description: subscription.snippet.description,
        uploadsPlaylistId: channels.get(subscription.snippet.resourceId.channelId).contentDetails.relatedPlaylists.uploads,
      }
    })
    if (nextPagesPromise) {
      const nextPages = await nextPagesPromise
      return subscriptionList.concat(nextPages);
    } else {
      return subscriptionList;
    }
  }

  async function getUploads() {
    const subscriptions = await listSubscriptions();
    const batchRequest: Batch<PlaylistListResponse> = gapi.client.newBatch();
    subscriptions.forEach(subscription => {
      const request = gapi.client.youtube.playlistItems.list({
        part: 'snippet',
        fields: 'etag,items(snippet(title,description,publishedAt,resourceId/videoId)),nextPageToken',
        playlistId: subscription.uploadsPlaylistId,
        maxResults: 50,
      });
      // @ts-ignore
      batchRequest.add(request, {id: subscription.uploadsPlaylistId})
    });
    const batchResponse = await batchRequest;
    const batch = batchResponse.result;
    return subscriptions.map(subscription => {
      const uploads = batch[subscription.uploadsPlaylistId].result;
      return {
        ...subscription,
        // TODO: Extend existing uploads
        uploads: uploads.items.map(upload => {
          // @ts-ignore
          return {
            title: upload.snippet.title,
            description: upload.snippet.description,
            publishedAt: upload.snippet.publishedAt,
            videoId: upload.snippet.resourceId.videoId,
          }
        }),
        uploadsEtag: uploads.etag,
        nextUploadsPageToken: uploads.nextPageToken,
      }
    });
  }
</script>

{#if isAuthorized === false}
  <button id="sign-in-or-authorize-button" on:click={() => googleAuth.signIn()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">{isSignedIn ? 'Authorize' : 'Sign in'}</button>
{/if}
{#if isSignedIn === true}
  <button id="sign-out-button" on:click={() => googleAuth.signOut()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">Sign out</button>
  <button id="revoke-button" on:click={() => googleAuth.disconnect()} class="bg-blue-600 text-white p-1.5 rounded-2xl hover:bg-blue-700">Revoke access</button>
  <button on:click={async () => console.log(await listSubscriptions())}>List subscriptions</button>
  <button on:click={async () => console.log(await getUploads())}>Get uploads</button>
{/if}
