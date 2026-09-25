"use client";

import { useState, useEffect } from "react";

export default function LocalTime() {
  // Identical server and first-client markup avoids hydration mismatches.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <time className="font-mono text-xs text-[var(--muted)]" dateTime={now?.toISOString()} aria-label="Current New York time" style={{fontVariantNumeric:"tabular-nums"}}>
      {now ? new Intl.DateTimeFormat("en-GB", {timeZone:"America/New_York", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false}).format(now) : "--:--:--"}
    </time>
  );
}
