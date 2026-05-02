import { useState, useRef, useEffect } from "react";
import { Github01Icon, Linkedin01Icon } from "hugeicons-react";

const SYSTEM_PROMPT = `You are TestCraft AI, a senior QA engineer with 15+ years of experience in software testing, specializing in BDD, risk-based testing, and test design techniques.

Your job is to generate PROFESSIONAL, COMPREHENSIVE test cases from a user story or feature description.

## OUTPUT FORMAT
Always respond with a valid JSON object (no markdown, no backticks, no explanation outside JSON):

{
  "feature": "Feature name",
  "summary": "One sentence about what is being tested",
  "stats": {
    "positive": <number>,
    "negative": <number>,
    "edge": <number>,
    "accessibility": <number>,
    "performance": <number>,
    "security": <number>
  },
  "scenarios": [
    {
      "id": "TC-001",
      "title": "Scenario title",
      "type": "positive" | "negative" | "edge" | "accessibility" | "performance" | "security",
      "priority": "critical" | "high" | "medium" | "low",
      "tags": ["@smoke", "@regression"],
      "steps": {
        "given": ["context step"],
        "when": ["action step"],
        "then": ["expected outcome"],
        "and": ["additional outcomes"]
      },
      "notes": "Optional test design notes or risk rationale"
    }
  ]
}

## COVERAGE RULES — always apply ALL of these:

### Positive scenarios (Happy Path)
- Main success flow with valid data
- Alternative valid flows
- Boundary values that succeed

### Negative scenarios (Sad Path)
- Missing required fields
- Invalid formats
- Wrong credentials / unauthorized access
- Expired or revoked tokens/sessions
- Duplicate submissions

### Edge cases
- Boundary values (0, 1, max-1, max, max+1)
- Empty state / null / whitespace-only inputs
- Very long strings
- Special characters in inputs
- Concurrent actions / race conditions

### Security scenarios
- Attempt to access resource without authentication
- Attempt to access another user's resource (IDOR)
- Sensitive data not exposed in URL or logs
- CSRF / XSS input sanitation

### Accessibility scenarios
- All interactive elements reachable via keyboard
- Screen reader labels present
- Error messages are descriptive, not just color-based
- Focus management after modal/overlay

### Performance scenarios
- Response time under normal load
- Behavior under slow connection
- Large data set rendering

## QUALITY RULES
- Each scenario must be ATOMIC
- Steps must be SPECIFIC
- Given/When/Then must be clear enough for a junior tester to execute
- Tags: always include @regression; add @smoke for critical paths
- Priority: critical = app-breaking; high = major feature; medium = important; low = cosmetic
- IDs: sequential TC-001, TC-002, etc.
- Minimum 8 scenarios, ideally 12-16
- Always include at least 1 security, 1 accessibility, and 1 performance scenario

## LANGUAGE
Detect the language of the input and respond in the SAME language. JSON keys stay in English always.`;

const TypeBadge = ({ type }) => {
  const config = {
    positive:      { label: "Positive",      bg: "#0d2f1a", border: "#1a5c32", text: "#4ade80" },
    negative:      { label: "Negative",      bg: "#2f0d0d", border: "#5c1a1a", text: "#f87171" },
    edge:          { label: "Edge Case",     bg: "#2a1f0a", border: "#5c3d10", text: "#fbbf24" },
    security:      { label: "Security",      bg: "#0d1a2f", border: "#1a3a5c", text: "#60a5fa" },
    accessibility: { label: "Accessibility", bg: "#1f0a2a", border: "#3d1060", text: "#c084fc" },
    performance:   { label: "Performance",   bg: "#0d2a2a", border: "#0f5454", text: "#2dd4bf" },
  };
  const c = config[type] || config.positive;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", padding: "2px 8px", borderRadius: 4, background: c.bg, border: `1px solid ${c.border}`, color: c.text, textTransform: "uppercase", fontFamily: "monospace" }}>{c.label}</span>
  );
};

const PriorityDot = ({ priority }) => {
  const colors = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#6b7280" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors[priority] || "#6b7280", display: "inline-block" }} />
      {priority?.charAt(0).toUpperCase() + priority?.slice(1)}
    </span>
  );
};

