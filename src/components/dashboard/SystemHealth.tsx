import React from 'react';

export function SystemHealth() {
  return (
    <div className="lg:col-span-5 glass-card rounded-[2.5rem] p-8 relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 self-start mb-8 flex items-center gap-2">
        <span className="material-symbols-outlined text-sm text-primary">monitor_heart</span>
        System Health
      </h3>
      <div className="relative">
        <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 192 192">
          <circle
            className="text-surface-container-low"
            cx="96"
            cy="96"
            fill="transparent"
            r="88"
            stroke="currentColor"
            strokeWidth="8"
          ></circle>
          <circle
            className="text-secondary"
            cx="96"
            cy="96"
            fill="transparent"
            r="88"
            stroke="currentColor"
            strokeDasharray="552.92"
            strokeDashoffset="176.93"
            strokeLinecap="round"
            strokeWidth="12"
          ></circle>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-headline text-5xl font-black text-secondary">68%</span>
          <span className="font-label text-[0.7rem] uppercase tracking-widest text-secondary mt-1">
            Moderate
          </span>
        </div>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 w-full">
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">Cyclomatic</p>
          <p className="text-lg font-black text-tertiary">142.4</p>
        </div>
        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-1">Stability</p>
          <p className="text-lg font-black text-primary">Stable</p>
        </div>
      </div>
    </div>
  );
}
