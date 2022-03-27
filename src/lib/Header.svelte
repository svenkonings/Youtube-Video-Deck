<script lang="ts">
  import PrimaryButton from "./components/PrimaryButton.svelte";
  import Center from "./components/Center.svelte";

  export let isSignedIn: boolean;

  function signOut(): void {
    gapi.auth2.getAuthInstance().signOut();
  }
</script>

<header class="h-12">
  <Center>
    <a class="font-extrabold" href="{'#'}">Youtube Video Deck</a>
    <div slot="inline" class="float-right p-1">
      {#if isSignedIn}
        <PrimaryButton class="w-24 m-1" on:click={signOut}>Sign out</PrimaryButton>
      {/if}
    </div>
  </Center>
</header>
