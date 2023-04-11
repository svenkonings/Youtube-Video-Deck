<script lang="ts">
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";
  import Center from "$lib/ui/components/Center.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { errorString } from "$lib/util/error";

  if (browser && window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  export let data: PageData;
  const { isSignedIn, settings, streamed } = data;
</script>

<Header {isSignedIn} />
<section class="w-full h-[calc(100%-3rem)]">
  {#if isSignedIn}
    {#await streamed.subscriptions}
      <Center>
        <Spinner />
      </Center>
    {:then subscriptions}
      <code>{JSON.stringify(subscriptions)}</code>
      <!-- <SubscriptionsDeck/>
          <Player/>
          <SubscriptionsEditor/> -->
    {:catch error}
      <p class="text-center">{errorString(error)}</p>
    {/await}
  {:else}
    <LoginScreen />
  {/if}
</section>
