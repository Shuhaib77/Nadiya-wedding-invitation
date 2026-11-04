import { invitation as c } from "@/invitation.config";
import Countdown from "@/components/Countdown";
import Rsvp from "@/components/Rsvp";
import { Dust, Reveal } from "@/components/Fx";
import ThemeSwitch from "@/components/ThemeSwitch";

const d = (n: number) => ({ "--d": n }) as React.CSSProperties;

function Letters({ text, from }: { text: string; from: number }) {
  return <>{[...text].map((ch, i) => <span key={i} className="l" style={{ "--i": from + i } as React.CSSProperties}>{ch}</span>)}</>;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const sp = await searchParams;
  const key = sp.theme && c.themes[sp.theme] ? sp.theme : c.theme;
  const rootCss = `:root{${Object.entries(c.themes[key]).map(([k, v]) => `--${k}:${v}`).join(";")}}`;

  const e = c.event;
  const start = new Date(e.start);
  const end = new Date(start.getTime() + e.durationHours * 3600_000);
  const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: e.timeZone, ...o }).format(start);
  const day = f({ day: "numeric" }), month = f({ month: "long" }), year = f({ year: "numeric" }), weekday = f({ weekday: "long" });
  const time = f({ hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  const ring = `${day} ${month.toUpperCase()} ${year} • ${weekday.toUpperCase()} ${time} • `;
  const stamp = (x: Date) => x.toISOString().replace(/[-:]|\.\d{3}/g, "");
  const calendar = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${c.bride} & ${c.groom} Wedding`)}&dates=${stamp(start)}/${stamp(end)}&location=${encodeURIComponent(`${e.venue}, ${e.place}`)}`;

  return (
    <>
    <style dangerouslySetInnerHTML={{ __html: rootCss }} />
    <div className="page">
      <header className="banner">
        <Dust />
        <div className="arc" aria-hidden="true" />
        <div className="bx">
          <p className="bs ar" dir="rtl" lang="ar" style={d(0)}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
          <svg className="ring" viewBox="0 0 200 200" role="img" aria-label={`${day} ${month} ${year}`} style={d(1)}>
            <defs><path id="rp" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0" /></defs>
            <g className="spin"><text><textPath href="#rp" textLength={498} lengthAdjust="spacing">{ring}</textPath></text></g>
            <circle cx="100" cy="100" r="62" fill="none" stroke="var(--gold)" strokeWidth=".8" />
            <text className="mono" x="100" y="116" textAnchor="middle">{c.monogram}</text>
          </svg>
          <p className="it" style={d(2)}>{c.intro}</p>
          <h1 className="names" aria-label={`${c.bride} and ${c.groom}`} style={d(3)}>
            <span className="ln"><Letters text={c.bride} from={0} /></span>
            <span className="amp gv">&amp;</span>
            <span className="ln"><Letters text={c.groom} from={c.bride.length} /></span>
          </h1>
          <p className="par" style={d(4)}>{c.groomLine}</p>
          <div className="dl" style={d(5)}><i /><span>{weekday}, {day} {month} {year}</span><i /></div>
        </div>
        <div className="sc" aria-hidden="true"><i /></div>
      </header>

      <section className="rv">
        <div className="sh"><b>The Families</b><i /></div>
        <div className="card">
          <div className="ctop"><small>Together with their families</small><h3 className="pf">{c.bride} weds {c.groom}</h3></div>
          <div className="fam">
            <div><h4 className="pf">{c.bride}</h4><p>{c.brideParents.label}<strong>{c.brideParents.names[0]}</strong>&amp; {c.brideParents.names[1]}</p></div>
            <hr />
            <div><h4 className="pf">{c.groom}</h4><p>{c.groomParents.label}<strong>{c.groomParents.names[0]}</strong>&amp; {c.groomParents.names[1]}</p></div>
          </div>
          <p className="foot">{c.home}</p>
        </div>
      </section>

      <section className="rv">
        <div className="sh"><b>Counting down</b><i /></div>
        <div className="card"><Countdown target={e.start} /></div>
      </section>

      <section className="rv">
        <div className="sh"><b>Event details</b><i /></div>
        <div className="card">
          <div className="row"><small>Date</small><div><h4>{weekday}, {day} {month} {year}</h4>{e.hijri && <p>{e.hijri}</p>}</div></div>
          <div className="row"><small>Time</small><div><h4>{time} onwards</h4><p>{e.note}</p></div></div>
          <div className="row"><small>Venue</small><div><h4>{e.venue}</h4><p>{e.place}</p></div></div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18, flexWrap: "wrap" }}>
          <a className="wa" href={e.mapUrl} target="_blank" rel="noreferrer">Open map</a>
          <a className="wa" href={calendar} target="_blank" rel="noreferrer" style={{ background: "transparent", color: "var(--deep)", border: "1px solid var(--deep)" }}>Add to calendar</a>
        </div>
      </section>

      <p className="orn gv">With love &amp; prayers</p>

      <Rsvp whatsapp={c.whatsapp} by={c.rsvpBy} />

      <footer>
        <p className="gv">With Love</p>
        <h5 className="pf">{c.hosts}</h5>
        <hr />
        <p>{c.regards}</p>
      </footer>
      <Reveal />
    </div>
    {c.showSwitcher && <ThemeSwitch themes={c.themes} initial={key} />}
    </>
  );
}