const ScenarioCard = ({ scenario, index }) => {
  const [open, setOpen] = useState(index < 2);
  const allSteps = [
    ...(scenario.steps?.given || []).map(s => ({ kw: "Given", text: s })),
    ...(scenario.steps?.when  || []).map(s => ({ kw: "When",  text: s })),
    ...(scenario.steps?.then  || []).map(s => ({ kw: "Then",  text: s })),
    ...(scenario.steps?.and   || []).map(s => ({ kw: "And",   text: s })),
  ];
  const kwColors = { Given: "#60a5fa", When: "#c084fc", Then: "#4ade80", And: "#94a3b8" };
  return (
    <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 10, overflow: "hidden", marginBottom: 8, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#2e3a50"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e2330"}>
      <div onClick={() => setOpen(o => !o)} style={{ padding: "14px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#4b5563", minWidth: 52 }}>{scenario.id}</span>
        <TypeBadge type={scenario.type} />
        <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "#e2e8f0", minWidth: 120 }}>{scenario.title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <PriorityDot priority={scenario.priority} />
          <div style={{ display: "flex", gap: 4 }}>{scenario.tags?.map(t => <span key={t} style={{ fontSize: 11, color: "#475569", fontFamily: "monospace" }}>{t}</span>)}</div>
          <span style={{ color: "#4b5563", fontSize: 13 }}>{open ? "▲" : "▼"}</span>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid #1e2330", padding: "16px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {allSteps.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: kwColors[s.kw], fontFamily: "monospace", minWidth: 42, paddingTop: 1 }}>{s.kw}</span>
                <span style={{ fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.6 }}>{s.text}</span>
              </div>
            ))}
          </div>
          {scenario.notes && (
            <div style={{ background: "#0a0c10", border: "1px solid #1e2330", borderLeft: "3px solid #2563eb", borderRadius: 6, padding: "10px 14px", fontSize: 12.5, color: "#64748b", lineHeight: 1.7, marginTop: 12 }}>
              <span style={{ color: "#3b82f6", fontWeight: 600, marginRight: 6 }}>Note:</span>{scenario.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatPill = ({ label, value, color }) => (
  <div style={{ background: "#0f1117", border: "1px solid #1e2330", borderRadius: 8, padding: "10px 14px", textAlign: "center", minWidth: 80 }}>
    <div style={{ fontSize: 20, fontWeight: 700, color, fontFamily: "monospace" }}>{value}</div>
    <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
  </div>
);

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ background: "transparent", border: "1px solid #1e2330", borderRadius: 6, color: copied ? "#4ade80" : "#6b7280", fontSize: 12, padding: "6px 14px", cursor: "pointer", fontFamily: "monospace" }}>
      {copied ? "✓ Copied" : "Copy .feature"}
    </button>
  );
};

const scenariosToGherkin = (data) => {
  if (!data) return "";
  let out = `Feature: ${data.feature}\n  ${data.summary}\n\n`;
  data.scenarios?.forEach(sc => {
    out += `  # ${sc.id} | ${sc.type} | ${sc.priority}\n`;
    if (sc.tags?.length) out += `  ${sc.tags.join(" ")}\n`;
    out += `  Scenario: ${sc.title}\n`;
    sc.steps?.given?.forEach(s => out += `    Given ${s}\n`);
    sc.steps?.when?.forEach(s  => out += `    When ${s}\n`);
    sc.steps?.then?.forEach(s  => out += `    Then ${s}\n`);
    sc.steps?.and?.forEach(s   => out += `    And ${s}\n`);
    if (sc.notes) out += `    # Note: ${sc.notes}\n`;
    out += "\n";
  });
  return out;
};

const statConfig = [
  { key: "positive",      label: "Positive",    color: "#4ade80" },
  { key: "negative",      label: "Negative",    color: "#f87171" },
  { key: "edge",          label: "Edge Cases",  color: "#fbbf24" },
  { key: "security",      label: "Security",    color: "#60a5fa" },
  { key: "accessibility", label: "A11y",        color: "#c084fc" },
  { key: "performance",   label: "Performance", color: "#2dd4bf" },
];

