const API_BASE = import.meta.env.VITE_API_URL || 'https://karmix-helper-1.onrender.com/api';

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
  public static login(body: any) {
    return this.request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) });
  }

  public static register(body: any) {
    return this.request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) });
  }

  public static getMe() {
    return this.request<any>('/auth/me');
  }

  public static updateProfile(body: any) {
    return this.request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(body) });
  }

  // Schemes & Categories
  public static getCategories() {
    return this.request<any>('/categories');
  }

  public static getSchemes(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<any>(`/schemes?${query.toString()}`);
  }

  public static getSchemeBySlug(slug: string) {
    return this.request<any>(`/schemes/${slug}`);
  }

  public static getRecommendations(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return this.request<any>(`/schemes/recommendations?${query.toString()}`);
  }

  public static searchNaturalLanguage(q: string) {
    return this.request<any>('/schemes/search-ai', {
      method: 'POST',
      body: JSON.stringify({ q }),
    });
  }

  public static toggleSaveScheme(schemeId: string, notes?: string) {
    return this.request<any>('/schemes/toggle-save', {
      method: 'POST',
      body: JSON.stringify({ schemeId, notes }),
    });
  }

  public static getSavedSchemes() {
    return this.request<any>(`/schemes/saved`);
  }

  // Eligibility
  public static checkEligibility(schemeId: string, profile?: any) {
    return this.request<any>('/eligibility/check', {
      method: 'POST',
      body: JSON.stringify({ schemeId, profile }),
    });
  }

  // AI Assistant
  public static chatAI(message: string, conversationId?: string, language: string = 'en') {
    return this.request<any>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, language }),
    });
  }

  public static getConversations() {
    return this.request<any>('/ai/conversations');
  }

  public static getConversationById(id: string) {
    return this.request<any>(`/ai/conversations/${id}`);
  }

  // Application Tracker
  public static getApplications() {
    return this.request<any>('/applications');
  }

  public static createApplication(body: any) {
    return this.request<any>('/applications', { method: 'POST', body: JSON.stringify(body) });
  }

  public static updateApplication(id: string, body: any) {
    return this.request<any>(`/applications/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  public static updateDocumentProgress(id: string, documentId: string, status: string) {
    return this.request<any>(`/applications/${id}/documents`, {
      method: 'PATCH',
      body: JSON.stringify({ documentId, status }),
    });
  }

  public static deleteApplication(id: string) {
    return this.request<any>(`/applications/${id}`, { method: 'DELETE' });
  }

  // Notifications
  public static getNotifications() {
    return this.request<any>('/notifications');
  }

  public static markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public static markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', { method: 'PATCH' });
  }

  // Reports
  public static submitReport(body: any) {
    return this.request<any>('/reports', { method: 'POST', body: JSON.stringify(body) });
  }

  public static getReports() {
    return this.request<any>('/reports');
  }

  public static updateReportStatus(id: string, body: any) {
    return this.request<any>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
  }

  // Admin
  public static getAdminStats() {
    return this.request<any>('/admin/stats');
  }

  public static createScheme(body: any) {
    return this.request<any>('/admin/schemes', { method: 'POST', body: JSON.stringify(body) });
  }

  public static updateScheme(id: string, body: any) {
    return this.request<any>(`/admin/schemes/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  public static deleteScheme(id: string) {
    return this.request<any>(`/admin/schemes/${id}`, { method: 'DELETE' });
  }

  public static getSources() {
    return this.request<any>('/admin/sources');
  }

  public static verifySource(id: string, isVerified: boolean) {
    return this.request<any>(`/admin/sources/${id}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ isVerified }),
    });
  }
}
