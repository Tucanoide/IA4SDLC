import React from 'react';

export function HardMetrics() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <div className="bg-surface-container-high p-5 border-l-2 border-primary/40 flex flex-col justify-between">
        <span className="font-label text-[0.7rem] uppercase tracking-[0.15em] text-outline">
          Total Programs
        </span>
        <div className="flex items-baseline space-x-2 mt-2">
          <span className="font-mono text-3xl font-bold text-on-surface">1,432</span>
          <span className="text-tertiary text-xs font-medium font-mono">+12</span>
        </div>
        <div className="w-full bg-surface-container-low h-1 mt-4">
          <div className="bg-primary h-full w-2/3"></div>
        </div>
      </div>
      <div className="bg-surface-container-high p-5 border-l-2 border-secondary/40 flex flex-col justify-between">
        <span className="font-label text-[0.7rem] uppercase tracking-[0.15em] text-outline">
          Lines of Code
        </span>
        <div className="flex items-baseline space-x-2 mt-2">
          <span className="font-mono text-3xl font-bold text-on-surface">4.2M</span>
          <span className="text-on-surface-variant/40 text-xs font-mono">COBOL-74</span>
        </div>
        <div className="w-full bg-surface-container-low h-1 mt-4">
          <div className="bg-secondary h-full w-4/5"></div>
        </div>
      </div>
      <div className="bg-surface-container-high p-5 border-l-2 border-error/40 flex flex-col justify-between">
        <span className="font-label text-[0.7rem] uppercase tracking-[0.15em] text-outline">
          Error Count
        </span>
        <div className="flex items-baseline space-x-2 mt-2">
          <span className="font-mono text-3xl font-bold text-error">284</span>
          <span className="text-error text-xs font-medium font-mono">▲ 4%</span>
        </div>
        <div className="w-full bg-surface-container-low h-1 mt-4">
          <div className="bg-error h-full w-1/4"></div>
        </div>
      </div>
    </section>
  );
}
