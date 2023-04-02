<script lang="ts">
  import type { PageData } from "./$types";
  import { browser } from "$app/environment";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";

  if (browser && window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  export let data: PageData;
  const { isSignedIn, settings } = data;
</script>

<main class="w-full h-full overflow-x-auto x-scroll bg-neutral-700 text-white">
  <div class="w-full h-full min-w-[22rem]">
    <Header {isSignedIn} />
    <section class="w-full h-[calc(100%-3rem)]">
      {#if isSignedIn}
        <!-- <SubscriptionsDeck/>
          <Player/>
          <SubscriptionsEditor/> -->
      {:else}
        <LoginScreen />
      {/if}
    </section>
  </div>
</main>
