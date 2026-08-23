import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Compass, Trash2, ArrowRight, FileCheck2, AlertCircle } from 'lucide-react';
import { ApiClient } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { EligibilityModal } from '../components/eligibility/EligibilityModal';
import { Scheme } from '../types';

export const SavedSchemesPage: React.FC = () => {
  const { t, getLocalized } = useLanguage();
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchemeForEligibility, setSelectedSchemeForEligibility] = useState<Scheme | null>(null);

  const fetchSavedSchemes = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getSavedSchemes();
      if (res.success) {
        setSavedItems(res.savedSchemes);
      }
    } catch (err) {
      console.error('Failed to fetch saved schemes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedSchemes();
  }, []);

  const handleToggleSave = async (schemeId: string) => {
    try {
      await ApiClient.toggleSaveScheme(schemeId);
      setSavedItems((prev) => prev.filter((item) => item.scheme.id !== schemeId));
    } catch (err) {
      console.error('Failed to remove saved scheme:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      <div>
        <div className="flex items-center gap-2 text-gov-blue">
          <Bookmark className="w-5 h-5 fill-current" />
          <span className="text-xs uppercase font-bold tracking-wider">Bookmarked Benefits</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          {t('savedSchemesTitle')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Your shortlisted government schemes and initiatives for easy reference and tracking.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="civic-card p-6 h-64 animate-pulse bg-slate-100/70" />
          ))}
        </div>
      ) : savedItems.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-16 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-gov-blue flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Saved Schemes Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Click the bookmark icon on any scheme card to save it here for quick comparison and document preparation.
          </p>
          <Link to="/find" className="civic-btn-primary mx-auto inline-flex text-xs">
            <Compass className="w-4 h-4" />
            <span>{t('findSchemes')}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedItems.map((item) => (
            <SchemeCard
              key={item.id}
              scheme={item.scheme}
              onToggleSave={handleToggleSave}
              onCheckEligibility={(s) => setSelectedSchemeForEligibility(s)}
            />
          ))}
        </div>
      )}

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
