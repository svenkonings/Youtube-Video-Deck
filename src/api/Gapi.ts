interface GapiRequestInit extends RequestInit {
  query?: string[][] | Record<string, string> | string | URLSearchParams
}

export function request(input: string, init: GapiRequestInit = {}): Promise<Response> {
  input = 'https://www.googleapis.com/' + input;
  if (!(init.headers instanceof Headers)) {
    init.headers = new Headers(init.headers);
  }
  init.headers.append('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  if (init.query) {
    init.query = new URLSearchParams(init.query);
    input += `?${init.query}`;
  }
  return fetch(input, init).then(res => {
    if (!res.ok) throw res;
    return res;
  });
}

export function jsonBlob(content: any): Blob {
  return new Blob([JSON.stringify(content)], {type: 'application/json'})
}
