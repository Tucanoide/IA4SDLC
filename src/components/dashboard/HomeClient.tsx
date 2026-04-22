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

      {/* AtomD Central Navigator - Main Hero */}
      <section className="flex flex-col gap-3 relative animate-in fade-in slide-in-from-bottom-10">
        <div className="glass-card rounded-[4rem] h-[820px] relative overflow-hidden group border-primary/20 shadow-2xl shadow-primary/10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-transparent pointer-events-none"></div>
          
          {/* Subtitle / Context Overlay */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40 mb-2">Architectural Neural Map</h2>
            <div className="h-px w-12 bg-primary/20 mx-auto"></div>
          </div>

          {/* Legend Overlay */}
          <div className="absolute bottom-12 left-12 z-20 flex flex-col gap-4 text-white/20 text-[9px] uppercase tracking-[0.25em] font-bold pointer-events-none group-hover:text-white/40 transition-colors">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] inline-block"/>COMPLETE</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/50 inline-block"/>IN PROGRESS</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white/20 border border-white/20 inline-block"/>PENDING</span>
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

