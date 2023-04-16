const abbreviations = ["", "K", "M", "B", "T"];

export function abbreviate(number: string): string {
  for (let i = abbreviations.length - 1; i > 0; i--) {
    if (number.length > 3 * i) {
      return number.slice(0, -3 * i) + abbreviations[i];
    }
  }
  return number;
}
