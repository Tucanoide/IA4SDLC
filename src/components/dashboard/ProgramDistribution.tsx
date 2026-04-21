import React from 'react';

export function ProgramDistribution() {
  return (
    <div className="lg:col-span-7 glass-card rounded-[2.5rem] p-8">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm text-secondary">donut_large</span>
          Program Type Distribution
        </h3>
        <span className="material-symbols-outlined text-outline cursor-pointer">
          more_horiz
        </span>
      </div>
      <div className="flex items-center justify-around h-64">
        <div className="relative w-48 h-48-full border-[12px] border-surface-container-low flex items-center justify-center">
          <div className="absolute inset-0-full border-[12px] border-primary border-t-transparent border-r-transparent transform -rotate-45"></div>
          <div className="absolute inset-0-full border-[12px] border-tertiary border-b-transparent border-l-transparent transform rotate-12"></div>
          <div className="text-center">
            <span className="block font-mono text-2xl font-bold">5.2k</span>
            <span className="font-label text-[0.6rem] uppercase tracking-tighter text-outline">
              Modules
            </span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary-sm"></div>
            <div>
              <p className="text-xs font-bold text-on-surface">Batch Processing</p>
              <p className="font-mono text-[0.65rem] text-outline">2,841 Units (54%)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-tertiary-sm"></div>
            <div>
              <p className="text-xs font-bold text-on-surface">CICS Transaction</p>
              <p className="font-mono text-[0.65rem] text-outline">1,204 Units (23%)</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-secondary-sm"></div>
            <div>
              <p className="text-xs font-bold text-on-surface">Database IO</p>
              <p className="font-mono text-[0.65rem] text-outline">892 Units (17%)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
