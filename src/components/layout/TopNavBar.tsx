'use client';
import React, { useState, useEffect } from 'react';

export function TopNavBar({ initialMetrics }: { initialMetrics?: {totalPrograms: number, totalLines: number, health: number} }) {
  const [time, setTime] = useState('');
  const [metrics, setMetrics] = useState(initialMetrics || null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}_UTC`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);


  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? n.toLocaleString()
    : n.toString();

  return (
    <header className="glass-nav sticky top-0 z-50 flex justify-between items-center w-full px-8 h-24 border-b border-white/5 shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mr-1">
          <span className="material-symbols-outlined text-primary text-sm">hub</span>
        </div>
        <div className="text-on-surface font-black tracking-tighter text-lg">
          AtomD Navigator
          <span className="text-[10px] text-on-surface-variant ml-3 font-semibold tracking-[0.2em] uppercase opacity-40">
            ORBITAL_INTERFACE_v2
          </span>
        </div>
      </div>

      {/* Center Metrics Display */}
      <div className="hidden lg:flex items-center gap-8 bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-2 backdrop-blur-sm">
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">Programs</span>
          <span className="text-sm font-black text-on-surface">{metrics ? fmt(metrics.totalPrograms) : '—'}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">LOC</span>
          <span className="text-sm font-black text-on-surface">{metrics ? fmt(metrics.totalLines) : '—'}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-primary/50 uppercase tracking-widest">Health</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-on-surface">{metrics ? metrics.health : '—'}%</span>
            <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: metrics ? `${metrics.health}%` : '0%' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">{time}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/80"></span>
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">MAINFRAME ONLINE</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/[0.06] transition-all cursor-pointer">
          <span className="material-symbols-outlined text-lg">sync</span>
        </button>
        <button className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-white/[0.06] transition-all cursor-pointer">
          <span className="material-symbols-outlined text-lg">notifications</span>
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center ml-1 cursor-pointer hover:scale-105 transition-transform">
          <span className="text-[11px] font-black text-primary">JD</span>
        </div>
      </div>
    </header>
  );
}

