"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { invitation } from "@/invitation.config";

type Rsvp = {
  id: string;
  name: string;
  attending: boolean;
  guests: number;
  timestamp: string;
};

type Filter = "all" | "attending" | "declined";
type View = "overview" | "responses";

const PALETTE = [
  ["#eef2ff", "#4f46e5"],
  ["#ecfdf5", "#059669"],
  ["#fff7ed", "#ea580c"],
  ["#fdf2f8", "#db2777"],
  ["#eff6ff", "#2563eb"],
  ["#fefce8", "#ca8a04"],
];

function avatarColor(name: string) {
  const sum = [...name].reduce((s, c) => s + c.charCodeAt(0), 0);
  return PALETTE[sum % PALETTE.length];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => (w[0] ? w[0].toUpperCase() : ""))
    .join("");
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPanel() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("overview");

  useEffect(() => {
    const apply = () => {
      const hash = window.location.hash.replace("#", "");
      const param = new URLSearchParams(window.location.search).get("view");
      setView(param === "responses" || hash === "responses" ? "responses" : "overview");
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch("/api/rsvp-admin", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch RSVPs");
        return res.json();
      })
      .then((data) => {
        if (data.success) setRsvps(data.data);
        else throw new Error(data.error || "Unknown error");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rsvps.filter((r) => {
      const byStatus =
        filter === "all" ? true : filter === "attending" ? r.attending : !r.attending;
      const bySearch = q === "" || r.name.toLowerCase().includes(q);
      return byStatus && bySearch;
    });
  }, [rsvps, filter, search]);

  const total = rsvps.length;
  const attending = rsvps.filter((r) => r.attending).length;
  const declined = total - attending;
  const headcount = rsvps
    .filter((r) => r.attending)
    .reduce((s, r) => s + (r.guests || 1), 0);

  const go = (v: View) => {
    setView(v);
    window.history.replaceState(null, "", v === "responses" ? "#responses" : "#overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const exportCsv = () => {
    const source = view === "responses" ? filtered : rsvps;
    const rows = [
      ["Name", "Status", "Guests", "Received"],
      ...source.map((r) => [
        r.name,
        r.attending ? "Attending" : "Declined",
        String(r.guests || 1),
        fmtDate(r.timestamp),
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rsvp-responses.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSearch = (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value);

  const weddingDate = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: invitation.event.timeZone,
  }).format(new Date(invitation.event.start));

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: total },
    { key: "attending", label: "Attending", count: attending },
    { key: "declined", label: "Declined", count: declined },
  ];

  const renderRows = (rows: Rsvp[]) => (
    <div className="dsh-table-wrap">
      <table className="dsh-table">
        <thead>
          <tr>
            <th>Guest</th>
            <th>Status</th>
            <th>Guests</th>
            <th>Received</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const [bg, fg] = avatarColor(r.name);
            return (
              <tr key={r.id}>
                <td>
                  <div className="who">
                    <span className="avatar" style={{ background: bg, color: fg }}>
                      {initials(r.name)}
                    </span>
                    <div>
                      <b>{r.name}</b>
                      <span>RSVP response</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={r.attending ? "badge yes" : "badge no"}>
                    <i className="dot" />
                    {r.attending ? "Attending" : "Declined"}
                  </span>
                </td>
                <td className="guests-cell">{r.attending ? `${r.guests || 1}` : "—"}</td>
                <td className="date-cell" title={new Date(r.timestamp).toLocaleString()}>
                  {fmtDate(r.timestamp)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="dsh">
      <style>{css}</style>

      <aside className="dsh-side">
        <div className="dsh-brand">
          <div className="dsh-logo">{invitation.monogram}</div>
          <div>
            <b>
              {invitation.bride} &amp; {invitation.groom.split(" ")[0]}
            </b>
            <small>Wedding RSVP</small>
          </div>
        </div>

        <nav className="dsh-nav">
          <p className="label">Menu</p>
          <button
            type="button"
            className={`nav-btn${view === "overview" ? " on" : ""}`}
            onClick={() => go("overview")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Overview
          </button>
          <button
            type="button"
            className={`nav-btn${view === "responses" ? " on" : ""}`}
            onClick={() => go("responses")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-6l-2 3h-4l-2-3H2" />
              <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
            </svg>
            Responses
          </button>
          <button type="button" className="nav-btn" onClick={exportCsv}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
        </nav>

        <div className="dsh-sidecard">
          <div className="sidecard-ico">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <p className="sidecard-title">Wedding day</p>
          <p className="sidecard-main">{weddingDate}</p>
          <p className="sidecard-sub">{invitation.event.venue}</p>
        </div>
      </aside>

      <div className="dsh-main">
        <header className="dsh-top">
          <div>
            <p className="dsh-title">{view === "overview" ? "RSVP Overview" : "Responses"}</p>
            <p className="dsh-sub">
              {view === "overview"
                ? "Guest responses for the wedding celebration"
                : "Every RSVP received, newest first"}
            </p>
          </div>
          <div className="dsh-top-actions">
            <button type="button" className="dsh-btn ghost" onClick={load}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Refresh
            </button>
            <button type="button" className="dsh-btn primary" onClick={exportCsv}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          </div>
        </header>

        <div className="dsh-mnav">
          <button
            type="button"
            className={view === "overview" ? "on" : ""}
            onClick={() => go("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={view === "responses" ? "on" : ""}
            onClick={() => go("responses")}
          >
            Responses
          </button>
        </div>

        {loading ? (
          <div className="dsh-state">
            <div className="dsh-spinner" />
            <p>Loading responses…</p>
          </div>
        ) : error ? (
          <div className="dsh-state">
            <div className="state-ico err">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="state-title">Something went wrong</p>
            <p className="state-sub">{error}</p>
            <button type="button" className="dsh-btn primary" onClick={load}>
              Try again
            </button>
          </div>
        ) : view === "overview" ? (
          <div className="dsh-content">
            <div className="dsh-kpis">
              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-ico indigo">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="kpi-tag indigo">
                    {total > 0 ? Math.round((attending / total) * 100) : 0}% yes
                  </span>
                </div>
                <p className="kpi-num">{total}</p>
                <p className="kpi-lbl">Total responses</p>
              </div>

              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-ico green">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                </div>
                <p className="kpi-num">{attending}</p>
                <p className="kpi-lbl">Attending</p>
              </div>

              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-ico rose">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  </div>
                </div>
                <p className="kpi-num">{declined}</p>
                <p className="kpi-lbl">Declined</p>
              </div>

              <div className="kpi">
                <div className="kpi-top">
                  <div className="kpi-ico amber">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="19" y1="8" x2="19" y2="14" />
                      <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                  </div>
                </div>
                <p className="kpi-num">{headcount}</p>
                <p className="kpi-lbl">Expected guests</p>
              </div>
            </div>

            <div className="dsh-panel">
              <div className="panel-titlebar">
                <div>
                  <p className="panel-title">Latest responses</p>
                  <p className="panel-sub">The 5 most recent RSVPs</p>
                </div>
                <button type="button" className="link-btn" onClick={() => go("responses")}>
                  View all responses
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
              {rsvps.length === 0 ? (
                <div className="dsh-empty">
                  <div className="state-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                    </svg>
                  </div>
                  <p className="state-title">No responses yet</p>
                  <p className="state-sub">Responses will appear here as guests RSVP.</p>
                </div>
              ) : (
                renderRows(rsvps.slice(0, 5))
              )}
            </div>
          </div>
        ) : (
          <div className="dsh-content">
            <div className="dsh-panel">
              <div className="dsh-panel-head">
                <div className="tabs">
                  {tabs.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      className={filter === t.key ? "on" : ""}
                      onClick={() => setFilter(t.key)}
                    >
                      {t.label}
                      <span className="tab-count">{t.count}</span>
                    </button>
                  ))}
                </div>
                <div className="search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by guest name…"
                    value={search}
                    onChange={onSearch}
                  />
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="dsh-empty">
                  <div className="state-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <p className="state-title">No responses found</p>
                  <p className="state-sub">
                    {total === 0
                      ? "Responses will appear here as guests RSVP."
                      : "Try a different filter or search term."}
                  </p>
                </div>
              ) : (
                renderRows(filtered)
              )}

              <div className="dsh-panel-foot">
                <span>
                  Showing <b>{filtered.length}</b> of <b>{total}</b> responses
                </span>
                <span className="foot-sort">Sorted by newest</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const css = `
html,body{margin:0;padding:0;background:#f4f5f7}
.dsh{
  --bg:#f4f5f7;--card:#ffffff;--line:#e6e8ee;--ink:#0f172a;--muted:#64748b;--faint:#94a3b8;
  --accent:#4f46e5;--green:#059669;--green-bg:#ecfdf5;--red:#e11d48;--red-bg:#fff1f2;--amber:#d97706;--amber-bg:#fffbeb;
  min-height:100vh;display:grid;grid-template-columns:250px 1fr;background:var(--bg);color:var(--ink);
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size:14px;line-height:1.5;text-align:left;
}
.dsh *{box-sizing:border-box}
.dsh h1,.dsh h2,.dsh p{margin:0}
.dsh svg{width:18px;height:18px}

.dsh-side{background:#0e1526;color:#cbd5e1;padding:22px 16px;display:flex;flex-direction:column;gap:26px;position:sticky;top:0;height:100vh}
.dsh-brand{display:flex;align-items:center;gap:11px;padding:0 8px}
.dsh-logo{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:grid;place-items:center;color:#fff;font-weight:700;font-size:14px;letter-spacing:.03em;flex:none}
.dsh-brand b{color:#fff;font-size:14.5px;font-weight:600;display:block;line-height:1.3}
.dsh-brand small{display:block;color:#64748b;font-size:11.5px}

.dsh-nav{display:flex;flex-direction:column;gap:3px}
.dsh-nav .label{font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;color:#475569;padding:0 12px;margin-bottom:8px;font-weight:600}
.dsh-nav a,.dsh-nav .nav-btn{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:10px;color:#94a3b8;font-size:13.5px;text-decoration:none;font-weight:500;background:transparent;border:0;cursor:pointer;font-family:inherit;width:100%;text-align:left;transition:background .15s,color .15s}
.dsh-nav .nav-btn svg,.dsh-nav a svg{width:17px;height:17px;flex:none}
.dsh-nav a:hover,.dsh-nav .nav-btn:hover{background:rgba(255,255,255,.05);color:#e2e8f0}
.dsh-nav a.on,.dsh-nav .nav-btn.on{background:rgba(99,102,241,.18);color:#c7d2fe}

.dsh-sidecard{margin-top:auto;background:#151f36;border:1px solid rgba(255,255,255,.06);border-radius:14px;padding:16px}
.sidecard-ico{width:32px;height:32px;border-radius:8px;background:rgba(99,102,241,.18);color:#a5b4fc;display:grid;place-items:center;margin-bottom:10px}
.sidecard-ico svg{width:16px;height:16px}
.sidecard-title{font-size:10.5px;letter-spacing:.14em;text-transform:uppercase;color:#64748b;font-weight:600}
.sidecard-main{color:#fff;font-weight:600;font-size:14px;margin-top:3px}
.sidecard-sub{color:#64748b;font-size:12px;margin-top:2px}

.dsh-main{min-width:0;display:flex;flex-direction:column}
.dsh-top{display:flex;align-items:center;gap:16px;background:#fff;border-bottom:1px solid var(--line);padding:16px 28px;position:sticky;top:0;z-index:5}
.dsh-title{font-size:19px;font-weight:650;letter-spacing:-.01em}
.dsh-sub{font-size:12.5px;color:var(--muted);margin-top:2px}
.dsh-top-actions{margin-left:auto;display:flex;gap:10px;align-items:center}
.dsh-btn{display:inline-flex;align-items:center;gap:8px;padding:9px 14px;border-radius:10px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,box-shadow .15s}
.dsh-btn svg{width:15px;height:15px}
.dsh-btn.ghost{background:#fff;border:1px solid var(--line);color:var(--ink)}
.dsh-btn.ghost:hover{background:#f8fafc}
.dsh-btn.primary{background:var(--accent);border:1px solid var(--accent);color:#fff}
.dsh-btn.primary:hover{background:#4338ca;border-color:#4338ca}

.dsh-content{padding:26px 28px 44px;display:flex;flex-direction:column;gap:22px;max-width:1280px;width:100%}

.dsh-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.kpi{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:18px;box-shadow:0 1px 2px rgba(16,24,40,.04)}
.kpi-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.kpi-ico{width:38px;height:38px;border-radius:10px;display:grid;place-items:center}
.kpi-ico svg{width:19px;height:19px}
.kpi-ico.indigo{background:#eef2ff;color:#4f46e5}
.kpi-ico.green{background:var(--green-bg);color:var(--green)}
.kpi-ico.rose{background:var(--red-bg);color:var(--red)}
.kpi-ico.amber{background:var(--amber-bg);color:var(--amber)}
.kpi-tag{font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px}
.kpi-tag.indigo{background:#eef2ff;color:#4f46e5}
.kpi-num{font-size:29px;font-weight:700;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.kpi-lbl{font-size:12.5px;color:var(--muted);margin-top:6px}

.dsh-panel{background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden}
.dsh-panel-head{display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.panel-titlebar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--line);flex-wrap:wrap}
.panel-title{font-size:14px;font-weight:600}
.panel-sub{font-size:12px;color:var(--muted);margin-top:1px}
.link-btn{display:inline-flex;align-items:center;gap:6px;background:transparent;border:0;color:var(--accent);font:inherit;font-size:12.5px;font-weight:600;cursor:pointer;padding:7px 10px;border-radius:8px;transition:background .15s}
.link-btn:hover{background:#eef2ff}
.link-btn svg{width:14px;height:14px}
.tabs{display:flex;gap:4px;background:#f1f3f7;padding:4px;border-radius:10px}
.tabs button{border:0;background:transparent;padding:7px 13px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600;color:var(--muted);cursor:pointer;display:inline-flex;align-items:center;gap:6px;transition:background .15s,color .15s}
.tabs button:hover{color:var(--ink)}
.tabs button.on{background:#fff;color:var(--ink);box-shadow:0 1px 2px rgba(16,24,40,.08)}
.tab-count{font-size:11px;font-weight:600;background:#e2e8f0;color:#475569;padding:1px 7px;border-radius:999px}
.tabs button.on .tab-count{background:#eef2ff;color:#4f46e5}
.search{position:relative;margin-left:auto}
.search svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--faint);width:15px;height:15px}
.search input{width:250px;padding:9px 12px 9px 34px;border:1px solid var(--line);border-radius:10px;font:inherit;font-size:13px;outline:none;background:#fff;color:var(--ink);transition:border-color .15s,box-shadow .15s}
.search input::placeholder{color:var(--faint)}
.search input:focus{border-color:#a5b4fc;box-shadow:0 0 0 3px rgba(99,102,241,.12)}

.dsh-table-wrap{overflow-x:auto}
.dsh-table{width:100%;border-collapse:collapse;min-width:560px}
.dsh-table th{font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600;text-align:left;padding:11px 20px;background:#fafbfc;border-bottom:1px solid var(--line);white-space:nowrap}
.dsh-table td{padding:13px 20px;border-bottom:1px solid #f1f3f7;font-size:13.5px;vertical-align:middle}
.dsh-table tbody tr:last-child td{border-bottom:0}
.dsh-table tbody tr{transition:background .12s}
.dsh-table tbody tr:hover{background:#fafbff}
.who{display:flex;align-items:center;gap:12px}
.avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:12.5px;font-weight:700;flex:none}
.who b{display:block;font-weight:600;font-size:13.5px;color:var(--ink);line-height:1.3}
.who span{font-size:12px;color:var(--faint)}
.badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap}
.badge .dot{width:6px;height:6px;border-radius:50%;font-style:normal}
.badge.yes{background:var(--green-bg);color:#047857}
.badge.yes .dot{background:#10b981}
.badge.no{background:var(--red-bg);color:#be123c}
.badge.no .dot{background:#f43f5e}
.guests-cell{color:var(--ink);font-weight:500;font-variant-numeric:tabular-nums}
.date-cell{color:var(--muted);white-space:nowrap}

.dsh-panel-foot{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted);background:#fcfcfd;flex-wrap:wrap;gap:6px}
.dsh-panel-foot b{color:var(--ink);font-weight:600}
.foot-sort{color:var(--faint)}

.dsh-state{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:80px 24px;text-align:center}
.dsh-spinner{width:34px;height:34px;border-radius:50%;border:3px solid #e2e8f0;border-top-color:var(--accent);animation:dsh-spin .8s linear infinite}
@keyframes dsh-spin{to{transform:rotate(360deg)}}
.state-ico{width:52px;height:52px;border-radius:14px;background:#f1f3f7;color:var(--faint);display:grid;place-items:center;margin:0 auto 2px}
.state-ico svg{width:24px;height:24px}
.state-ico.err{background:var(--red-bg);color:var(--red)}
.dsh-state .dsh-btn{margin-top:8px}
.state-title{font-size:15px;font-weight:600;color:var(--ink)}
.state-sub{font-size:13px;color:var(--muted);max-width:40ch}
.dsh-empty{padding:64px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:6px}

.dsh-mnav{display:none}
@media(max-width:1024px){
  .dsh{grid-template-columns:1fr}
  .dsh-side{display:none}
  .dsh-kpis{grid-template-columns:repeat(2,1fr)}
  .dsh-mnav{display:flex;gap:6px;padding:10px 14px;background:#fff;border-bottom:1px solid var(--line)}
  .dsh-mnav button{border:1px solid var(--line);background:#fff;color:var(--muted);font:inherit;font-size:13px;font-weight:600;padding:8px 14px;border-radius:9px;cursor:pointer}
  .dsh-mnav button.on{background:#eef2ff;border-color:#c7d2fe;color:var(--accent)}
}
@media(max-width:640px){
  .dsh-top{padding:14px 16px;flex-wrap:wrap}
  .dsh-top-actions{margin-left:0;width:100%}
  .dsh-content{padding:18px 14px 34px}
  .dsh-kpis{grid-template-columns:repeat(2,1fr);gap:10px}
  .kpi{padding:14px}
  .kpi-num{font-size:24px}
  .dsh-panel-head{padding:12px}
  .search{margin-left:0;width:100%}
  .search input{width:100%}
  .dsh-table th,.dsh-table td{padding:11px 14px}
  .dsh-table th:nth-child(3),.dsh-table td:nth-child(3){display:none}
}
@media(prefers-reduced-motion:reduce){
  .dsh *{transition:none!important;animation-duration:.01ms!important}
  .dsh-spinner{animation:none}
}
`;
