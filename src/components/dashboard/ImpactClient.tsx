'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import type { ProgramEntry } from '@/lib/metrics';

// ── Types ──────────────────────────────────────────────────────────────────
interface FileAccess   { logical_name: string; physical_name: string; file_type: string; }
interface Db2Table     { table: string; schema: string; operations: string[]; }
interface SharedCopy   { copybook: string; programs: string[]; }

interface AnalysisJson {
  calling_programs: string[];
  called_programs: string[];
  copys: string[];
  file_accesses: FileAccess[];
  db2_tables: Db2Table[];
  shared_copybook_programs: SharedCopy[];
  [key: string]: unknown;
}

interface ImpactContent {
  program_name: string;
  program_description: string;
  program_functionality: string;
  calling_count: number;
  called_count: number;
  impact_risk: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  impact_rationale: string;
  analysis_json: AnalysisJson;
  generated_at: string;
}

interface Props {
  programs: ProgramEntry[];
  dbError: string | null;
}

type PageStatus = 'idle' | 'checking' | 'not_found' | 'completed' | 'error';

const RISK_CONFIG = {
  HIGH:   { color: '#ffb4ab', bg: 'bg-error/10',   border: 'border-error/30',   label: 'HIGH RISK'   },
  MEDIUM: { color: '#ffd966', bg: 'bg-warning/10',  border: 'border-warning/30', label: 'MEDIUM RISK' },
  LOW:    { color: '#a8d5a2', bg: 'bg-success/10',  border: 'border-success/30', label: 'LOW RISK'    },
};
const riskCfg = (r?: string) => RISK_CONFIG[r as keyof typeof RISK_CONFIG] ?? RISK_CONFIG.LOW;

