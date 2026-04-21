import React from 'react';

const mockRankings = [
  {
    id: 'PAYROLL_MAIN_PROC',
    criticality: 'CRITICAL',
    criticalityColor: 'error',
    complexity: 4812,
    complexityPercent: 90,
    statusColor: 'error',
    statusText: 'Emergency Action Required',
  },
  {
    id: 'TX_AUDIT_LEDGER_74',
    criticality: 'HIGH RISK',
    criticalityColor: 'secondary',
    complexity: 3120,
    complexityPercent: 65,
    statusColor: 'secondary',
    statusText: 'Refactor Pending',
  },
  {
    id: 'USER_SESSION_VALID',
    criticality: 'LOW RISK',
    criticalityColor: 'tertiary',
    complexity: 412,
    complexityPercent: 15,
    statusColor: 'tertiary',
    statusText: 'Optimized',
  },
  {
    id: 'MVS_JOB_SCHEDULER',
    criticality: 'HIGH RISK',
    criticalityColor: 'secondary',
    complexity: 2891,
    complexityPercent: 60,
    statusColor: 'secondary',
    statusText: 'Queued',
  },
];

export function ChaosRanking() {
  return (
    <section className="glass-card rounded-[2.5rem] overflow-hidden">
      <div className="p-8 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-error">crisis_alert</span>
            Chaos Ranking
          </h3>
          <p className="text-xs font-medium text-on-surface-variant opacity-50 mt-2">
            Top critical legacy assets requiring refactor attention
          </p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-surface-container-high px-3 py-1.5 text-[0.7rem] font-bold text-on-surface-variant flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-xs">filter_list</span>
            <span>Filter</span>
          </button>
          <button className="bg-surface-container-high px-3 py-1.5 text-[0.7rem] font-bold text-on-surface-variant flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined text-xs">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="font-label text-[0.65rem] uppercase tracking-widest text-outline border-b border-outline-variant/5">
              <th className="px-6 py-4 font-medium">Program ID</th>
              <th className="px-6 py-4 font-medium">Criticality</th>
              <th className="px-6 py-4 font-medium">Complexity</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[0.8rem]">
            {mockRankings.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-surface-container-high transition-colors group cursor-pointer"
              >
                <td className="px-6 py-5 text-on-surface font-bold">{row.id}</td>
                <td className="px-6 py-5">
                  <span
                    className={`text-${row.criticalityColor} bg-${row.criticalityColor}/10 px-2 py-0.5 text-[0.7rem]`}
                  >
                    {row.criticality}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <span className="text-on-surface">{row.complexity.toLocaleString()}</span>
                    <div className="w-16 h-1 bg-surface-container-lowest-full overflow-hidden">
                      <div
                        className={`h-full bg-${row.criticalityColor}`}
                        style={{ width: `${row.complexityPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2.5 h-2.5-full bg-${row.statusColor} ${
                        row.statusColor === 'error' ? 'shadow-[0_0_8px_rgba(255,180,171,0.6)]' : ''
                      }`}
                    ></div>
                    <span className="text-[0.7rem] uppercase tracking-tighter text-outline-variant">
                      {row.statusText}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
                    open_in_new
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-surface-container-lowest flex justify-between items-center text-[0.65rem] font-label text-outline uppercase tracking-wider">
        <span>Showing 1-4 of 1,432 entries</span>
        <div className="flex space-x-4">
          <button className="hover:text-primary transition-colors cursor-pointer">Previous</button>
          <button className="hover:text-primary transition-colors cursor-pointer">Next</button>
        </div>
      </div>
    </section>
  );
}
