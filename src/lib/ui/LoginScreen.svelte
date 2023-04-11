<script lang="ts">
  import Center from "$lib/ui/components/Center.svelte";
  import PrimaryButton from "$lib/ui/components/PrimaryButton.svelte";
</script>

<Center>
  <p>Please sign in to continue</p>
  <br />
  <form method="POST" action="?/login">
    <PrimaryButton type="submit" class="w-full">Sign in</PrimaryButton>
  </form>
</Center>
