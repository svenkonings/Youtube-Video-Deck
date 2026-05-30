<script lang="ts">
  import type {PageData} from "./$types";

  import {browser} from "$app/environment";

  import App from "$lib/ui/App.svelte";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";

  if (browser && window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  type Props = {data: PageData};

  let props: Props = $props();
  let data = $derived.by(() => {
    // Make data deeply reactive
    const data = $state(props.data);
    return data;
  });
</script>

<Header isSignedIn={data.isSignedIn} />
<section class="h-[calc(100%-3rem)] w-full">
  {#if data.isSignedIn}
    <App settings={data.settings} />
  {:else}
    <LoginScreen />
  {/if}
</section>
