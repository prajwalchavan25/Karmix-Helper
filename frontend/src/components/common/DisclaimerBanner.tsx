import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const DisclaimerBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>{t('statutoryDisclaimer')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-50/60 to-slate-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-blue-100/80 flex items-center justify-center text-blue-700 flex-shrink-0">
        <ShieldCheck className="w-5 h-5" />
      </div>
      <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p className="font-semibold text-slate-900 mb-0.5">Official Source & Independence Disclosure</p>
        <p>{t('statutoryDisclaimer')}</p>
      </div>
    </div>
  );
};
