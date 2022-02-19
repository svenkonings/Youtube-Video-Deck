<script lang="ts">
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import Center from "./components/Center.svelte";

  export let isSignedIn: boolean;

  function signOut(): void {
    gapi.auth2.getAuthInstance().signOut();
  }

  function disconnect(): void {
    gapi.auth2.getAuthInstance().disconnect();
  }
</script>

<header class="h-12">
  <Center>
    <span class="font-extrabold">Youtube Video Deck</span>
    <div slot="inline" class="float-right p-1">
      {#if isSignedIn}
        <PrimaryButton class="w-36 m-1" on:click={signOut}>Sign out</PrimaryButton>
        <PrimaryButton class="w-36 m-1" on:click={disconnect}>Revoke access</PrimaryButton>
      {/if}
    </div>
  </Center>
</header>
