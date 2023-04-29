<script lang="ts">
  import type { PageData } from "./$types";

  import { browser } from "$app/environment";

  import App from "$lib/ui/App.svelte";
  import Header from "$lib/ui/Header.svelte";
  import LoginScreen from "$lib/ui/LoginScreen.svelte";
  import Center from "$lib/ui/components/Center.svelte";
  import Spinner from "$lib/ui/components/Spinner.svelte";
  import { errorString } from "$lib/util/error";

  import { setContext } from "svelte";
  import { type Writable, writable } from "svelte/store";

  if (browser && window.location.search) {
    window.history.replaceState(null, "", window.location.pathname);
  }

  export let data: PageData;

  const editorVisible: Writable<boolean | undefined> = writable(undefined);
  $: if (!data.isSignedIn) editorVisible.set(undefined);
  setContext("editorVisible", editorVisible);
</script>

<Header isSignedIn={data.isSignedIn} />
<section class="w-full h-[calc(100%-3rem)]">
  {#if data.isSignedIn}
    {#await data.streamed.subscriptions}
      <Center>
        <Spinner />
      </Center>
    {:then subscriptions}
      <App settings={data.settings} {subscriptions} />
    {:catch error}
      <p class="text-center">{errorString(error)}</p>
    {/await}
  {:else}
    <LoginScreen />
  {/if}
</section>
