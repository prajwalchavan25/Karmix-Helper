import React, { useState } from 'react';
import { X, FileCheck2, Save, Calendar, FileText } from 'lucide-react';
import { Application, Scheme } from '../../types';
import { ApiClient } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface ApplicationModalProps {
  application?: Application | null;
  scheme?: Scheme | null;
  onClose: () => void;
  onSaved: () => void;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  scheme,
  onClose,
  onSaved,
}) => {
  const { t, getLocalized } = useLanguage();

  const [status, setStatus] = useState(application?.status || 'INTERESTED');
  const [referenceNumber, setReferenceNumber] = useState(application?.referenceNumber || '');
  const [appliedDate, setAppliedDate] = useState(
    application?.appliedDate ? new Date(application.appliedDate).toISOString().split('T')[0] : ''
  );
  const [deadlineDate, setDeadlineDate] = useState(
    application?.deadlineDate ? new Date(application.deadlineDate).toISOString().split('T')[0] : ''
  );
  const [notes, setNotes] = useState(application?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const schemeTitle = scheme
    ? getLocalized(scheme, 'title')
    : application?.scheme
    ? getLocalized(application.scheme, 'title')
    : 'Government Scheme';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      if (application) {
        // Update
        await ApiClient.updateApplication(application.id, {
          status,
          referenceNumber,
          appliedDate: appliedDate || null,
          deadlineDate: deadlineDate || null,
          notes,
        });
      } else if (scheme) {
        // Create
        await ApiClient.createApplication({
          schemeId: scheme.id,
          status,
          referenceNumber,
          deadlineDate: deadlineDate || null,
          notes,
        });
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save application entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-blue-100/80 text-gov-blue flex items-center justify-center flex-shrink-0">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-snug">
              {application ? 'Update Application Tracker' : 'Track New Application'}
            </h3>
            <p className="text-xs text-slate-500 truncate max-w-sm">{schemeTitle}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Application Stage
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="civic-input"
            >
              <option value="INTERESTED">{t('statusInterested')}</option>
              <option value="DOCUMENTS_PENDING">{t('statusDocsPending')}</option>
              <option value="READY_TO_APPLY">{t('statusReadyToApply')}</option>
              <option value="APPLIED">{t('statusApplied')}</option>
              <option value="UNDER_REVIEW">{t('statusUnderReview')}</option>
              <option value="APPROVED">{t('statusApproved')}</option>
              <option value="REJECTED">{t('statusRejected')}</option>
              <option value="COMPLETED">{t('statusCompleted')}</option>
            </select>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Application / Acknowledgment Number (Optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. MH-DBT-2026-98124 or Portal Ref ID"
              className="civic-input font-mono"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applied Date (Optional)
              </label>
              <input
                type="date"
                value={appliedDate}
                onChange={(e) => setAppliedDate(e.target.value)}
                className="civic-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Deadline Date (Optional)
              </label>
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="civic-input"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Personal Notes / Pending Requirements
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Awaiting Tehsildar income certificate renewal before final biometric auth..."
              rows={3}
              className="civic-input resize-none"
            />
          </div>

          <div className="flex gap-2 pt-3">
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
              <span>{loading ? 'Saving...' : 'Save to Tracker'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
