import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck2,
  Calendar,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Edit3,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { Application } from '../../types';
import { Badge } from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';

interface ApplicationCardProps {
  application: Application;
  onEdit: (app: Application) => void;
  onDelete: (id: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onEdit, onDelete }) => {
  const { t, getLocalized } = useLanguage();
  const scheme = application.scheme;

  const title = getLocalized(scheme, 'title');
  const benefits = getLocalized(scheme, 'benefits');

  const statusConfig: Record<string, { labelKey: string; variant: 'slate' | 'yellow' | 'blue' | 'green' | 'red' | 'purple' }> = {
    INTERESTED: { labelKey: 'statusInterested', variant: 'slate' },
    DOCUMENTS_PENDING: { labelKey: 'statusDocsPending', variant: 'yellow' },
    READY_TO_APPLY: { labelKey: 'statusReadyToApply', variant: 'blue' },
    APPLIED: { labelKey: 'statusApplied', variant: 'purple' },
    UNDER_REVIEW: { labelKey: 'statusUnderReview', variant: 'yellow' },
    APPROVED: { labelKey: 'statusApproved', variant: 'green' },
    REJECTED: { labelKey: 'statusRejected', variant: 'red' },
    COMPLETED: { labelKey: 'statusCompleted', variant: 'green' },
  };

  const currentStatus = statusConfig[application.status] || {
    labelKey: application.status,
    variant: 'blue',
  };

  const readiness = application.readinessPercentage || 0;

  return (
    <div className="civic-card p-5 sm:p-6 flex flex-col justify-between hover:border-slate-300 relative group">
      <div>
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <Badge variant={currentStatus.variant} size="md">
            {t(currentStatus.labelKey)}
          </Badge>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(application)}
              className="p-1.5 text-slate-400 hover:text-gov-blue hover:bg-slate-100 rounded-lg transition-colors"
              title="Edit Application Notes & Status"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(application.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete from Tracker"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scheme Title */}
        <Link to={`/schemes/${scheme.slug}`} className="block group-hover:text-gov-blue transition-colors mb-1">
          <h3 className="text-base font-bold text-slate-900 leading-snug">{title}</h3>
        </Link>
        <p className="text-xs text-slate-500 mb-3">{scheme.department}</p>

        {/* Reference Number If available */}
        {application.referenceNumber ? (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 mb-3 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Application Ref:</span>
            <span className="font-mono font-bold text-slate-800">{application.referenceNumber}</span>
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 italic mb-3">
            No application reference number added yet.
          </div>
        )}

        {/* Document Readiness Bar */}
        <div className="mb-4 bg-blue-50/50 border border-blue-100 rounded-xl p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700">Document Readiness:</span>
            <span className="font-bold text-gov-blue">
              {application.readyDocsCount || 0}/{application.totalDocsCount || 0} ({readiness}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                readiness === 100 ? 'bg-emerald-500' : 'bg-gov-blue'
              }`}
              style={{ width: `${readiness}%` }}
            />
          </div>
        </div>

        {/* Personal Notes */}
        {application.notes && (
          <div className="text-xs text-slate-600 bg-amber-50/40 border border-amber-100 rounded-xl p-3 mb-3">
            <span className="font-semibold text-amber-900 block mb-0.5">Notes:</span>
            <p className="line-clamp-2 leading-relaxed">{application.notes}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <Link
          to={`/schemes/${scheme.slug}`}
          className="text-xs font-semibold text-gov-blue hover:underline flex items-center gap-1 justify-center sm:justify-start py-1"
        >
          <span>View Full Guide & Checklist</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {scheme.applicationUrl && (
          <a
            href={scheme.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-gov-navy hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span>Official Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
