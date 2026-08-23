import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Bookmark,
  FileCheck2,
  User as UserIcon,
  Globe,
  Bell,
  Sparkles,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotifications } from '../../context/NotificationContext';
import { Language } from '../../types';

interface NavbarProps {
  onOpenAIModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAIModal }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [notifMenuOpen, setNotifMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifMenuOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setLangMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gov-navy flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition-transform duration-200">
              <span className="font-bold text-lg tracking-wider text-amber-400">K</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">Karmix Helper</span>
                <span className="text-[10px] uppercase font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full">Civic AI</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block">Understand. Discover. Apply.</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/find"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive('/find')
                  ? 'bg-blue-50 text-gov-blue font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('find')}</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-gov-blue font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  {t('dashboard')}
                </Link>
                <Link
                  to="/saved"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/saved')
                      ? 'bg-blue-50 text-gov-blue font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{t('saved')}</span>
                </Link>
                <Link
                  to="/applications"
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/applications')
                      ? 'bg-blue-50 text-gov-blue font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>{t('applications')}</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-purple-600 hover:text-purple-800 hover:bg-purple-50/60'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('admin')}</span>
              </Link>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Ask AI button */}
            {onOpenAIModal && (
              <button
                onClick={onOpenAIModal}
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-gov-blue to-civic-600 hover:from-gov-navy hover:to-gov-blue text-white rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 group"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>{t('askKarmixAI')}</span>
              </button>
            )}

            {/* Language Selector Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="p-2 sm:px-3 sm:py-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-medium border border-slate-200 flex items-center gap-1.5 transition-colors"
                title="Select Language"
              >
                <Globe className="w-4 h-4 text-gov-blue" />
                <span className="hidden sm:inline">
                  {language === 'mr' ? 'मराठी' : language === 'hi' ? 'हिन्दी' : 'English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-slate-150 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <button
                    onClick={() => handleLangChange('en')}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      language === 'en' ? 'text-gov-blue font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>English</span>
                    {language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-gov-blue"></span>}
                  </button>
                  <button
                    onClick={() => handleLangChange('mr')}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      language === 'mr' ? 'text-gov-blue font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>मराठी (Marathi)</span>
                    {language === 'mr' && <span className="w-1.5 h-1.5 rounded-full bg-gov-blue"></span>}
                  </button>
                  <button
                    onClick={() => handleLangChange('hi')}
                    className={`w-full text-left px-4 py-2 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                      language === 'hi' ? 'text-gov-blue font-bold bg-blue-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>हिन्दी (Hindi)</span>
                    {language === 'hi' && <span className="w-1.5 h-1.5 rounded-full bg-gov-blue"></span>}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Dropdown (If Logged In) */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl relative transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifMenuOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-gov-blue" />
                        <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-gov-blue hover:underline flex items-center gap-1 font-medium"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-xs text-slate-500">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                              !n.isRead ? 'bg-blue-50/40 font-medium' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-slate-900">
                                {language === 'mr' ? n.titleMr : language === 'hi' ? n.titleHi : n.titleEn}
                              </p>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></span>}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                              {language === 'mr' ? n.messageMr : language === 'hi' ? n.messageHi : n.messageEn}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/80"
                >
                  <div className="w-8 h-8 rounded-lg bg-gov-navy text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium">{isAdmin ? 'Admin' : 'Citizen'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-150 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      <span>{t('profile')}</span>
                    </Link>

                    <Link
                      to="/saved"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      <span>{t('saved')}</span>
                    </Link>

                    <Link
                      to="/applications"
                      onClick={() => setUserMenuOpen(false)}
                      className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-500" />
                      <span>{t('applications')}</span>
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-medium border-t border-slate-100"
                      >
                        <Shield className="w-4 h-4 text-purple-600" />
                        <span>{t('admin')}</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {t('login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                >
                  {t('register')}
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl md:hidden"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/find"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Compass className="w-4 h-4 text-gov-blue" />
            <span>{t('find')}</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <span>{t('dashboard')}</span>
              </Link>
              <Link
                to="/saved"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Bookmark className="w-4 h-4 text-gov-blue" />
                <span>{t('saved')}</span>
              </Link>
              <Link
                to="/applications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <FileCheck2 className="w-4 h-4 text-gov-blue" />
                <span>{t('applications')}</span>
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="w-4 h-4 text-gov-blue" />
                <span>{t('profile')}</span>
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-purple-700 bg-purple-50"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>{t('admin')}</span>
                </Link>
              )}
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold border border-slate-200 text-slate-800"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl text-sm font-semibold bg-gov-navy text-white shadow-xs"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
