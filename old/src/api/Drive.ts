import {jsonBlob, request} from "./Gapi";
import type {Settings} from "../model/Settings";

const settingsFileName = 'settings.json';
let settingsFileId: string;

async function getSettingsFileId(): Promise<void> {
  const response = await request('/drive/v3/files', {
    method: 'GET',
    query: {
      spaces: 'appDataFolder',
      fields: 'files(id)',
      q: `name = '${settingsFileName}'`,
      pageSize: '1',
    },
  });
  const result: gapi.client.drive.FileList = await response.json()
  settingsFileId = result.files.length > 0 ? result.files[0].id : null;
}

export async function readSettings(): Promise<Settings> {
  if (settingsFileId === undefined) {
    await getSettingsFileId();
  }
  if (settingsFileId == null) {
    return null;
  }
  const response = await request(`/drive/v3/files/${settingsFileId}`, {
    method: 'GET',
    query: {'alt': 'media'},
  });
  return response.json();
}

export async function writeSettings(content: Settings): Promise<void> {
  if (settingsFileId === undefined) {
    await getSettingsFileId();
  }
  if (settingsFileId == null) {
    await createSettings(content);
  } else {
    await updateSettings(content);
  }
}

async function createSettings(content: Settings): Promise<void> {
  const metadata = {
    name: settingsFileName,
    mimeType: 'application/json',
    parents: ['appDataFolder'],
  };
  const form = new FormData();
  form.append('metadata', jsonBlob(metadata));
  form.append('file', jsonBlob(content), settingsFileName);
  const response = await request('/upload/drive/v3/files', {
    method: 'POST',
    query: {'uploadType': 'multipart'},
    body: form,
  });
  const result: gapi.client.drive.File = await response.json();
  settingsFileId = result.id;
}

async function updateSettings(content: Settings): Promise<void> {
  await request(`/upload/drive/v3/files/${settingsFileId}`, {
    method: 'PATCH',
    query: {'uploadType': 'media'},
    body: jsonBlob(content),
  });
}

export async function deleteSettings(): Promise<void> {
  if (settingsFileId === undefined) {
    await getSettingsFileId();
  }
  if (settingsFileId != null) {
    await request(`/drive/v3/files/${settingsFileId}`, {
      method: 'DELETE',
    });
    settingsFileId = null;
  }
}
