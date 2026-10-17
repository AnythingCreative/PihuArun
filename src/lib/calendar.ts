import { wedding, fullPlace, hasCeremonyTime, type WeddingConfig } from "../config/wedding";

/** Escapes TEXT values per RFC 5545 §3.3.11. */
function esc(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** Folds content lines longer than 75 octets (RFC 5545 §3.1). */
function fold(line: string) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += ch;
    size += n;
  }
  out.push(current);
  return out.join("\r\n ");
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const dateOnly = (iso: string) => iso.replace(/-/g, "");

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** Builds the event. Without a confirmed time it is an all-day event — never a guessed time. */
export function buildIcs(c: WeddingConfig = wedding, now = new Date()): string {
  const venue = [c.venueName, c.venueAddress].filter(Boolean).join(", ");
  const location = venue || fullPlace();
  const notes: string[] = [`With love and blessings, join ${c.groom} and ${c.bride} as they begin their new journey together.`];
  if (!hasCeremonyTime()) notes.push("Ceremony time to be announced.");
  if (!venue) notes.push("Venue details to follow.");
  if (c.siteUrl) notes.push(c.siteUrl);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${esc(c.groom)} & ${esc(c.bride)}//Wedding Invitation//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${c.groom.toLowerCase()}-${c.bride.toLowerCase()}-${dateOnly(c.date)}@wedding-invitation`,
    `DTSTAMP:${utcStamp(now)}`,
  ];

  if (hasCeremonyTime()) {
    const start = new Date(`${c.date}T${c.ceremonyStart}:00${c.utcOffset}`);
    lines.push(`DTSTART:${utcStamp(start)}`);
    if (/^\d{2}:\d{2}$/.test(c.ceremonyEnd)) {
      let end = new Date(`${c.date}T${c.ceremonyEnd}:00${c.utcOffset}`);
      // an end time "earlier" than the start means the ceremony runs past midnight
      if (end <= start) end = new Date(end.getTime() + 86_400_000);
      lines.push(`DTEND:${utcStamp(end)}`);
    }
  } else {
    lines.push(`DTSTART;VALUE=DATE:${dateOnly(c.date)}`, `DTEND;VALUE=DATE:${dateOnly(addDays(c.date, 1))}`);
  }

  lines.push(
    `SUMMARY:${esc(`Wedding of ${c.groom} & ${c.bride}`)}`,
    `LOCATION:${esc(location)}`,
    `DESCRIPTION:${esc(notes.join("\n"))}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  );
  return lines.map(fold).join("\r\n") + "\r\n";
}

export function downloadIcs() {
  const blob = new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${wedding.groom}-${wedding.bride}-wedding.ics`.toLowerCase();
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
