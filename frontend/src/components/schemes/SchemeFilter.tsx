import React from 'react';
import { Filter, RotateCcw, Building2, MapPin, Briefcase, Layers, Award } from 'lucide-react';
import { SchemeCategory } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface SchemeFilterProps {
  categories: SchemeCategory[];
  selectedCategory: string;
  selectedState: string;
  selectedLevel: string;
  selectedOccupation: string;
  selectedBenefitType: string;
  onCategoryChange: (val: string) => void;
  onStateChange: (val: string) => void;
  onLevelChange: (val: string) => void;
  onOccupationChange: (val: string) => void;
  onBenefitTypeChange: (val: string) => void;
  onReset: () => void;
}

export const SchemeFilter: React.FC<SchemeFilterProps> = ({
  categories,
  selectedCategory,
  selectedState,
  selectedLevel,
  selectedOccupation,
  selectedBenefitType,
  onCategoryChange,
  onStateChange,
  onLevelChange,
  onOccupationChange,
  onBenefitTypeChange,
  onReset,
}) => {
  const { t, getLocalized } = useLanguage();

  const hasActiveFilters =
    selectedCategory ||
    selectedState ||
    selectedLevel ||
    selectedOccupation ||
    selectedBenefitType;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gov-blue" />
          <h3 className="font-bold text-sm text-slate-900">Filters & Preferences</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-medium hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{t('clearFilters')}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Category */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" />
            <span>{t('filterCategory')}</span>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="civic-input text-xs py-2"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {getLocalized(c, 'name')}
              </option>
            ))}
          </select>
        </div>

        {/* State */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span>{t('filterState')}</span>
          </label>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className="civic-input text-xs py-2"
          >
            <option value="">{t('allStates')}</option>
            <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
            <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
            <option value="Delhi">Delhi (दिल्ली)</option>
            <option value="All India">All India Schemes (केंद्रीय)</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>{t('filterLevel')}</span>
          </label>
          <select
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
            className="civic-input text-xs py-2"
          >
            <option value="">{t('allLevels')}</option>
            <option value="CENTRAL">Central Government</option>
            <option value="STATE">State Government</option>
          </select>
        </div>

        {/* Occupation */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-slate-400" />
            <span>{t('filterOccupation')}</span>
          </label>
          <select
            value={selectedOccupation}
            onChange={(e) => onOccupationChange(e.target.value)}
            className="civic-input text-xs py-2"
          >
            <option value="">{t('allOccupations')}</option>
            <option value="Student">Student (विद्यार्थी)</option>
            <option value="Farmer">Farmer (शेतकरी)</option>
            <option value="Business Owner">Business / MSME (उद्योजक)</option>
            <option value="Daily Wage">Daily Wage Worker (कामगार)</option>
            <option value="Unemployed">Unemployed Youth (बेरोजगार)</option>
            <option value="Salaried">Salaried Employee</option>
          </select>
        </div>

        {/* Benefit Type */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-slate-400" />
            <span>{t('filterBenefitType')}</span>
          </label>
          <select
            value={selectedBenefitType}
            onChange={(e) => onBenefitTypeChange(e.target.value)}
            className="civic-input text-xs py-2"
          >
            <option value="">{t('allBenefitTypes')}</option>
            <option value="Direct Benefit Transfer">Direct Cash / DBT (थेट निधी)</option>
            <option value="Subsidy">Subsidy & Concession (अनुदान)</option>
            <option value="Loan">Loan & Credit (कर्ज)</option>
            <option value="Health Insurance">Health Insurance (आरोग्य विमा)</option>
            <option value="Training">Skill Training (कौशल्य प्रशिक्षण)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
