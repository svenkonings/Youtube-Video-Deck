export function objectToErrorMessage(e: unknown): string {
  if (typeof e === "string") {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  } else {
    return JSON.stringify(e, null, 2);
  }
}

export async function responseToErrorMessage(response: Response): Promise<string> {
  try {
    return `Response failed with status ${response.status} and message: ${await response.text()}`;
  } catch (e) {
    return `Response failed with status ${response.status}. Couldn't load body: ${objectToErrorMessage(e)}`;
  }
}
