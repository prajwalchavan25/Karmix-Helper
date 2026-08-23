import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, ExternalLink, HelpCircle, FileText } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                K
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Karmix Helper</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('tagline')}
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Empowering Indian citizens with personalized discovery, AI-assisted eligibility checking, verified document checklists, and direct official application access.
            </p>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-100">Civic Discovery</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/find" className="hover:text-white transition-colors">
                  {t('find')}
                </Link>
              </li>
              <li>
                <Link to="/find?category=scholarships-education" className="hover:text-white transition-colors">
                  Education & Scholarships
                </Link>
              </li>
              <li>
                <Link to="/find?category=agriculture-farmers" className="hover:text-white transition-colors">
                  Agriculture & Farmers
                </Link>
              </li>
              <li>
                <Link to="/find?category=healthcare-wellness" className="hover:text-white transition-colors">
                  Healthcare (Ayushman)
                </Link>
              </li>
              <li>
                <Link to="/find?category=business-msme" className="hover:text-white transition-colors">
                  MSME & MUDRA Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Portals */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-slate-100">Verified Official Portals</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a
                  href="https://mahadbt.maharashtra.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>MahaDBT Portal (Maharashtra)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>PM-Kisan Official Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmjay.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>Ayushman Bharat PM-JAY</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://scholarships.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white flex items-center gap-1"
                >
                  <span>National Scholarship Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Trust & Verification Guarantee */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400">Verification First</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every scheme on Karmix Helper is cross-referenced with official gazettes and portals. We strictly prevent AI hallucination of non-existent public funds.
            </p>
            <div className="pt-1">
              <span className="inline-block text-[11px] bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700">
                100% Free & Open Citizen Tech
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer Strip */}
        <div className="border-t border-slate-800/80 pt-6 pb-2 text-center text-xs text-slate-500 space-y-2">
          <p className="max-w-4xl mx-auto leading-relaxed">
            <strong className="text-slate-400">Disclaimer:</strong> Karmix Helper is an independent information and assistance platform and is not affiliated with or operated by any government authority. Scheme eligibility results are indicative and calculated based on user inputs.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs pt-2">
            <span>© 2026 Karmix Helper</span>
            <span>•</span>
            <span>Made with <Heart className="w-3.5 h-3.5 text-rose-500 inline fill-rose-500" /> for India</span>
            <span>•</span>
            <span>Supported Languages: English | मराठी | हिन्दी</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
