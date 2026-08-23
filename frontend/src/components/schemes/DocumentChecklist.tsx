import React, { useState } from 'react';
import { FileCheck, CheckCircle2, Clock, Ban, Building } from 'lucide-react';
import { RequiredDocument } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface DocumentChecklistProps {
  documents: RequiredDocument[];
  initialProgress?: Record<string, 'READY' | 'MISSING' | 'NA'>;
  onProgressChange?: (docId: string, status: 'READY' | 'MISSING' | 'NA') => void;
  interactive?: boolean;
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({
  documents,
  initialProgress = {},
  onProgressChange,
  interactive = true,
}) => {
  const { t, getLocalized } = useLanguage();
  const [progress, setProgress] = useState<Record<string, 'READY' | 'MISSING' | 'NA'>>(() => {
    const init: Record<string, 'READY' | 'MISSING' | 'NA'> = { ...initialProgress };
    documents.forEach((d) => {
      if (!init[d.id]) {
        init[d.id] = 'MISSING';
      }
    });
    return init;
  });

  const handleStatusChange = (docId: string, status: 'READY' | 'MISSING' | 'NA') => {
    if (!interactive) return;
    const updated = { ...progress, [docId]: status };
    setProgress(updated);
    if (onProgressChange) {
      onProgressChange(docId, status);
    }
  };

  const total = documents.length;
  const readyCount = documents.filter((d) => progress[d.id] === 'READY' || progress[d.id] === 'NA').length;
  const percentage = total > 0 ? Math.round((readyCount / total) * 100) : 100;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header & Progress Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-gov-blue" />
            <h3 className="font-bold text-base text-slate-900">{t('requiredDocuments')}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified official certificates required for this scheme application.
          </p>
        </div>

        <div className="flex flex-col sm:items-end">
          <span className="text-xs font-bold text-slate-800">
            {readyCount} of {total} {t('documentsReady')} ({percentage}%)
          </span>
          <div className="w-full sm:w-36 h-2 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentage === 100
                  ? 'bg-emerald-500'
                  : percentage >= 50
                  ? 'bg-gov-blue'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Document Items List */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const docName = getLocalized(doc, 'name');
          const docDesc = getLocalized(doc, 'description');
          const currentStatus = progress[doc.id] || 'MISSING';

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-xl border transition-all ${
                currentStatus === 'READY'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : currentStatus === 'NA'
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{docName}</span>
                    {doc.isMandatory ? (
                      <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Optional
                      </span>
                    )}
                  </div>
                  {docDesc && <p className="text-xs text-slate-600 leading-relaxed">{docDesc}</p>}
                  {doc.issuanceAuthority && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium pt-0.5">
                      <Building className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>Issuing Office: {doc.issuanceAuthority}</span>
                    </div>
                  )}
                </div>

                {/* Status Toggle Buttons */}
                {interactive && (
                  <div className="flex items-center gap-1.5 self-start sm:self-center flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(doc.id, 'READY')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'READY'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('markReady')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(doc.id, 'MISSING')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'MISSING'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{t('markMissing')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStatusChange(doc.id, 'NA')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                        currentStatus === 'NA'
                          ? 'bg-slate-700 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      <span>{t('markNA')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
