'use client';
import { useRouter } from 'next/navigation';
import {
  Home, GitBranch, ShieldCheck, BarChart2,
  FileText, Languages, Network, ClipboardCheck,
  GraduationCap, Bot
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

interface SystemData {
  system: { name: string; description: string | null };
  totalPrograms: number;
  totalLines: number;
  totalDependencies?: number;
}

interface Props {
  data: SystemData | null;
  error: string | null;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000   ? n.toLocaleString()
  : n.toString();

const NAV_NODES = [
  {
    id: 1, title: "Overview", date: "HOME",
    content: "Dashboard principal. Métricas del sistema, estado de salud arquitectural y acceso rápido a todos los módulos activos.",
    category: "Navigation", icon: Home, relatedIds: [2, 10],
    status: "completed" as const, energy: 100, href: "/",
  },
  {
    id: 2, title: "Impact Explorer", date: "IMPACT",
    content: "Trazado neural de dependencias entre programas COBOL. Identifica puntos de falla en cascada antes de ejecutar cambios.",
    category: "Analysis", icon: GitBranch, relatedIds: [1, 3],
    status: "completed" as const, energy: 90, href: "/impact",
  },
  {
    id: 3, title: "Metrics", date: "METRICS",
    content: "Métricas de calidad y complejidad extraídas del análisis estático de cada programa COBOL.",
    category: "Quality", icon: ShieldCheck, relatedIds: [2, 4],
    status: "completed" as const, energy: 85, href: "/audit",
  },
  {
    id: 4, title: "Debt Analyzer", date: "CODE-AUDIT",
    content: "Cuantifica la deuda técnica arquitectural. Identifica dependencias obsoletas y nodos de entrada vulnerables.",
    category: "Analysis", icon: BarChart2, relatedIds: [3, 5],
    status: "in-progress" as const, energy: 70, href: "/code-audit",
  },
  {
    id: 5, title: "Technical Spec", date: "DOCS/TECH",
    content: "Genera documentación técnica AI-powered desde código fuente COBOL. Sintetiza estructuras, APIs y flujos de datos.",
    category: "Documentation", icon: FileText, relatedIds: [4, 6],
    status: "in-progress" as const, energy: 65, href: "/docs/technical",
  },
  {
    id: 6, title: "Functional Logic", date: "DOCS/FUNC",
    content: "Decodifica bloques COBOL en lógica semántica legible. Reverse-engineering de intención de negocio oculta.",
    category: "Documentation", icon: Languages, relatedIds: [5, 7],
    status: "in-progress" as const, energy: 60, href: "/docs/functional",
  },
  {
    id: 7, title: "Knowledge Sync", date: "SYSTEM",
    content: "Visión funcional completa del sistema. Enlace bidireccional entre el mainframe y repositorios cloud modernos.",
    category: "Integration", icon: Network, relatedIds: [6, 8],
    status: "pending" as const, energy: 45, href: "/docs/system-overview",
  },
  {
    id: 8, title: "Use Cases", date: "USE-CASES",
    content: "Casos de uso generados automáticamente desde el análisis del código. Mapeo de flujos de negocio a lógica técnica.",
    category: "Documentation", icon: ClipboardCheck, relatedIds: [7, 9],
    status: "pending" as const, energy: 35, href: "/use-cases",
  },
  {
    id: 9, title: "Onboarding", date: "TRAINING",
    content: "Módulo de capacitación contextual para nuevos desarrolladores, generado desde el codebase real del sistema.",
    category: "Training", icon: GraduationCap, relatedIds: [8, 10],
    status: "pending" as const, energy: 25, href: "/onboarding",
  },
  {
    id: 10, title: "AI Assistant", date: "DOCQUERY",
    content: "Agente forense conversacional. Consultas en lenguaje natural sobre programas, dependencias y documentación COBOL.",
    category: "AI", icon: Bot, relatedIds: [9, 1],
    status: "pending" as const, energy: 15, href: "/docquery",
  },
];

function AsciiMetric({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div className="glass-card py-3 px-5 flex flex-col gap-1 items-center text-center rounded-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
      <div className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-80">{label}</div>
      <div className="text-4xl font-black tracking-tighter text-on-surface">{value}</div>
      <div className="text-xs text-on-surface-variant font-medium">{subtext}</div>
      {/* Decorative inner glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl rounded-full -mr-12 -mt-12"></div>
    </div>
  );
}

function AsciiProgressMetric({ label, value, percent }: { label: string; value: string; percent: number }) {
  return (
    <div className="glass-card py-3 px-5 flex flex-col gap-1 items-center text-center rounded-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
      <div className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-80">{label}</div>
      <div className="text-4xl font-black tracking-tighter text-on-surface">{value}</div>
      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-primary to-secondary h-full transition-all duration-1000" 
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}


export default function HomeClient({ data, error }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto w-full">
      {/* DB error */}
      {error && (
        <div className="glass-card p-4 flex items-start space-x-3 bg-error-container/10 border-error/20 rounded-xl">
          <span className="text-error text-lg">⚠</span>
          <div>
            <p className="text-sm text-error font-bold tracking-tight">DATABASE_CONNECTION_FAILED</p>
            <p className="text-on-surface-variant text-xs mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Status Row — 4 metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto w-full">
        <AsciiMetric
          label="PROG_ANALYZED"
          value={data ? fmt(data.totalPrograms) : '—'}
          subtext="VALIDATED_OBJECTS"
        />
        <AsciiMetric
          label="TOTAL_LOC"
          value={data ? fmt(data.totalLines) : '—'}
          subtext="SEMANTIC_LINES"
        />
        <AsciiProgressMetric
          label="AUDIT_HEALTH"
          value="80%"
          percent={80}
        />
      </section>

      {/* AtomD Central Navigator */}
      <section className="flex flex-col gap-3 relative">
        {/* The Orbital Timeline is now embedded here */}
        <div className="glass-card rounded-[3rem] h-[700px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
          
          {/* Legend Overlay */}
          <div className="absolute bottom-10 left-10 z-20 flex flex-col gap-3 text-white/20 text-[9px] uppercase tracking-[0.25em] font-bold pointer-events-none group-hover:text-white/40 transition-colors">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block"/>COMPLETE</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block"/>IN PROGRESS</span>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/20 border border-white/20 inline-block"/>PENDING</span>
            </div>
          </div>

          <RadialOrbitalTimeline
            timelineData={NAV_NODES}
            onNodeNavigate={(href) => router.push(href)}
          />
        </div>
      </section>
    </div>
  );
}
