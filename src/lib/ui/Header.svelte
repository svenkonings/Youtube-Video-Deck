<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";

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

<header class="h-12 w-full">
  <Center>
    <a class="font-extrabold" href={resolve("/")}>YouTube Video Deck</a>
    <div slot="before" class="float-left p-1">
      {#if $editorVisible !== undefined}
        <PrimaryButton class="m-1 w-20" on:click={showEditor}>Edit</PrimaryButton>
      {/if}
    </div>
    <div slot="after" class="float-right p-1">
      {#if isSignedIn}
        <form method="POST" action="?/logout" use:enhance>
          <PrimaryButton type="submit" class="m-1 w-20">Sign out</PrimaryButton>
        </form>
      {/if}
    </div>
  </Center>
</header>
