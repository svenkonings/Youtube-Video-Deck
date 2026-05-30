<script lang="ts">
  import {enhance} from "$app/forms";
  import {resolve} from "$app/paths";

  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
  import {showEditor} from "$lib/util/shared.svelte";

  type Props = {isSignedIn: boolean};

  let {isSignedIn}: Props = $props();
</script>

<header class="h-12 w-full">
  <Center>
    <a class="font-extrabold" href={resolve("/")}>YouTube Video Deck</a>
    {#snippet before()}
      {#if isSignedIn}
        <div class="float-left p-1">
          <PrimaryButton class="m-1 w-20" onclick={showEditor}>Edit</PrimaryButton>
        </div>
      {/if}
    {/snippet}
    {#snippet after()}
      {#if isSignedIn}
        <div class="float-right p-1">
          <form method="POST" action="?/logout" use:enhance>
            <PrimaryButton type="submit" class="m-1 w-20">Sign out</PrimaryButton>
          </form>
        </div>
      {/if}
    {/snippet}
  </Center>
</header>
