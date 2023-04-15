import { Settings } from "$lib/model/Settings";

import type { Credentials } from "google-auth-library";

export type User = {
  readonly sub: string;
  readonly version: number;
  readonly credentials: Credentials;
  readonly settings: Settings;
};

export function User(sub: string, credentials: Credentials, settings: Settings = Settings()): User {
  return {
    sub,
    version: 1,
    credentials,
    settings,
  };
}
