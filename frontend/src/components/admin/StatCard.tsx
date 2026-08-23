import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 block">{title}</span>
        <span className="text-2xl font-black text-slate-900 tracking-tight">{value}</span>
        {subtitle && <span className="text-[11px] text-slate-500 block">{subtitle}</span>}
      </div>
      <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ${colorMap[variant]}`}>
        {icon}
      </div>
    </div>
  );
};
