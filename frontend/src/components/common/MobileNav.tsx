import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Bookmark, FileCheck2, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileNavProps {
  onOpenAIModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAIModal }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 shadow-lg">
      <div className="flex items-center justify-around">
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/') ? 'text-gov-blue font-bold' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>{t('home')}</span>
        </Link>

        <Link
          to="/find"
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/find') ? 'text-gov-blue font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>{t('find')}</span>
        </Link>

        {/* Prominent Center AI Trigger Button */}
        {onOpenAIModal && (
          <button
            onClick={onOpenAIModal}
            className="flex flex-col items-center -mt-6 bg-gradient-to-tr from-gov-navy to-gov-blue text-white p-3 rounded-full shadow-lg shadow-blue-900/20 active:scale-95 transition-transform"
            title="Ask Karmix AI"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
          </button>
        )}

        <Link
          to={isAuthenticated ? '/saved' : '/login'}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/saved') ? 'text-gov-blue font-bold' : 'text-slate-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span>{t('saved')}</span>
        </Link>

        <Link
          to={isAuthenticated ? '/applications' : '/login'}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/applications') ? 'text-gov-blue font-bold' : 'text-slate-500'
          }`}
        >
          <FileCheck2 className="w-5 h-5" />
          <span>{t('applications')}</span>
        </Link>

        <Link
          to={isAuthenticated ? '/profile' : '/login'}
          className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive('/profile') || isActive('/login') ? 'text-gov-blue font-bold' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span>{isAuthenticated ? t('profile') : t('login')}</span>
        </Link>
      </div>
    </div>
  );
};
