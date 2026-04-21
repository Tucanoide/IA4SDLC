'use client';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { ProgramEntry } from '@/lib/metrics';

// ── Types ──────────────────────────────────────────────────────────────────
type DocType = 'technical' | 'functional';

interface DocQueryResult {
  programId?: string;
  docType?: DocType;
  content?: string;      // main LLM response
  output?: string;       // n8n alias
  text?: string;         // n8n alias
  [key: string]: unknown;
}

interface Props {
  programs: ProgramEntry[];
  dbError: string | null;
}

const DOCQUERY_WEBHOOK = 'https://n8n.srv1187720.hstgr.cloud/webhook/doc-query';

const TYPE_COLORS: Record<string, string> = {
  CBL: '#c3c0ff', CPY: '#d1bcff', JCL: '#c6c5d4', UNKNOWN: '#918fa1',
};
const typeColor = (t?: string) => TYPE_COLORS[t?.toUpperCase() ?? ''] ?? '#c3c0ff';

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── Program Selector ───────────────────────────────────────────────────────
function ProgramSelector({
  programs, selected, onSelect,
}: {
  programs: ProgramEntry[];
  selected: ProgramEntry | null;
  onSelect: (p: ProgramEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() =>
    programs.filter((p) =>
      p.program_name.toLowerCase().includes(filter.toLowerCase()) ||
      p.program_type.toLowerCase().includes(filter.toLowerCase())
    ).slice(0, 80),
  [programs, filter]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const choose = (p: ProgramEntry) => {
    onSelect(p);
    setOpen(false);
    setFilter('');
  };

  return (
    <div ref={containerRef} className="relative flex-1">
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="w-full flex items-center gap-4 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3.5 text-left transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
      >
        {selected ? (
          <>
            <div className="w-10 h-6 rounded bg-primary/10 text-primary text-[10px] font-black flex items-center justify-center tracking-widest flex-shrink-0">
              {selected.program_type}
            </div>
            <span className="text-sm text-on-surface font-bold tracking-tight">{selected.program_name}</span>
          </>
        ) : (
          <span className="text-on-surface-variant/40 text-sm font-medium">Target Program...</span>
        )}
        <span className="material-symbols-outlined text-primary ml-auto transition-transform group-hover:translate-y-0.5">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-40 glass-card rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-40 text-sm">search</span>
            <input
              ref={inputRef}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter..."
              className="w-full bg-white/5 rounded-xl text-xs text-on-surface placeholder-on-surface-variant/30 outline-none pl-9 py-2.5 border border-white/5"
            />
          </div>
          <div className="overflow-y-auto max-h-72 custom-scrollbar pr-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-on-surface-variant opacity-50">Null results</p>
            ) : (
              filtered.map((p) => (
                <button
                  key={p.program_name}
                  type="button"
                  onClick={() => choose(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all group
                    ${selected?.program_name === p.program_name ? 'bg-primary/5' : ''}`}
                >
                  <div className="w-9 h-5 rounded bg-white/5 text-on-surface-variant group-hover:text-primary transition-colors text-[9px] font-black flex items-center justify-center tracking-widest flex-shrink-0">
                    {p.program_type}
                  </div>
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

// ── DocType Toggle ─────────────────────────────────────────────────────────
function DocTypeToggle({ value, onChange }: { value: DocType; onChange: (v: DocType) => void }) {
  const options: { value: DocType; label: string; icon: string }[] = [
    { value: 'technical',  label: 'Tech',  icon: 'code' },
    { value: 'functional', label: 'Logic', icon: 'psychology' },
  ];
  return (
    <div className="flex bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-1 gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer
            ${value === opt.value
              ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
              : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
            }`}
        >
          <span className="material-symbols-outlined text-lg">{opt.icon}</span>
          <span className="tracking-tighter">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Client ────────────────────────────────────────────────────────────
export default function DocQueryClient({ programs, dbError }: Props) {
  const [selected, setSelected] = useState<ProgramEntry | null>(null);
  const [docType, setDocType] = useState<DocType>('technical');
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<DocQueryResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = !!selected && !!prompt.trim() && status !== 'loading';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setStatus('loading');
    setResult(null);
    setErrorMsg('');

    try {
      const res = await fetch(DOCQUERY_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId:   selected!.program_name,
          programType: selected!.program_type,
          docType,
          prompt:      prompt.trim(),
        }),
      });

      const text = await res.text();
      if (!text.trim()) {
        setErrorMsg('Neural core returned null. Review node configuration.');
        setStatus('error');
        return;
      }

      try {
        const data: DocQueryResult = JSON.parse(text);
        setResult(data);
        setStatus('done');
      } catch {
        setResult({ content: text });
        setStatus('done');
      }
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : 'Uplink transmission error.');
      setStatus('error');
    }
  };

  const responseText = result
    ? (result.content ?? result.output ?? result.text ??
       (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)))
    : null;

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl">psychology</span>
          </div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter uppercase italic">Doc Assistant</h1>
        </div>
        <p className="text-on-surface-variant font-medium text-sm border-l-2 border-secondary/20 pl-4 opacity-70">
          Direct neural link to technical and functional documentation archives.
        </p>
      </header>

      {/* DB warning */}
      {dbError && (
        <div className="glass-card p-5 border-l-4 border-error rounded-2xl flex items-center gap-4 bg-error/5">
          <span className="material-symbols-outlined text-error text-2xl">warning</span>
          <div>
            <p className="text-sm font-black text-on-surface uppercase tracking-tight">Archival Sync Failed</p>
            <p className="text-xs font-semibold text-on-surface-variant opacity-60">{dbError}</p>
          </div>
        </div>
      )}

      {/* Query form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <ProgramSelector programs={programs} selected={selected} onSelect={setSelected} />
          <div className="md:w-72">
            <DocTypeToggle value={docType} onChange={setDocType} />
          </div>
        </div>

        <div className="glass-card rounded-3xl p-1 shadow-2xl overflow-hidden focus-within:ring-2 ring-primary/20 transition-all">
          <div className="flex flex-col">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSubmit(e as unknown as React.FormEvent); 
                }
              }}
              placeholder={`Inquire about ${docType} logic...\ne.g. "Index structure?", "Flow validation?"`}
              rows={4}
              className="w-full bg-transparent px-8 py-6 text-lg font-medium text-on-surface placeholder-on-surface-variant/20 focus:outline-none resize-none"
            />
            <div className="px-8 py-4 flex items-center justify-between bg-white/[0.02] border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">
                  <span className="material-symbols-outlined text-sm">keyboard_command_key</span>
                  <span>+ ENTER TO SEND</span>
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{prompt.length} / 2000</div>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="h-10 px-8 rounded-xl bg-primary text-on-primary font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:shadow-[0_0_20px_rgba(195,192,255,0.4)] transition-all hover:scale-[1.02] active:scale-[0.95] disabled:opacity-20 disabled:scale-100 disabled:shadow-none cursor-pointer"
              >
                {status === 'loading' ? <Spinner /> : <span className="material-symbols-outlined text-lg">send</span>}
                {status === 'loading' ? 'TRANSMITTING...' : 'EXECUTE QUERY'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Loading Overlay */}
      {status === 'loading' && (
        <div className="glass-card p-10 rounded-3xl flex items-center gap-6 bg-primary/5 animate-pulse">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div>
            <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em]">Neural Processing Underway</h3>
            <p className="text-xs font-semibold text-on-surface-variant opacity-60">Consulting LLM agent for {selected?.program_name} analysis.</p>
          </div>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="glass-card p-8 border-l-4 border-error rounded-2xl flex items-center gap-6">
          <span className="material-symbols-outlined text-error text-4xl">report</span>
          <div>
            <h3 className="text-sm font-black text-error uppercase tracking-[0.2em]">Archival Core Error</h3>
            <p className="text-xs font-semibold text-on-surface-variant opacity-60 mt-1">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Idle State */}
      {status === 'idle' && (
        <div className="glass-card py-24 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6 opacity-30 grayscale">
          <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl">forum</span>
          </div>
          <div className="max-w-xs">
            <p className="text-sm font-black uppercase tracking-widest leading-loose">Awaiting neural link coordinates to begin inquiry.</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {status === 'done' && result && (
        <article className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="glass-card rounded-[3rem] overflow-hidden shadow-2xl">
            {/* Context bar */}
            <div className="px-10 py-5 bg-white/[0.03] border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                  <span className="material-symbols-outlined text-sm">{docType === 'technical' ? 'code' : 'psychology'}</span>
                  {docType} SPEC
                </div>
                <div className="text-xs font-bold text-on-surface opacity-80">{selected?.program_name}</div>
              </div>
              <button
                type="button"
                onClick={() => { setStatus('idle'); setResult(null); setPrompt(''); }}
                className="w-10 h-10 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center text-on-surface-variant cursor-pointer group"
              >
                <span className="material-symbols-outlined group-hover:scale-125 transition-transform">close</span>
              </button>
            </div>

            {/* Response Area */}
            <div className="p-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="text-base text-on-surface/90 leading-relaxed font-medium whitespace-pre-wrap selection:bg-primary/30">
                {typeof responseText === 'string' ? responseText : JSON.stringify(responseText, null, 2)}
              </div>
            </div>
            
            <div className="px-10 py-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
               <div className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-30">END OF TRANSMISSION</div>
            </div>
          </div>
        </article>
      )}
    </div>
  );
}
