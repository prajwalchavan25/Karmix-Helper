import React, { useState, useEffect } from 'react';
import { User, Save, ShieldCheck, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserProfile, Language } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [prefLang, setPrefLang] = useState<Language>(user?.preferredLanguage || 'en');

  // Profile fields
  const [age, setAge] = useState<string>(user?.profile?.age ? String(user.profile.age) : '');
  const [gender, setGender] = useState(user?.profile?.gender || 'Male');
  const [state, setState] = useState(user?.profile?.state || 'Maharashtra');
  const [district, setDistrict] = useState(user?.profile?.district || 'Pune');
  const [areaType, setAreaType] = useState(user?.profile?.areaType || 'Urban');
  const [occupation, setOccupation] = useState(user?.profile?.occupation || 'Student');
  const [education, setEducation] = useState(user?.profile?.education || 'Undergraduate');
  const [incomeRange, setIncomeRange] = useState(user?.profile?.incomeRange || '1L - 2.5L');
  const [casteCategory, setCasteCategory] = useState(user?.profile?.casteCategory || 'OBC');
  const [rationCardType, setRationCardType] = useState(user?.profile?.rationCardType || 'Orange (AAY)');
  const [isBpl, setIsBpl] = useState(user?.profile?.isBpl || false);
  const [isDisability, setIsDisability] = useState(user?.profile?.isDisability || false);
  const [landHoldingAcres, setLandHoldingAcres] = useState<string>(
    user?.profile?.landHoldingAcres ? String(user.profile.landHoldingAcres) : ''
  );

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setPrefLang(user.preferredLanguage);
      if (user.profile) {
        setAge(user.profile.age ? String(user.profile.age) : '');
        setGender(user.profile.gender || 'Male');
        setState(user.profile.state || 'Maharashtra');
        setDistrict(user.profile.district || 'Pune');
        setAreaType(user.profile.areaType || 'Urban');
        setOccupation(user.profile.occupation || 'Student');
        setEducation(user.profile.education || 'Undergraduate');
        setIncomeRange(user.profile.incomeRange || '1L - 2.5L');
        setCasteCategory(user.profile.casteCategory || 'OBC');
        setRationCardType(user.profile.rationCardType || 'Orange (AAY)');
        setIsBpl(user.profile.isBpl || false);
        setIsDisability(user.profile.isDisability || false);
        setLandHoldingAcres(user.profile.landHoldingAcres ? String(user.profile.landHoldingAcres) : '');
      }
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const profilePayload: Partial<UserProfile> = {
        age: age ? parseInt(age, 10) : null,
        gender,
        state,
        district,
        areaType,
        occupation,
        education,
        incomeRange,
        casteCategory,
        rationCardType,
        isBpl,
        isDisability,
        landHoldingAcres: landHoldingAcres ? parseFloat(landHoldingAcres) : null,
      };

      await updateProfile(profilePayload, { name, phone });
      setLanguage(prefLang);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-gov-blue">
          <User className="w-5 h-5" />
          <span className="text-xs uppercase font-bold tracking-wider">Citizen Profile</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
          {t('profile')} & Eligibility Parameters
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          This information is used strictly to compute tailored scheme recommendations and calculate indicative eligibility.
        </p>
      </div>

      {/* Privacy Notice Banner */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-gov-blue flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900">Privacy & Data Minimization:</span>
          <p className="leading-relaxed">
            We only collect standard eligibility attributes (age, district, income range) to cross-reference with official criteria. Karmix Helper never requests Aadhaar OTPs or bank security PINs.
          </p>
        </div>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Profile updated successfully! Your scheme recommendations have been recalculated.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Personal Details */}
        <div className="civic-card p-6 sm:p-7 space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            1. Basic Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="civic-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 00000"
                className="civic-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as any)}
                className="civic-input"
              >
                <option value="en">English</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="hi">हिन्दी (Hindi)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Account Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="civic-input bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Location & Demographics */}
        <div className="civic-card p-6 sm:p-7 space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            2. Location & Demographics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age (in years)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 20"
                className="civic-input"
                min="0"
                max="120"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="civic-input"
              >
                <option value="Male">Male (पुरुष)</option>
                <option value="Female">Female (स्त्री / महिला)</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Area Type</label>
              <select
                value={areaType}
                onChange={(e) => setAreaType(e.target.value)}
                className="civic-input"
              >
                <option value="Urban">Urban (शहरी)</option>
                <option value="Rural">Rural (ग्रामीण)</option>
                <option value="Semi-Urban">Semi-Urban (निमशहरी)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / UT</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="civic-input"
              >
                <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                <option value="Delhi">Delhi (दिल्ली)</option>
                <option value="All India">Other States</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Pune, Mumbai, Nagpur"
                className="civic-input"
              />
            </div>
          </div>
        </div>

        {/* Socio-Economic & Occupation */}
        <div className="civic-card p-6 sm:p-7 space-y-4">
          <h3 className="font-bold text-base text-slate-900 pb-2 border-b border-slate-100">
            3. Occupation & Socio-Economic Status
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Occupation</label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="civic-input"
              >
                <option value="Student">Student (विद्यार्थी)</option>
                <option value="Farmer">Farmer (शेतकरी)</option>
                <option value="Business Owner">Business Owner / MSME (उद्योजक)</option>
                <option value="Daily Wage">Daily Wage Worker (कामगार)</option>
                <option value="Unemployed">Unemployed Youth (बेरोजगार)</option>
                <option value="Salaried">Salaried Private/Govt Employee</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Education Level</label>
              <select
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="civic-input"
              >
                <option value="Below 10th">Below 10th Standard</option>
                <option value="10th Pass">10th Pass (SSC)</option>
                <option value="12th Pass">12th Pass (HSC)</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="Undergraduate">Undergraduate (Degree)</option>
                <option value="Post Graduate">Post Graduate / Master's</option>
                <option value="Doctorate">Doctorate (Ph.D.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Annual Household Income Bracket
              </label>
              <select
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                className="civic-input"
              >
                <option value="Below 1L">Below ₹1,00,000 (Below 1 Lakh)</option>
                <option value="1L - 2.5L">₹1,00,000 - ₹2,50,000 (1L - 2.5L)</option>
                <option value="2.5L - 5L">₹2,50,000 - ₹5,00,000 (2.5L - 5L)</option>
                <option value="5L - 8L">₹5,00,000 - ₹8,00,000 (5L - 8L)</option>
                <option value="Above 8L">Above ₹8,00,000 (Above 8 Lakhs)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category (Caste)</label>
              <select
                value={casteCategory}
                onChange={(e) => setCasteCategory(e.target.value)}
                className="civic-input"
              >
                <option value="General">General / Open</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="VJNT">VJNT / SBC (Special Backward Category)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ration Card Type</label>
              <select
                value={rationCardType}
                onChange={(e) => setRationCardType(e.target.value)}
                className="civic-input"
              >
                <option value="Yellow (BPL)">Yellow Card (BPL / Antyodaya)</option>
                <option value="Orange (AAY)">Orange Card (Priority Household)</option>
                <option value="White (APL)">White Card (APL / Non-BPL)</option>
                <option value="None">No Ration Card</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agricultural Land Holding (Acres)
              </label>
              <input
                type="number"
                step="0.1"
                value={landHoldingAcres}
                onChange={(e) => setLandHoldingAcres(e.target.value)}
                placeholder="e.g. 2.5 (if farmer)"
                className="civic-input"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={isDisability}
                onChange={(e) => setIsDisability(e.target.checked)}
                className="w-4 h-4 rounded text-gov-blue"
              />
              <span>Divyang / Person with Benchmark Disability (PwD)</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="civic-btn-primary px-8 py-3 font-bold text-sm shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving Profile...' : 'Save Profile & Recalculate'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
