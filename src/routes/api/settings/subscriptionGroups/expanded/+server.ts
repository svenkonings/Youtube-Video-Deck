import type { RequestHandler } from "./$types";

import { ajv } from "$lib/server/ajv";
import { updateExpanded } from "$lib/server/db";

import { error } from "@sveltejs/kit";
import type { JSONSchemaType } from "ajv";

type PutType = {
  index: number;
  expanded: boolean;
};

const putSchema: JSONSchemaType<PutType> = {
  type: "object",
  properties: {
    index: { type: "integer" },
    expanded: { type: "boolean" },
  },
  required: ["index", "expanded"],
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
  await updateExpanded(locals.user.sub, data.index, data.expanded);
  return new Response();
};
