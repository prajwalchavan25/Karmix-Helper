import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCitizen = () => {
    setEmail('citizen@karmix.in');
    setPassword('Citizen@123456');
  };

  const fillDemoAdmin = () => {
    setEmail('admin@karmix.gov.in');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gov-navy text-white flex items-center justify-center mx-auto shadow-md">
            <span className="font-bold text-xl text-amber-400">K</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Citizen Login</h2>
          <p className="text-xs text-slate-500">
            Sign in to access personalized scheme recommendations, saved documents, and application tracking.
          </p>
        </div>

        {/* Demo Credentials Quick Fill Box */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
          <span className="font-bold text-gov-blue block">⚡ Quick Demo Logins:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillDemoCitizen}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-100/70 text-slate-800 rounded-lg border border-blue-200 font-medium text-left transition-colors"
            >
              👤 <strong>Citizen Demo</strong>
              <span className="block text-[10px] text-slate-500 truncate">citizen@karmix.in</span>
            </button>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="px-2.5 py-1.5 bg-white hover:bg-blue-100/70 text-slate-800 rounded-lg border border-blue-200 font-medium text-left transition-colors"
            >
              🛡️ <strong>Admin Demo</strong>
              <span className="block text-[10px] text-slate-500 truncate">admin@karmix.gov.in</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="civic-input"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="civic-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full civic-btn-primary py-3 font-bold text-sm shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-gov-blue hover:underline">
            Register as a Citizen
          </Link>
        </div>
      </div>
    </div>
  );
};
