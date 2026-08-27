"use client";

import { useEffect, useState } from "react";
import { PLAYBOOK_VERSION } from "@/lib/playbook";

type Score = { label: string; score: number; note: string };
type Rewrite = { label: string; text: string };

type Result = {
  confidence?: string;
  confidenceNote?: string;
  scores?: Score[];
  total?: number;
  flags?: string[];
  rewrites?: Rewrite[];
  coachNote?: string;
  replyType?: string;
  reading?: string;
  priceCall?: string;
  escalation?: string;
};

export default function Page() {
  const [mode, setMode] = useState<"draft" | "reply">("draft");
  const [message, setMessage] = useState("");
  const [context, setContext] = useState("");
  const [passcode, setPasscode] = useState("");
  const [savedCode, setSavedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    setSavedCode(window.localStorage.getItem("deebo_code"));
  }, []);

  function unlock() {
    if (!passcode.trim()) {
      setError("Enter the passcode first.");
      return;
    }
    window.localStorage.setItem("deebo_code", passcode.trim());
    setSavedCode(passcode.trim());
    setError("");
  }

  async function run() {
    if (!message.trim()) {
      setError(mode === "draft" ? "Paste your draft first." : "Paste their reply first.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode, message, context, passcode: savedCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
        if (res.status === 401) {
          window.localStorage.removeItem("deebo_code");
          setSavedCode(null);
        }
      } else {
        setResult(data.result);
      }
    } catch {
      setError("Couldn't reach the coach. Check your connection and try again.");
    }
    setLoading(false);
  }

  async function copy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("");
    }
  }

  if (savedCode === null) {
    return (
      <main className="wrap">
        <div className="brand">Deebo!</div>
        <div className="tagline">Your People. Your Events. Your City.</div>
        <hr className="rule" />
        <div className="field">
          <label htmlFor="code">Passcode</label>
          <p className="hint">Ask Timmy if you don&apos;t have it.</p>
          <input
            id="code"
            type="password"
            value={passcode}
            onChange={(e) => {
              setPasscode(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && unlock()}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <button className="primary" onClick={unlock}>
          Open the coach
        </button>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div className="brand">Deebo!</div>
      <div className="tagline">Outreach coach · playbook {PLAYBOOK_VERSION}</div>
      <hr className="rule" />

      <div className="tabs">
        <button
          className="tab"
          aria-pressed={mode === "draft"}
          onClick={() => {
            setMode("draft");
            setResult(null);
            setError("");
          }}
        >
          Check a message before sending
        </button>
        <button
          className="tab"
          aria-pressed={mode === "reply"}
          onClick={() => {
            setMode("reply");
            setResult(null);
            setError("");
          }}
        >
          They replied — what now
        </button>
      </div>

      <div className="field">
        <label htmlFor="ctx">{mode === "draft" ? "Who are you messaging?" : "What did you send them?"}</label>
        <p className="hint">
          {mode === "draft"
            ? "Optional. Their handle, follower count, what event they have coming up."
            : "Optional, but it makes the answer much better."}
        </p>
        <textarea id="ctx" rows={2} value={context} onChange={(e) => setContext(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="msg">{mode === "draft" ? "Your draft" : "Their reply"}</label>
        <textarea
          id="msg"
          rows={7}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setError("");
          }}
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button className="primary" onClick={run} disabled={loading}>
        {loading ? "Reading it…" : mode === "draft" ? "Rate my message" : "Tell me what to send"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          {result.confidence === "low" && result.confidenceNote && (
            <div className="flag">
              <strong>Low confidence.</strong> {result.confidenceNote}
            </div>
          )}

          {result.replyType && (
            <div className="card">
              <h2>What this reply is</h2>
              <div style={{ marginBottom: 10 }}>
                <span className="pill">{result.replyType}</span>
                {result.priceCall && result.priceCall !== "not relevant" && (
                  <span className="pill">price: {result.priceCall}</span>
                )}
                {result.escalation && result.escalation !== "none" && (
                  <span className="pill warn">escalate: {result.escalation}</span>
                )}
              </div>
              {result.reading && <p style={{ fontSize: 15 }}>{result.reading}</p>}
            </div>
          )}

          {result.scores && result.scores.length > 0 && (
            <div className="card">
              <h2>How it scores</h2>
              {result.scores.map((s) => (
                <div key={s.label}>
                  <div className="bar-row">
                    <span className="bar-label">{s.label}</span>
                    <span className="bar-track">
                      <span className="bar-fill" style={{ width: `${(s.score / 5) * 100}%` }} />
                    </span>
                    <span className="bar-score">{s.score}</span>
                  </div>
                  <p className="bar-note">{s.note}</p>
                </div>
              ))}
              {typeof result.total === "number" && (
                <div className="total">{Math.round(result.total)} out of 30</div>
              )}
            </div>
          )}

          {result.flags && result.flags.length > 0 && (
            <div className="card">
              <h2>Playbook problems</h2>
              {result.flags.map((f, i) => (
                <div className="flag" key={i}>
                  {f}
                </div>
              ))}
            </div>
          )}

          {result.rewrites && result.rewrites.length > 0 && (
            <div className="card">
              <h2>{mode === "draft" ? "Better versions" : "Send this"}</h2>
              {result.rewrites.map((r) => (
                <div className="rewrite" key={r.label}>
                  <div className="rewrite-head">
                    <span className="rewrite-label">{r.label}</span>
                    <button className="copy" onClick={() => copy(r.text, r.label)}>
                      {copied === r.label ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <p className="rewrite-text">{r.text}</p>
                </div>
              ))}
            </div>
          )}

          {result.coachNote && (
            <div className="card">
              <h2>The one thing to fix</h2>
              <p style={{ fontSize: 15 }}>{result.coachNote}</p>
            </div>
          )}
        </div>
      )}

      <p className="foot">
        This coach only knows what&apos;s in the Deebo! playbook. If it says it doesn&apos;t cover
        something, that&apos;s real — tell Timmy so it gets added next week.
      </p>
    </main>
  );
}
