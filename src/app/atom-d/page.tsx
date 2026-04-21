"use client";

import { useRouter } from "next/navigation";
import {
  Home, GitBranch, ShieldCheck, BarChart2,
  FileText, Languages, Network, ClipboardCheck,
  GraduationCap, Bot, Atom,
} from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

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

export default function AtomDPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5 bg-gradient-to-b from-black via-black/60 to-transparent pointer-events-none">
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 via-blue-500 to-teal-400 flex items-center justify-center shadow-[0_0_24px_rgba(139,92,246,0.5)]">
            <Atom size={18} className="text-white" />
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tighter leading-none">AtomD</div>
            <div className="text-white/25 text-[9px] uppercase tracking-[0.35em] font-bold mt-0.5">Orbital Navigator · {NAV_NODES.length} nodes</div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all cursor-pointer backdrop-blur-sm"
        >
          ← EXIT
        </button>
      </div>

      {/* ── Legend ─────────────────────────────────────────────── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 text-white/20 text-[9px] uppercase tracking-[0.25em] font-bold pointer-events-none">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white inline-block"/>Complete</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block"/>In Progress</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-white/20 border border-white/20 inline-block"/>Pending</span>
        <span>·</span>
        <span className="animate-pulse">Click node → Explore · Click card → Enter module</span>
      </div>

      {/* ── Orbital Timeline ────────────────────────────────────── */}
      <RadialOrbitalTimeline
        timelineData={NAV_NODES}
        onNodeNavigate={(href) => router.push(href)}
      />
    </div>
  );
}
