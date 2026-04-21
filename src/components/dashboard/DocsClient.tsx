'use client';
import type { ProgramEntry } from '@/lib/metrics';

interface Props {
  programs: ProgramEntry[];
  dbError: string | null;
}

export default function DocsClient({ programs, dbError }: Props) {
  void programs;
  void dbError;
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto w-full pb-32 animate-in fade-in duration-700">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-2xl">auto_stories</span>
          </div>
          <h1 className="text-4xl font-black text-on-surface tracking-tighter uppercase italic">Documentation</h1>
        </div>
        <p className="text-on-surface-variant font-medium text-sm border-l-2 border-secondary/20 pl-4 opacity-70">
          Use Technical Spec or Functional Logic from the sidebar.
        </p>
      </header>
    </div>
  );
}
