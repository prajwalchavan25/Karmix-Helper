import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: Account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Step 2: Optional Onboarding
  const [age, setAge] = useState('20');
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('Maharashtra');
  const [occupation, setOccupation] = useState('Student');
  const [education, setEducation] = useState('Undergraduate');
  const [incomeRange, setIncomeRange] = useState('1L - 2.5L');
  const [casteCategory, setCasteCategory] = useState('OBC');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name || !email || !password) {
      setError('Please provide your name, email, and password.');
      setStep(1);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name,
        email,
        password,
        phone,
        preferredLanguage: language,
        profile: {
          age: age ? parseInt(age, 10) : null,
          gender,
          state,
          occupation,
          education,
          incomeRange,
          casteCategory,
        },
      };

      await register(payload);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <img
            src="/karmix-logo.png"
            alt="Karmix Logo"
            className="w-16 h-16 rounded-2xl object-cover bg-black mx-auto shadow-md border border-slate-800"
          />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Create Citizen Account' : 'Personalize Your Recommendations'}
          </h2>
          <p className="text-xs text-slate-500">
            {step === 1
              ? 'Join Karmix Helper to discover, verify, and track government schemes.'
              : 'Optional details to match you with eligible scholarships, subsidies, and grants.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setStep(2);
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Patil"
                className="civic-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="civic-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="civic-input"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 12345"
                className="civic-input"
              />
            </div>

            <button
              type="submit"
              className="w-full civic-btn-primary py-3 font-bold text-sm shadow-md"
            >
              <span>Continue to Eligibility Personalization</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-gov-blue flex-shrink-0 mt-0.5" />
              <span>
                These fields are optional and used purely to filter schemes relevant to your demographic.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="civic-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="civic-input"
                >
                  <option value="Male">Male (पुरुष)</option>
                  <option value="Female">Female (स्त्री / महिला)</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">State / UT</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="civic-input"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="All India">Other States</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Occupation</label>
                <select
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="civic-input"
                >
                  <option value="Student">Student (विद्यार्थी)</option>
                  <option value="Farmer">Farmer (शेतकरी)</option>
                  <option value="Business Owner">Business Owner (उद्योजक)</option>
                  <option value="Daily Wage">Daily Wage Worker</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Annual Family Income</label>
                <select
                  value={incomeRange}
                  onChange={(e) => setIncomeRange(e.target.value)}
                  className="civic-input"
                >
                  <option value="Below 1L">Below ₹1 Lakh</option>
                  <option value="1L - 2.5L">₹1L - ₹2.5 Lakhs</option>
                  <option value="2.5L - 5L">₹2.5L - ₹5 Lakhs</option>
                  <option value="5L - 8L">₹5L - ₹8 Lakhs</option>
                  <option value="Above 8L">Above ₹8 Lakhs</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={casteCategory}
                  onChange={(e) => setCasteCategory(e.target.value)}
                  className="civic-input"
                >
                  <option value="OBC">OBC</option>
                  <option value="General">General / Open</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleRegister()}
                className="w-1/2 civic-btn-secondary text-xs"
              >
                Skip For Now
              </button>
              <button
                type="button"
                onClick={() => handleRegister()}
                disabled={loading}
                className="w-1/2 civic-btn-primary text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating...' : 'Complete & Finish'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-gov-blue hover:underline">
            Sign In to your Account
          </Link>
        </div>
      </div>
    </div>
  );
};
