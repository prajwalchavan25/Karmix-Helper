import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { RecommendationService } from '../services/recommendationService';
import { AIService } from '../services/aiService';
import { EligibilityService } from '../services/eligibilityService';

const prisma = new PrismaClient();

export class SchemeController {
  public static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await prisma.schemeCategory.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: {
            select: { schemes: { where: { isPublished: true } } },
          },
        },
      });

      res.json({
        success: true,
        categories: categories.map((c) => ({
          ...c,
          schemeCount: c._count.schemes,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch categories.', error: error.message });
    }
  }

  public static async getSchemes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        category,
        state,
        level,
        occupation,
        benefitType,
        search,
        featured,
        page = '1',
        limit = '20',
      } = req.query;

      const where: any = { isPublished: true };

      if (category) {
        where.category = { slug: String(category) };
      }

      if (state && state !== 'All India') {
        where.OR = [
          { state: String(state) },
          { state: 'All India' },
          { state: null },
        ];
      }

      if (level && (level === 'CENTRAL' || level === 'STATE')) {
        where.level = level;
      }

      if (benefitType) {
        where.benefitType = { contains: String(benefitType) };
      }

      if (featured === 'true') {
        where.isFeatured = true;
      }

      if (search) {
        const s = String(search).trim();
        where.OR = [
          { titleEn: { contains: s } },
          { titleMr: { contains: s } },
          { titleHi: { contains: s } },
          { shortSummaryEn: { contains: s } },
          { shortSummaryMr: { contains: s } },
          { shortSummaryHi: { contains: s } },
          { department: { contains: s } },
        ];
      }

      const pageNum = parseInt(String(page), 10) || 1;
      const limitNum = parseInt(String(limit), 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [schemes, total] = await Promise.all([
        prisma.scheme.findMany({
          where,
          include: {
            category: true,
            source: true,
            eligibilityCriteria: true,
            requiredDocuments: true,
          },
          orderBy: [{ isFeatured: 'desc' }, { viewsCount: 'desc' }, { createdAt: 'desc' }],
          skip,
          take: limitNum,
        }),
        prisma.scheme.count({ where }),
      ]);

      // If user is authenticated, compute eligibility for each scheme
      let userProfile: any = null;
      let savedSchemeIds: string[] = [];

      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            profile: true,
            savedSchemes: true,
          },
        });
        userProfile = user?.profile;
        savedSchemeIds = user?.savedSchemes.map((s) => s.schemeId) || [];
      }

      const enhancedSchemes = schemes.map((scheme) => {
        const eligibility = EligibilityService.evaluate(userProfile, scheme.eligibilityCriteria);
        return {
          ...scheme,
          isSaved: savedSchemeIds.includes(scheme.id),
          calculatedEligibility: eligibility,
        };
      });

      res.json({
        success: true,
        schemes: enhancedSchemes,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch schemes.', error: error.message });
    }
  }

  public static async getSchemeBySlug(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      const scheme = await prisma.scheme.findUnique({
        where: { slug },
        include: {
          category: true,
          source: true,
          eligibilityCriteria: true,
          requiredDocuments: true,
        },
      });

      if (!scheme) {
        res.status(404).json({ success: false, message: 'Scheme not found.' });
        return;
      }

      // Increment view count asynchronously
      prisma.scheme.update({
        where: { id: scheme.id },
        data: { viewsCount: { increment: 1 } },
      }).catch((e) => console.error('Failed to increment scheme view:', e));

      let userProfile: any = null;
      let isSaved = false;
      let existingApplication: any = null;

      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            profile: true,
            savedSchemes: { where: { schemeId: scheme.id } },
            applications: { where: { schemeId: scheme.id } },
          },
        });
        userProfile = user?.profile;
        isSaved = (user?.savedSchemes.length || 0) > 0;
        existingApplication = user?.applications[0] || null;
      }

      const calculatedEligibility = EligibilityService.evaluate(userProfile, scheme.eligibilityCriteria);

      res.json({
        success: true,
        scheme: {
          ...scheme,
          isSaved,
          existingApplication,
          calculatedEligibility,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch scheme details.', error: error.message });
    }
  }

  public static async getRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      let userProfile: any = null;
      let savedSchemeIds: string[] = [];

      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            profile: true,
            savedSchemes: true,
          },
        });
        userProfile = user?.profile;
        savedSchemeIds = user?.savedSchemes.map((s) => s.schemeId) || [];
      } else if (req.query.age || req.query.state || req.query.occupation || req.query.incomeRange) {
        // Guest query parameters
        userProfile = {
          age: req.query.age ? parseInt(String(req.query.age), 10) : null,
          state: req.query.state ? String(req.query.state) : null,
          occupation: req.query.occupation ? String(req.query.occupation) : null,
          gender: req.query.gender ? String(req.query.gender) : null,
          education: req.query.education ? String(req.query.education) : null,
          incomeRange: req.query.incomeRange ? String(req.query.incomeRange) : null,
          casteCategory: req.query.casteCategory ? String(req.query.casteCategory) : null,
        };
      }

      const allSchemes = await prisma.scheme.findMany({
        where: { isPublished: true },
        include: {
          category: true,
          source: true,
          eligibilityCriteria: true,
          requiredDocuments: true,
        },
      });

      const ranked = RecommendationService.rankSchemes(userProfile, allSchemes);

      const enhancedRanked = ranked.slice(0, 12).map((item) => ({
        ...item.scheme,
        isSaved: savedSchemeIds.includes(item.scheme.id),
        calculatedEligibility: item.eligibility,
        recommendationScore: item.recommendationScore,
        recommendationReasonEn: item.recommendationReasonEn,
        recommendationReasonMr: item.recommendationReasonMr,
        recommendationReasonHi: item.recommendationReasonHi,
      }));

      res.json({
        success: true,
        recommendations: enhancedRanked,
        userProfileUsed: userProfile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch recommendations.', error: error.message });
    }
  }

  public static async searchNaturalLanguage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q } = req.body;
      if (!q || !q.trim()) {
        res.status(400).json({ success: false, message: 'Search query string is required.' });
        return;
      }

      const parsedFilters = await AIService.parseNaturalLanguageSearch(q);

      // Log search query asynchronously for analytics
      prisma.searchLog.create({
        data: {
          query: q,
          parsedFiltersJson: JSON.stringify(parsedFilters),
          resultsCount: 0,
          language: 'en',
        },
      }).catch((e) => console.error('Search log error:', e));

      // Build structured Prisma query
      const where: any = { isPublished: true };

      if (parsedFilters.categorySlug) {
        where.category = { slug: parsedFilters.categorySlug };
      }

      if (parsedFilters.state && parsedFilters.state !== 'All India') {
        where.OR = [
          { state: parsedFilters.state },
          { state: 'All India' },
          { state: null },
        ];
      }

      const schemes = await prisma.scheme.findMany({
        where,
        include: {
          category: true,
          source: true,
          eligibilityCriteria: true,
          requiredDocuments: true,
        },
        take: 15,
      });

      let userProfile: any = null;
      let savedSchemeIds: string[] = [];

      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: {
            profile: true,
            savedSchemes: true,
          },
        });
        userProfile = user?.profile;
        savedSchemeIds = user?.savedSchemes.map((s) => s.schemeId) || [];
      } else if (parsedFilters.age || parsedFilters.occupation || parsedFilters.state || parsedFilters.gender) {
        userProfile = {
          age: parsedFilters.age,
          occupation: parsedFilters.occupation,
          state: parsedFilters.state,
          gender: parsedFilters.gender,
        };
      }

      const scored = RecommendationService.rankSchemes(userProfile, schemes);

      const results = scored.map((item) => ({
        ...item.scheme,
        isSaved: savedSchemeIds.includes(item.scheme.id),
        calculatedEligibility: item.eligibility,
        recommendationReasonEn: item.recommendationReasonEn,
        recommendationReasonMr: item.recommendationReasonMr,
        recommendationReasonHi: item.recommendationReasonHi,
      }));

      res.json({
        success: true,
        query: q,
        parsedFilters,
        results,
        count: results.length,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Natural language search failed.', error: error.message });
    }
  }

  public static async toggleSaveScheme(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Please log in to save schemes.' });
        return;
      }

      const { schemeId, notes } = req.body;
      if (!schemeId) {
        res.status(400).json({ success: false, message: 'Scheme ID is required.' });
        return;
      }

      const existing = await prisma.savedScheme.findUnique({
        where: {
          userId_schemeId: {
            userId: req.user.id,
            schemeId,
          },
        },
      });

      if (existing) {
        await prisma.savedScheme.delete({
          where: { id: existing.id },
        });
        await prisma.scheme.update({
          where: { id: schemeId },
          data: { savesCount: { decrement: 1 } },
        });
        res.json({ success: true, isSaved: false, message: 'Scheme removed from saved list.' });
      } else {
        await prisma.savedScheme.create({
          data: {
            userId: req.user.id,
            schemeId,
            notes: notes || null,
          },
        });
        await prisma.scheme.update({
          where: { id: schemeId },
          data: { savesCount: { increment: 1 } },
        });
        res.json({ success: true, isSaved: true, message: 'Scheme saved successfully to your dashboard.' });
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to toggle save scheme.', error: error.message });
    }
  }

  public static async getSavedSchemes(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          profile: true,
          savedSchemes: {
            include: {
              scheme: {
                include: {
                  category: true,
                  source: true,
                  eligibilityCriteria: true,
                  requiredDocuments: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          applications: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const savedList = user.savedSchemes.map((item) => {
        const eligibility = EligibilityService.evaluate(user.profile, item.scheme.eligibilityCriteria);
        const activeApp = user.applications.find((a) => a.schemeId === item.scheme.id);
        return {
          id: item.id,
          savedAt: item.createdAt,
          notes: item.notes,
          scheme: {
            ...item.scheme,
            isSaved: true,
            calculatedEligibility: eligibility,
            applicationStatus: activeApp ? activeApp.status : null,
            applicationId: activeApp ? activeApp.id : null,
          },
        };
      });

      res.json({
        success: true,
        savedSchemes: savedList,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch saved schemes.', error: error.message });
    }
  }
}
