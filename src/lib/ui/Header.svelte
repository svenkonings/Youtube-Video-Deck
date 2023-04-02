<script lang="ts">
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import Center from "$lib/ui/components/Center.svelte";
  // import {editorVisible, settingsStore, subscriptionsStore} from "../../../old/src/util/stores";

  export let isSignedIn: boolean;

  // function showEditor() {
  //   $editorVisible = true;
  // }
</script>

<header class="w-full h-12">
  <Center>
    <a class="font-extrabold" href={"#"}>YouTube Video Deck</a>
    <!-- <div slot="before" class="float-left p-1">
      {#if isAuthorized && $settingsStore && $subscriptionsStore}
        <PrimaryButton class="w-20 m-1" on:click={showEditor}>Edit</PrimaryButton>
      {/if}
    </div> -->
    <div slot="after" class="float-right p-1">
      {#if isSignedIn}
        <form method="POST" action="?/logout">
          <PrimaryButton type="submit" class="w-20 m-1">Sign out</PrimaryButton>
        </form>
      {/if}
    </div>
  </Center>
</header>
