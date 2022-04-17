<script lang="ts">
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import Center from "./components/Center.svelte";
  import {editorVisible} from "../util/stores";

  export let isSignedIn: boolean;
  export let isAuthorized: boolean;

  function showEditor() {
    $editorVisible = true;
  }

  function signOut(): void {
    gapi.auth2.getAuthInstance().signOut();
  }
</script>

<header class="w-full h-12">
  <Center>
    <a class="font-extrabold" href={'#'}>YouTube Video Deck</a>
    <div slot="before" class="float-left p-1">
      {#if isAuthorized}
        <PrimaryButton class="w-20 m-1" on:click={showEditor}>Edit</PrimaryButton>
      {/if}
    </div>
    <div slot="after" class="float-right p-1">
      {#if isSignedIn}
        <PrimaryButton class="w-20 m-1" on:click={signOut}>Sign out</PrimaryButton>
      {/if}
    </div>
  </Center>
</header>
