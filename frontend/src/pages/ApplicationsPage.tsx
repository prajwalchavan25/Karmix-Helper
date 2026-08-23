import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck2, Plus, Compass, Filter, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ApiClient } from '../services/api';
import { Application } from '../types';
import { ApplicationCard } from '../components/applications/ApplicationCard';
import { ApplicationModal } from '../components/applications/ApplicationModal';
import { useLanguage } from '../context/LanguageContext';

export const ApplicationsPage: React.FC = () => {
  const { t } = useLanguage();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Edit Modal
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await ApiClient.getApplications();
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this application from your tracker?')) return;
    try {
      await ApiClient.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete application:', err);
    }
  };

  const filteredApplications =
    statusFilter === 'ALL'
      ? applications
      : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-gov-blue">
            <FileCheck2 className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Citizen Lifecycle Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            {t('applications')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Track your documents, portal application numbers, and submission statuses in one unified pipeline.
          </p>
        </div>

        <Link to="/find" className="civic-btn-primary self-start sm:self-auto text-xs font-bold">
          <Plus className="w-4 h-4" />
          <span>Find & Track New Scheme</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-gov-navy text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Applications ({applications.length})
        </button>
        <button
          onClick={() => setStatusFilter('DOCUMENTS_PENDING')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'DOCUMENTS_PENDING'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Docs Pending
        </button>
        <button
          onClick={() => setStatusFilter('READY_TO_APPLY')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'READY_TO_APPLY'
              ? 'bg-gov-blue text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Ready to Apply
        </button>
        <button
          onClick={() => setStatusFilter('APPLIED')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'APPLIED'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Applied
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Approved
        </button>
      </div>

      {/* Applications Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="civic-card p-6 h-64 animate-pulse bg-slate-100/70" />
          ))}
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 sm:p-16 text-center max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-gov-blue flex items-center justify-center mx-auto">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">No Applications In This Category</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Add a scheme to your tracker from the scheme details page to monitor required certificates and submission deadlines.
          </p>
          <Link to="/find" className="civic-btn-primary mx-auto inline-flex text-xs">
            <Compass className="w-4 h-4" />
            <span>Discover Schemes</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onEdit={(a) => setEditingApplication(a)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingApplication && (
        <ApplicationModal
          application={editingApplication}
          onClose={() => setEditingApplication(null)}
          onSaved={fetchApplications}
        />
      )}
    </div>
  );
};
