export const NOT_MODIFIED = 'Not Modified';

export type URLSearchParamsInit = string[][] | Record<string, string> | string | URLSearchParams;

export interface GapiRequestInit extends RequestInit {
  query?: URLSearchParamsInit,
  etag?: string,
}

function appendQuery(url: string, query?: URLSearchParamsInit): string {
  if (query) {
    const params = new URLSearchParams(query);
    return `${url}?${params}`;
  } else {
    return url;
  }
}

export function toRequest(path: string, init: GapiRequestInit = {}): Request {
  const input = appendQuery('https://www.googleapis.com' + path, init.query);
  init.headers = new Headers(init.headers);
  init.headers.append('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
  if (init.etag) {
    init.headers.append('If-None-Match', init.etag);
  }
  return new Request(input, init);
}

export async function request(input: RequestInfo, init: GapiRequestInit = {}): Promise<Response> {
  if (typeof input === 'string') {
    input = toRequest(input, init);
  }
  const response = await fetch(input);
  if (response.status === 304) throw NOT_MODIFIED;
  if (!response.ok) throw response;
  return response;
}

export async function batchRequest(api: string, requests: Map<string, Request>): Promise<Map<string, Response>> {
  const boundary = `boundary${Date.now()}`;
  const input = '/batch' + api;
  const response = await request(input, {
    method: 'POST',
    headers: {'Content-Type': `multipart/mixed; boundary=${boundary}`},
    body: await batchRequestsToBody(requests, boundary),
  });
  return batchResponseToMap(response);
}

async function batchRequestsToBody(requests: Map<string, Request>, boundary: string): Promise<string> {
  let lines = [];
  for (const [id, request] of requests) {
    lines.push(`--${boundary}`);

    // Multipart headers
    lines.push('Content-Type: application/http');
    lines.push(`Content-ID: ${id}`);
    if (request.bodyUsed) {
      lines.push(`Content-Length: ${(await request.blob()).size}`);
    }

    // Multipart header-body separator
    lines.push('');

    // Multipart application/http body
    // Request location
    lines.push(`${request.method} ${request.url}`);

    // Request headers
    if (request.headers) {
      for (const [name, value] of request.headers.entries()) {
        lines.push(`${name}: ${value}`);
      }
    }

    // Request body
    if (request.bodyUsed) {
      // Request header-body separator
      lines.push('')
      lines.push(await request.text());
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
    const [partHeaderString, responseHead, responseBodyString] = part.split('\r\n\r\n', 3);

    const partHeaders = headerStringToHeaders(partHeaderString);
    const id = partHeaders.get('Content-ID').match(/^response-(.+)$/)[1];

    const [responseStats, responseHeaderString] = responseHead.split('\r\n', 2);
    const [httpVersion, responseStatusCode, responseStatusText] = responseStats.split(' ', 3);
    const responseHeaders = headerStringToHeaders(responseHeaderString);

    const responseBody = responseBodyString.length === 0 ? null : responseBodyString

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
