"use client";
import { useEffect, useRef, useState } from "react";

type Props = { whatsapp: string; by: string; date: string; time: string; venue: string };

export default function Rsvp({ whatsapp, by, date, time, venue }: Props) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [err, setErr] = useState(false);
  const [answer, setAnswer] = useState<null | boolean>(null); // true = accept, false = decline
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = answer !== null;
  const yes = answer === true;

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setAnswer(null); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const send = async (ok: boolean) => {
    if (!name.trim()) { setErr(true); inputRef.current?.focus(); return; }
    setErr(false);
    setAnswer(ok);
    try {
      await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attending: ok, guests }),
      });
    } catch (e) {
      console.error("RSVP submit error:", e);
    }
  };

  const msg = yes
    ? `Assalamu alaikum, this is ${name.trim()}. I will attend the wedding with ${guests} guest${guests > 1 ? "s" : ""}.`
    : `Assalamu alaikum, this is ${name.trim()}. Sorry, I am unable to attend the wedding.`;

  return (
    <>
      <section className="rv rsvp">
        <div className="card">
          <div className="ctop">
            <h2 className="pf">Will you join us?</h2>
            <small style={{ marginTop: 6 }}>Kindly respond by {by}</small>
          </div>
          <div className="body">
            <label className="t" htmlFor="nm">Your full name</label>
            <input ref={inputRef} id="nm" className={`inp${err ? " err" : ""}`} value={name} onChange={(e) => setName(e.target.value)}
              placeholder={err ? "Please enter your name first" : "Enter your name"} autoComplete="name" />
            <div className="g">
              <span>Guests attending</span>
              <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
              <output>{guests}</output>
              <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(15, g + 1))}>+</button>
            </div>
            <div className="ch">
              <button type="button" className="yes" onClick={() => send(true)}>Joyfully accept</button>
              <button type="button" className="no" onClick={() => send(false)}>Regretfully decline</button>
            </div>
          </div>
        </div>
      </section>

      {open && (
        <div className="mo" onClick={() => setAnswer(null)}>
          <div className="mb" role="dialog" aria-modal="true" aria-labelledby="mtitle" onClick={(e) => e.stopPropagation()}>
            <div className={`mt${yes ? "" : " no"}`}>
              <div className="mi" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {yes ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />}
                </svg>
              </div>
              <h3 id="mtitle">{yes ? "We’re delighted!" : "We understand."}</h3>
              <p>{yes ? "Your presence will make our day even more special." : "Thank you for letting us know. You will be in our prayers on the day."}</p>
            </div>
            <div className="mr">
              <div><span>Guest name</span><b>{name.trim()}</b></div>
              <div><span>Attending</span><b><i className={`ba ${yes ? "y" : "n"}`}>{yes ? "Attending" : "Not attending"}</i></b></div>
              {yes && <div><span>Guests</span><b>{guests}</b></div>}
              <div><span>Date</span><b>{date}</b></div>
              <div><span>Time</span><b>{time}</b></div>
              <div><span>Venue</span><b>{venue}</b></div>
            </div>
            <div className="mf">
              <a className="wa" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`}>Send reply on WhatsApp</a>
              <button ref={closeRef} type="button" className="wa o" onClick={() => setAnswer(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}