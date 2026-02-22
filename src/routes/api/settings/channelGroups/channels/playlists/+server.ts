import type {RequestHandler} from "./$types";

import type {Playlist} from "$lib/model/Playlist";
import {ajv} from "$lib/server/ajv";
import {updatePlaylists} from "$lib/server/db";

import {error} from "@sveltejs/kit";
import type {JSONSchemaType} from "ajv";

type PutType = {groupIndex: number; channelIndex: number; playlists: Playlist[]};

const putSchema: JSONSchemaType<PutType> = {
  type: "object",
  properties: {
    groupIndex: {type: "integer"},
    channelIndex: {type: "integer"},
    playlists: {
      type: "array",
      items: {
        type: "object",
        properties: {playlistPrefix: {type: "string"}},
        required: ["playlistPrefix"],
        additionalProperties: false,
      },
    },
  },
  required: ["groupIndex", "channelIndex", "playlists"],
  additionalProperties: false,
};

const putValidate = ajv.compile(putSchema);

export const PUT: RequestHandler = async ({locals, request}) => {
  if (!locals.user) {
    throw error(401, "User not logged in");
  }
  const data = await request.json();
  const valid = putValidate(data);
  if (!valid) {
    throw error(400, JSON.stringify(putValidate.errors, null, 2));
  }
  await updatePlaylists(locals.user.sub, data.groupIndex, data.channelIndex, data.playlists);
  return new Response();
};
