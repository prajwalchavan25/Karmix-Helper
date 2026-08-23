import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Tractor,
  HeartPulse,
  Briefcase,
  Home,
  Users,
  Search,
  FileCheck2,
  Languages,
  ExternalLink,
  ChevronDown,
  Building,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ApiClient } from '../services/api';
import { Scheme, SchemeCategory } from '../types';
import { SchemeCard } from '../components/schemes/SchemeCard';
import { EligibilityModal } from '../components/eligibility/EligibilityModal';

interface LandingPageProps {
  onOpenAIModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAIModal }) => {
  const { t, language, getLocalized } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [featuredSchemes, setFeaturedSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Discovery Interactive Bar
  const [quickAge, setQuickAge] = useState('20');
  const [quickState, setQuickState] = useState('Maharashtra');
  const [quickOccupation, setQuickOccupation] = useState('Student');
  const [quickIncome, setQuickIncome] = useState('1L - 2.5L');

  // Eligibility Modal State
  const [selectedSchemeForEligibility, setSelectedSchemeForEligibility] = useState<Scheme | null>(null);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, schemesRes] = await Promise.all([
          ApiClient.getCategories(),
          ApiClient.getSchemes({ featured: 'true', limit: 4 }),
        ]);

        if (catRes.success) setCategories(catRes.categories);
        if (schemesRes.success) setFeaturedSchemes(schemesRes.schemes);
      } catch (err) {
        console.error('Failed to load landing page data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickMatch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/find?state=${encodeURIComponent(quickState)}&occupation=${encodeURIComponent(
        quickOccupation
      )}&age=${quickAge}&incomeRange=${encodeURIComponent(quickIncome)}`
    );
  };

  const faqs = [
    {
      q: 'Is Karmix Helper an official government application?',
      qMr: 'कार्मिक्स हेल्पर हे अधिकृत शासकीय संकेतस्थळ आहे का?',
      qHi: 'क्या कार्मिक्स हेल्पर आधिकारिक सरकारी वेबसाइट है?',
      a: 'No. Karmix Helper is an independent civic information platform created to simplify complex government scheme documentation. All scheme guidelines, documents, and application links are verified directly against official government domains (.gov.in, .nic.in, state portals).',
      aMr: 'नाही. कार्मिक्स हेल्पर हे एक स्वतंत्र नागरिक माहिती व्यासपीठ आहे, जे गुंतागुंतीच्या शासकीय योजना समजून सांगण्यास मदत करते. सर्व माहिती अधिकृत शासकीय संकेतस्थळांवरून (gov.in / nic.in) तपासली जाते.',
      aHi: 'नहीं। कार्मिक्स हेल्पर एक स्वतंत्र नागरिक सूचना मंच है जो जटिल सरकारी प्रक्रियाओं को सरल बनाता है। सभी योजनाएं आधिकारिक सरकारी पोर्टलों (.gov.in, .nic.in) से सत्यापित हैं।',
    },
    {
      q: 'How does the AI Eligibility Checker work?',
      qMr: 'AI पात्रता तपासणी कशी कार्य करते?',
      qHi: 'AI पात्रता जांच कैसे काम करती है?',
      a: 'The system cross-references your profile parameters (age, state, income ceiling, occupation, category) against the verified government eligibility criteria. It breaks down each criterion into Green (Satisfied), Yellow (Needs Verification), or Red (Unmet) with clear explanations.',
      aMr: 'प्रणाली तुमच्या प्रोफाइलमधील वय, उत्पन्न, राज्य आणि व्यवसाय या बाबींची पडताळणी शासकीय नियमावलीनुसार करते आणि सोप्या भाषेत पात्रतेचे विश्लेषण देते.',
      aHi: 'सिस्टम आपकी प्रोफ़ाइल (आयु, आय, राज्य, व्यवसाय) की तुलना आधिकारिक सरकारी मानदंडों से करता है और प्रत्येक शर्त का स्पष्ट विश्लेषण प्रस्तुत करता है।',
    },
    {
      q: 'Are all application links direct and secure?',
      qMr: 'अर्जासाठी दिलेल्या लिंक्स थेट आणि सुरक्षित आहेत का?',
      qHi: 'क्या आवेदन के सभी लिंक सीधे और सुरक्षित हैं?',
      a: 'Yes. Karmix Helper redirects you directly to the official state and central portals (e.g. mahadbt.maharashtra.gov.in, pmkisan.gov.in, nha.gov.in). We never ask for payments or sensitive banking passwords.',
      aMr: 'होय. कार्मिक्स हेल्पर तुम्हाला थेट अधिकृत शासकीय पोर्टलवर घेऊन जातो. आम्ही कधीही कोणतेही शुल्क किंवा संवेदनशील बँकिंग पासवर्ड मागत नाही.',
      aHi: 'हाँ। कार्मिक्स हेल्पर आपको सीधे आधिकारिक सरकारी पोर्टलों पर भेजता है। हम कभी भी कोई शुल्क या संवेदनशील पासवर्ड नहीं मांगते।',
    },
    {
      q: 'Which languages are supported?',
      qMr: 'कोणत्या भाषा उपलब्ध आहेत?',
      qHi: 'कौन सी भाषाएं समर्थित हैं?',
      a: 'Karmix Helper provides end-to-end support in English, Marathi (मराठी), and Hindi (हिन्दी) across UI labels, scheme guides, documents, and the Karmix AI Assistant.',
      aMr: 'इंग्रजी, मराठी आणि हिन्दी या तिन्ही भाषांमध्ये संपूर्ण योजना, कागदपत्रे आणि AI साहाय्यक उपलब्ध आहे.',
      aHi: 'अंग्रेजी, मराठी और हिन्दी में सभी योजनाएं, दस्तावेज चेकलिस्ट और AI सहायक उपलब्ध हैं।',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Pill & Brand Logo */}
            <div className="flex flex-col items-center gap-4">
              <img
                src="/karmix-logo.png"
                alt="Karmix Logo"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover bg-black shadow-xl shadow-slate-900/15 border-2 border-slate-900 hover:scale-105 transition-transform duration-300"
              />
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-gov-blue text-xs font-semibold shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Grounded in Official Indian Government Gazettes & Portals</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Government Benefits, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-gov-navy via-gov-blue to-civic-600 bg-clip-text text-transparent">
                Made Simple.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              {t('heroSubtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/find" className="civic-btn-primary px-6 py-3.5 text-sm sm:text-base font-bold shadow-md">
                <Compass className="w-5 h-5" />
                <span>{t('findSchemes')}</span>
              </Link>

              {onOpenAIModal && (
                <button
                  onClick={onOpenAIModal}
                  className="civic-btn-secondary px-6 py-3.5 text-sm sm:text-base font-bold border border-slate-300/80 hover:bg-slate-100 flex items-center gap-2 shadow-2xs"
                >
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>{t('askKarmixAI')}</span>
                </button>
              )}
            </div>

            {/* Trust Highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Personalized Discovery</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>AI Eligibility Explainer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified .gov.in Sources</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>English • मराठी • हिन्दी</span>
              </div>
            </div>
          </div>

          {/* 2. Interactive "Quick Match" Civic Onboarding Box */}
          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative">
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-gov-blue" />
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Quick Eligibility Matcher (No Login Required)
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Instant Results</span>
            </div>

            <form onSubmit={handleQuickMatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  value={quickAge}
                  onChange={(e) => setQuickAge(e.target.value)}
                  placeholder="e.g. 20"
                  className="civic-input text-xs py-2.5"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">State / UT</label>
                <select
                  value={quickState}
                  onChange={(e) => setQuickState(e.target.value)}
                  className="civic-input text-xs py-2.5"
                >
                  <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                  <option value="Karnataka">Karnataka (ಕರ್ನಾಟಕ)</option>
                  <option value="Delhi">Delhi (दिल्ली)</option>
                  <option value="All India">Other / All India</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Occupation</label>
                <select
                  value={quickOccupation}
                  onChange={(e) => setQuickOccupation(e.target.value)}
                  className="civic-input text-xs py-2.5"
                >
                  <option value="Student">Student (विद्यार्थी)</option>
                  <option value="Farmer">Farmer (शेतकरी)</option>
                  <option value="Business Owner">Business / MSME (उद्योजक)</option>
                  <option value="Daily Wage">Daily Wage Worker</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Annual Household Income</label>
                <select
                  value={quickIncome}
                  onChange={(e) => setQuickIncome(e.target.value)}
                  className="civic-input text-xs py-2.5"
                >
                  <option value="Below 1L">Below ₹1 Lakh</option>
                  <option value="1L - 2.5L">₹1L - ₹2.5 Lakhs</option>
                  <option value="2.5L - 5L">₹2.5L - ₹5 Lakhs</option>
                  <option value="5L - 8L">₹5L - ₹8 Lakhs</option>
                  <option value="Above 8L">Above ₹8 Lakhs</option>
                </select>
              </div>

              <div className="sm:col-span-2 lg:col-span-4 pt-2">
                <button
                  type="submit"
                  className="w-full civic-btn-primary py-3 font-bold text-sm shadow-md"
                >
                  <Search className="w-4 h-4" />
                  <span>Discover Matched Schemes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-gov-blue">Step-by-Step Flow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {t('howItWorks')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            From discovering eligibility to submitting your application on the official government portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="civic-card p-5 space-y-2 border-t-4 border-t-gov-navy">
            <span className="text-xs font-black text-gov-navy bg-slate-100 px-2 py-0.5 rounded">01</span>
            <h4 className="font-bold text-sm text-slate-900">{t('step1Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step1Desc')}</p>
          </div>

          <div className="civic-card p-5 space-y-2 border-t-4 border-t-gov-blue">
            <span className="text-xs font-black text-gov-blue bg-blue-50 px-2 py-0.5 rounded">02</span>
            <h4 className="font-bold text-sm text-slate-900">{t('step2Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step2Desc')}</p>
          </div>

          <div className="civic-card p-5 space-y-2 border-t-4 border-t-emerald-600">
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">03</span>
            <h4 className="font-bold text-sm text-slate-900">{t('step3Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step3Desc')}</p>
          </div>

          <div className="civic-card p-5 space-y-2 border-t-4 border-t-amber-500">
            <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">04</span>
            <h4 className="font-bold text-sm text-slate-900">{t('step4Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step4Desc')}</p>
          </div>

          <div className="civic-card p-5 space-y-2 border-t-4 border-t-purple-600">
            <span className="text-xs font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded">05</span>
            <h4 className="font-bold text-sm text-slate-900">{t('step5Title')}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{t('step5Desc')}</p>
          </div>
        </div>
      </section>

      {/* 4. Scheme Categories Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-gov-blue">Browse Sectors</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Schemes by Category
            </h2>
          </div>
          <Link
            to="/find"
            className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 6).map((cat) => (
            <Link
              key={cat.id}
              to={`/find?category=${cat.slug}`}
              className="civic-card p-4 text-center group hover:border-gov-blue hover:scale-105 transition-all flex flex-col items-center justify-center space-y-2.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-gov-blue flex items-center justify-center group-hover:bg-gov-navy group-hover:text-white transition-colors">
                {cat.slug.includes('scholar') ? (
                  <GraduationCap className="w-6 h-6" />
                ) : cat.slug.includes('agri') ? (
                  <Tractor className="w-6 h-6" />
                ) : cat.slug.includes('health') ? (
                  <HeartPulse className="w-6 h-6" />
                ) : cat.slug.includes('busin') ? (
                  <Briefcase className="w-6 h-6" />
                ) : cat.slug.includes('hous') ? (
                  <Home className="w-6 h-6" />
                ) : (
                  <Users className="w-6 h-6" />
                )}
              </div>
              <h4 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                {getLocalized(cat, 'name')}
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">
                {cat.schemeCount || 0} schemes
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Popular Schemes */}
      {featuredSchemes.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-gov-blue">High-Impact Initiatives</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Featured Government Schemes
              </h2>
            </div>
            <Link
              to="/find"
              className="text-xs font-bold text-gov-blue hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore 20+ Schemes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredSchemes.map((scheme) => (
              <SchemeCard
                key={scheme.id}
                scheme={scheme}
                onCheckEligibility={(s) => setSelectedSchemeForEligibility(s)}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Trust & Official Verification Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Public Trust Standard</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              We Never Fake Schemes. <br />
              Direct Links to Official Portals Only.
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Ordinary citizens are often misled by fake viral notices or unofficial intermediaries. Karmix Helper guarantees that every scheme in our database is linked exclusively to verified government domains (`.gov.in`, `.nic.in`, or official state gazettes).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-lg font-bold text-emerald-400">100%</span>
                <p className="text-slate-300 font-medium">Verified Sources</p>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-lg font-bold text-amber-400">0</span>
                <p className="text-slate-300 font-medium">Intermediaries</p>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-lg font-bold text-blue-400">3</span>
                <p className="text-slate-300 font-medium">Languages (EN/MR/HI)</p>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 space-y-1">
                <span className="text-lg font-bold text-purple-400">Free</span>
                <p className="text-slate-300 font-medium">Citizen Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Accordion Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-gov-blue">Frequently Asked Questions</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Understanding Karmix Helper
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const question =
              language === 'mr' ? faq.qMr : language === 'hi' ? faq.qHi : faq.q;
            const answer =
              language === 'mr' ? faq.aMr : language === 'hi' ? faq.aHi : faq.a;
            const isOpen = openFaq === idx;

            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180 text-gov-blue' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Eligibility Modal */}
      {selectedSchemeForEligibility && (
        <EligibilityModal
          scheme={selectedSchemeForEligibility}
          eligibility={
            selectedSchemeForEligibility.calculatedEligibility || {
              status: 'POSSIBLY_ELIGIBLE',
              badgeColor: 'yellow',
              overallScorePercentage: 50,
              reasons: [],
              summaryEn: 'Complete your profile for a full calculation.',
              summaryMr: 'संपूर्ण विश्लेषणासाठी प्रोफाइल पूर्ण करा.',
              summaryHi: 'पूर्ण गणना के लिए प्रोफ़ाइल पूरी करें।',
              disclaimer: 'Calculated based on available scheme requirements.',
            }
          }
          onClose={() => setSelectedSchemeForEligibility(null)}
        />
      )}
    </div>
  );
};
