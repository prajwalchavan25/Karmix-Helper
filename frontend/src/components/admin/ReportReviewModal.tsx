import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { ReportItem } from '../../types';
import { ApiClient } from '../../services/api';

interface ReportReviewModalProps {
  report: ReportItem;
  onClose: () => void;
  onUpdated: () => void;
}

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({ report, onClose, onUpdated }) => {
  const [status, setStatus] = useState(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await ApiClient.updateReportStatus(report.id, {
        status,
        adminNotes,
      });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update report.');
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
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900">Review Citizen Report</h3>
            <p className="text-xs text-slate-500 truncate max-w-sm">{report.scheme?.titleEn}</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6 text-xs">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Issue Category:</span>
              <span className="font-bold text-slate-900">{report.issueType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Reported By:</span>
              <span className="text-slate-800">{report.user?.name || report.userEmail || 'Anonymous'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Report Date:</span>
              <span className="text-slate-800">{new Date(report.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <span className="font-semibold text-slate-700 block mb-1">Citizen's Feedback:</span>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-slate-800 leading-relaxed font-medium">
              {report.description}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="civic-input"
            >
              <option value="PENDING">Pending Review</option>
              <option value="INVESTIGATING">Investigating / Cross-Referencing</option>
              <option value="RESOLVED">Resolved / Information Updated</option>
              <option value="REJECTED">Rejected / Invalid Claim</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Admin Notes / Action Taken
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g., Verified against official gazette notification dated 15th Aug. Updated criteria and notified user."
              rows={3}
              className="civic-input resize-none"
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
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Update Status'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
