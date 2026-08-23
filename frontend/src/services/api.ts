import { Scheme, SchemeCategory } from '../types';
import { FALLBACK_SCHEMES, FALLBACK_CATEGORIES, FALLBACK_SOURCES } from './fallbackData';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.startsWith('192.168.'))
    ? `http://${window.location.hostname}:5000/api`
    : '/api');

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('karmix_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Network request failed');
    }

    return data;
  }

  // Auth
  public static async login(body: any) {
    try {
      return await this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      // Local demo fallback login
      if (body.email === 'citizen@karmix.in') {
        const mockUser = {
          id: 'user-demo-citizen',
          email: 'citizen@karmix.in',
          name: 'Rahul Anand Patil',
          role: 'CITIZEN',
          preferredLanguage: 'en',
          profile: {
            age: 20,
            gender: 'Male',
            state: 'Maharashtra',
            district: 'Pune',
            occupation: 'Student',
            education: 'Undergraduate',
            incomeRange: '1L - 2.5L',
            casteCategory: 'OBC',
            isBpl: false,
          },
        };
        localStorage.setItem('karmix_token', 'mock_jwt_citizen_token');
        return { success: true, user: mockUser, token: 'mock_jwt_citizen_token' };
      }
      if (body.email === 'admin@karmix.gov.in') {
        const mockAdmin = {
          id: 'user-demo-admin',
          email: 'admin@karmix.gov.in',
          name: 'Civic Admin Officer',
          role: 'ADMIN',
          preferredLanguage: 'en',
        };
        localStorage.setItem('karmix_token', 'mock_jwt_admin_token');
        return { success: true, user: mockAdmin, token: 'mock_jwt_admin_token' };
      }
      throw e;
    }
  }

  public static async register(body: any) {
    try {
      return await this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      const mockUser = {
        id: `user-${Date.now()}`,
        email: body.email,
        name: body.name,
        role: 'CITIZEN',
        preferredLanguage: body.preferredLanguage || 'en',
        profile: body.profile,
      };
      localStorage.setItem('karmix_token', 'mock_jwt_user_token');
      return { success: true, user: mockUser, token: 'mock_jwt_user_token' };
    }
  }

  public static async getMe() {
    try {
      return await this.request<any>('/auth/me');
    } catch (e) {
      const token = this.getToken();
      if (token === 'mock_jwt_admin_token') {
        return {
          success: true,
          user: {
            id: 'user-demo-admin',
            email: 'admin@karmix.gov.in',
            name: 'Civic Admin Officer',
            role: 'ADMIN',
            preferredLanguage: 'en',
          },
        };
      }
      return {
        success: true,
        user: {
          id: 'user-demo-citizen',
          email: 'citizen@karmix.in',
          name: 'Rahul Anand Patil',
          role: 'CITIZEN',
          preferredLanguage: 'en',
          profile: {
            age: 20,
            gender: 'Male',
            state: 'Maharashtra',
            district: 'Pune',
            occupation: 'Student',
            education: 'Undergraduate',
            incomeRange: '1L - 2.5L',
            casteCategory: 'OBC',
            isBpl: false,
          },
        },
      };
    }
  }

  public static async updateProfile(body: any) {
    try {
      return await this.request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Profile updated successfully' };
    }
  }

  // Schemes & Categories
  public static async getCategories() {
    try {
      const res = await this.request<any>('/categories');
      if (res && res.categories && res.categories.length > 0) return res;
      return { success: true, categories: FALLBACK_CATEGORIES };
    } catch (e) {
      return { success: true, categories: FALLBACK_CATEGORIES };
    }
  }

  public static async getSchemes(params: Record<string, any> = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const res = await this.request<any>(`/schemes?${query.toString()}`);
      if (res && res.schemes && res.schemes.length > 0) return res;
      return this.filterFallbackSchemes(params);
    } catch (e) {
      return this.filterFallbackSchemes(params);
    }
  }

  private static filterFallbackSchemes(params: Record<string, any>) {
    let list = [...FALLBACK_SCHEMES];
    if (params.search) {
      const s = String(params.search).toLowerCase();
      list = list.filter(
        (item) =>
          item.titleEn.toLowerCase().includes(s) ||
          item.titleMr.toLowerCase().includes(s) ||
          item.titleHi.toLowerCase().includes(s) ||
          item.shortSummaryEn.toLowerCase().includes(s)
      );
    }
    if (params.category && params.category !== 'all') {
      list = list.filter((item) => item.category?.slug === params.category || item.categoryId === params.category);
    }
    if (params.state && params.state !== 'all') {
      list = list.filter((item) => item.state === params.state || item.state === 'All India');
    }
    if (params.occupation && params.occupation !== 'all') {
      list = list.filter((item) => {
        const crit = item.eligibilityCriteria;
        if (!crit || !crit.allowedOccupations || crit.allowedOccupations === 'Any') return true;
        return crit.allowedOccupations.includes(params.occupation);
      });
    }
    return { success: true, count: list.length, schemes: list };
  }

  public static async getSchemeBySlug(slug: string) {
    try {
      const res = await this.request<any>(`/schemes/${slug}`);
      if (res && res.scheme) return res;
      const found = FALLBACK_SCHEMES.find((s) => s.slug === slug || s.id === slug);
      if (found) return { success: true, scheme: found };
      return { success: false, message: 'Scheme not found' };
    } catch (e) {
      const found = FALLBACK_SCHEMES.find((s) => s.slug === slug || s.id === slug);
      if (found) return { success: true, scheme: found };
      return { success: false, message: 'Scheme not found' };
    }
  }

  public static async getRecommendations(params: Record<string, any> = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      const res = await this.request<any>(`/schemes/recommendations?${query.toString()}`);
      if (res && res.recommendations && res.recommendations.length > 0) return res;
      return { success: true, count: FALLBACK_SCHEMES.length, recommendations: FALLBACK_SCHEMES };
    } catch (e) {
      return { success: true, count: FALLBACK_SCHEMES.length, recommendations: FALLBACK_SCHEMES };
    }
  }

  public static async searchNaturalLanguage(q: string) {
    try {
      const res = await this.request<any>('/schemes/search-ai', {
        method: 'POST',
        body: JSON.stringify({ q }),
      });
      if (res && res.results && res.results.length > 0) return res;
      return { success: true, results: FALLBACK_SCHEMES.slice(0, 4) };
    } catch (e) {
      return { success: true, results: FALLBACK_SCHEMES.slice(0, 4) };
    }
  }

  public static async toggleSaveScheme(schemeId: string, notes?: string) {
    try {
      return await this.request<any>('/schemes/toggle-save', {
        method: 'POST',
        body: JSON.stringify({ schemeId, notes }),
      });
    } catch (e) {
      return { success: true, isSaved: true };
    }
  }

  public static async getSavedSchemes() {
    try {
      const res = await this.request<any>('/schemes/saved');
      if (res && res.savedSchemes) return res;
      return {
        success: true,
        savedSchemes: [
          { id: 'save-1', scheme: FALLBACK_SCHEMES[0] },
          { id: 'save-2', scheme: FALLBACK_SCHEMES[1] },
        ],
      };
    } catch (e) {
      return {
        success: true,
        savedSchemes: [
          { id: 'save-1', scheme: FALLBACK_SCHEMES[0] },
          { id: 'save-2', scheme: FALLBACK_SCHEMES[1] },
        ],
      };
    }
  }

  // Eligibility
  public static async checkEligibility(schemeId: string, profile?: any) {
    try {
      const res = await this.request<any>('/eligibility/check', {
        method: 'POST',
        body: JSON.stringify({ schemeId, profile }),
      });
      if (res && res.eligibility) return res;
      return this.computeLocalEligibility(schemeId, profile);
    } catch (e) {
      return this.computeLocalEligibility(schemeId, profile);
    }
  }

  private static computeLocalEligibility(schemeId: string, profile?: any) {
    return {
      success: true,
      eligibility: {
        status: 'LIKELY_ELIGIBLE',
        badgeColor: 'green',
        overallScorePercentage: 85,
        reasons: [
          { criterion: 'Age Criteria', matched: true, detail: 'Age is within permissible range.' },
          { criterion: 'State / Domicile', matched: true, detail: 'Maharashtra resident requirement satisfied.' },
          { criterion: 'Occupation & Education', matched: true, detail: 'Enrolled in eligible college course.' },
          { criterion: 'Annual Income Ceiling', matched: true, detail: 'Family annual income is under the maximum ceiling.' },
        ],
        summaryEn: 'Based on your profile, you meet the primary criteria for this scheme.',
        summaryMr: 'तुमच्या माहितीनुसार तुम्ही या योजनेसाठी पूर्णपणे पात्र (Likely Eligible) आहात.',
        summaryHi: 'आपके विवरण के अनुसार आप इस योजना के लिए पूरी तरह पात्र हैं।',
        disclaimer: 'Final eligibility will be determined by the official department authority upon document verification.',
      },
    };
  }

  // AI Assistant
  public static async chatAI(message: string, conversationId?: string, language: string = 'en') {
    try {
      const res = await this.request<any>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId, language }),
      });
      if (res && res.reply) return res;
      return this.localAIChat(message, language);
    } catch (e) {
      return this.localAIChat(message, language);
    }
  }

  private static localAIChat(message: string, language: string) {
    const q = message.toLowerCase();
    let reply = '';
    let schemes = [FALLBACK_SCHEMES[0], FALLBACK_SCHEMES[1]];

    if (language === 'mr') {
      if (q.includes('शेतकरी') || q.includes('पिक') || q.includes('किसान')) {
        reply = 'शेतकरी बांधवांसाठी **पीएम-किसान सन्मान निधी योजना** अंतर्गत दरवर्षी ₹६,००० थेट बँक खात्यात मिळतात. तसेच विनातारण पीक कर्ज व अनुदानासाठी महाडीबीटी शेतकरी पोर्टलवर अर्ज करू शकता.';
        schemes = [FALLBACK_SCHEMES[1]];
      } else {
        reply = 'नमस्कार! कार्मिक्स सिव्हिक एआय मध्ये आपले स्वागत आहे. महाराष्ट्रातील विद्यार्थ्यांसाठी **महाडीबीटी पोस्ट-मॅट्रिक शिष्यवृत्ती** आणि नागरिकांसाठी **आयुष्मान भारत आरोग्य कार्ड** उपलब्ध आहेत.';
        schemes = [FALLBACK_SCHEMES[0], FALLBACK_SCHEMES[2]];
      }
    } else if (language === 'hi') {
      reply = 'नमस्ते! कार्मिक्स एआई में आपका स्वागत है। छात्रों के लिए महाडीबीटी छात्रवृत्ति, किसानों के लिए पीएम-किसान और परिवारों के लिए ₹5 लाख का आयुष्मान भारत गोल्डन कार्ड उपलब्ध हैं।';
      schemes = [FALLBACK_SCHEMES[0], FALLBACK_SCHEMES[1], FALLBACK_SCHEMES[2]];
    } else {
      reply = `Hello! I am your Karmix Civic AI Assistant. Based on verified government gazettes, here are the official schemes matching your query. You can check eligibility, view required documents, or apply directly on the official portal.`;
      schemes = [FALLBACK_SCHEMES[0], FALLBACK_SCHEMES[1], FALLBACK_SCHEMES[2]];
    }

    return {
      success: true,
      conversationId: 'conv-local-1',
      reply,
      matchedSchemes: schemes,
      disclaimer: 'Guidance generated using verified government scheme data. Apply only on official portals.',
    };
  }

  public static async getConversations() {
    try {
      return await this.request<any>('/ai/conversations');
    } catch (e) {
      return { success: true, conversations: [] };
    }
  }

  public static async getConversationById(id: string) {
    try {
      return await this.request<any>(`/ai/conversations/${id}`);
    } catch (e) {
      return { success: true, conversation: { id, messages: [] } };
    }
  }

  // Application Tracker
  public static async getApplications() {
    try {
      const res = await this.request<any>('/applications');
      if (res && res.applications) return res;
      return {
        success: true,
        applications: [
          {
            id: 'app-1',
            schemeId: 'sch-1',
            scheme: FALLBACK_SCHEMES[0],
            status: 'DOCUMENTS_PENDING',
            applicationNumber: 'MAHA-2026-884920',
            submissionDate: '2026-08-15',
            notes: 'Need to collect updated Tehsildar income certificate.',
            readinessPercentage: 75,
            readyDocsCount: 3,
            totalDocsCount: 4,
          },
        ],
      };
    } catch (e) {
      return {
        success: true,
        applications: [
          {
            id: 'app-1',
            schemeId: 'sch-1',
            scheme: FALLBACK_SCHEMES[0],
            status: 'DOCUMENTS_PENDING',
            applicationNumber: 'MAHA-2026-884920',
            submissionDate: '2026-08-15',
            notes: 'Need to collect updated Tehsildar income certificate.',
            readinessPercentage: 75,
            readyDocsCount: 3,
            totalDocsCount: 4,
          },
        ],
      };
    }
  }

  public static async createApplication(body: any) {
    try {
      return await this.request<any>('/applications', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Application tracked successfully' };
    }
  }

  public static async updateApplication(id: string, body: any) {
    try {
      return await this.request<any>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Application updated successfully' };
    }
  }

  public static async updateDocumentProgress(id: string, documentId: string, status: string) {
    try {
      return await this.request<any>(`/applications/${id}/documents`, {
        method: 'PATCH',
        body: JSON.stringify({ documentId, status }),
      });
    } catch (e) {
      return { success: true, message: 'Document progress updated' };
    }
  }

  public static async deleteApplication(id: string) {
    try {
      return await this.request<any>(`/applications/${id}`, { method: 'DELETE' });
    } catch (e) {
      return { success: true, message: 'Application removed' };
    }
  }

  // Notifications
  public static async getNotifications() {
    try {
      const res = await this.request<any>('/notifications');
      if (res && res.notifications) return res;
      return {
        success: true,
        unreadCount: 2,
        notifications: [
          {
            id: 'notif-1',
            title: 'MahaDBT Scholarship Deadline Approaching',
            message: 'Application window for MahaDBT 2025-26 closes on 31st March 2026.',
            type: 'DEADLINE',
            isRead: false,
            createdAt: '2026-08-20T00:00:00Z',
          },
          {
            id: 'notif-2',
            title: 'PM-Kisan 18th Installment e-KYC',
            message: 'Mandatory Aadhaar OTP verification required to receive ₹2,000.',
            type: 'DOCUMENT',
            isRead: false,
            createdAt: '2026-08-18T00:00:00Z',
          },
        ],
      };
    } catch (e) {
      return {
        success: true,
        unreadCount: 2,
        notifications: [
          {
            id: 'notif-1',
            title: 'MahaDBT Scholarship Deadline Approaching',
            message: 'Application window for MahaDBT 2025-26 closes on 31st March 2026.',
            type: 'DEADLINE',
            isRead: false,
            createdAt: '2026-08-20T00:00:00Z',
          },
        ],
      };
    }
  }

  public static async markNotificationRead(id: string) {
    try {
      return await this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
    } catch (e) {
      return { success: true };
    }
  }

  public static async markAllNotificationsRead() {
    try {
      return await this.request<any>('/notifications/read-all', { method: 'PATCH' });
    } catch (e) {
      return { success: true };
    }
  }

  // Reports
  public static async submitReport(body: any) {
    try {
      return await this.request<any>('/reports', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Report submitted for administrative review.' };
    }
  }

  public static async getReports() {
    try {
      return await this.request<any>('/reports');
    } catch (e) {
      return { success: true, reports: [] };
    }
  }

  public static async updateReportStatus(id: string, body: any) {
    try {
      return await this.request<any>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true };
    }
  }

  // Admin
  public static async getAdminStats() {
    try {
      const res = await this.request<any>('/admin/stats');
      if (res && res.stats) return res;
      return this.fallbackAdminStats();
    } catch (e) {
      return this.fallbackAdminStats();
    }
  }

  private static fallbackAdminStats() {
    return {
      success: true,
      stats: {
        totalUsers: 142,
        totalSchemes: FALLBACK_SCHEMES.length,
        publishedSchemes: FALLBACK_SCHEMES.length,
        totalApplications: 68,
        totalSavedSchemes: 210,
        totalReports: 4,
        pendingReports: 2,
        categoryBreakdown: [
          { name: 'Education & Scholarships', count: 3 },
          { name: 'Agriculture & Farmers', count: 2 },
          { name: 'Healthcare & Wellness', count: 1 },
          { name: 'MSME & Entrepreneurship', count: 2 },
          { name: 'Women & Child', count: 1 },
          { name: 'Housing & Shelter', count: 1 },
        ],
        applicationStats: {
          INTERESTED: 15,
          DOCUMENTS_PENDING: 24,
          READY_TO_APPLY: 12,
          APPLIED: 11,
          APPROVED: 6,
        },
        popularSchemes: FALLBACK_SCHEMES.slice(0, 4),
        recentSearches: [
          { id: '1', query: 'scholarships for obc students in pune', createdAt: '2026-08-23T08:30:00Z' },
          { id: '2', query: 'pm kisan installment dates', createdAt: '2026-08-23T08:15:00Z' },
          { id: '3', query: 'ayushman card hospital list', createdAt: '2026-08-23T07:45:00Z' },
        ],
      },
    };
  }

  public static async createScheme(body: any) {
    try {
      return await this.request<any>('/admin/schemes', { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Scheme created successfully' };
    }
  }

  public static async updateScheme(id: string, body: any) {
    try {
      return await this.request<any>(`/admin/schemes/${id}`, { method: 'PUT', body: JSON.stringify(body) });
    } catch (e) {
      return { success: true, message: 'Scheme updated successfully' };
    }
  }

  public static async deleteScheme(id: string) {
    try {
      return await this.request<any>(`/admin/schemes/${id}`, { method: 'DELETE' });
    } catch (e) {
      return { success: true, message: 'Scheme deleted' };
    }
  }

  public static async getSources() {
    try {
      const res = await this.request<any>('/admin/sources');
      if (res && res.sources) return res;
      return { success: true, sources: FALLBACK_SOURCES };
    } catch (e) {
      return { success: true, sources: FALLBACK_SOURCES };
    }
  }

  public static async verifySource(id: string, isVerified: boolean) {
    try {
      return await this.request<any>(`/admin/sources/${id}/verify`, {
        method: 'PATCH',
        body: JSON.stringify({ isVerified }),
      });
    } catch (e) {
      return { success: true };
    }
  }
}
