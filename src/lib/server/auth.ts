import { upsertUser } from "$lib/server/db";
import { User } from "$lib/server/model/User";

import { env } from "$env/dynamic/private";

import google from "@googleapis/youtube";
import type { OAuth2Client } from "google-auth-library";

export function initClient(): OAuth2Client {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URL);
}

export function generateAuthUrl(client: OAuth2Client): string {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "https://www.googleapis.com/auth/youtube.readonly"],
  });
}

export async function login(client: OAuth2Client, code: string): Promise<User> {
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) {
    throw new Error("Missing ID token");
  }
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const sub = ticket.getUserId();
  if (!sub) {
    throw new Error("Missing user ID");
  }
  const user = await upsertUser(User(sub, tokens));
  return user;
}
