import React from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Scheme, EligibilityEvaluationResult } from '../../types';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface EligibilityModalProps {
  scheme: Scheme;
  eligibility: EligibilityEvaluationResult;
  onClose: () => void;
}

export const EligibilityModal: React.FC<EligibilityModalProps> = ({ scheme, eligibility, onClose }) => {
  const { t, getLocalized, language } = useLanguage();
  const { isAuthenticated } = useAuth();

  const title = getLocalized(scheme, 'title');
  const summary =
    language === 'mr'
      ? eligibility.summaryMr
      : language === 'hi'
      ? eligibility.summaryHi
      : eligibility.summaryEn;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-gov-blue flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-gov-blue" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              AI Eligibility Assessment
            </span>
            <h3 className="font-bold text-lg text-slate-900 leading-snug">{title}</h3>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-2xl border mb-6 flex items-center justify-between gap-4 ${
            eligibility.status === 'LIKELY_ELIGIBLE'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : eligibility.status === 'POSSIBLY_ELIGIBLE'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            {eligibility.status === 'LIKELY_ELIGIBLE' && (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" />
            )}
            {eligibility.status === 'POSSIBLY_ELIGIBLE' && (
              <AlertCircle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            )}
            {eligibility.status === 'LIKELY_NOT_ELIGIBLE' && (
              <XCircle className="w-8 h-8 text-rose-600 flex-shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm sm:text-base">
                {eligibility.status === 'LIKELY_ELIGIBLE'
                  ? t('likelyEligible')
                  : eligibility.status === 'POSSIBLY_ELIGIBLE'
                  ? t('possiblyEligible')
                  : t('likelyNotEligible')}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">{summary}</p>
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-2xl font-black text-slate-900">
              {eligibility.overallScorePercentage}%
            </span>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Match</span>
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            {t('criteriaBreakdown')}
          </h4>

          {eligibility.reasons.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-2">
              No restrictive criteria specified for this general civic scheme.
            </p>
          ) : (
            eligibility.reasons.map((crit, idx) => {
              const critName =
                language === 'mr'
                  ? crit.criterionNameMr
                  : language === 'hi'
                  ? crit.criterionNameHi
                  : crit.criterionNameEn;

              const reason =
                language === 'mr'
                  ? crit.reasonMr
                  : language === 'hi'
                  ? crit.reasonHi
                  : crit.reasonEn;

              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 bg-white flex items-start gap-3 text-xs"
                >
                  <div className="mt-0.5">
                    {crit.status === 'PASSED' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                    {crit.status === 'UNKNOWN' && (
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                    )}
                    {crit.status === 'FAILED' && (
                      <XCircle className="w-4 h-4 text-rose-600" />
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{critName}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          crit.status === 'PASSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : crit.status === 'UNKNOWN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {crit.status === 'PASSED'
                          ? 'Passed'
                          : crit.status === 'UNKNOWN'
                          ? 'Needs Info'
                          : 'Not Met'}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">{reason}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Disclaimer Strip */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 mb-6 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p>{t('statutoryDisclaimer')}</p>
        </div>

        {/* Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {!isAuthenticated ? (
            <Link
              to="/register"
              onClick={onClose}
              className="text-xs text-gov-blue hover:underline font-semibold flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4" />
              <span>Create profile for 100% personalized checks</span>
            </Link>
          ) : (
            <Link
              to="/profile"
              onClick={onClose}
              className="text-xs text-gov-blue hover:underline font-semibold"
            >
              Update your citizen profile
            </Link>
          )}

          <Link
            to={`/schemes/${scheme.slug}`}
            onClick={onClose}
            className="w-full sm:w-auto civic-btn-primary text-xs"
          >
            <span>{t('viewDetails')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
