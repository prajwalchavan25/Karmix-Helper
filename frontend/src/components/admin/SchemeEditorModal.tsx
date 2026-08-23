import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Building, ShieldCheck, Layers, FileText } from 'lucide-react';
import { Scheme, SchemeCategory, GovernmentSource } from '../../types';
import { ApiClient } from '../../services/api';

interface SchemeEditorModalProps {
  scheme?: Scheme | null;
  categories: SchemeCategory[];
  sources: GovernmentSource[];
  onClose: () => void;
  onSaved: () => void;
}

export const SchemeEditorModal: React.FC<SchemeEditorModalProps> = ({
  scheme,
  categories,
  sources,
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'content' | 'criteria' | 'docs'>('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [titleEn, setTitleEn] = useState(scheme?.titleEn || '');
  const [titleMr, setTitleMr] = useState(scheme?.titleMr || '');
  const [titleHi, setTitleHi] = useState(scheme?.titleHi || '');
  const [slug, setSlug] = useState(scheme?.slug || '');
  const [categoryId, setCategoryId] = useState(scheme?.categoryId || categories[0]?.id || '');
  const [sourceId, setSourceId] = useState(scheme?.sourceId || sources[0]?.id || '');
  const [department, setDepartment] = useState(scheme?.department || '');
  const [level, setLevel] = useState<'CENTRAL' | 'STATE'>(scheme?.level || 'CENTRAL');
  const [state, setState] = useState(scheme?.state || 'All India');
  const [benefitType, setBenefitType] = useState(scheme?.benefitType || 'Direct Benefit Transfer');
  const [applicationUrl, setApplicationUrl] = useState(scheme?.applicationUrl || '');
  const [portalName, setPortalName] = useState(scheme?.portalName || '');
  const [applicationDeadline, setApplicationDeadline] = useState(scheme?.applicationDeadline || 'Rolling / Always Open');
  const [isPublished, setIsPublished] = useState(scheme?.isPublished !== undefined ? scheme.isPublished : true);
  const [isFeatured, setIsFeatured] = useState(scheme?.isFeatured || false);

  // Content (English, Marathi, Hindi)
  const [shortSummaryEn, setShortSummaryEn] = useState(scheme?.shortSummaryEn || '');
  const [shortSummaryMr, setShortSummaryMr] = useState(scheme?.shortSummaryMr || '');
  const [benefitsEn, setBenefitsEn] = useState(scheme?.benefitsEn || '');
  const [benefitsMr, setBenefitsMr] = useState(scheme?.benefitsMr || '');
  const [detailedDescriptionEn, setDetailedDescriptionEn] = useState(scheme?.detailedDescriptionEn || '');

  // Criteria
  const [minAge, setMinAge] = useState<string>(scheme?.eligibilityCriteria?.minAge ? String(scheme.eligibilityCriteria.minAge) : '');
  const [maxAge, setMaxAge] = useState<string>(scheme?.eligibilityCriteria?.maxAge ? String(scheme.eligibilityCriteria.maxAge) : '');
  const [allowedStates, setAllowedStates] = useState(scheme?.eligibilityCriteria?.allowedStates || 'All India');
  const [allowedOccupations, setAllowedOccupations] = useState(scheme?.eligibilityCriteria?.allowedOccupations || '');
  const [maxAnnualIncome, setMaxAnnualIncome] = useState<string>(scheme?.eligibilityCriteria?.maxAnnualIncome ? String(scheme.eligibilityCriteria.maxAnnualIncome) : '');
  const [allowedCategories, setAllowedCategories] = useState(scheme?.eligibilityCriteria?.allowedCategories || 'Any');
  const [requiresBpl, setRequiresBpl] = useState(scheme?.eligibilityCriteria?.requiresBpl || false);
  const [requiresDisability, setRequiresDisability] = useState(scheme?.eligibilityCriteria?.requiresDisability || false);

  // Auto slug generation
  const handleTitleChange = (val: string) => {
    setTitleEn(val);
    if (!scheme) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn.trim() || !applicationUrl.trim() || !categoryId) {
      setError('Title (EN), Category, and Official Application URL are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        titleEn,
        titleMr: titleMr || titleEn,
        titleHi: titleHi || titleEn,
        slug,
        categoryId,
        sourceId: sourceId || null,
        department,
        level,
        state,
        benefitType,
        applicationUrl,
        portalName: portalName || 'Official Portal',
        applicationDeadline,
        isPublished,
        isFeatured,
        shortSummaryEn,
        shortSummaryMr: shortSummaryMr || shortSummaryEn,
        shortSummaryHi: shortSummaryEn,
        detailedDescriptionEn,
        detailedDescriptionMr: shortSummaryMr || shortSummaryEn,
        detailedDescriptionHi: shortSummaryEn,
        benefitsEn,
        benefitsMr: benefitsMr || benefitsEn,
        benefitsHi: benefitsEn,
        criteria: {
          minAge: minAge ? parseInt(minAge, 10) : null,
          maxAge: maxAge ? parseInt(maxAge, 10) : null,
          allowedStates,
          allowedOccupations: allowedOccupations ? (allowedOccupations.startsWith('[') ? allowedOccupations : JSON.stringify(allowedOccupations.split(',').map((s) => s.trim()))) : 'Any',
          maxAnnualIncome: maxAnnualIncome ? parseFloat(maxAnnualIncome) : null,
          allowedCategories: allowedCategories ? (allowedCategories.startsWith('[') ? allowedCategories : JSON.stringify(allowedCategories.split(',').map((s) => s.trim()))) : 'Any',
          requiresBpl,
          requiresDisability,
        },
      };

      if (scheme) {
        await ApiClient.updateScheme(scheme.id, payload);
      } else {
        await ApiClient.createScheme(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save scheme.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {scheme ? 'Edit Government Scheme' : 'Add New Government Scheme'}
            </h3>
            <p className="text-xs text-slate-500">Official gazette verified civic record</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 my-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Tab navigation */}
        <div className="flex gap-2 border-b border-slate-200 pt-3 pb-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'basic' ? 'bg-gov-navy text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Basic & Official Source
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'content' ? 'bg-gov-navy text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Multilingual Content & Benefits
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('criteria')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              activeTab === 'criteria' ? 'bg-gov-navy text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Eligibility Criteria
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs pr-1">
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheme Title (English) *</label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. MahaDBT Post-Matric Scholarship for OBC Students"
                  className="civic-input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Slug / Unique ID *</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="civic-input font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="civic-input"
                    required
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Government Level</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="civic-input"
                  >
                    <option value="CENTRAL">Central Government</option>
                    <option value="STATE">State Government</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra, All India"
                    className="civic-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Benefit Type</label>
                  <select
                    value={benefitType}
                    onChange={(e) => setBenefitType(e.target.value)}
                    className="civic-input"
                  >
                    <option value="Direct Benefit Transfer">Direct Cash / DBT</option>
                    <option value="Subsidy">Subsidy & Grant</option>
                    <option value="Loan">Loan / Credit Guarantee</option>
                    <option value="Health Insurance">Health Insurance</option>
                    <option value="Training">Skill Training</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department / Ministry</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Social Justice & Special Assistance Department"
                  className="civic-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Application URL *</label>
                  <input
                    type="url"
                    value={applicationUrl}
                    onChange={(e) => setApplicationUrl(e.target.value)}
                    placeholder="https://mahadbt.maharashtra.gov.in"
                    className="civic-input"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Portal Name</label>
                  <input
                    type="text"
                    value={portalName}
                    onChange={(e) => setPortalName(e.target.value)}
                    placeholder="MahaDBT Official Portal"
                    className="civic-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="text"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    placeholder="e.g. 31st March 2026 or Rolling"
                    className="civic-input"
                  />
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-gov-blue"
                    />
                    <span>Published</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-gov-blue"
                    />
                    <span>Featured Scheme</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (मराठी)</label>
                <input
                  type="text"
                  value={titleMr}
                  onChange={(e) => setTitleMr(e.target.value)}
                  placeholder="उदा. महाडीबीटी मॅट्रिकोत्तर शिष्यवृत्ती"
                  className="civic-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title (हिन्दी)</label>
                <input
                  type="text"
                  value={titleHi}
                  onChange={(e) => setTitleHi(e.target.value)}
                  placeholder="उदा. महाडीबीटी पोस्ट-मैट्रिक छात्रवृत्ति"
                  className="civic-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Summary (English)</label>
                <textarea
                  value={shortSummaryEn}
                  onChange={(e) => setShortSummaryEn(e.target.value)}
                  rows={2}
                  className="civic-input resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Short Summary (मराठी)</label>
                <textarea
                  value={shortSummaryMr}
                  onChange={(e) => setShortSummaryMr(e.target.value)}
                  rows={2}
                  className="civic-input resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Benefits (English)</label>
                <textarea
                  value={benefitsEn}
                  onChange={(e) => setBenefitsEn(e.target.value)}
                  rows={2}
                  className="civic-input resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Key Benefits (मराठी)</label>
                <textarea
                  value={benefitsMr}
                  onChange={(e) => setBenefitsMr(e.target.value)}
                  rows={2}
                  className="civic-input resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Detailed Description (English)</label>
                <textarea
                  value={detailedDescriptionEn}
                  onChange={(e) => setDetailedDescriptionEn(e.target.value)}
                  rows={4}
                  className="civic-input resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'criteria' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Age (Optional)</label>
                  <input
                    type="number"
                    value={minAge}
                    onChange={(e) => setMinAge(e.target.value)}
                    placeholder="e.g. 18"
                    className="civic-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Age (Optional)</label>
                  <input
                    type="number"
                    value={maxAge}
                    onChange={(e) => setMaxAge(e.target.value)}
                    placeholder="e.g. 35"
                    className="civic-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maximum Annual Family Income (₹)</label>
                  <input
                    type="number"
                    value={maxAnnualIncome}
                    onChange={(e) => setMaxAnnualIncome(e.target.value)}
                    placeholder="e.g. 250000 (2.5 Lakhs)"
                    className="civic-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligible Occupations</label>
                  <input
                    type="text"
                    value={allowedOccupations}
                    onChange={(e) => setAllowedOccupations(e.target.value)}
                    placeholder="e.g. Student, Unemployed or Any"
                    className="civic-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligible Social Categories</label>
                  <input
                    type="text"
                    value={allowedCategories}
                    onChange={(e) => setAllowedCategories(e.target.value)}
                    placeholder="e.g. OBC, SC, ST, EWS, General or Any"
                    className="civic-input"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Eligible States</label>
                  <input
                    type="text"
                    value={allowedStates}
                    onChange={(e) => setAllowedStates(e.target.value)}
                    placeholder="Maharashtra or All India"
                    className="civic-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requiresBpl}
                    onChange={(e) => setRequiresBpl(e.target.checked)}
                    className="w-4 h-4 rounded text-gov-blue"
                  />
                  <span>Requires BPL / Priority Ration Card</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={requiresDisability}
                    onChange={(e) => setRequiresDisability(e.target.checked)}
                    className="w-4 h-4 rounded text-gov-blue"
                  />
                  <span>Exclusively for Divyang / Persons with Disability</span>
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-slate-100 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 civic-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-1/2 civic-btn-primary"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Scheme'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
