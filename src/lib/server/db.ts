import type { Settings } from "$lib/model/Settings";
import type { User } from "$lib/server/model/User";

import { env } from "$env/dynamic/private";

import type { Credentials } from "google-auth-library";
import { MongoClient } from "mongodb";

const client = new MongoClient(
  `mongodb://${env.MONGO_USER}:${env.MONGO_PASSWORD}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DATABASE}`
);
const db = client.db(env.MONGO_DATABASE);
const users = db.collection<User>("users");

export async function getUser(sub: string): Promise<User> {
  const user = await users.findOne({ sub });
  if (!user) {
    throw new Error(`User with sub ${sub} not found`);
  }
  return user;
}

export async function upsertUser(user: User): Promise<User> {
  // Only set credential fields with non-null value
  const credentialFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(user.credentials)) {
    if (value) {
      credentialFields[`credentials.${key}`] = value;
    }
  }
  // Finds the user and updates the credentials, then returns the updated user
  // Inserts a new user if the user does not yet exists
  const result = await users.findOneAndUpdate(
    { sub: user.sub },
    {
      $set: credentialFields,
      $setOnInsert: { sub: user.sub, version: user.version, settings: user.settings },
    },
    { upsert: true, returnDocument: "after" }
  );
  if (!result.value) {
    throw new Error(`Failed to update user with sub ${user.sub}`);
  }
  return result.value;
}

export async function updateCredentials(sub: string, credentials: Credentials): Promise<void> {
  await users.updateOne({ sub }, { $set: { credentials } });
}

export async function updateSettings(sub: string, settings: Settings): Promise<void> {
  await users.updateOne({ sub }, { $set: { settings } });
}

export async function updateExpanded(sub: string, index: number, expanded: boolean): Promise<void> {
  await users.updateOne({ sub }, { $set: { [`settings.subscriptionGroups.${index}.expanded`]: expanded } });
}