// ── Hamburger icon ────────────────────────────────────────────────────────────
const HamburgerIcon = ({ open }) => (
  <div style={{ width: 22, height: 16, display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}>
    <span style={{ display: "block", height: 2, background: "#e2e8f0", borderRadius: 2, transition: "all 0.3s", transform: open ? "translateY(7px) rotate(45deg)" : "none" }} />
    <span style={{ display: "block", height: 2, background: "#e2e8f0", borderRadius: 2, transition: "all 0.3s", opacity: open ? 0 : 1 }} />
    <span style={{ display: "block", height: 2, background: "#e2e8f0", borderRadius: 2, transition: "all 0.3s", transform: open ? "translateY(-7px) rotate(-45deg)" : "none" }} />
  </div>
);

// ── Navbar ────────────────────────────────────────────────────────────────────
function Navbar({ scrollTo }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleNav = (id) => {
    scrollTo(id);
    setMenuOpen(false);
  };

  const links = [["The problem", "problem"], ["AI & QA", "copilot"], ["Generator", "generator"]];

  return (
    <>
      <nav style={{ position: "sticky", top: 0, zIndex: 200, borderBottom: "1px solid #0f1520", background: "rgba(7,10,15,0.96)", backdropFilter: "blur(12px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", height: 58, gap: 16 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🧪</div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9", letterSpacing: "-0.02em" }}>TestCraft <span style={{ color: "#3b82f6" }}>AI</span></span>
          </div>

          {/* Desktop links */}
          {!isMobile && (
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {links.map(([l, id]) => (
                <button key={id} className="nav-btn" onClick={() => handleNav(id)}>{l}</button>
              ))}
              <button onClick={() => handleNav("generator")} style={{ background: "#1d4ed8", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 18px", cursor: "pointer" }}>
                Try it free 
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button onClick={() => setMenuOpen(o => !o)} style={{ background: "none", border: "none", padding: 8, cursor: "pointer" }} aria-label="Toggle menu">
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 58, left: 0, right: 0, zIndex: 199,
          background: "rgba(7,10,15,0.98)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid #1e2330",
          maxHeight: menuOpen ? 320 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
        }}>
          <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
            {links.map(([l, id]) => (
              <button key={id} onClick={() => handleNav(id)} style={{
                background: "none", border: "none", color: "#94a3b8", fontSize: 16,
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                padding: "12px 0", borderBottom: "1px solid #0f1520", width: "100%",
                transition: "color 0.2s"
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
                onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
              >{l}</button>
            ))}
            <button onClick={() => handleNav("generator")} style={{
              marginTop: 12, background: "#1d4ed8", border: "none", borderRadius: 10,
              color: "#fff", fontSize: 15, fontWeight: 600, padding: "13px",
              cursor: "pointer", width: "100%"
            }}>
              Try it free
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Generator ─────────────────────────────────────────────────────────────────
function Generator() {
  const [input, setInput]      = useState("");
  const [loading, setLoading]  = useState(false);
  const [result, setResult]    = useState(null);
  const [error, setError]      = useState("");
  const [streamTxt, setStream] = useState("");
  const taRef = useRef(null);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 240) + "px";
    }
  }, [input]);

const generate = async () => {
  if (!input.trim()) return;
  setLoading(true); setResult(null); setError("");
  const dots = ["Analysing the feature", "Mapping happy paths", "Identifying edge cases", "Covering security & accessibility", "Refining scenarios"];
  let di = 0; setStream(dots[0] + "...");
  const iv = setInterval(() => { di = (di + 1) % dots.length; setStream(dots[di] + "..."); }, 1800);
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 8000, system: SYSTEM_PROMPT, messages: [{ role: "user", content: input.trim() }] })
    });
    clearInterval(iv);
    const data = await res.json();
    console.log("API response:", JSON.stringify(data));
    const raw = data.content?.[0]?.text || "";
    setResult(JSON.parse(raw.replace(/```json|```/g, "").trim()));
  } catch (err) {
    clearInterval(iv);
    console.error("Error:", err);
    setError("Failed to generate test cases. Please check your API key and try again.");
  } finally { setLoading(false); setStream(""); }
};

  return (
    <section id="generator" style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span style={{ fontSize: 11, fontFamily: "monospace", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", background: "#0f1117", border: "1px solid #1e2330", padding: "4px 14px", borderRadius: 20 }}>Generator</span>
        <h2 style={{ fontSize: "clamp(22px,4vw,30px)", fontWeight: 700, color: "#f1f5f9", marginTop: 14, letterSpacing: "-0.03em" }}>Try it now</h2>
        <p style={{ color: "#475569", fontSize: 15, marginTop: 8, maxWidth: 500, margin: "8px auto 0" }}>Paste a user story or feature description and get professional test cases in seconds.</p>
      </div>

      <div style={{ background: "#0a0d14", border: "1px solid #1e2330", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "12px 18px 0" }}>
          <span style={{ fontSize: 12, color: "#334155", fontFamily: "monospace" }}>user_story.txt</span>
        </div>
        <textarea ref={taRef} value={input} onChange={e => setInput(e.target.value)}
          placeholder={`Describe the feature or paste your user story here...\n\nEx: "Login with email and password. The user can fail 3 times before their account is locked for 15 minutes."`}
          onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
          style={{ width: "100%", minHeight: 120, maxHeight: 240, background: "transparent", border: "none", outline: "none", color: "#cbd5e1", fontSize: 14, lineHeight: 1.8, padding: "12px 18px 18px", resize: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        <div style={{ borderTop: "1px solid #0f1520", padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "#1e2d40" }}>⌘ + Enter to generate</span>
          <button onClick={generate} disabled={loading || !input.trim()}
            style={{ background: loading || !input.trim() ? "#0f1520" : "#1d4ed8", border: `1px solid ${loading || !input.trim() ? "#1e2330" : "#2563eb"}`, borderRadius: 8, color: loading || !input.trim() ? "#334155" : "#fff", fontSize: 13, fontWeight: 600, padding: "9px 22px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap" }}>
            {loading ? streamTxt : "Generate test cases →"}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "#1a0000", border: "1px solid #5c1a1a", borderRadius: 10, padding: "14px 18px", color: "#f87171", fontSize: 13, marginBottom: 24 }}>{error}</div>}

      {result && (
        <div>
          <div style={{ background: "#0a0d14", border: "1px solid #1e2330", borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Feature</div>
                <div style={{ fontSize: "clamp(16px,3vw,20px)", fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{result.feature}</div>
                <div style={{ fontSize: 13.5, color: "#475569", marginTop: 6, lineHeight: 1.6 }}>{result.summary}</div>
              </div>
              <CopyButton text={scenariosToGherkin(result)} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              {statConfig.map(s => result.stats?.[s.key] > 0 && <StatPill key={s.key} label={s.label} value={result.stats[s.key]} color={s.color} />)}
              <StatPill label="Total" color="#e2e8f0" value={result.scenarios?.length || 0} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#334155", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>{result.scenarios?.length} scenarios generated</div>
          {result.scenarios?.map((sc, i) => <ScenarioCard key={sc.id} scenario={sc} index={i} />)}
          <div style={{ display: "flex", gap: 10, paddingTop: 12, flexWrap: "wrap" }}>
            <button onClick={() => { setResult(null); setInput(""); }} style={{ background: "transparent", border: "1px solid #1e2330", borderRadius: 8, color: "#6b7280", fontSize: 13, padding: "9px 18px", cursor: "pointer" }}>← New test</button>
            <CopyButton text={scenariosToGherkin(result)} />
          </div>
        </div>
      )}
      {!result && !loading && (
        <div style={{ textAlign: "center", padding: "40px 0", color: "#1e2d40", fontSize: 13, fontFamily: "monospace" }}>Paste your user story above and click generate →</div>
      )}
    </section>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <div style={{ background: "#070a0f", minHeight: "100vh", fontFamily: "'DM Sans', 'Segoe UI', sans-serif", color: "#e2e8f0", overflowX: "hidden" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #070a0f; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .fu  { animation: fadeUp 0.6s ease both; }
        .fu1 { animation-delay:0.1s; }
        .fu2 { animation-delay:0.25s; }
        .fu3 { animation-delay:0.4s; }
        .fu4 { animation-delay:0.55s; }
        .nav-btn { background:none; border:none; color:#64748b; font-size:14px; cursor:pointer; font-family:inherit; transition:color 0.2s; padding: 4px 0; }
        .nav-btn:hover { color:#e2e8f0; }
        .pain-card { background:#0a0d14; border:1px solid #1e2330; border-radius:12px; padding:24px; transition:border-color 0.2s, transform 0.2s; }
        .pain-card:hover { border-color:#2e3a50; transform:translateY(-2px); }
        .row-item { display:flex; gap:14px; align-items:flex-start; padding:18px 0; border-bottom:1px solid #0f1520; }
        .row-item:last-child { border-bottom:none; }
        @media (max-width: 640px) {
          .hero-btns { flex-direction: column !important; align-items: stretch !important; }
          .hero-btns button { width: 100%; text-align: center; }
          .hero-stats { gap: 20px !important; }
          .copilot-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
          .problem-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <Navbar scrollTo={scrollTo} />

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", padding: "80px 24px 100px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(30,51,80,0.13) 1px,transparent 1px),linear-gradient(90deg,rgba(30,51,80,0.13) 1px,transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
        <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 700, height: 320, background: "radial-gradient(ellipse,rgba(37,99,235,0.1) 0%,transparent 70%)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto" }}>
          <div className="fu" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#0f1520", border: "1px solid #1e3a5c", borderRadius: 20, padding: "5px 14px 5px 8px", marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", display: "inline-block", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 12, color: "#60a5fa", fontFamily: "monospace" }}>v1.0 — open source coming soon</span>
          </div>
          <h1 className="fu fu1" style={{ fontSize: "clamp(30px,5.5vw,60px)", fontWeight: 700, color: "#f1f5f9", lineHeight: 1.1, letterSpacing: "-0.04em", marginBottom: 20 }}>
            Professional test cases.<br /><span style={{ color: "#3b82f6" }}>In seconds.</span>
          </h1>
          <p className="fu fu2" style={{ fontSize: "clamp(14px,1.8vw,18px)", color: "#64748b", lineHeight: 1.75, marginBottom: 36, maxWidth: 540, margin: "0 auto 36px" }}>
            Paste a user story. Get complete BDD scenarios 🚀 <br></br> Positive, negative, edge cases, security, accessibility and performance, generated by AI trained as a professional QA engineer.
          </p>
          <div className="fu fu3 hero-btns" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("generator")} style={{ background: "#1d4ed8", border: "1px solid #2563eb", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 600, padding: "13px 28px", cursor: "pointer" }}>
              Generate test cases 
            </button>
            <button onClick={() => scrollTo("copilot")} style={{ background: "transparent", border: "1px solid #1e2330", borderRadius: 10, color: "#94a3b8", fontSize: 15, padding: "13px 28px", cursor: "pointer" }}>
              How it works
            </button>
          </div>
          <div className="fu fu4 hero-stats" style={{ display: "flex", gap: 40, justifyContent: "center", marginTop: 52, flexWrap: "wrap" }}>
            {[["6 coverage types", "per generation"], ["< 30s", "average time"], ["Gherkin / BDD", "industry standard"]].map(([v, l]) => (
              <div key={v} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "clamp(16px,2vw,20px)", fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontSize: 14, color: "#334155", marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section id="problem" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <span style={{ fontSize: 13, fontFamily: "monospace", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>The problem</span>
          <h2 style={{ fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, color: "#f1f5f9", marginTop: 10, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
            QA exists to protect the business.<br />But daily tasks pull you away from that.
          </h2>
        </div>
        <div className="problem-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 16 }}>
          {[
            { icon: "✍️", title: "Writing test cases by hand", body: "Hours documenting scenarios that any senior can enumerate in minutes. Time you should spend thinking about risk, not Gherkin syntax.", accent: "#f87171" },
            { icon: "🔄", title: "Scripts that break every sprint", body: "Fragile selectors. Red pipelines. More time maintaining automation than creating value. The cycle never ends.", accent: "#fbbf24" },
            { icon: "💬", title: '"How does this flow work?"', body: "You answer the same question for the tenth time. Product knowledge lives in your head instead of being accessible to the whole team.", accent: "#60a5fa" },
          ].map(c => (
            <div key={c.title} className="pain-card">
              <div style={{ fontSize: 26, marginBottom: 14 }}>{c.icon}</div>
              <div style={{ width: 28, height: 2, background: c.accent, borderRadius: 2, marginBottom: 14 }} />
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#f1f5f9", marginBottom: 8 }}>{c.title}</h3>
              <p style={{ fontSize: 14, color: "#64748b", lineHeight: 1.7 }}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI & QA */}
      <section id="copilot" style={{ padding: "80px 24px", borderTop: "1px solid #0f1520" }}>
        <div className="copilot-grid" style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 56, alignItems: "start" }}>
          <div>
            <span style={{ fontSize: 13, fontFamily: "monospace", color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI & QA</span>
            <h2 style={{ fontSize: "clamp(22px,3.5vw,28px)", fontWeight: 700, color: "#f1f5f9", marginTop: 10, marginBottom: 20, letterSpacing: "-0.03em", lineHeight: 1.2 }}>
              AI won't take your job.<br />It will change what you do with your time.
            </h2>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, marginBottom: 14 }}>
              Some QA tasks consume time but require no human judgment like enumerating scenarios from clear requirements, ensuring boundary value coverage or formatting steps in Gherkin.
            </p>
            <p style={{ fontSize: 15, color: "#64748b", lineHeight: 1.8, marginBottom: 14 }}>
              AI executes those tasks in seconds with consistency a tired human can't guarantee, not because it's smarter, but because it doesn't lose focus or forget edge cases on a Friday at 6pm.
            </p>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.8 }}>
              What AI <strong style={{ color: "#e2e8f0" }}>doesn't do</strong>: understand implicit business context, decide what's worth testing when time is short, challenge poorly written requirements, or communicate risk to stakeholders. <strong style={{ color: "#e2e8f0" }}>That's you.</strong>
            </p>
          </div>
          <div style={{ background: "#0a0d14", border: "1px solid #1e2330", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "14px 18px", borderBottom: "1px solid #0f1520", display: "flex", gap: 10 }}>
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: "#2f0d0d", color: "#f87171", border: "1px solid #5c1a1a", fontFamily: "monospace" }}>Before</span>
              <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 4, background: "#0d2f1a", color: "#4ade80", border: "1px solid #1a5c32", fontFamily: "monospace" }}>After</span>
            </div>
            {[
              { bad: true,  title: "2–4h writing test cases manually",      body: "For an average feature, a junior QA spends half a day documenting scenarios before testing even starts." },
              { bad: false, title: "30s generation + human review",          body: "AI generates the base coverage. You review, adapt to context, and focus on testing what AI can't anticipate." },
              { bad: true,  title: "Inconsistent coverage across sprints",   body: "Under pressure, edge cases and security tests are the first to be skipped." },
              { bad: false, title: "6 coverage types guaranteed every time", body: "Positive, negative, edge cases, security, accessibility and performance in every generation, without exception." },
            ].map((item, i) => (
              <div key={i} className="row-item" style={{ padding: i === 0 ? "18px" : "0 18px 18px" }}>
                <div style={{ minWidth: 8, height: 8, borderRadius: "50%", background: item.bad ? "#f87171" : "#4ade80", marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GENERATOR */}
      <div style={{ paddingTop: 80, borderTop: "1px solid #0f1520" }}>
        <Generator />
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid #0f1520", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg,#1e3a5f,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>🧪</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>TestCraft <span style={{ color: "#3b82f6" }}>AI</span></span>
        </div>
        <p style={{ fontSize: 13, color: "#1e2d40", marginBottom: 16,fontWeight: "bold"}}>Built by a QA in training. For QAs who want to do more.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <a href="https://github.com/MiguelGuedes1" target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", textDecoration: "none", padding: "8px 16px", border: "1px solid #1e2330", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "#2e3a50"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#1e2330"; }}>
            <Github01Icon size={15} color="currentColor" />
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/miguel-guedes1/" target="_blank" rel="noreferrer"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "#475569", textDecoration: "none", padding: "8px 16px", border: "1px solid #1e2330", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f1f5f9"; e.currentTarget.style.borderColor = "#2e3a50"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#475569"; e.currentTarget.style.borderColor = "#1e2330"; }}>
            <Linkedin01Icon size={15} color="currentColor" />
            LinkedIn
          </a>
        </div>
      </footer>
    </div>
  );
}
