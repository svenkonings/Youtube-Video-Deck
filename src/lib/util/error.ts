export function errorString(e: any): string {
  if (typeof e === "string") {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  } else {
    const json = JSON.stringify(e);
    if (json.startsWith("{") || json.startsWith("[") || json.startsWith('"')) {
      return json.slice(1, -1);
    }
    return json;
  }
}
