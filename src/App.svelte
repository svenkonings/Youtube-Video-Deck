<svelte:options immutable/>
<script lang="ts">
  import Spinner from "./lib/components/Spinner.svelte";
  import LoginScreen from "./lib/LoginScreen.svelte";
  import Header from "./lib/Header.svelte";
  import SubscriptionsDeck from "./lib/SubscriptionsDeck.svelte";
  import Player from "./lib/Player.svelte";
  import SubscriptionsEditor from "./lib/SubscriptionsEditor.svelte";
  import Center from "./lib/components/Center.svelte";
  import {errorString} from "./util/error";

  const scope = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/drive.appdata';

  let isSignedIn: boolean;
  let isAuthorized: boolean;

  function loadGapi(): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      gapi.load('client:auth2', () => initClient().then(() => resolve()).catch(e => reject(e)));
    }));
  }

  async function initClient(): Promise<void> {
    await gapi.client.init({
      'apiKey': 'AIzaSyBAHcJ9fPTrCjDExl1NZkF4fZd15fICEFI',
      'clientId': '789354109817-qrqoqtfj1k3gvs01gufrpqlv38g0bi9p.apps.googleusercontent.com',
      'scope': scope,
    });
    const googleAuth = gapi.auth2.getAuthInstance();
    isSignedIn = googleAuth.isSignedIn.get();
    googleAuth.isSignedIn.listen(signInStatus => isSignedIn = signInStatus);
    isAuthorized = googleAuth.currentUser.get().hasGrantedScopes(scope);
    googleAuth.currentUser.listen(user => isAuthorized = user.hasGrantedScopes(scope));
  }
</script>

<main class="w-full h-full overflow-x-auto x-scroll bg-neutral-700 text-white">
  <div class="w-full h-full min-w-[22rem]">
    <Header {isSignedIn} {isAuthorized}/>
    <section class="w-full h-[calc(100%-3rem)]">
      {#await loadGapi()}
        <Center>
          <Spinner/>
        </Center>
      {:then _}
        {#if isAuthorized}
          <SubscriptionsDeck/>
          <Player/>
          <SubscriptionsEditor/>
        {:else}
          <LoginScreen {isSignedIn}/>
        {/if}
      {:catch error}
        <p class="text-center">{errorString(error)}</p>
      {/await}
    </section>
  </div>
</main>
