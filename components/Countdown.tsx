"use client";
import { useEffect, useState } from "react";

export default function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const s = now === null ? 0 : Math.max(0, Math.floor((new Date(target).getTime() - now) / 1000));
  const units: [string, number][] = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor(s / 3600) % 24], ["Mins", Math.floor(s / 60) % 60], ["Secs", s % 60]];
  return (
    <div className="cd" aria-label="Time remaining">
      {units.map(([label, v]) => {
        const t = now === null ? "--" : String(v).padStart(2, "0");
        return <div key={label}><b key={t} className="tk">{t}</b><small>{label}</small></div>;
      })}
    </div>
  );
}
