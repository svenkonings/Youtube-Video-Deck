<script lang="ts">
  import { enhance } from "$app/forms";

  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";

  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  export let isSignedIn: boolean;

  const editorVisible: Writable<boolean | undefined> = getContext("editorVisible");

  function showEditor() {
    $editorVisible = true;
  }
</script>

<header class="w-full h-12">
  <Center>
    <a class="font-extrabold" href={"#"}>YouTube Video Deck</a>
    <div slot="before" class="float-left p-1">
      {#if $editorVisible !== undefined}
        <PrimaryButton class="w-20 m-1" on:click={showEditor}>Edit</PrimaryButton>
      {/if}
    </div>
    <div slot="after" class="float-right p-1">
      {#if isSignedIn}
        <form method="POST" action="?/logout" use:enhance>
          <PrimaryButton type="submit" class="w-20 m-1">Sign out</PrimaryButton>
        </form>
      {/if}
    </div>
  </Center>
</header>
