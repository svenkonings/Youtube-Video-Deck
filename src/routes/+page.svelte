<script lang="ts">
  import type { PageData } from "./$types";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";

  export let data: PageData;
  const { isSignedIn, authUrl, settings } = data;
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
        <LoginScreen {authUrl} />
      {/if}
    </section>
  </div>
</main>
