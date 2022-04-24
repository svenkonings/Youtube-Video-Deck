export function errorString(e: any): string {
  if (e instanceof Error) {
    return e.message;
  } else {
    return JSON.stringify(e).slice(1, -1);
  }
}
