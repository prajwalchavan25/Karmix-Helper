import React, { useState, useEffect } from 'react';
import {
  Shield,
  Layers,
  FileCheck2,
  Users,
  AlertTriangle,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Eye,
  Bookmark,
  Check,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ApiClient } from '../services/api';
import { AdminStats, Scheme, SchemeCategory, GovernmentSource, ReportItem } from '../types';
import { StatCard } from '../components/admin/StatCard';
import { SchemeEditorModal } from '../components/admin/SchemeEditorModal';
import { ReportReviewModal } from '../components/admin/ReportReviewModal';
import { Badge } from '../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schemes' | 'reports' | 'sources'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [categories, setCategories] = useState<SchemeCategory[]>([]);
  const [sources, setSources] = useState<GovernmentSource[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editingScheme, setEditingScheme] = useState<Scheme | null>(null);
  const [isCreatingScheme, setIsCreatingScheme] = useState(false);
  const [reviewingReport, setReviewingReport] = useState<ReportItem | null>(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, schemesRes, catRes, srcRes, repRes] = await Promise.all([
        ApiClient.getAdminStats(),
        ApiClient.getSchemes({ limit: 100 }),
        ApiClient.getCategories(),
        ApiClient.getSources(),
        ApiClient.getReports(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (schemesRes.success) setSchemes(schemesRes.schemes);
      if (catRes.success) setCategories(catRes.categories);
      if (srcRes.success) setSources(srcRes.sources);
      if (repRes.success) setReports(repRes.reports);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteScheme = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this scheme?')) return;
    try {
      await ApiClient.deleteScheme(id);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to delete scheme:', err);
    }
  };

  const handleToggleSourceVerify = async (id: string, current: boolean) => {
    try {
      await ApiClient.verifySource(id, !current);
      fetchAdminData();
    } catch (err) {
      console.error('Failed to update source verification:', err);
    }
  };

  const COLORS = ['#0F2744', '#1E6091', '#2A9D8F', '#F4A261', '#E76F51', '#8B5CF6', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-purple-700">
            <Shield className="w-5 h-5" />
            <span className="text-xs uppercase font-bold tracking-wider">Administrative Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Karmix Civic Admin & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Manage verified scheme registries, official gazette sources, citizen reports, and usage metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreatingScheme(true)}
            className="civic-btn-primary bg-purple-700 hover:bg-purple-800 text-xs font-bold py-2.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Scheme</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'overview'
              ? 'border-purple-700 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => setActiveTab('schemes')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'schemes'
              ? 'border-purple-700 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Schemes Registry ({schemes.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'border-purple-700 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <span>Citizen Reports</span>
          {stats && stats.pendingReports > 0 && (
            <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
              {stats.pendingReports}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'sources'
              ? 'border-purple-700 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Government Sources ({sources.length})
        </button>
      </div>

      {/* Tab 1: Overview & Analytics */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Registered Citizens"
              value={stats.totalUsers}
              subtitle="Active profiles"
              icon={<Users className="w-6 h-6" />}
              variant="blue"
            />
            <StatCard
              title="Published Schemes"
              value={`${stats.publishedSchemes}/${stats.totalSchemes}`}
              subtitle="Verified initiatives"
              icon={<Layers className="w-6 h-6" />}
              variant="purple"
            />
            <StatCard
              title="Applications Tracked"
              value={stats.totalApplications}
              subtitle="Citizens applying"
              icon={<FileCheck2 className="w-6 h-6" />}
              variant="emerald"
            />
            <StatCard
              title="Citizen Issue Reports"
              value={stats.totalReports}
              subtitle={`${stats.pendingReports} pending review`}
              icon={<AlertTriangle className="w-6 h-6" />}
              variant="rose"
            />
          </div>

          {/* Visual Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown Bar Chart */}
            <div className="civic-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Schemes by Category Breakdown</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryBreakdown}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#64748B' }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#1E6091" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Application Pipeline Status Pie Chart */}
            <div className="civic-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Application Lifecycle Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.applicationStats)
                        .filter(([_, val]) => val > 0)
                        .map(([key, val]) => ({ name: key, value: val }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {Object.entries(stats.applicationStats).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Popular Schemes & Recent Search Demand */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Popular Schemes Table */}
            <div className="civic-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Most Viewed Schemes</h3>
              <div className="divide-y divide-slate-100 text-xs">
                {stats.popularSchemes.map((s, idx) => (
                  <div key={s.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="space-y-0.5 max-w-xs">
                      <span className="font-bold text-slate-900 truncate block">{s.titleEn}</span>
                      <span className="text-slate-500 text-[11px]">{s.department}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        {s.viewsCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                        {s.savesCount}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="civic-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Live Citizen Search Queries</h3>
              <div className="space-y-2">
                {stats.recentSearches.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{log.query}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex-shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Schemes Registry */}
      {activeTab === 'schemes' && (
        <div className="civic-card overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              All Schemes ({schemes.length})
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3.5 font-bold">Scheme Name</th>
                  <th className="p-3.5 font-bold">Category</th>
                  <th className="p-3.5 font-bold">Level</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold">Views</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schemes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                      {s.titleEn}
                    </td>
                    <td className="p-3.5 text-slate-600">{s.category?.nameEn}</td>
                    <td className="p-3.5 text-slate-600">{s.level} ({s.state || 'All'})</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.isPublished
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">{s.viewsCount}</td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setEditingScheme(s)}
                        className="p-1.5 text-slate-600 hover:text-gov-blue rounded hover:bg-slate-100"
                        title="Edit Scheme"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteScheme(s.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                        title="Delete Scheme"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Citizen Issue Reports */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center text-xs text-slate-500">
              No citizen issue reports submitted yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="civic-card p-5 space-y-3 border-l-4 border-l-amber-500"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        rep.status === 'PENDING'
                          ? 'yellow'
                          : rep.status === 'RESOLVED'
                          ? 'green'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {rep.status}
                    </Badge>
                    <span className="text-[11px] text-slate-400">
                      {new Date(rep.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{rep.scheme?.titleEn}</h4>
                    <span className="text-[11px] text-amber-800 font-semibold block mt-0.5">
                      Issue: {rep.issueType}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">
                    "{rep.description}"
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      By: {rep.user?.name || rep.userEmail || 'Anonymous'}
                    </span>
                    <button
                      onClick={() => setReviewingReport(rep)}
                      className="civic-btn-primary py-1.5 px-3 text-xs"
                    >
                      Review & Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Government Sources */}
      {activeTab === 'sources' && (
        <div className="civic-card overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200">
            <span className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Verified Government Sources & Domains
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {sources.map((src) => (
              <div key={src.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{src.name}</h4>
                    {src.isVerified ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500">{src.departmentName}</p>
                  <a
                    href={src.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-gov-blue hover:underline flex items-center gap-1 pt-0.5"
                  >
                    <span>{src.domain}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <button
                  onClick={() => handleToggleSourceVerify(src.id, src.isVerified)}
                  className={`px-3 py-1.5 rounded-xl font-semibold text-xs border transition-colors self-start sm:self-auto ${
                    src.isVerified
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {src.isVerified ? 'Mark Unverified' : 'Verify Domain'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {(isCreatingScheme || editingScheme) && (
        <SchemeEditorModal
          scheme={editingScheme}
          categories={categories}
          sources={sources}
          onClose={() => {
            setIsCreatingScheme(false);
            setEditingScheme(null);
          }}
          onSaved={fetchAdminData}
        />
      )}

      {reviewingReport && (
        <ReportReviewModal
          report={reviewingReport}
          onClose={() => setReviewingReport(null)}
          onUpdated={fetchAdminData}
        />
      )}
    </div>
  );
};
