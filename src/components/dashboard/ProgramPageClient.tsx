'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

export interface ProgramEntry {
  program_name: string;
  program_type: string;
}

export interface AuditFinding {
  severity: string;
  title: string;
  description: string;
  type_name: string;
  code?: string;
  line_number?: number | null;
  line_content?: string | null;
  raw_evidence?: string | null;
}

export interface ContentData {
  content_html?: string;
  content_md?: string;
  generated_at?: string;
  overall_score?: number;
  title?: string;
  chapters?: { chapter_order: number; title: string; estimated_minutes: number; content_html: string }[];
  // code_audit fields
  findings?: AuditFinding[];
  overall_quality?: string;
  summary?: string;
  findings_count?: number;
  // metrics fields
  metrics?: {
    total_lines?: number;
    code_lines?: number;
    comment_lines?: number;
    comment_ratio?: number;
    goto_count?: number;
    goto_lines?: string[];
    perform_count?: number;
    evaluate_count?: number;
    exec_sql_count?: number;
    paragraph_count?: number;
    dead_paragraphs?: string[];
    checks_file_status?: boolean;
    checks_sqlcode?: boolean;
  };
  [key: string]: unknown;
}

type PageStatus = 'idle' | 'checking' | 'not_found' | 'completed' | 'error';

interface Props {
  programs?: ProgramEntry[];
  contentType: string;
  title: string;
  description: string;
  icon: string;
  accentColor?: string;
  systemLevel?: boolean;          // true = no program selector (onboarding)
  contentTypeLabel?: string;      // label override for content_type in status API
}

