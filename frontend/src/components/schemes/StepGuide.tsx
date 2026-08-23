import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface StepGuideProps {
  stepsJson: string;
  applicationUrl: string;
  portalName: string;
}

export const StepGuide: React.FC<StepGuideProps> = ({ stepsJson, applicationUrl, portalName }) => {
  const { language, t } = useLanguage();

  let steps: string[] = [];
  try {
    steps = typeof stepsJson === 'string' ? JSON.parse(stepsJson) : stepsJson;
  } catch {
    steps = [stepsJson];
  }

  if (!steps || steps.length === 0) {
    steps = [
      'Check your eligibility conditions against the criteria.',
      'Prepare the required official certificates and bank passbook.',
      `Visit the official government portal (${portalName}).`,
      'Complete the online registration and attach required documents.',
      'Track your application reference number for status verification.',
    ];
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="font-bold text-base text-slate-900">How to Apply Step-by-Step</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Follow these structured steps to ensure error-free application on the official government portal.
        </p>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => (
          <div key={idx} className="relative flex items-start gap-4">
            <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gov-navy text-white text-xs font-bold flex items-center justify-center shadow-xs border-2 border-white">
              {idx + 1}
            </div>
            <div className="space-y-1 bg-slate-50 border border-slate-150 rounded-xl p-3.5 sm:p-4 w-full">
              <span className="text-[11px] uppercase font-bold text-gov-blue tracking-wider">
                STEP {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                {step}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
