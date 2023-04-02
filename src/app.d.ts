import type { Session } from "svelte-kit-cookie-session";
import type { OAuth2Client } from "google-auth-library";
import type { User } from "$lib/server/model/User";

type SessionData = {
  sub?: string;
};

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      session: Session<SessionData>;
      auth: OAuth2Client;
      user?: User;
    }
    // interface PageData {}
    // interface Platform {}
  }
}

export {};
