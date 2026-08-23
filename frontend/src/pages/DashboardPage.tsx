import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Bookmark,
  FileCheck2,
  Calendar,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ApiClient } from '../services/api';
import { Scheme, Application } from '../types';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { EligibilityModal } from '../components/eligibility/EligibilityModal';

interface DashboardPageProps {
  onOpenAIModal?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenAIModal }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [recommendations, setRecommendations] = useState<Scheme[]>([]);
  const [savedSchemes, setSavedSchemes] = useState<any[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeForEligibility, setSelectedSchemeForEligibility] = useState<Scheme | null>(null);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greetingMorning');
    if (hour < 17) return t('greetingAfternoon');
    return t('greetingEvening');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recRes, savedRes, appRes] = await Promise.all([
        ApiClient.getRecommendations(),
        ApiClient.getSavedSchemes(),
        ApiClient.getApplications(),
      ]);

      if (recRes.success) setRecommendations(recRes.recommendations);
      if (savedRes.success) setSavedSchemes(savedRes.savedSchemes);
      if (appRes.success) setApplications(appRes.applications);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleSave = async (schemeId: string) => {
    try {
      await ApiClient.toggleSaveScheme(schemeId);
      fetchData();
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* 1. Header Greeting & Citizen Profile Meta */}
      <div className="bg-gradient-to-r from-gov-navy to-gov-blue text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
            Citizen Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {getGreeting()}, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
            {user?.profile?.occupation
              ? `Personalized benefits for ${user.profile.occupation} in ${user.profile.state || 'India'}.`
              : 'Complete your profile to unlock customized eligibility calculations and deadline reminders.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
            {user?.profile?.state && (
              <span className="bg-white/10 px-2.5 py-1 rounded-full border border-white/15 font-medium">
                📍 {user.profile.state}
              </span>
            )}
            {user?.profile?.occupation && (
              <span className="bg-white/10 px-2.5 py-1 rounded-full border border-white/15 font-medium">
                💼 {user.profile.occupation}
              </span>
            )}
            {user?.profile?.casteCategory && (
              <span className="bg-white/10 px-2.5 py-1 rounded-full border border-white/15 font-medium">
                🏷️ Category: {user.profile.casteCategory}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/profile"
            className="civic-btn-secondary bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold py-2.5"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </Link>

          {onOpenAIModal && (
            <button
              onClick={onOpenAIModal}
              className="civic-btn-primary bg-amber-400 hover:bg-amber-300 text-slate-900 border-none font-bold text-xs py-2.5 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Karmix AI</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Recommended Count */}
        <Link
          to="/find"
          className="civic-card p-5 space-y-1 hover:border-gov-blue transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Matched For You</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{recommendations.length}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-gov-blue flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-gov-blue font-semibold block pt-1">
            Explore All Schemes →
          </span>
        </Link>

        {/* Saved Schemes */}
        <Link
          to="/saved"
          className="civic-card p-5 space-y-1 hover:border-gov-blue transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Saved Schemes</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{savedSchemes.length}</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-purple-700 font-semibold block pt-1">
            View Bookmarks →
          </span>
        </Link>

        {/* Active Applications */}
        <Link
          to="/applications"
          className="civic-card p-5 space-y-1 hover:border-gov-blue transition-all"
        >
          <span className="text-xs font-semibold text-slate-500 block">Active Applications</span>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-slate-900">{applications.length}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block pt-1">
            Track Progress →
          </span>
        </Link>
      </div>

      {/* 3. Recommended For You Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {t('recommendedForYou')}
            </h2>
            <p className="text-xs text-slate-500">{t('recommendedDesc')}</p>
          </div>
          <Link
            to="/find"
            className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1"
          >
            <span>Browse More</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="civic-card p-6 h-60 animate-pulse bg-slate-100/70" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
            <p className="text-xs text-slate-500">
              No matching schemes found for your current profile filters.
            </p>
            <Link to="/find" className="civic-btn-primary mx-auto inline-flex text-xs">
              Explore All Schemes
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendations.slice(0, 6).map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onToggleSave={handleToggleSave}
                onCheckEligibility={(s) => setSelectedSchemeForEligibility(s)}
                showRecommendationReason={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Active Applications & Deadlines Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Application Tracker Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Application Pipeline</h3>
            <Link
              to="/applications"
              className="text-xs font-bold text-gov-blue hover:underline"
            >
              View Full Tracker →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 text-center space-y-2">
              <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">You are not tracking any applications yet.</p>
              <Link to="/find" className="civic-btn-secondary mx-auto inline-flex text-xs">
                Find a Scheme to Apply
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="civic-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gov-blue bg-blue-50 px-2 py-0.5 rounded">
                      {app.status}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1">
                      {app.scheme?.titleEn}
                    </h4>
                    <span className="text-[11px] text-slate-500 block">
                      Documents: {app.readyDocsCount || 0}/{app.totalDocsCount || 0} ready (
                      {app.readinessPercentage || 0}%)
                    </span>
                  </div>

                  <Link
                    to="/applications"
                    className="text-xs font-semibold text-gov-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <span>Update</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines Widget */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gov-blue" />
            <span>{t('upcomingDeadlines')}</span>
          </h3>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3">
            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">
                MahaDBT Scholarship 2026
              </span>
              <p className="text-xs font-bold text-slate-900">Application Window Closing</p>
              <p className="text-[11px] text-slate-600">Deadline: 31st March 2026</p>
            </div>

            <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase text-gov-blue tracking-wider block">
                PM-Kisan 18th Installment
              </span>
              <p className="text-xs font-bold text-slate-900">Mandatory e-KYC Verification</p>
              <p className="text-[11px] text-slate-600">Rolling Quarterly Verification</p>
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Modal */}
      {selectedSchemeForEligibility && (
        <EligibilityModal
          scheme={selectedSchemeForEligibility}
          eligibility={
            selectedSchemeForEligibility.calculatedEligibility || {
              status: 'POSSIBLY_ELIGIBLE',
              badgeColor: 'yellow',
              overallScorePercentage: 50,
              reasons: [],
              summaryEn: 'Complete your profile for a full calculation.',
              summaryMr: 'संपूर्ण विश्लेषणासाठी प्रोफाइल पूर्ण करा.',
              summaryHi: 'पूर्ण गणना के लिए प्रोफ़ाइल पूरी करें।',
              disclaimer: 'Calculated based on available scheme requirements.',
            }
          }
          onClose={() => setSelectedSchemeForEligibility(null)}
        />
      )}
    </div>
  );
};
