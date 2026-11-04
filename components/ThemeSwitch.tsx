"use client";
import { useState } from "react";

export default function ThemeSwitch({ themes, initial }: { themes: Record<string, Record<string, string>>; initial: string }) {
  const [active, setActive] = useState(initial);
  const pick = (k: string) => {
    for (const [name, v] of Object.entries(themes[k])) document.documentElement.style.setProperty(`--${name}`, v);
    setActive(k);
  };
  return (
    <div className="sw" role="group" aria-label="Colour theme">
      {Object.entries(themes).map(([k, t]) => (
        <button key={k} type="button" aria-label={k} aria-pressed={active === k} style={{ background: t.mid }} onClick={() => pick(k)} />
      ))}
    </div>
  );
}
