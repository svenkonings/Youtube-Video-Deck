export function hasProperty<T, Prop extends string>(obj: T, prop: Prop): obj is T & Record<Prop, unknown> {
  return obj && typeof obj === "object" && prop in obj;
}
