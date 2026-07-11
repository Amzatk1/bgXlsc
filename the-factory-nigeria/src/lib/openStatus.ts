// Honest open/closed indicator computed against the stated hours
// (9am–5pm, Mon–Fri) in the factory's real timezone (Africa/Lagos).
// This reflects the published hours — visits are still by appointment.

export type OpenStatus = { open: boolean; label: string };

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Lagos",
      weekday: "short",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const weekday = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hourStr = parts.find((p) => p.type === "hour")?.value ?? "0";
    const hour = parseInt(hourStr, 10) % 24;

    const isWeekday = ["Mon", "Tue", "Wed", "Thu", "Fri"].includes(weekday);
    const open = isWeekday && hour >= 9 && hour < 17;

    return {
      open,
      label: open ? "Open now · Lagos" : "Closed · Mon–Fri 9–5",
    };
  } catch {
    return { open: false, label: "Mon–Fri · 9–5" };
  }
}
