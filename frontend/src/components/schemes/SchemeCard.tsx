import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Scheme } from '../../types';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface SchemeCardProps {
  scheme: Scheme;
  onToggleSave?: (schemeId: string) => void;
  onCheckEligibility?: (scheme: Scheme) => void;
  showRecommendationReason?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onToggleSave,
  onCheckEligibility,
  showRecommendationReason = true,
}) => {
  const { language, getLocalized, t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const title = getLocalized(scheme, 'title');
  const summary = getLocalized(scheme, 'shortSummary');
  const benefits = getLocalized(scheme, 'benefits');
  const recReason = getLocalized(scheme, 'recommendationReason');
  const categoryName = getLocalized(scheme.category, 'name');

  const eligibility = scheme.calculatedEligibility;

  return (
    <div className="civic-card p-5 sm:p-6 flex flex-col justify-between relative group hover:border-slate-300">
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="blue" size="sm">
              {categoryName}
            </Badge>

            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {scheme.level === 'CENTRAL' ? 'Central Govt' : scheme.state || 'State Govt'}
            </span>

            {scheme.isFeatured && (
              <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3 text-purple-600" />}>
                Popular
              </Badge>
            )}
          </div>

          {/* Save Button */}
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(scheme.id)}
              className={`p-2 rounded-xl border transition-all ${
                scheme.isSaved
                  ? 'bg-blue-50 border-blue-200 text-gov-blue'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
              }`}
              title={scheme.isSaved ? t('savedBadge') : t('save')}
            >
              <Bookmark className={`w-4 h-4 ${scheme.isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Scheme Title */}
        <Link to={`/schemes/${scheme.slug}`} className="block group-hover:text-gov-blue transition-colors">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2">
            {title}
          </h3>
        </Link>

        {/* Department Name */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 mb-3">
          <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="truncate">{scheme.department}</span>
        </div>

        {/* Short Summary */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
          {summary}
        </p>

        {/* Quantified Benefit Highlight Box */}
        <div className="bg-gradient-to-r from-emerald-50/80 to-blue-50/40 border border-emerald-100 rounded-xl p-3 mb-4">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            Key Scheme Benefit
          </span>
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2">
            {benefits}
          </p>
        </div>

        {/* Recommendation Reason Tag ("Why am I seeing this?") */}
        {showRecommendationReason && recReason && (
          <div className="mb-4 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-slate-600">
            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="truncate">{recReason}</span>
          </div>
        )}
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-3 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs">
          {/* Eligibility Indicator */}
          {eligibility ? (
            <div className="flex items-center gap-1.5">
              {eligibility.status === 'LIKELY_ELIGIBLE' && (
                <Badge variant="green" size="sm" icon={<CheckCircle2 className="w-3 h-3 text-emerald-600" />}>
                  {t('likelyEligible')}
                </Badge>
              )}
              {eligibility.status === 'POSSIBLY_ELIGIBLE' && (
                <Badge variant="yellow" size="sm" icon={<AlertCircle className="w-3 h-3 text-amber-600" />}>
                  {t('possiblyEligible')}
                </Badge>
              )}
              {eligibility.status === 'LIKELY_NOT_ELIGIBLE' && (
                <Badge variant="red" size="sm" icon={<XCircle className="w-3 h-3 text-rose-600" />}>
                  {t('likelyNotEligible')}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-slate-500 flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{scheme.applicationDeadline || 'Rolling Deadline'}</span>
            </span>
          )}

          {/* Official Source Tag */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Official Source</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {onCheckEligibility && (
            <button
              onClick={() => onCheckEligibility(scheme)}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center gap-1"
            >
              <span>{t('checkEligibility')}</span>
            </button>
          )}

          <Link
            to={`/schemes/${scheme.slug}`}
            className={`px-3 py-2 text-xs font-semibold rounded-xl bg-gov-navy hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-1 shadow-2xs ${
              !onCheckEligibility ? 'col-span-2' : ''
            }`}
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
