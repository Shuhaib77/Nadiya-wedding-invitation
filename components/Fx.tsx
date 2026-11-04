"use client";
import { useEffect, useState } from "react";

export function Dust() {
  const [p, setP] = useState<{ l: number; dur: number; del: number }[]>([]);
  useEffect(() => {
    setP(Array.from({ length: 16 }, () => ({ l: Math.random() * 100, dur: 6 + Math.random() * 8, del: Math.random() * 8 })));
  }, []);
  return (
    <div className="dust" aria-hidden="true">
      {p.map((x, i) => <i key={i} style={{ left: `${x.l}%`, animationDuration: `${x.dur}s`, animationDelay: `${x.del}s` }} />)}
    </div>
  );
}

export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
      { threshold: 0.15 }
    );
    document.querySelectorAll(".rv").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
