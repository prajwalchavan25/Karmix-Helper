import React from 'react';
import { Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface KarmixFloatingButtonProps {
  onClick: () => void;
}

export const KarmixFloatingButton: React.FC<KarmixFloatingButtonProps> = ({ onClick }) => {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className="hidden md:flex fixed bottom-6 right-6 z-40 items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-gov-navy to-gov-blue hover:from-slate-900 hover:to-gov-navy text-white rounded-full shadow-xl shadow-blue-950/25 border border-white/20 hover:scale-105 active:scale-95 transition-all duration-200 group"
      title="Ask Karmix AI Assistant"
    >
      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
        <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
      </div>
      <span className="text-xs font-bold tracking-tight">Ask Karmix AI</span>
    </button>
  );
};
