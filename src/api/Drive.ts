import {jsonBlob, request} from "./Gapi";

const subscriptionFileName = 'subscriptions.json';
let subscriptionFileId: string;

async function getSubscriptionFileId(): Promise<void> {
  const response = await request('/drive/v3/files', {
    method: 'GET',
    query: {
      spaces: 'appDataFolder',
      fields: 'files(id)',
      q: `name = '${subscriptionFileName}'`,
      pageSize: '1',
    },
  });
  const result: gapi.client.drive.FileList = await response.json()
  if (result.files.length > 0) {
    subscriptionFileId = result.files[0].id;
  } else {
    subscriptionFileId = null;
  }
}

export async function readSubscriptions(): Promise<any> {
  if (subscriptionFileId === undefined) {
    await getSubscriptionFileId();
  }
  if (subscriptionFileId == null) {
    return null;
  }
  const response = await request(`/drive/v3/files/${subscriptionFileId}`, {
    method: 'GET',
    query: {'alt': 'media'},
  })
  return response.json();
}

export async function writeSubscriptions(content: any): Promise<void> {
  if (subscriptionFileId === undefined) {
    await getSubscriptionFileId();
  }
  if (subscriptionFileId == null) {
    await createSubscriptions(content);
  } else {
    await updateSubscriptions(content);
  }
}

async function createSubscriptions(content: any): Promise<void> {
  const metadata = {
    name: subscriptionFileName,
    mimeType: 'application/json',
    parents: ['appDataFolder'],
  };
  const form = new FormData();
  form.append('metadata', jsonBlob(metadata));
  form.append('file', jsonBlob(content), subscriptionFileName);
  const response = await request('/upload/drive/v3/files', {
    method: 'POST',
    query: {'uploadType': 'multipart'},
    body: form,
  });
  const result: gapi.client.drive.File = await response.json();
  subscriptionFileId = result.id;
}

async function updateSubscriptions(content: any): Promise<void> {
  await request(`/upload/drive/v3/files/${subscriptionFileId}`, {
    method: 'PATCH',
    query: {'uploadType': 'media'},
    body: jsonBlob(content),
  });
}

export async function deleteSubscriptions(): Promise<void> {
  if (subscriptionFileId === undefined) {
    await getSubscriptionFileId();
  }
  if (subscriptionFileId != null) {
    await request(`/drive/v3/files/${subscriptionFileId}`, {
      method: 'DELETE',
    });
    subscriptionFileId = null;
  }
}
