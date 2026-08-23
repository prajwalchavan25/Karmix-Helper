import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  Bookmark,
  FileCheck2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  FileText,
  Clock,
  Layers,
} from 'lucide-react';
import { ApiClient } from '../services/api';
import { Scheme } from '../types';
import { Badge } from '../components/common/Badge';
import { DocumentChecklist } from '../components/schemes/DocumentChecklist';
import { StepGuide } from '../components/schemes/StepGuide';
import { EligibilityModal } from '../components/eligibility/EligibilityModal';
import { ReportModal } from '../components/common/ReportModal';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { DisclaimerBanner } from '../components/common/DisclaimerBanner';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export const SchemeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, getLocalized, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Modals
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const fetchScheme = async () => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await ApiClient.getSchemeBySlug(slug);
      if (res.success) {
        setScheme(res.scheme);
        setIsSaved(res.scheme.isSaved || false);
      }
    } catch (err) {
      console.error('Failed to load scheme details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheme();
  }, [slug]);

  const handleToggleSave = async () => {
    if (!scheme) return;
    try {
      const res = await ApiClient.toggleSaveScheme(scheme.id);
      if (res.success) {
        setIsSaved(res.isSaved);
      }
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
        <div className="h-64 bg-slate-100 rounded-3xl animate-pulse" />
        <div className="h-48 bg-slate-100 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="font-bold text-lg text-slate-900">Scheme Not Found</h3>
        <p className="text-xs text-slate-500">The requested scheme may have been updated or removed.</p>
        <Link to="/find" className="civic-btn-primary inline-flex text-xs">
          Browse All Schemes
        </Link>
      </div>
    );
  }

  const title = getLocalized(scheme, 'title');
  const summary = getLocalized(scheme, 'shortSummary');
  const detailedDesc = getLocalized(scheme, 'detailedDescription');
  const benefits = getLocalized(scheme, 'benefits');
  const categoryName = getLocalized(scheme.category, 'name');
  const importantNotes = getLocalized(scheme, 'importantNotes');

  const eligibility = scheme.calculatedEligibility;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Schemes</span>
      </button>

      {/* Main Scheme Hero Header Card */}
      <div className="civic-card p-6 sm:p-8 space-y-6 relative border-t-4 border-t-gov-navy">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="blue" size="md">
              {categoryName}
            </Badge>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
              {scheme.level === 'CENTRAL' ? 'Central Government' : scheme.state || 'State Government'}
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Official Verified Source</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                onClick={handleToggleSave}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isSaved
                    ? 'bg-blue-50 border-blue-200 text-gov-blue'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                <span>{isSaved ? t('savedBadge') : t('save')}</span>
              </button>
            )}

            <button
              onClick={() => setShowReportModal(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
              title={t('reportInformation')}
            >
              <AlertTriangle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheme Title */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{scheme.department}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Last Verified: {new Date(scheme.lastVerifiedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Deadline: {scheme.applicationDeadline || 'Rolling Application'}</span>
            </div>
          </div>
        </div>

        {/* Quantified Benefit Highlight Box */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-blue-50/40 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex items-start gap-4 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Award className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block">
              Scheme Benefit & Assistance
            </span>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {benefits}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => setShowEligibilityModal(true)}
            className="civic-btn-accent px-5 py-3 font-bold text-xs sm:text-sm shadow-md"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('checkEligibility')}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowApplicationModal(true)}
              className="civic-btn-secondary px-4 py-3 font-semibold text-xs sm:text-sm border border-slate-200"
            >
              <FileCheck2 className="w-4 h-4 text-gov-blue" />
              <span>{scheme.existingApplication ? 'Update Tracker' : t('addToTracker')}</span>
            </button>
          )}

          {scheme.applicationUrl && (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="civic-btn-primary px-5 py-3 font-bold text-xs sm:text-sm shadow-md ml-auto"
            >
              <span>{t('applyOnOfficialWebsite')}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Calculated Eligibility Card (If evaluated) */}
      {eligibility && (
        <div
          className={`p-5 sm:p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            eligibility.status === 'LIKELY_ELIGIBLE'
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : eligibility.status === 'POSSIBLY_ELIGIBLE'
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-start gap-3.5">
            {eligibility.status === 'LIKELY_ELIGIBLE' && (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 flex-shrink-0 mt-0.5" />
            )}
            {eligibility.status === 'POSSIBLY_ELIGIBLE' && (
              <AlertCircle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            {eligibility.status === 'LIKELY_NOT_ELIGIBLE' && (
              <XCircle className="w-7 h-7 text-rose-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm sm:text-base">
                  {eligibility.status === 'LIKELY_ELIGIBLE'
                    ? t('likelyEligible')
                    : eligibility.status === 'POSSIBLY_ELIGIBLE'
                    ? t('possiblyEligible')
                    : t('likelyNotEligible')}
                </h4>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-white/80 border border-current">
                  {eligibility.overallScorePercentage}% Match
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                {language === 'mr'
                  ? eligibility.summaryMr
                  : language === 'hi'
                  ? eligibility.summaryHi
                  : eligibility.summaryEn}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowEligibilityModal(true)}
            className="text-xs font-bold underline hover:no-underline flex-shrink-0"
          >
            View Criteria Details →
          </button>
        </div>
      )}

      {/* Detailed Description */}
      <div className="civic-card p-6 sm:p-8 space-y-4">
        <h3 className="font-bold text-base text-slate-900">About this Government Scheme</h3>
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3">
          <p>{detailedDesc || summary}</p>
        </div>

        {importantNotes && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-1">
            <span className="font-bold block">Important Official Note:</span>
            <p className="leading-relaxed">{importantNotes}</p>
          </div>
        )}
      </div>

      {/* Step-by-Step Guide */}
      <StepGuide
        stepsJson={scheme.applicationStepsEn}
        applicationUrl={scheme.applicationUrl}
        portalName={scheme.portalName}
      />

      {/* Document Checklist */}
      {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
        <DocumentChecklist
          documents={scheme.requiredDocuments}
          interactive={isAuthenticated}
        />
      )}

      {/* Official Government Portal Source Verification Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
          <h4 className="font-bold text-sm tracking-wide uppercase">
            Official Source Verification
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 block">Official Application Portal:</span>
            <span className="font-semibold text-white text-sm">{scheme.portalName}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Verified Domain:</span>
            <span className="font-mono text-amber-300">{scheme.source?.domain || 'Official .gov.in Portal'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Department / Ministry:</span>
            <span className="font-semibold text-white">{scheme.department}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Application Mode:</span>
            <span className="font-semibold text-white">{scheme.applicationMode} Application</span>
          </div>
        </div>

        <div className="pt-2">
          <a
            href={scheme.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="civic-btn-primary bg-blue-600 hover:bg-blue-700 text-white inline-flex text-xs font-semibold py-2.5 px-4"
          >
            <span>Proceed to {scheme.portalName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Statutory Disclaimer */}
      <DisclaimerBanner />

      {/* Modals */}
      {showEligibilityModal && (
        <EligibilityModal
          scheme={scheme}
          eligibility={
            eligibility || {
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
          onClose={() => setShowEligibilityModal(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          schemeId={scheme.id}
          schemeTitle={title}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {showApplicationModal && (
        <ApplicationModal
          scheme={scheme}
          application={scheme.existingApplication}
          onClose={() => setShowApplicationModal(false)}
          onSaved={fetchScheme}
        />
      )}
    </div>
  );
};
