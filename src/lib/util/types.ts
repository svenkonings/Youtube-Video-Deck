export type All<T> = {
  [P in keyof T]-?: All<NonNullable<T[P]>>;
};
