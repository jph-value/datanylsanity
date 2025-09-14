"use client";

import { useEffect, useMemo, useRef, useState } from "react";
function DiscoLayer({ onStart, onEnd, muted }: { onStart: () => void, onEnd: () => void, muted: boolean }) {
  // simple confetti + beep
  useEffect(() => {
    onStart();
    const overlay = document.createElement('div');
    overlay.className = 'disco-strobe';
    document.body.appendChild(overlay);
    try {
      if (!muted) {
        const clips = ["/music/datanlybgm/discomode.mp3", "/music/datanlybgm/technomode2.mp3"];
        const src = clips[Math.floor(Math.random() * clips.length)];
        const audio = new Audio(src);
        audio.volume = 0.6;
        audio.addEventListener('loadedmetadata', () => {
          const start = Math.random() * Math.max(0, (audio.duration || 60) - 12);
          audio.currentTime = start;
          audio.play().catch(() => {});
        });
        audio.play().catch(() => {});
        const endT = setTimeout(() => { try { audio.pause(); } catch {} }, 10000);
        return () => clearTimeout(endT);
      }
    } catch {}
    const colors = ["#ff0066", "#00ffcc", "#ffee00", "#7c00ff", "#00e1ff", "#ff7c7c"];
    const pieces = 120;
    const els: HTMLElement[] = [];
    // add light beams
    const beams: HTMLElement[] = [];
    for (let b = 0; b < 8; b++) {
      const beam = document.createElement("div");
      beam.className = "disco-beam";
      beam.style.left = Math.random() * 100 + "vw";
      const col = colors[Math.floor(Math.random() * colors.length)];
      beam.style.background = `linear-gradient(to bottom, ${col}00, ${col}55, ${col}00)`;
      beam.style.animationDuration = (1.8 + Math.random() * 1.2) + "s";
      document.body.appendChild(beam);
      beams.push(beam);
    }
    for (let i = 0; i < pieces; i++) {
      const div = document.createElement("div");
      div.className = "confetti";
      div.style.left = Math.random() * 100 + "vw";
      div.style.setProperty("--confetti-color", colors[i % colors.length]);
      div.style.width = (6 + Math.random() * 10) + "px";
      div.style.height = (6 + Math.random() * 14) + "px";
      div.style.setProperty("--confetti-drift", (Math.random() * 300 - 150) + "px");
      div.style.animationDuration = (Math.random() * 2 + 2) + "s";
      document.body.appendChild(div);
      els.push(div);
    }
    // spawn bursts
    const emojis = ["✨","🕺","💿","🎉","💥","🌈","🪩","💫"]; 
    const burst = setInterval(() => {
      for (let i = 0; i < 28; i++) {
        const isEmoji = Math.random() < 0.35;
        const div = document.createElement("div");
        div.className = isEmoji ? "confetti emoji" : "confetti";
        div.style.left = Math.random() * 100 + "vw";
        if (isEmoji) {
          div.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        } else {
          const col = colors[Math.floor(Math.random() * colors.length)];
          div.style.setProperty("--confetti-color", col);
          div.style.width = (6 + Math.random() * 10) + "px";
          div.style.height = (6 + Math.random() * 14) + "px";
        }
        div.style.setProperty("--confetti-drift", (Math.random() * 280 - 140) + "px");
        div.style.animationDuration = (Math.random() * 2 + 2) + "s";
        document.body.appendChild(div);
        els.push(div);
      }
    }, 1500);

    const t = setTimeout(() => {
      els.forEach((e) => e.remove());
      beams.forEach((b) => b.remove());
      overlay.remove();
      onEnd();
    }, 10000);
    return () => {
      clearTimeout(t);
      clearInterval(burst);
      els.forEach((e) => e.remove());
      beams.forEach((b) => b.remove());
      overlay.remove();
    };
  }, [onEnd, muted]);
  return null;
}

function triggerDisco() {
  // noop; real effect is in DiscoLayer mount
}

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      if (!res.ok) throw new Error("Failed to join waitlist");
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6 bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)]">
        <p className="text-sm sm:text-base">You're on the list. We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
      <input
        type="email"
        required
        placeholder="Work email"
        className="flex-1 rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="text"
        placeholder="Company (optional)"
        className="flex-1 rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-foreground text-background px-4 py-2 text-sm disabled:opacity-60"
      >
        {loading ? "Joining…" : "Join waitlist"}
      </button>
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

