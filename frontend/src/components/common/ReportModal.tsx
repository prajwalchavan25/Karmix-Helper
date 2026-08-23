import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

interface ReportModalProps {
  schemeId: string;
  schemeTitle: string;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ schemeId, schemeTitle, onClose }) => {
  const { t } = useLanguage();
  const [issueType, setIssueType] = useState('INCORRECT_ELIGIBILITY');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a brief description of the issue.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await ApiClient.submitReport({
        schemeId,
        issueType,
        description,
        userEmail,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Report Scheme Information</h3>
            <p className="text-xs text-slate-500 truncate max-w-[280px]">{schemeTitle}</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Report Submitted</h4>
            <p className="text-xs text-slate-600">
              Thank you! Our civic team will verify this against official government portals.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Type of Issue
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="civic-input"
              >
                <option value="INCORRECT_ELIGIBILITY">Incorrect Eligibility Criteria</option>
                <option value="OUTDATED_DEADLINE">Outdated Application Deadline</option>
                <option value="WRONG_DOCUMENT">Wrong Document Requirement</option>
                <option value="BROKEN_LINK">Broken Official Portal Link</option>
                <option value="SCHEME_CLOSED">Scheme Discontinued / Closed</option>
                <option value="TRANSLATION_ISSUE">Translation or Language Error</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Details / Official Source Reference
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what information is inaccurate and mention the official update if known..."
                rows={3}
                className="civic-input resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Email (Optional, for resolution updates)
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="civic-input"
              />
            </div>

            <div className="flex gap-2 pt-2">
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
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
