export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;

export interface GapiRequestInit extends RequestInit {
  query?: URLSearchParamsInit,
}

function appendQuery(url: string, query?: URLSearchParamsInit): string {
  if (query) {
    const params = new URLSearchParams(query);
    return `${url}?${params}`;
  } else {
    return url;
  }
}

export async function request(path: string, init: GapiRequestInit = {}): Promise<Response> {
  const input = appendQuery('https://www.googleapis.com' + path, init.query);
  if (!(init.headers instanceof Headers)) {
    init.headers = new Headers(init.headers);
  }
  init.headers.append('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  const response = await fetch(input, init);
  if (!response.ok) throw response;
  return response;
}

export interface BatchRequest {
  id: string;
  method: string;
  path: string;
  headers?: HeadersInit;
  query?: URLSearchParamsInit;
  body?: any;
}

export async function batchRequest(api: string, requests: BatchRequest[]): Promise<Map<string, Response>> {
  const boundary = `boundary${Date.now()}`;
  const input = '/batch' + api;
  const response = await request(input, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/mixed; boundary=${boundary}`,
    },
    body: batchRequestsToBody(requests, boundary),
  });
  return batchResponseToMap(response);
}

function batchRequestsToBody(requests: BatchRequest[], boundary) {
  let lines = [];
  for (const request of requests) {
    if (request.body) {
      request.body = JSON.stringify(request.body);
    }
    lines.push(`--${boundary}`);

    // Multipart headers
    lines.push('Content-Type: application/http');
    lines.push(`Content-ID: ${request.id}`);
    if (request.body) {
      lines.push(`Content-Length: ${new Blob([request.body]).size}`);
    }

    // Multipart header-body separator
    lines.push('');

    // Multipart application/http body
    // Request location
    lines.push(`${request.method} ${appendQuery(request.path, request.query)}`);

    // Request headers
    if (request.headers) {
      const headers = new Headers(request.headers);
      for (const [name, value] of headers.entries()) {
        lines.push(`${name}: ${value}`);
      }
    }

    // Request body
    if (request.body) {
      // Request header-body separator
      lines.push('')
      lines.push(request.body);
    }
  }
  lines.push(`--${boundary}--`);
  return lines.join('\r\n')
}

async function batchResponseToMap(response: Response): Promise<Map<string, Response>> {
  const boundary = response.headers.get('Content-Type').match(/^multipart\/mixed; boundary=(.+)$/)[1];
  const text = await response.text();
  const parts = text.split(new RegExp(`\r\n--${boundary}(?:--)?\r\n`, 'g')).slice(1, -1);
  const responseMap = new Map<string, Response>();
  for (const part of parts) {
    const [partHeaderString, responseHead, responseBody] = part.split('\r\n\r\n', 3);

    const partHeaders = headerStringToHeaders(partHeaderString);
    const id = partHeaders.get('Content-ID').match(/^response-(.+)$/)[1];

    const [responseStats, responseHeaderString] = responseHead.split('\r\n', 2);
    const [httpVersion, responseStatusCode, responseStatusText] = responseStats.split(' ', 3);
    const responseHeaders = headerStringToHeaders(responseHeaderString);

    const response = new Response(responseBody, {
      status: parseInt(responseStatusCode, 10),
      statusText: responseStatusText,
      headers: responseHeaders,
    });
    responseMap.set(id, response);
  }
  return responseMap;
}

function headerStringToHeaders(headerString: string): Headers {
  const headers = new Headers();
  for (const header of headerString.split('\r\n')) {
    const [name, value] = header.split(': ');
    headers.append(name, value);
  }
  return headers;
}

export function jsonBlob(content: any): Blob {
  return new Blob([JSON.stringify(content)], {type: 'application/json'})
}