// ── Spinner ────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ── DepList ────────────────────────────────────────────────────────────────
function DepList({ title, items, accent, icon }: { title: string; items: string[]; accent: string; icon: string }) {
  if (!items.length) return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2 px-2">
        <span className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: accent }} />
        {title} <span className="opacity-30">[0]</span>
      </h3>
      <div className="glass-card rounded-2xl p-6 text-center opacity-30">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
        <p className="text-[10px] font-black uppercase tracking-widest mt-2">Ninguno</p>
      </div>
    </div>
  );
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2 px-2">
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
        {title} <span className="opacity-30">[{items.length}]</span>
      </h3>
      <div className="glass-card rounded-2xl overflow-hidden p-1">
        <div className="max-h-52 overflow-y-auto custom-scrollbar flex flex-col gap-1 p-1">
          {items.map((item) => (
            <div key={item} className="px-4 py-2.5 rounded-xl bg-white/[0.02] flex items-center gap-3 hover:bg-white/[0.05] transition-colors group">
              <span className="material-symbols-outlined text-base opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" style={{ color: accent }}>chevron_right</span>
              <span className="text-xs font-bold text-on-surface tracking-tight font-mono">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Program Selector ───────────────────────────────────────────────────────
function ProgramSelector({ programs, selected, onSelect, disabled }: {
  programs: ProgramEntry[];
  selected: ProgramEntry | null;
  onSelect: (p: ProgramEntry) => void;
  disabled?: boolean;
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

  const choose = (p: ProgramEntry) => { onSelect(p); setOpen(false); setFilter(''); };

  return (
    <div ref={containerRef} className="relative w-80">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current?.focus(), 40); }}
        className="w-full h-11 flex items-center justify-between bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-xl px-5 text-left transition-all hover:bg-white/5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary">{selected.program_type}</span>
            <span className="text-sm font-bold text-on-surface tracking-tight truncate max-w-[160px]">{selected.program_name}</span>
          </div>
        ) : (
          <span className="text-on-surface-variant/40 text-sm font-medium">Seleccioná un programa...</span>
        )}
        <span className="material-symbols-outlined text-primary text-xl transition-transform group-hover:translate-y-0.5">expand_more</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-40 glass-card rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
          <div className="relative mb-2">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary opacity-40 text-sm">search</span>
            <input ref={inputRef} value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar..."
              className="w-full bg-white/5 rounded-xl text-xs text-on-surface placeholder-on-surface-variant/30 outline-none pl-9 py-2.5 border border-white/5 focus:border-primary/20 transition-all font-medium" />
          </div>
          <div className="overflow-y-auto max-h-64 custom-scrollbar pr-1">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-xs text-on-surface-variant opacity-50">Sin resultados</p>
            ) : filtered.map((p) => (
              <button key={p.program_name} type="button" onClick={() => choose(p)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/5 transition-all group ${selected?.program_name === p.program_name ? 'bg-primary/5' : ''}`}>
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 text-primary w-9 text-center flex-shrink-0">{p.program_type}</span>
                <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">{p.program_name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Client ────────────────────────────────────────────────────────────
export default function ImpactClient({ programs, dbError }: Props) {
  const [selected, setSelected]   = useState<ProgramEntry | null>(null);
  const [status, setStatus]       = useState<PageStatus>('idle');
  const [content, setContent]     = useState<ImpactContent | null>(null);
  const [errorMsg, setErrorMsg]   = useState('');

  const fetchContent = async (programName: string) => {
    const res = await fetch(`/api/content?content_type=impact_analysis&program_name=${programName}`);
    if (!res.ok) throw new Error(`Content fetch failed: ${res.status}`);
    return res.json() as Promise<ImpactContent>;
  };

  const checkStatus = async (programName: string): Promise<string> => {
    const res = await fetch(`/api/status?content_type=impact_analysis&program_name=${programName}`);
    if (!res.ok) return 'error';
    const data = await res.json() as { status: string };
    return data.status;
  };

  const handleSelect = async (program: ProgramEntry) => {
    setSelected(program);
    setContent(null);
    setErrorMsg('');
    setStatus('checking');
    try {
      const st = await checkStatus(program.program_name);
      if (st === 'completed') {
        const data = await fetchContent(program.program_name);
        setContent(data);
        setStatus('completed');
      } else {
        setStatus('not_found');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Error de conexión con la base de datos.');
    }
  };

  const isLoading = status === 'checking';
  const a         = content?.analysis_json;
  const risk          = riskCfg(content?.impact_risk);
  const totalLinks    = (a?.calling_programs.length ?? 0) + (a?.called_programs.length ?? 0) + (a?.copys.length ?? 0);

  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 animate-in fade-in duration-700">

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">account_tree</span>
            </div>
            <h1 className="text-4xl font-black text-on-surface tracking-tighter uppercase italic">Impact Analysis</h1>
          </div>
          <p className="text-on-surface-variant font-medium text-sm border-l-2 border-primary/20 pl-4 opacity-70">
            Análisis de dependencias, recursos y riesgo de impacto ante cambios en programas COBOL.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <ProgramSelector programs={programs} selected={selected} onSelect={handleSelect} disabled={isLoading} />
        </div>
      </header>

      {dbError && (
        <div className="glass-card p-5 border-l-4 border-error rounded-2xl flex items-center gap-4 bg-error/5">
          <span className="material-symbols-outlined text-error text-2xl">database</span>
          <p className="text-sm font-semibold text-on-surface-variant opacity-60">{dbError}</p>
        </div>
      )}

      {/* Generated date */}
      {status === 'completed' && content?.generated_at && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card self-start">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
            SYNC: {new Date(content.generated_at).toLocaleString('es-AR', { hour12: false })}
          </span>
        </div>
      )}

      {/* Idle */}
      {status === 'idle' && (
        <div className="glass-card py-32 rounded-[3rem] flex flex-col items-center justify-center text-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant opacity-20">
            <span className="material-symbols-outlined text-6xl">account_tree</span>
          </div>
          <div>
            <p className="text-xl font-black text-on-surface tracking-tight">Seleccioná un programa</p>
            <p className="text-sm text-on-surface-variant font-medium mt-1 opacity-60">Se cargará el análisis existente o podrás generarlo.</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="glass-card p-10 rounded-[2rem] flex items-center gap-6 bg-primary/5 animate-pulse">
          <Spinner />
          <div>
            <p className="text-sm font-black text-primary uppercase tracking-widest">Verificando...</p>
            <p className="text-xs font-medium text-on-surface-variant opacity-60 mt-1">Consultando base de datos.</p>
          </div>
        </div>
      )}

      {/* Not found */}
      {(status === 'not_found' || status === 'error') && selected && (
        <div className="glass-card p-12 rounded-[3rem] flex flex-col items-center text-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <div className="w-20 h-20 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-4xl">inventory_2</span>
          </div>
          <div className="max-w-md">
            <h3 className="text-2xl font-black text-on-surface tracking-tighter mb-2">Sin datos disponibles</h3>
            <p className="text-sm font-medium text-on-surface-variant opacity-70 leading-relaxed">
              No existe análisis de impacto para <span className="text-primary font-bold">{selected.program_name}</span>.
            </p>
            {errorMsg && (
              <div className="mt-4 p-3 rounded-xl bg-error/10 border border-error/20 text-[10px] font-black tracking-widest text-error uppercase">{errorMsg}</div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      {status === 'completed' && content && a && (
        <article className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">

          {/* Summary Banner */}
          <div className="glass-card rounded-[2.5rem] p-1 shadow-2xl overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center gap-8 p-10 bg-white/[0.02]">
              <div className="flex-1">
                <h2 className="text-3xl font-black text-on-surface tracking-tighter uppercase italic mb-2">{content.program_name}</h2>
                <p className="text-sm text-on-surface/70 font-medium leading-relaxed max-w-xl">{content.program_description}</p>
              </div>
              <div className="flex items-center gap-8 flex-shrink-0">
                {/* Risk Badge */}
                <div className={`flex flex-col items-center gap-2 px-6 py-4 rounded-2xl border ${risk.bg} ${risk.border}`}>
                  <span className="material-symbols-outlined text-2xl" style={{ color: risk.color }}>
                    {content.impact_risk === 'HIGH' ? 'crisis_alert' : content.impact_risk === 'MEDIUM' ? 'warning' : 'check_circle'}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: risk.color }}>{risk.label}</span>
                </div>
                <div className="w-px h-12 bg-white/5" />
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-black text-primary tracking-tighter leading-none">{content.calling_count}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-2">CALLERS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-on-surface tracking-tighter leading-none">{content.called_count}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-2">CALLEES</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-black text-on-surface tracking-tighter leading-none">{totalLinks}</div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-2">TOTAL LINKS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact Rationale */}
          {content.impact_rationale && (
            <div className={`glass-card rounded-2xl p-6 border-l-4 flex items-start gap-4 ${risk.border}`}>
              <span className="material-symbols-outlined mt-0.5 flex-shrink-0" style={{ color: risk.color }}>
                {content.impact_risk === 'HIGH' ? 'crisis_alert' : content.impact_risk === 'MEDIUM' ? 'warning' : 'check_circle'}
              </span>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">Justificación del riesgo</p>
                <p className="text-sm text-on-surface/80 font-medium leading-relaxed">{content.impact_rationale}</p>
              </div>
            </div>
          )}

          {/* Functionality */}
          {content.program_functionality && (
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant opacity-40 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">description</span>
                Funcionalidad
              </h3>
              <p className="text-sm text-on-surface/80 leading-relaxed font-medium">{content.program_functionality}</p>
            </div>
          )}

          {/* Dependencies */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-4 px-1">Dependencias de programas</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DepList title="Callers (invocantes)" items={a.calling_programs} accent="#ffb4ab" icon="call_received" />
              <DepList title="Callees (invocados)"  items={a.called_programs}  accent="#c3c0ff" icon="call_made" />
              <DepList title="Copybooks"             items={a.copys}            accent="#d1bcff" icon="library_books" />
            </div>
          </div>

          {/* File Accesses */}
          {a.file_accesses?.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">folder_open</span>
                  Archivos accedidos <span className="opacity-30">[{a.file_accesses.length}]</span>
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {a.file_accesses.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-30">folder</span>
                    <span className="text-xs font-bold text-on-surface font-mono w-40 flex-shrink-0">{f.logical_name}</span>
                    <span className="text-xs text-on-surface-variant opacity-50 flex-1 truncate font-mono">{f.physical_name}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-on-surface-variant opacity-60">{f.file_type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DB2 Tables */}
          {a.db2_tables?.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">table_chart</span>
                  Tablas DB2 <span className="opacity-30">[{a.db2_tables.length}]</span>
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {a.db2_tables.map((t, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-30">table_rows</span>
                    <span className="text-xs font-bold text-on-surface font-mono w-40 flex-shrink-0">{t.schema ? `${t.schema}.${t.table}` : t.table}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {(t.operations ?? []).map((op) => (
                        <span key={op} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-primary/10 text-primary">{op}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Copybooks */}
          {a.shared_copybook_programs?.length > 0 && (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">share</span>
                  Copybooks compartidos (impacto indirecto) <span className="opacity-30">[{a.shared_copybook_programs.length}]</span>
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {a.shared_copybook_programs.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant opacity-30 mt-0.5">library_books</span>
                    <span className="text-xs font-bold text-on-surface font-mono w-40 flex-shrink-0 pt-0.5">{s.copybook}</span>
                    <div className="flex gap-1.5 flex-wrap">
                      {(s.programs ?? []).map((p) => (
                        <span key={p} className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-on-surface-variant font-mono">{p}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </article>
      )}
    </div>
  );
}