type CsvStats = {
  columnName: string;
  count: number;
  numeric: boolean;
  min?: number;
  max?: number;
  mean?: number;
};

function CsvQuickStats() {
  const [csvText, setCsvText] = useState("");
  const [stats, setStats] = useState<CsvStats[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function parseCsv(text: string): string[][] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines.map((l) => l.split(",").map((c) => c.trim()));
  }

  function onAnalyze() {
    setError(null);
    try {
      const rows = parseCsv(csvText);
      if (rows.length < 2) {
        setError("Provide a header row and at least one data row.");
        setStats(null);
        return;
      }
      const header = rows[0];
      const data = rows.slice(1);
      const columns = header.length;
      const computed: CsvStats[] = [];
      for (let c = 0; c < columns; c++) {
        const values = data.map((r) => r[c] ?? "");
        const numericValues = values
          .map((v) => (v === "" ? NaN : Number(v.replace(/[$,%]/g, ""))))
          .filter((v) => !Number.isNaN(v));
        const isNumeric = numericValues.length >= Math.max(1, Math.floor(values.length * 0.6));
        if (isNumeric && numericValues.length > 0) {
          const sum = numericValues.reduce((a, b) => a + b, 0);
          computed.push({
            columnName: header[c] || `Column ${c + 1}`,
            count: values.length,
            numeric: true,
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            mean: sum / numericValues.length,
          });
        } else {
          computed.push({
            columnName: header[c] || `Column ${c + 1}`,
            count: values.length,
            numeric: false,
          });
        }
      }
      setStats(computed);
    } catch (e) {
      setError("Could not parse CSV. Ensure comma-separated values with a header row.");
      setStats(null);
    }
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <div className="mb-3">
        <label className="text-sm">Paste small CSV (≤ 5k chars)</label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value.slice(0, 5000))}
          rows={6}
          placeholder="col_a,col_b\n1,hello\n2,world"
          className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
        />
      </div>
      <button onClick={onAnalyze} className="rounded-md bg-foreground text-background px-4 py-2 text-sm">Analyze</button>
      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}
      {stats && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left">
              <tr>
                <th className="py-2 pr-4">Column</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Count</th>
                <th className="py-2 pr-4">Min</th>
                <th className="py-2 pr-4">Max</th>
                <th className="py-2 pr-4">Mean</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.columnName} className="border-t border-black/[.06] dark:border-white/[.09]">
                  <td className="py-2 pr-4">{s.columnName}</td>
                  <td className="py-2 pr-4">{s.numeric ? "numeric" : "text"}</td>
                  <td className="py-2 pr-4">{s.count}</td>
                  <td className="py-2 pr-4">{s.numeric ? s.min?.toLocaleString() : "—"}</td>
                  <td className="py-2 pr-4">{s.numeric ? s.max?.toLocaleString() : "—"}</td>
                  <td className="py-2 pr-4">{s.numeric ? (s.mean ?? 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [memeMode, setMemeMode] = useState(true);
  const [bgIdx, setBgIdx] = useState(0);
  const [disco, setDisco] = useState(false);
  const [muted, setMuted] = useState(!true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const musicTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const [trackAdvance, setTrackAdvance] = useState(0);
  const gradients = [
    ["#ff00a6", "#00ffd1"],
    ["#ffea00", "#7c00ff"],
    ["#00e1ff", "#ff7c7c"],
    ["#00ff87", "#00b7ff"],
    ["#ff8a00", "#e52e71"],
    ["#a8ff78", "#78ffd6"],
  ];
  const bgStyle = memeMode ? { background: `linear-gradient(135deg, ${gradients[bgIdx][0]}, ${gradients[bgIdx][1]})` } : {};
  useEffect(() => {
    if (!memeMode) return;
    const id = setInterval(() => {
      if (!disco && Math.random() < 0.08) setDisco(true);
    }, 4000);
    return () => clearInterval(id);
  }, [memeMode, disco]);
  useEffect(() => {
    // Immediately stop disco if user switches to boring mode
    if (!memeMode && disco) setDisco(false);
  }, [memeMode, disco]);
  useEffect(() => {
    // set default mute per mode
    setMuted(!memeMode);
  }, [memeMode]);

  // Meme background music loop (8-bit style)
  useEffect(() => {
    const bgTracks = [
      "/music/datanlybgm/baby-steps-funny-cartoon-mischief-meme-kids-music-232028.mp3",
      "/music/datanlybgm/be-boop-a-meme-402913.mp3",
      "/music/datanlybgm/cosmic-pond-of-arcane-waterfowl-135465.mp3",
      "/music/datanlybgm/into-the-water-141262.mp3",
      "/music/datanlybgm/quirky-sneaky-memes-background-music-392224.mp3",
      // exclude technomode2 and discomode from background
    ];
    const stopAudio = async () => {
      const a = bgAudioRef.current;
      if (!a) return;
      try {
        let v = a.volume;
        const fade = setInterval(() => {
          v -= 0.05;
          a.volume = Math.max(0, v);
          if (v <= 0) {
            clearInterval(fade);
            a.pause();
          }
        }, 80);
      } catch {}
      bgAudioRef.current = null;
      setCurrentTrack(null);
    };

    const startAudio = () => {
      try {
        if (!memeMode || muted) return;
        const pick = bgTracks[Math.floor(Math.random() * bgTracks.length)];
        const audio = new Audio(pick);
        audio.loop = true;
        audio.volume = 0;
        bgAudioRef.current?.pause();
        bgAudioRef.current = audio;
        const name = pick.split("/").pop() || pick;
        setCurrentTrack(name.replace(/\.mp3$/i, "").replace(/[-_]+/g, " "));
        audio.play().catch(() => {});
        let v = 0;
        const fadeIn = setInterval(() => {
          v += 0.05;
          audio.volume = Math.min(0.4, v);
          if (v >= 0.4) clearInterval(fadeIn);
        }, 120);
      } catch {}
    };

    if (!memeMode || muted) {
      stopAudio();
      return;
    }
    stopAudio();
    // Attempt autoplay on load and when switching to Meme Mode
    startAudio();
    return () => { stopAudio(); };
  }, [memeMode, muted, trackAdvance]);
  return (
    <div className={`min-h-screen ${memeMode ? `meme-mode ${disco ? 'disco-pulse' : ''}` : "boring-mode"}`} style={bgStyle}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className={`text-lg font-semibold tracking-tight ${memeMode ? "meme-title" : ""}`}>Datanyl</div>
        <div className="flex items-center gap-3">
          <button
            className={`text-xs px-3 py-1 rounded-md ${memeMode ? "meme-button bg-yellow-300 text-black" : "border border-black/[.12]"}`}
            onClick={() => {
              const next = (bgIdx + 1) % gradients.length;
              setBgIdx(next);
            }}
          >
            Cycle Colors
          </button>
          <button
            className={`text-xs px-3 py-1 rounded-md ${memeMode ? "meme-button bg-white text-black" : "bg-foreground text-background"}`}
            onClick={() => setMemeMode((v) => !v)}
          >
            {memeMode ? "Boring Mode" : "Meme Mode"}
          </button>
          <button
            aria-pressed={!muted}
            className={`text-xs px-3 py-1 rounded-md ${memeMode ? "meme-button bg-green-300 text-black" : "border border-black/[.12]"}`}
            onClick={() => {
              const next = !muted;
              setMuted(next);
              try {
                if (next) {
                  bgAudioRef.current?.pause();
                } else if (memeMode) {
                  bgAudioRef.current?.play().catch(() => {});
                }
              } catch {}
            }}
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          {memeMode && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-xs px-2 py-1 rounded-md border border-black/[.12] dark:border-white/[.145]">
                <span>Now playing{currentTrack ? ":" : ""}</span>
                <span className="font-medium truncate max-w-[180px]">{currentTrack ?? ""}</span>
                <button
                  className="ml-1 px-2 py-0.5 rounded-md border border-black/[.12] dark:border-white/[.145]"
                  onClick={() => setTrackAdvance((n) => n + 1)}
                  title="Next track"
                >
                  Next ▶
                </button>
              </div>
              <details className="sm:hidden">
                <summary className="text-xs underline cursor-pointer">Now playing</summary>
                <div className="mt-1 flex items-center gap-2 text-xs px-2 py-1 rounded-md border border-black/[.12] dark:border-white/[.145] bg-white/70 dark:bg-black/30">
                  <span className="font-medium truncate flex-1">{currentTrack ?? ""}</span>
                  <button
                    className="px-2 py-0.5 rounded-md border border-black/[.12] dark:border-white/[.145]"
                    onClick={() => setTrackAdvance((n) => n + 1)}
                    title="Next track"
                  >
                    Next ▶
                  </button>
                </div>
              </details>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-16">
        {memeMode && disco && (
          <DiscoLayer
            muted={muted}
            onStart={() => { try { bgAudioRef.current?.pause(); } catch {} }}
            onEnd={() => { setDisco(false); try { if (bgAudioRef.current && !muted) { bgAudioRef.current.play().catch(() => {}); } } catch {} }}
          />
        )}
        <section className="grid grid-cols-1 items-center gap-8 sm:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h1 className={`text-3xl sm:text-5xl font-semibold tracking-tight ${memeMode ? "meme-title" : ""}`}>
              Tiny data tools. Big sanity.
            </h1>
            <p className="text-sm sm:text-base leading-6 text-black/80 dark:text-white/80">
              In-browser CSV and SQL helpers. Paste, click, done. No upload.
            </p>
            <div id="waitlist" className="mt-2">
              <WaitlistForm />
            </div>
            <div className="text-xs text-black/60 dark:text-white/60">
              Meme Mode for fun · Boring Mode for focus
            </div>
          </div>
          <div className={`p-4 sm:p-6 rounded-xl ${memeMode ? "meme-card bg-white text-black" : "border border-black/[.08] dark:border-white/[.145]"}`}>
            <ul className="list-disc pl-5 text-sm">
              <li>CSV Joiner & Diagnostics</li>
              <li>SQL Safety Linter</li>
              <li>JSON → SQL Flattener</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">CSV Joiner & Diagnostics</h2>
          <CsvJoinerDiagnostics />
        </section>

        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">SQL Safety Linter</h2>
          <SqlSafetyLinter />
        </section>

        <section className="mt-12 sm:mt-16">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight mb-4">JSON → SQL Flattener</h2>
          <JsonToSqlFlattener />
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-12 text-sm text-black/60 dark:text-white/60">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Datanyl, Inc.</p>
          <div className="flex gap-4">
            <a className="hover:underline" href="#">Privacy</a>
            <a className="hover:underline" href="#">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SqlSafetyLinter() {
  const [sqlText, setSqlText] = useState("");
  const [issues, setIssues] = useState<Array<{ level: "error" | "warn"; message: string }>>([]);

  function extractBetween(text: string, start: string, endTokens: string[]): string | null {
    const lower = text.toLowerCase();
    const sIdx = lower.indexOf(start);
    if (sIdx === -1) return null;
    let endIdx = text.length;
    for (const end of endTokens) {
      const idx = lower.indexOf(end, sIdx + start.length);
      if (idx !== -1) endIdx = Math.min(endIdx, idx);
    }
    return text.substring(sIdx + start.length, endIdx).trim();
  }

  function handleLint() {
    const sql = sqlText.trim();
    const findings: Array<{ level: "error" | "warn"; message: string }> = [];
    const lower = sql.toLowerCase();
    if (/\bdrop\s+(table|database)\b/.test(lower) || /\btruncate\b/.test(lower)) findings.push({ level: "error", message: "Destructive statement (DROP/TRUNCATE) detected." });
    if (/\bupdate\b[\s\S]*?;?/i.test(sql) && !/\bwhere\b/i.test(sql)) findings.push({ level: "error", message: "UPDATE without WHERE." });
    if (/\bdelete\b[\s\S]*?;?/i.test(sql) && !/\bwhere\b/i.test(sql)) findings.push({ level: "error", message: "DELETE without WHERE." });
    if (/select\s+\*/i.test(sql)) findings.push({ level: "warn", message: "SELECT * detected; specify columns." });
    if (/\bjoin\b/i.test(sql) && !/\bjoin\b[\s\S]*?\bon\b/i.test(sql) && !/\busing\b/i.test(sql)) findings.push({ level: "warn", message: "JOIN without ON/USING may create a Cartesian product." });
    if (/\bselect\b/i.test(sql) && !/\blimit\b/i.test(sql)) findings.push({ level: "warn", message: "SELECT without LIMIT (consider limiting in exploration)." });
    setIssues(findings);
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <label className="text-sm">Paste a SQL query</label>
      <textarea
        value={sqlText}
        onChange={(e) => setSqlText(e.target.value)}
        rows={6}
        placeholder="UPDATE users SET admin = true;  -- bad"
        className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
      />
      <button onClick={handleLint} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Lint</button>
      <ul className="mt-3 space-y-1 text-sm">
        {issues.map((i, idx) => (
          <li key={idx} className={i.level === "error" ? "text-red-600 dark:text-red-400" : "text-yellow-700 dark:text-yellow-300"}>
            [{i.level.toUpperCase()}] {i.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CsvToSqlGenerator() {
  const [csvText, setCsvText] = useState("");
  const [tableName, setTableName] = useState("my_table");
  const [sql, setSql] = useState<string | null>(null);

  function parseCsv(text: string): string[][] {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    return lines.map((l) => l.split(",").map((c) => c.trim()));
  }

  function sanitizeName(name: string, fallback: string): string {
    const lowered = name.toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
    return lowered || fallback;
  }

  function detectType(values: string[]): "INTEGER" | "REAL" | "BOOLEAN" | "TIMESTAMP" | "TEXT" {
    const nonEmpty = values.filter((v) => v !== "");
    if (nonEmpty.every((v) => /^(true|false)$/i.test(v))) return "BOOLEAN";
    if (nonEmpty.every((v) => /^-?\d+$/.test(v))) return "INTEGER";
    if (nonEmpty.every((v) => /^-?\d*\.\d+$/.test(v))) return "REAL";
    if (nonEmpty.every((v) => /^(\d{4}-\d{2}-\d{2})([ tT]\d{2}:\d{2}(:\d{2})?)?([zZ]|[+-]\d{2}:?\d{2})?$/.test(v))) return "TIMESTAMP";
    return "TEXT";
  }

  function sqlEscape(value: string): string {
    return `'${value.replace(/'/g, "''")}'`;
  }

  function handleGenerate() {
    const rows = parseCsv(csvText);
    if (rows.length < 2) {
      setSql("-- Provide a header row and at least one data row.");
      return;
    }
    const header = rows[0];
    const data = rows.slice(1);
    const columnNames = header.map((h, i) => sanitizeName(h, `col_${i + 1}`));
    const columnsByIndex = columnNames.map((n, i) => ({
      name: n,
      type: detectType(data.map((r) => r[i] ?? "")),
    }));

    const quotedTable = `"${sanitizeName(tableName, "my_table")}"`;
    const columnDefs = columnsByIndex.map((c) => `  "${c.name}" ${c.type}`).join(",\n");
    const createStmt = `CREATE TABLE ${quotedTable} (\n${columnDefs}\n);`;

    const maxInsert = Math.min(20, data.length);
    const insertValues = data.slice(0, maxInsert).map((row) => {
      const vals = row.map((v, idx) => {
        const t = columnsByIndex[idx].type;
        if (v === "" || v == null) return "NULL";
        if (t === "INTEGER" || t === "REAL") return v;
        if (t === "BOOLEAN") return /^(true|1)$/i.test(v) ? "TRUE" : "FALSE";
        return sqlEscape(v);
      });
      return `(${vals.join(", ")})`;
    });
    const quotedCols = columnsByIndex.map((c) => `"${c.name}"`).join(", ");
    const insertStmt = insertValues.length > 0 ? `\n\nINSERT INTO ${quotedTable} (${quotedCols}) VALUES\n${insertValues.join(",\n")};` : "";

    setSql(`${createStmt}${insertStmt}`);
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">Table name</span>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
            placeholder="my_table"
          />
        </label>
      </div>
      <div className="mt-3">
        <label className="text-sm">Paste small CSV (≤ 5k chars)</label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value.slice(0, 5000))}
          rows={6}
          placeholder="name,amount,created_at\nalpha,10,2024-01-01\nbeta,20,2024-01-02"
          className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
        />
      </div>
      <button onClick={handleGenerate} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Generate SQL</button>
      {sql && (
        <div className="mt-4">
          <div className="mb-2 flex gap-2">
            <button onClick={() => navigator.clipboard.writeText(sql)} className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-1 text-xs">Copy</button>
            <button onClick={() => {
              const blob = new Blob([sql], { type: "text/sql" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `${tableName || "table"}.sql`; a.click();
              URL.revokeObjectURL(url);
            }} className="rounded-md border border-black/[.08] dark:border-white/[.145] px-3 py-1 text-xs">Download .sql</button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-4 text-xs whitespace-pre-wrap">{sql}</pre>
        </div>
      )}
    </div>
  );
}

function JwtInspector() {
  const [jwt, setJwt] = useState("");
  const [decoded, setDecoded] = useState<{ header?: unknown; payload?: any; signature?: string; errors?: string[] } | null>(null);

  function base64UrlDecode(input: string): string {
    try {
      const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
      const pad = b64.length % 4 === 2 ? "==" : b64.length % 4 === 3 ? "=" : "";
      return atob(b64 + pad);
    } catch {
      throw new Error("Invalid base64url");
    }
  }

  function inspect() {
    const parts = jwt.split(".");
    const errors: string[] = [];
    if (parts.length !== 3) {
      setDecoded({ errors: ["Token must have 3 parts (header.payload.signature)"] });
      return;
    }
    let header: unknown; let payload: any; let signature = parts[2];
    try { header = JSON.parse(base64UrlDecode(parts[0])); } catch { errors.push("Invalid header"); }
    try { payload = JSON.parse(base64UrlDecode(parts[1])); } catch { errors.push("Invalid payload"); }
    if (payload) {
      const now = Math.floor(Date.now() / 1000);
      if (typeof payload.exp === "number" && payload.exp < now) errors.push("Token is expired.");
      if (typeof payload.nbf === "number" && payload.nbf > now) errors.push("Token is not yet valid (nbf).");
    }
    setDecoded({ header, payload, signature, errors: errors.length ? errors : undefined });
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <label className="text-sm">Paste a JWT (header.payload.signature)</label>
      <textarea
        value={jwt}
        onChange={(e) => setJwt(e.target.value)}
        rows={4}
        placeholder="eyJhbGciOi..."
        className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
      />
      <button onClick={inspect} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Inspect</button>
      {decoded && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium">Header</p>
            <pre className="mt-1 text-xs whitespace-pre-wrap bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-2 rounded-md">{JSON.stringify(decoded.header ?? {}, null, 2)}</pre>
          </div>
          <div>
            <p className="text-sm font-medium">Payload</p>
            <pre className="mt-1 text-xs whitespace-pre-wrap bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-2 rounded-md">{JSON.stringify(decoded.payload ?? {}, null, 2)}</pre>
          </div>
          <div>
            <p className="text-sm font-medium">Signature</p>
            <code className="mt-1 block text-xs break-all bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-2 rounded-md">{decoded.signature ?? ""}</code>
            {decoded.errors && decoded.errors.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-red-600 dark:text-red-400">
                {decoded.errors.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SecretsScanner() {
  const [text, setText] = useState("");
  const [findings, setFindings] = useState<Array<{ type: string; snippet: string; index: number }>>([]);

  const patterns: Array<{ type: string; regex: RegExp }> = [
    { type: "AWS Access Key", regex: /AKIA[0-9A-Z]{16}/g },
    { type: "AWS Secret Key", regex: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g },
    { type: "GitHub Token", regex: /ghp_[A-Za-z0-9]{36}/g },
    { type: "Slack Token", regex: /xox[baprs]-[A-Za-z0-9-]{10,48}/g },
    { type: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/g },
    { type: "JWT", regex: /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
    { type: "Private Key Block", regex: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  ];

  function scan() {
    const results: Array<{ type: string; snippet: string; index: number }> = [];
    for (const p of patterns) {
      const re = new RegExp(p.regex.source, p.regex.flags.includes("g") ? p.regex.flags : p.regex.flags + "g");
      let m: RegExpExecArray | null;
      while ((m = re.exec(text)) !== null) {
        const snippet = text.substring(Math.max(0, m.index - 8), Math.min(text.length, m.index + m[0].length + 8));
        results.push({ type: p.type, snippet, index: m.index });
      }
    }
    results.sort((a, b) => a.index - b.index);
    setFindings(results);
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <label className="text-sm">Paste text or config to scan for secrets</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="Paste logs, .env, or code snippets here"
        className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
      />
      <button onClick={scan} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Scan</button>
      {findings.length > 0 ? (
        <ul className="mt-3 list-disc pl-5 text-sm">
          {findings.map((f, i) => (
            <li key={i}><span className="font-medium">{f.type}:</span> <code>{f.snippet}</code></li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-black/60 dark:text-white/60">No findings yet.</p>
      )}
    </div>
  );
}

function SshConfigAnalyzer() {
  const [config, setConfig] = useState("");
  const [issues, setIssues] = useState<string[]>([]);

  function analyze() {
    const lines = config.split(/\r?\n/).map((l) => l.trim());
    const problems: string[] = [];
    const hasPasswordAuth = lines.some((l) => /^passwordauthentication\s+yes$/i.test(l));
    if (hasPasswordAuth) problems.push("PasswordAuthentication is enabled; prefer keys.");
    const hasRootLogin = lines.some((l) => /^permitrootlogin\s+yes$/i.test(l));
    if (hasRootLogin) problems.push("PermitRootLogin is enabled; disable for safety.");
    const weakKex = [/diffie-hellman-group1-sha1/i, /diffie-hellman-group14-sha1/i];
    if (lines.some((l) => /kexalgorithms/i.test(l) && weakKex.some((r) => r.test(l)))) problems.push("Weak KexAlgorithms include *sha1; prefer curve25519-sha256 or diffie-hellman-group-exchange-sha256.");
    const weakCiphers = [/aes128-cbc/i, /3des-cbc/i, /arcfour/i];
    if (lines.some((l) => /ciphers/i.test(l) && weakCiphers.some((r) => r.test(l)))) problems.push("Weak Ciphers include CBC or deprecated algorithms; prefer chacha20-poly1305@openssh.com or aes256-gcm@openssh.com.");
    const weakMacs = [/hmac-md5/i, /hmac-sha1/i];
    if (lines.some((l) => /macs/i.test(l) && weakMacs.some((r) => r.test(l)))) problems.push("Weak MACs include md5/sha1; prefer hmac-sha2-256 or -512, or umac-128-etm@openssh.com.");
    if (problems.length === 0) problems.push("No obvious issues detected. Consider key-only auth, strong KEX/Ciphers/MACs.");
    setIssues(problems);
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <label className="text-sm">Paste sshd_config or ssh_config</label>
      <textarea
        value={config}
        onChange={(e) => setConfig(e.target.value)}
        rows={6}
        placeholder="Example: \nPermitRootLogin no\nPasswordAuthentication no\nKexAlgorithms curve25519-sha256"
        className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none"
      />
      <button onClick={analyze} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Analyze</button>
      <ul className="mt-3 list-disc pl-5 text-sm">
        {issues.map((i, idx) => (
          <li key={idx}>{i}</li>
        ))}
      </ul>
    </div>
  );
}

function CsvJoinerDiagnostics() {
  const [csvA, setCsvA] = useState("");
  const [csvB, setCsvB] = useState("");
  const [keyA, setKeyA] = useState("");
  const [keyB, setKeyB] = useState("");
  const [report, setReport] = useState<string | null>(null);

  function parseCsv(text: string): string[][] {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    return lines.map((l) => l.split(",").map((c) => c.trim()));
  }

  function analyze() {
    try {
      const rowsA = parseCsv(csvA);
      const rowsB = parseCsv(csvB);
      if (rowsA.length < 2 || rowsB.length < 2) { setReport("Provide headers and at least one row in each CSV."); return; }
      const headerA = rowsA[0];
      const headerB = rowsB[0];
      const idxA = keyA ? headerA.indexOf(keyA) : 0;
      const idxB = keyB ? headerB.indexOf(keyB) : 0;
      if (idxA === -1 || idxB === -1) { setReport("Join keys not found in headers."); return; }
      const seenA = new Map<string, number>();
      const seenB = new Map<string, number>();
      for (let i = 1; i < rowsA.length; i++) { const k = rowsA[i][idxA] ?? ""; seenA.set(k, (seenA.get(k) || 0) + 1); }
      for (let i = 1; i < rowsB.length; i++) { const k = rowsB[i][idxB] ?? ""; seenB.set(k, (seenB.get(k) || 0) + 1); }
      let matches = 0; let onlyA = 0; let onlyB = 0; let dupA = 0; let dupB = 0;
      for (const [k, c] of seenA) { if (c > 1) dupA++; if (seenB.has(k)) matches++; else onlyA++; }
      for (const [k, c] of seenB) { if (c > 1) dupB++; if (!seenA.has(k)) onlyB++; }
      const coverageA = (matches / Math.max(1, seenA.size)) * 100;
      const coverageB = (matches / Math.max(1, seenB.size)) * 100;
      const suggestions: string[] = [];
      if (dupA > 0 || dupB > 0) suggestions.push("Resolve duplicate keys before one-to-one joins (consider GROUP BY or distinct). ");
      if (coverageA < 100 || coverageB < 100) suggestions.push("Normalize key casing/whitespace; check leading zeros and formats.");
      const summary = [
        `Rows A: ${rowsA.length - 1}, unique keys: ${seenA.size}`,
        `Rows B: ${rowsB.length - 1}, unique keys: ${seenB.size}`,
        `Matches: ${matches}, only in A: ${onlyA}, only in B: ${onlyB}`,
        `Duplicates — A: ${dupA}, B: ${dupB}`,
        `Coverage — A matched: ${coverageA.toFixed(1)}%, B matched: ${coverageB.toFixed(1)}%`,
        suggestions.length ? `Suggestions: ${suggestions.join(" ")}` : "",
      ].filter(Boolean).join("\n");
      setReport(summary);
    } catch {
      setReport("Could not parse CSVs. Ensure comma-separated values and short samples.");
    }
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm">CSV A (header first)</span>
          <textarea value={csvA} onChange={(e) => setCsvA(e.target.value)} rows={5} className="rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm">CSV B (header first)</span>
          <textarea value={csvB} onChange={(e) => setCsvB(e.target.value)} rows={5} className="rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none" />
        </label>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-2 text-sm">
          <span>Key in A</span>
          <input value={keyA} onChange={(e) => setKeyA(e.target.value)} placeholder="id" className="flex-1 rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span>Key in B</span>
          <input value={keyB} onChange={(e) => setKeyB(e.target.value)} placeholder="id" className="flex-1 rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none" />
        </label>
      </div>
      <button onClick={analyze} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Analyze</button>
      {report && (
        <pre className="mt-3 overflow-x-auto rounded-md bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-4 text-xs whitespace-pre-wrap">{report}</pre>
      )}
    </div>
  );
}

function JsonToSqlFlattener() {
  const [jsonText, setJsonText] = useState("");
  const [sql, setSql] = useState<string | null>(null);

  function flatten(obj: any, prefix = "", out: Record<string, any> = {}) {
    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const k of Object.keys(obj)) {
        flatten(obj[k], prefix ? `${prefix}_${k}` : k, out);
      }
    } else {
      out[prefix] = obj;
    }
    return out;
  }

  function detectType(v: any): string {
    if (typeof v === "number") return Number.isInteger(v) ? "INTEGER" : "REAL";
    if (typeof v === "boolean") return "BOOLEAN";
    if (typeof v === "string" && /^(\d{4}-\d{2}-\d{2})([ tT]\d{2}:\d{2}(:\d{2})?)?([zZ]|[+-]\d{2}:?\d{2})?$/.test(v)) return "TIMESTAMP";
    return "TEXT";
  }

  function generate() {
    try {
      const parsed = JSON.parse(jsonText);
      const sample = Array.isArray(parsed) ? (parsed[0] ?? {}) : parsed;
      const flat = flatten(sample);
      const cols = Object.keys(flat);
      if (cols.length === 0) { setSql("-- JSON object is empty"); return; }
      const defs = cols.map((c) => `  "${c}" ${detectType(flat[c])}`).join(",\n");
      const ddl = `CREATE TABLE "json_flat" (\n${defs}\n);`;
      setSql(ddl);
    } catch {
      setSql("-- Invalid JSON");
    }
  }

  return (
    <div className="w-full rounded-xl border border-black/[.08] dark:border-white/[.145] p-4 sm:p-6">
      <label className="text-sm">Paste JSON (object or array of objects)</label>
      <textarea value={jsonText} onChange={(e) => setJsonText(e.target.value)} rows={6} className="mt-1 w-full rounded-md border border-black/[.08] dark:border-white/[.145] bg-white dark:bg-black px-3 py-2 text-sm outline-none" />
      <button onClick={generate} className="mt-2 rounded-md bg-foreground text-background px-4 py-2 text-sm">Generate DDL</button>
      {sql && <pre className="mt-3 overflow-x-auto rounded-md bg-[rgb(245,245,245)] dark:bg-[rgb(20,20,20)] p-4 text-xs whitespace-pre-wrap">{sql}</pre>}
    </div>
  );
}
