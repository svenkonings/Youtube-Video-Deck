<script lang="ts">
  import type {PageData} from "./$types";

  import {browser} from "$app/environment";
  import {replaceState} from "$app/navigation";

  import App from "$lib/ui/App.svelte";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";

  // Clean URL after oauth redirect
  if (browser && window.location.search) {
    setTimeout(() => replaceState(window.location.pathname, {}));
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
    <App bind:settings={data.settings} />
  {:else}
    <LoginScreen />
  {/if}
</section>
