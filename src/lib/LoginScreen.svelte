<svelte:options immutable/>
<script lang="ts">
  import Center from "./components/Center.svelte";
  import PrimaryButton from "./components/PrimaryButton.svelte";

  export let isSignedIn: boolean;

  function signIn(): Promise<gapi.auth2.GoogleUser> {
    return gapi.auth2.getAuthInstance().signIn();
  }
</script>
<Center>
  <p>Please {isSignedIn ? 'authorize this app' : 'sign in'} to continue</p>
  <br>
  <PrimaryButton class="w-full" on:click={signIn}>{isSignedIn ? 'Authorize' : 'Sign in'}</PrimaryButton>
</Center>