const TYPE_COLORS: Record<string, string> = {
  CBL: '#c3c0ff', CPY: '#d1bcff', JCL: '#c6c5d4', UNKNOWN: '#918fa1',
};

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  return (
    <svg className={`animate-spin ${cls} text-primary`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Program Selector ───────────────────────────────────────────────────────
function ProgramSelector({
  programs,
  selected,
  onSelect,
  disabled,
}: {
  programs: ProgramEntry[];
  selected: ProgramEntry | null;
  onSelect: (p: ProgramEntry) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      programs
        .filter((p) =>
          p.program_name.toLowerCase().includes(filter.toLowerCase()) ||
          p.program_type.toLowerCase().includes(filter.toLowerCase())
        )
        .slice(0, 100),
    [programs, filter]
  );

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const choose = (p: ProgramEntry) => { onSelect(p); setOpen(false); setFilter(''); };

  const typeColor = (t: string) => TYPE_COLORS[t?.toUpperCase()] ?? '#c3c0ff';

  return (
    <div ref={ref} className="relative w-80">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 40); }}
        className="w-full h-11 flex items-center justify-between bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl px-5 text-left transition-all hover:bg-white/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {selected ? (
          <div className="flex items-center space-x-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10" style={{ color: typeColor(selected.program_type) }}>
              {selected.program_type}
            </span>
            <span className="text-sm font-bold text-on-surface tracking-tight truncate max-w-[160px]">{selected.program_name}</span>
          </div>
        ) : (
          <span className="text-on-surface-variant/40 text-sm font-medium">Search program...</span>
        )}
        <span className="material-symbols-outlined text-primary text-xl transition-transform group-hover:translate-y-0.5">expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-full z-50 glass-card rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-50 text-base">search</span>
            <input
              ref={inputRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              className="w-full bg-white/5 rounded-xl text-xs text-on-surface placeholder-on-surface-variant/30 outline-none pl-9 pr-3 py-2.5 border border-white/5 focus:border-primary/30 transition-colors"
            />
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-on-surface-variant opacity-50">Nothing found</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.program_name}
                  type="button"
                  onClick={() => choose(p)}
                  className="w-full text-left px-3 py-2.5 rounded-xl flex items-center space-x-3 hover:bg-white/5 transition-colors group"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 w-11 flex-shrink-0 text-center" style={{ color: typeColor(p.program_type) }}>
                    {p.program_type}
                  </span>
                  <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">{p.program_name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Score Badge (Quality Audit) ────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#c3c0ff' : score >= 50 ? '#d1bcff' : '#ffb4ab';
  const label = score >= 80 ? 'EXCELLENT' : score >= 50 ? 'FAIR' : 'CRITICAL';
  return (
    <div className="glass-card flex items-center space-x-6 p-6 rounded-3xl mb-8 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 relative">
        <span className="text-3xl font-black text-on-surface z-10">{score}</span>
        <div className="absolute inset-2 blur-xl rounded-full opacity-20" style={{ background: color }}></div>
      </div>
      <div>
        <div className="text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant opacity-60">Architectural Integrity</div>
        <div className="text-xl font-black tracking-tighter" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

// ── Markdown Content Renderer ──────────────────────────────────────────────
function stripMdFence(raw: string): string {
  return raw.replace(/^```(?:markdown)?\n/, '').replace(/\n```$/, '').trim();
}

function MarkdownContent({ md }: { md: string }) {
  return (
    <div className="prose-cobol">
      <ReactMarkdown>{stripMdFence(md)}</ReactMarkdown>
    </div>
  );
}

// ── HTML Content Renderer ──────────────────────────────────────────────────
function HtmlContent({ html }: { html: string }) {
  return (
    <div
      className="prose-cobol"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

// ── Onboarding Chapters ────────────────────────────────────────────────────
function OnboardingChapters({ chapters }: { chapters: ContentData['chapters'] }) {
  const [active, setActive] = useState(0);
  if (!chapters?.length) return null;
  const ch = chapters[active];
  return (
    <div className="flex gap-8">
      {/* Chapter nav */}
      <div className="w-64 flex-shrink-0">
        <div className="glass-card rounded-[2rem] overflow-hidden p-2">
          {chapters.map((c, i) => (
            <button
              key={c.chapter_order}
              onClick={() => setActive(i)}
              className={`w-full text-left px-5 py-4 flex items-start space-x-4 rounded-2xl transition-all duration-300 ${
                i === active 
                  ? 'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20' 
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
              }`}
            >
              <span className="text-[10px] font-black mt-1 opacity-60 w-4">{String(c.chapter_order).padStart(2, '0')}</span>
              <span className="text-xs font-bold leading-tight tracking-tight">{c.title}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Chapter content */}
      <div className="flex-1 glass-card rounded-[2.5rem] p-10 max-h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <h2 className="text-2xl font-black text-on-surface tracking-tighter">{ch.title}</h2>
          {ch.estimated_minutes > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">schedule</span>
              {ch.estimated_minutes} min sync
            </div>
          )}
        </div>
        <HtmlContent html={ch.content_html} />
      </div>
    </div>
  );
}

// ── Code Audit Findings ────────────────────────────────────────────────────
const SEV_COLORS: Record<string, string> = {
  CRITICAL: '#ffb4ab', WARNING: '#d1bcff', INFO: '#c3c0ff',
};

function CodeAuditFindings({ content }: { content: ContentData }) {
  const findings = content.findings ?? [];
  const quality  = content.overall_quality ?? 'UNKNOWN';
  const summary  = content.summary ?? '';

  const bySeverity: Record<string, AuditFinding[]> = {
    CRITICAL: findings.filter((f) => f.severity === 'CRITICAL'),
    WARNING:  findings.filter((f) => f.severity === 'WARNING'),
    INFO:     findings.filter((f) => f.severity === 'INFO'),
  };

  const qColor = TYPE_COLORS[quality] || '#c3c0ff';

  return (
    <div className="flex flex-col gap-8">
      {/* Quality banner */}
      <div className="glass-card p-8 rounded-[2rem] flex items-center gap-10">
        <div className="flex-shrink-0 text-center">
          <div className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant opacity-60 mb-1">Architecture</div>
          <div className="text-3xl font-black tracking-tighter" style={{ color: qColor }}>{quality}</div>
        </div>
        <div className="h-12 w-px bg-white/5" />
        <p className="text-sm font-medium text-on-surface-variant leading-relaxed italic opacity-80">"{summary}"</p>
      </div>

      {/* Severity counters */}
      <div className="flex gap-4">
        {Object.entries(bySeverity).map(([sev, items]) => (
          <div
            key={sev}
            className="glass-card px-6 py-4 rounded-2xl flex items-center gap-4 transition-transform hover:scale-105"
          >
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-xl" style={{ color: SEV_COLORS[sev] }}>
              {items.length}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest" style={{ color: SEV_COLORS[sev] }}>{sev}</div>
          </div>
        ))}
      </div>

      {/* Findings list */}
      <div className="space-y-4">
        {findings.length === 0 ? (
          <div className="glass-card py-20 rounded-[2rem] flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-5xl">verified</span>
            </div>
            <p className="text-sm font-bold text-on-surface opacity-60">Verified Integrity — No faults detected.</p>
          </div>
        ) : (
          (['CRITICAL', 'WARNING', 'INFO'] as const).flatMap((sev) =>
            bySeverity[sev].map((f, i) => (
              <div
                key={`${sev}-${i}`}
                className="glass-card p-6 rounded-2xl group transition-all hover:bg-white/[0.06]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow-sm"
                      style={{ background: SEV_COLORS[sev] + '20', color: SEV_COLORS[sev] }}
                    >
                      {sev}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-wider">{f.type_name}</span>
                  </div>
                  {f.line_number != null && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface-variant opacity-30">
                      <span className="material-symbols-outlined text-xs">tag</span>
                      OFFSET {f.line_number}
                    </div>
                  )}
                </div>
                <h4 className="text-base font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">{f.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed opacity-70 mb-4">{f.description}</p>
                {f.line_content && (
                  <div className="relative group/code">
                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                      <span className="text-[8px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">LOG_READ</span>
                    </div>
                    <pre className="bg-black/40 rounded-xl p-4 text-[0.7rem] font-mono text-on-surface/60 overflow-x-auto border border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                      <code>{f.line_content}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}

// ── Metrics Panel ──────────────────────────────────────────────────────────
function MetricCard({ label, value, variant = 'neutral' }: { label: string; value: string | number; variant?: 'ok' | 'warn' | 'neutral' }) {
  const colors = { ok: '#9bd598', warn: '#ffb4ab', neutral: '#c3c0ff' };
  return (
    <div className="glass-card py-4 px-5 rounded-2xl flex flex-col gap-1 transition-all hover:scale-[1.02]">
      <div className="text-2xl font-black tracking-tighter" style={{ color: colors[variant] }}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant opacity-60">{label}</div>
    </div>
  );
}

function MetricsPanel({ content, contentType }: { content: ContentData; contentType: string }) {
  const m = content.metrics;
  const score = content.overall_score;

  if (contentType !== 'metrics' || !m) {
    // fallback: show html if present
    return content.content_html ? (
      <div className="glass-card rounded-[3rem] p-12 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl">
        <div className="prose-cobol" dangerouslySetInnerHTML={{ __html: content.content_html }} />
      </div>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">
      {/* Overall Indicator — semáforo */}
      {typeof score === 'number' && (
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-8">
          {/* Traffic light */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 px-4">
            <div className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant opacity-50 mb-2">Overall Indicator</div>
            <div className="flex flex-col gap-3">
              {/* Red */}
              <div className={`w-8 h-8 rounded-full transition-all duration-500 ${
                score < 50 ? 'bg-[#ff4444] shadow-[0_0_16px_4px_rgba(255,68,68,0.7)]' : 'bg-white/10'
              }`} />
              {/* Yellow */}
              <div className={`w-8 h-8 rounded-full transition-all duration-500 ${
                score >= 50 && score < 70 ? 'bg-[#ffd700] shadow-[0_0_16px_4px_rgba(255,215,0,0.7)]' : 'bg-white/10'
              }`} />
              {/* Green */}
              <div className={`w-8 h-8 rounded-full transition-all duration-500 ${
                score >= 70 ? 'bg-[#4cde80] shadow-[0_0_16px_4px_rgba(76,222,128,0.7)]' : 'bg-white/10'
              }`} />
            </div>
          </div>
          <div className="h-24 w-px bg-white/5" />
          <div className="flex flex-col gap-2">
            <div
              className="text-2xl font-black tracking-tighter"
              style={{ color: score >= 70 ? '#4cde80' : score >= 50 ? '#ffd700' : '#ff4444' }}
            >
              {score >= 70 ? 'GOOD' : score >= 50 ? 'FAIR' : 'CRITICAL'}
            </div>
            <div className="text-xs text-on-surface-variant opacity-70 leading-relaxed max-w-xs">
              Índice compuesto de calidad calculado a partir de complejidad, dead code, patrones de riesgo y buenas prácticas COBOL.
            </div>
          </div>
        </div>
      )}

      {/* Numeric metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {m.total_lines     != null && <MetricCard label="Total Lines"       value={m.total_lines}     />}
        {m.code_lines      != null && <MetricCard label="Code Lines"        value={m.code_lines}      />}
        {m.comment_lines   != null && <MetricCard label="Comment Lines"     value={m.comment_lines}   />}
        {m.comment_ratio   != null && <MetricCard label="Comment Ratio"     value={`${m.comment_ratio}%`} />}
        {m.paragraph_count != null && <MetricCard label="Paragraphs"        value={m.paragraph_count} />}
        {m.perform_count   != null && <MetricCard label="PERFORM Count"     value={m.perform_count}   />}
        {m.evaluate_count  != null && <MetricCard label="EVALUATE Count"    value={m.evaluate_count}  />}
        {m.exec_sql_count  != null && <MetricCard label="EXEC SQL Count"    value={m.exec_sql_count}  />}
        {m.goto_count      != null && (
          <MetricCard label="GO TO Count" value={m.goto_count}
            variant={m.goto_count === 0 ? 'ok' : 'warn'} />
        )}
        {m.dead_paragraphs != null && (
          <MetricCard label="Dead Paragraphs" value={m.dead_paragraphs.length}
            variant={m.dead_paragraphs.length === 0 ? 'ok' : 'warn'} />
        )}
      </div>

      {/* Boolean checks */}
      <div className="glass-card p-6 rounded-[2rem] flex flex-wrap gap-6">
        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 w-full">Safety Checks</div>
        {[{ label: 'FILE STATUS check', value: m.checks_file_status },
          { label: 'SQLCODE check',     value: m.checks_sqlcode }].map(({ label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black ${
              value ? 'bg-[#9bd598]/20 text-[#9bd598]' : 'bg-[#ffb4ab]/20 text-[#ffb4ab]'
            }`}>
              <span className="material-symbols-outlined text-base">{value ? 'check' : 'close'}</span>
            </div>
            <span className="text-xs font-bold text-on-surface-variant opacity-70">{label}</span>
          </div>
        ))}
      </div>

      {/* Dead paragraphs list */}
      {m.dead_paragraphs && m.dead_paragraphs.length > 0 && (
        <div className="glass-card p-6 rounded-[2rem]">
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-4">Dead Paragraphs ({m.dead_paragraphs.length})</div>
          <div className="flex flex-wrap gap-2">
            {m.dead_paragraphs.map((p, i) => (
              <span key={i} className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20">{p}</span>
            ))}
          </div>
        </div>
      )}

      {/* GO TO lines */}
      {m.goto_lines && m.goto_lines.length > 0 && (
        <div className="glass-card p-6 rounded-[2rem]">
          <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-50 mb-4">GO TO Statements ({m.goto_lines.length})</div>
          <div className="flex flex-wrap gap-2">
            {m.goto_lines.map((l, i) => (
              <span key={i} className="text-[11px] font-mono px-3 py-1 rounded-lg bg-[#ffb4ab]/10 text-[#ffb4ab] border border-[#ffb4ab]/20">{l}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function ProgramPageClient({
  programs = [],
  contentType,
  title,
  description,
  icon,
  systemLevel = false,
  contentTypeLabel,
}: Props) {
  const [selected, setSelected] = useState<ProgramEntry | null>(null);
  const [status, setStatus]     = useState<PageStatus>('idle');
  const [content, setContent]   = useState<ContentData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const statusKey = contentTypeLabel ?? contentType;

  const fetchContent = async (programName?: string) => {
    const params = new URLSearchParams({ content_type: contentType });
    if (programName) params.set('program_name', programName);
    const res = await fetch(`/api/content?${params}`);
    if (!res.ok) throw new Error(`Content fetch failed: ${res.status}`);
    return res.json() as Promise<ContentData>;
  };

  const checkStatus = async (programName?: string): Promise<string> => {
    const params = new URLSearchParams({ content_type: statusKey });
    if (programName) params.set('program_name', programName);
    const res = await fetch(`/api/status?${params}`);
    if (!res.ok) return 'error';
    const data = await res.json() as { status: string };
    return data.status;
  };

  const handleSelect = async (program?: ProgramEntry) => {
    setContent(null);
    setErrorMsg('');
    if (!systemLevel && !program) return;
    const programName = program?.program_name;
    setStatus('checking');
    try {
      const st = await checkStatus(programName);
      if (st === 'completed') {
        const data = await fetchContent(programName);
        setContent(data);
        setStatus('completed');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Connection to archival core lost.');
    }
  };

  useEffect(() => {
    if (systemLevel) handleSelect();
  }, []);

  const onProgramSelect = (p: ProgramEntry) => {
    setSelected(p);
    handleSelect(p);
  };

  const programName = selected?.program_name;
  const isLoading = status === 'checking';

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 animate-in fade-in duration-700">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <span className="material-symbols-outlined text-2xl">{icon}</span>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter uppercase italic">{title}</h1>
          </div>
          <p className="text-on-surface-variant font-medium text-sm leading-relaxed max-w-xl opacity-70 border-l-2 border-primary/20 pl-4">
            {description}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {!systemLevel && (
            <ProgramSelector
              programs={programs}
              selected={selected}
              onSelect={onProgramSelect}
              disabled={isLoading}
            />
          )}
        </div>
      </header>

      {/* Generated date */}
      {status === 'completed' && content?.generated_at && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card max-fit-content self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
            LAS_SYNC: {new Date(content.generated_at).toLocaleString('en-US', { hour12: false })}
          </span>
        </div>
      )}

      {/* ── States ── */}

      {/* Idle: no program selected */}
      {status === 'idle' && !systemLevel && (
        <div className="glass-card py-32 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant opacity-20">
            <span className="material-symbols-outlined text-6xl">{icon}</span>
          </div>
          <div>
            <p className="text-xl font-black text-on-surface tracking-tight">Select target object</p>
            <p className="text-sm text-on-surface-variant font-medium mt-1">Archive waiting for specific selection criteria.</p>
          </div>
        </div>
      )}

      {/* Checking / Loading */}
      {isLoading && (
        <div className="glass-card p-10 rounded-[2rem] flex items-center gap-6 bg-primary/5 animate-pulse">
          <Spinner size="md" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-black text-primary uppercase tracking-widest">Establishing link...</p>
            <p className="text-xs font-medium text-on-surface-variant opacity-60">Querying archival database.</p>
          </div>
        </div>
      )}

      {/* Not found */}
      {(status === 'not_found' || status === 'error') && (selected || systemLevel) && (
        <div className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-on-surface tracking-tighter mb-2">No data available</h3>
            <p className="text-sm font-medium text-on-surface-variant opacity-70 leading-relaxed">
              No archival record found for <span className="text-primary font-bold">{programName || 'this system'}</span>.
            </p>
            {status === 'error' && errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-[10px] font-black tracking-widest text-error uppercase">
                {errorMsg}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed: render content */}
      {status === 'completed' && content && (
        <article className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {typeof content.overall_score === 'number' && !content.metrics && (
            <ScoreBadge score={content.overall_score} />
          )}

          {content.metrics ? (
            <MetricsPanel content={content} contentType={contentType} />
          ) : content.findings ? (
            <CodeAuditFindings content={content} />
          ) : content.chapters ? (
            <OnboardingChapters chapters={content.chapters} />
          ) : content.content_md ? (
            <div className="glass-card rounded-[3rem] p-12 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <MarkdownContent md={content.content_md} />
            </div>
          ) : content.content_html ? (
            <div className="glass-card rounded-[3rem] p-12 max-h-[80vh] overflow-y-auto custom-scrollbar shadow-2xl">
              <HtmlContent html={content.content_html} />
            </div>
          ) : (
            <div className="glass-card py-20 rounded-[2rem] text-center opacity-40 italic">
               Null archival data returned from core.
            </div>
          )}
        </article>
      )}
    </div>
  );
}
