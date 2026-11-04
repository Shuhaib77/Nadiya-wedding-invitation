"use client";
import { useState } from "react";

export default function Rsvp({ whatsapp, by }: { whatsapp: string; by: string }) {
  const [name, setName] = useState("");
  const [guests, setGuests] = useState(1);
  const [err, setErr] = useState(false);
  const [answer, setAnswer] = useState<null | boolean>(null);

  const send = (yes: boolean) => {
    if (!name.trim()) return setErr(true);
    setErr(false);
    setAnswer(yes);
  };
  const msg = answer
    ? `Assalamu alaikum, this is ${name.trim()}. I will attend the wedding with ${guests} guest${guests > 1 ? "s" : ""}.`
    : `Assalamu alaikum, this is ${name.trim()}. Sorry, I am unable to attend the wedding.`;

  return (
    <section className="rv rsvp">
      <div className="card">
        <div className="ctop">
          <h2 className="pf">Will you join us?</h2>
          <small style={{ marginTop: 6 }}>Kindly respond by {by}</small>
        </div>
        <div className="body">
          <label className="t" htmlFor="nm">Your full name</label>
          <input id="nm" className={`inp${err ? " err" : ""}`} value={name} onChange={(e) => setName(e.target.value)}
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
          <div className={`resp${answer === null ? "" : " show"}`}>
            <div>
              <div className="rbox">
                <h3 className="pf">{answer ? "We’re delighted!" : "We understand."}</h3>
                <p>{answer ? "Your presence will make our day even more special. Send your reply so the family can count you in." : "Thank you for letting us know. You will be in our prayers on the day."}</p>
                <a className="wa" target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`}>Send reply on WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
