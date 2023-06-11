import { DateTime, Duration } from "luxon";

export function formatDuration(isoDuration: string): string {
  const duration = Duration.fromISO(isoDuration);
  if (duration.days > 0) {
    return duration.toFormat("d:hh:mm:ss");
  } else if (duration.hours > 0) {
    return duration.toFormat("h:mm:ss");
  } else {
    return duration.toFormat("m:ss");
  }
}

export function relativeDate(isoDate: string): string {
  return DateTime.fromISO(isoDate).toRelative({ locale: "en" }) as string;
}
