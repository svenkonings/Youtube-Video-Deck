<script lang="ts">
  import type GoogleAuth = gapi.auth2.GoogleAuth;

  const scope = 'https://www.googleapis.com/auth/youtube.readonly';

  let googleAuth: GoogleAuth = null; // @hmr:keep
  let isSignedIn: boolean = false; // @hmr:keep
  let isAuthorized: boolean = false; // @hmr:keep

  gapi.load('client:auth2', initClient);

  async function initClient(): Promise<void> {
    await gapi.client.init({
      'apiKey': 'AIzaSyBAHcJ9fPTrCjDExl1NZkF4fZd15fICEFI',
      'clientId': '789354109817-qrqoqtfj1k3gvs01gufrpqlv38g0bi9p.apps.googleusercontent.com',
      'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
      'scope': scope,
    });
    googleAuth = gapi.auth2.getAuthInstance();
    isSignedIn = googleAuth.isSignedIn.get();
    googleAuth.isSignedIn.listen(signInStatus => isSignedIn = signInStatus);
    isAuthorized = googleAuth.currentUser.get().hasGrantedScopes(scope);
    googleAuth.currentUser.listen(user => isAuthorized = user.hasGrantedScopes(scope));
  }
</script>

{#if !isAuthorized}
  <button id="sign-in-or-authorize-button" on:click={googleAuth.signIn}>{isSignedIn ? 'Authorize' : 'Sign in'}</button>
{/if}
{#if isSignedIn}
  <button id="sign-out-button" on:click={googleAuth.signOut}>Sign out</button>
  <button id="revoke-button" on:click={googleAuth.disconnect}>Revoke access</button>
{/if}
