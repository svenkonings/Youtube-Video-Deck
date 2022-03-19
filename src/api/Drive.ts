const subscriptionFileName = 'subscriptions.json';
let subscriptionFileId: string;

async function getSubscriptionFileId(): Promise<void> {
  const response = await fetch('https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id)',
    q: `name = '${subscriptionFileName}'`,
    pageSize: '1',
  }), {
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token},
  });
  const result = await response.json()
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
  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${subscriptionFileId}?alt=media`, {
    method: 'GET',
    headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token},
  })
  return response.json();
}

export async function writeSubscriptions(content: any): Promise<any> {
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
  form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
  form.append('file', new Blob([JSON.stringify(content)], {type: 'application/json'}));
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token},
    body: form,
  });
  const result = await response.json();
  subscriptionFileId = result.id;
}

async function updateSubscriptions(content: any) {
  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${subscriptionFileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify(content),
  });
}

export async function deleteSubscriptions() {
  if (subscriptionFileId === undefined) {
    await getSubscriptionFileId();
  }
  if (subscriptionFileId != null) {
    await fetch(`https://www.googleapis.com/drive/v3/files/${subscriptionFileId}`, {
      method: 'DELETE',
      headers: {'Authorization': 'Bearer ' + gapi.auth.getToken().access_token,},
    });
    subscriptionFileId = null;
  }
}
