<script lang="ts">
  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";

  export let authUrl: string;
</script>

<Center>
  <p>Please sign in to continue</p>
  <br />
  <PrimaryButton class="w-full" href={authUrl}>Sign in</PrimaryButton>
</Center>
