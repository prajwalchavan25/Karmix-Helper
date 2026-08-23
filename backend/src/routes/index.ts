import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { SchemeController } from '../controllers/schemeController';
import { EligibilityController } from '../controllers/eligibilityController';
import { AIController } from '../controllers/aiController';
import { ApplicationController } from '../controllers/applicationController';
import { NotificationController } from '../controllers/notificationController';
import { ReportController } from '../controllers/reportController';
import { AdminController } from '../controllers/adminController';
import { authenticateToken, optionalAuthToken } from '../middleware/authMiddleware';
import { requireAdmin } from '../middleware/adminMiddleware';

const router = Router();

// --- Auth Routes ---
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authenticateToken, AuthController.getMe);
router.put('/auth/profile', authenticateToken, AuthController.updateProfile);

// --- Scheme Discovery Routes ---
router.get('/categories', SchemeController.getCategories);
router.get('/schemes', optionalAuthToken, SchemeController.getSchemes);
router.get('/schemes/recommendations', optionalAuthToken, SchemeController.getRecommendations);
router.post('/schemes/search-ai', optionalAuthToken, SchemeController.searchNaturalLanguage);
router.get('/schemes/saved', authenticateToken, SchemeController.getSavedSchemes);
router.post('/schemes/toggle-save', authenticateToken, SchemeController.toggleSaveScheme);
router.get('/schemes/:slug', optionalAuthToken, SchemeController.getSchemeBySlug);

// --- Eligibility Evaluation ---
router.post('/eligibility/check', optionalAuthToken, EligibilityController.checkEligibility);

// --- Karmix AI Assistant ---
router.post('/ai/chat', optionalAuthToken, AIController.chat);
router.get('/ai/conversations', authenticateToken, AIController.getConversations);
router.get('/ai/conversations/:id', authenticateToken, AIController.getConversationById);

// --- Citizen Application Tracker ---
router.get('/applications', authenticateToken, ApplicationController.getApplications);
router.post('/applications', authenticateToken, ApplicationController.createApplication);
router.put('/applications/:id', authenticateToken, ApplicationController.updateApplication);
router.patch('/applications/:id/documents', authenticateToken, ApplicationController.updateDocumentProgress);
router.delete('/applications/:id', authenticateToken, ApplicationController.deleteApplication);

// --- Notifications ---
router.get('/notifications', authenticateToken, NotificationController.getNotifications);
router.patch('/notifications/:id/read', authenticateToken, NotificationController.markAsRead);
router.patch('/notifications/read-all', authenticateToken, NotificationController.markAllAsRead);

// --- Reporting System ---
router.post('/reports', optionalAuthToken, ReportController.submitReport);
router.get('/reports', authenticateToken, requireAdmin, ReportController.getReports);
router.patch('/reports/:id', authenticateToken, requireAdmin, ReportController.updateReportStatus);

// --- Admin Management & Analytics ---
router.get('/admin/stats', authenticateToken, requireAdmin, AdminController.getStats);
router.post('/admin/schemes', authenticateToken, requireAdmin, AdminController.createScheme);
router.put('/admin/schemes/:id', authenticateToken, requireAdmin, AdminController.updateScheme);
router.delete('/admin/schemes/:id', authenticateToken, requireAdmin, AdminController.deleteScheme);
router.get('/admin/sources', AdminController.getSources);
router.patch('/admin/sources/:id/verify', authenticateToken, requireAdmin, AdminController.verifySource);

export default router;
