import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Compass,
  Filter,
  Layers,
  ArrowUpDown,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Scheme, SchemeCategory } from '../types';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { SchemeFilter } from '../components/schemes/SchemeFilter';
import { EligibilityModal } from '../components/eligibility/EligibilityModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const FindSchemesPage: React.FC = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || '');
  const [selectedOccupation, setSelectedOccupation] = useState(searchParams.get('occupation') || '');
  const [selectedBenefitType, setSelectedBenefitType] = useState(searchParams.get('benefitType') || '');

  // AI Semantic search status
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiDetectedFilters, setAiDetectedFilters] = useState<any>(null);

  // Eligibility Modal State
  const [selectedSchemeForEligibility, setSelectedSchemeForEligibility] = useState<Scheme | null>(null);

  // Load Categories on mount
  useEffect(() => {
    ApiClient.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  // Fetch schemes based on active filters
  const fetchSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getSchemes({
        search: searchQuery,
        category: selectedCategory,
        state: selectedState,
        level: selectedLevel,
        occupation: selectedOccupation,
        benefitType: selectedBenefitType,
      });

      if (res.success) {
        setSchemes(res.schemes);
        setTotalCount(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch schemes:', err);
    } finally {
      setLoading(false);
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedState,
    selectedLevel,
    selectedOccupation,
    selectedBenefitType,
  ]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Handle Natural Language Search via AI
  const handleAiNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsAiSearching(true);
      const res = await ApiClient.searchNaturalLanguage(searchQuery);
      if (res.success) {
        setSchemes(res.results);
        setTotalCount(res.count);
        setAiDetectedFilters(res.parsedFilters);
      }
    } catch (err) {
      console.error('Natural language search failed:', err);
      fetchSchemes();
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedState('');
    setSelectedLevel('');
    setSelectedOccupation('');
    setSelectedBenefitType('');
    setSearchQuery('');
    setAiDetectedFilters(null);
    setSearchParams({});
  };

  const handleToggleSave = async (schemeId: string) => {
    try {
      const res = await ApiClient.toggleSaveScheme(schemeId);
      if (res.success) {
        setSchemes((prev) =>
          prev.map((s) => (s.id === schemeId ? { ...s, isSaved: res.isSaved } : s))
        );
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header & Search Bar */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t('find')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Search verified Central & State government schemes, scholarships, and subsidies.
          </p>
        </div>

        {/* Natural Language Search Input */}
        <form onSubmit={handleAiNaturalSearch} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-12 pr-32 sm:pr-40 py-3.5 rounded-2xl border border-slate-300/80 bg-white text-slate-900 text-xs sm:text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-gov-blue/20 focus:border-gov-blue"
            />
            <button
              type="submit"
              disabled={isAiSearching}
              className="absolute right-2 top-2 bottom-2 px-3 sm:px-5 bg-gov-navy hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isAiSearching ? 'Parsing...' : 'Smart Search'}</span>
            </button>
          </div>
        </form>

        {/* AI Parsed Filters Notification (If any) */}
        {aiDetectedFilters && (
          <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-gov-blue flex-shrink-0" />
              <span>
                <strong>Smart AI Parsed:</strong>{' '}
                {aiDetectedFilters.occupation && `Occupation: ${aiDetectedFilters.occupation} • `}
                {aiDetectedFilters.state && `State: ${aiDetectedFilters.state} • `}
                {aiDetectedFilters.categorySlug && `Category: ${aiDetectedFilters.categorySlug} • `}
                {aiDetectedFilters.age && `Age: ${aiDetectedFilters.age} yrs`}
              </span>
            </div>
            <button
              onClick={() => {
                setAiDetectedFilters(null);
                fetchSchemes();
              }}
              className="text-gov-blue hover:underline font-semibold"
            >
              Reset to Standard Filters
            </button>
          </div>
        )}
      </div>

      {/* Filter Component */}
      <SchemeFilter
        categories={categories}
        selectedCategory={selectedCategory}
        selectedState={selectedState}
        selectedLevel={selectedLevel}
        selectedOccupation={selectedOccupation}
        selectedBenefitType={selectedBenefitType}
        onCategoryChange={setSelectedCategory}
        onStateChange={setSelectedState}
        onLevelChange={setSelectedLevel}
        onOccupationChange={setSelectedOccupation}
        onBenefitTypeChange={setSelectedBenefitType}
        onReset={handleResetFilters}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 pb-1">
        <span className="font-semibold">
          {loading ? 'Searching schemes...' : `${totalCount} ${t('schemesFound')}`}
        </span>
        <span className="text-[11px] text-slate-400">
          Updated with verified official gazettes
        </span>
      </div>

      {/* Schemes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="civic-card p-6 h-64 animate-pulse bg-slate-100/70" />
          ))}
        </div>
      ) : schemes.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">{t('noSchemesFound')}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t('tryAdjustingFilters')}
          </p>
          <button
            onClick={handleResetFilters}
            className="civic-btn-secondary mx-auto text-xs"
          >
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <SchemeCard
              key={scheme.id}
              scheme={scheme}
              onToggleSave={isAuthenticated ? handleToggleSave : undefined}
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
