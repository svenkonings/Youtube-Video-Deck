import type { RequestHandler } from "./$types";

import type { Settings } from "$lib/model/Settings";
import { ajv } from "$lib/server/ajv";
import { updateSettings } from "$lib/server/db";

import { error } from "@sveltejs/kit";
import type { JSONSchemaType } from "ajv";

const putSchema: JSONSchemaType<Settings> = {
  type: "object",
  properties: {
    subscriptionGroups: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
          expanded: {
            type: "boolean",
          },
          subscriptionIds: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["name", "expanded", "subscriptionIds"],
        additionalProperties: false,
      },
    },
  },
  required: ["subscriptionGroups"],
  additionalProperties: false,
};

const putValidate = ajv.compile(putSchema);

export const PUT: RequestHandler = async ({ locals, request }) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const data = await request.json();
  const valid = putValidate(data);
  if (!valid) {
    throw error(400, JSON.stringify(putValidate.errors, null, 2));
  }
  await updateSettings(locals.user.sub, data);
  return new Response();
};
