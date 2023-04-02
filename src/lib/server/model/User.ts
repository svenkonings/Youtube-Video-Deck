import type { Credentials } from "google-auth-library";
import { Settings } from "$lib/model/Settings";

export type User = {
  sub: string;
  version: number;
  credentials: Credentials;
  settings: Settings;
};

export function User(sub: string, credentials: Credentials, settings: Settings = Settings()): User {
  return {
    sub,
    version: 1,
    credentials,
    settings,
  };
}
