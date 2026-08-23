import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class AdminController {
  public static async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [
        totalUsers,
        totalSchemes,
        publishedSchemes,
        totalApplications,
        totalSavedSchemes,
        totalReports,
        pendingReports,
        totalSearches,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'CITIZEN' } }),
        prisma.scheme.count(),
        prisma.scheme.count({ where: { isPublished: true } }),
        prisma.application.count(),
        prisma.savedScheme.count(),
        prisma.report.count(),
        prisma.report.count({ where: { status: 'PENDING' } }),
        prisma.searchLog.count(),
      ]);

      // Category distribution
      const categories = await prisma.schemeCategory.findMany({
        include: {
          _count: { select: { schemes: true } },
        },
      });

      // Status pipeline distribution
      const applications = await prisma.application.findMany({
        select: { status: true },
      });

      const applicationStats: Record<string, number> = {
        INTERESTED: 0,
        DOCUMENTS_PENDING: 0,
        READY_TO_APPLY: 0,
        APPLIED: 0,
        UNDER_REVIEW: 0,
        APPROVED: 0,
        REJECTED: 0,
        COMPLETED: 0,
      };

      applications.forEach((a) => {
        if (applicationStats[a.status] !== undefined) {
          applicationStats[a.status]++;
        }
      });

      // Popular schemes by views
      const popularSchemes = await prisma.scheme.findMany({
        orderBy: { viewsCount: 'desc' },
        take: 5,
        select: {
          id: true,
          titleEn: true,
          slug: true,
          viewsCount: true,
          savesCount: true,
          department: true,
        },
      });

      // Recent searches
      const recentSearches = await prisma.searchLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
      });

      res.json({
        success: true,
        stats: {
          totalUsers,
          totalSchemes,
          publishedSchemes,
          totalApplications,
          totalSavedSchemes,
          totalReports,
          pendingReports,
          totalSearches,
          categoryBreakdown: categories.map((c) => ({
            name: c.nameEn,
            count: c._count.schemes,
          })),
          applicationStats,
          popularSchemes,
          recentSearches,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch admin stats.', error: error.message });
    }
  }

  public static async createScheme(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        titleEn,
        titleMr,
        titleHi,
        slug,
        shortSummaryEn,
        shortSummaryMr,
        shortSummaryHi,
        detailedDescriptionEn,
        detailedDescriptionMr,
        detailedDescriptionHi,
        benefitsEn,
        benefitsMr,
        benefitsHi,
        benefitType,
        department,
        level,
        state,
        categoryId,
        sourceId,
        applicationMode,
        applicationUrl,
        portalName,
        applicationDeadline,
        applicationStepsEn,
        applicationStepsMr,
        applicationStepsHi,
        importantNotesEn,
        importantNotesMr,
        importantNotesHi,
        isPublished,
        isFeatured,
        criteria,
        documents,
      } = req.body;

      if (!titleEn || !slug || !categoryId || !applicationUrl) {
        res.status(400).json({ success: false, message: 'Title, slug, category, and application URL are required.' });
        return;
      }

      const generatedSlug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const scheme = await prisma.scheme.create({
        data: {
          titleEn,
          titleMr: titleMr || titleEn,
          titleHi: titleHi || titleEn,
          slug: generatedSlug,
          shortSummaryEn: shortSummaryEn || '',
          shortSummaryMr: shortSummaryMr || shortSummaryEn || '',
          shortSummaryHi: shortSummaryHi || shortSummaryEn || '',
          detailedDescriptionEn: detailedDescriptionEn || '',
          detailedDescriptionMr: detailedDescriptionMr || detailedDescriptionEn || '',
          detailedDescriptionHi: detailedDescriptionHi || detailedDescriptionEn || '',
          benefitsEn: benefitsEn || '',
          benefitsMr: benefitsMr || benefitsEn || '',
          benefitsHi: benefitsHi || benefitsEn || '',
          benefitType: benefitType || 'Direct Benefit Transfer',
          department: department || 'Government Authority',
          level: level || 'CENTRAL',
          state: state || 'All India',
          categoryId,
          sourceId: sourceId || null,
          applicationMode: applicationMode || 'ONLINE',
          applicationUrl,
          portalName: portalName || 'Official Portal',
          applicationDeadline: applicationDeadline || 'Rolling / Always Open',
          applicationStepsEn: typeof applicationStepsEn === 'string' ? applicationStepsEn : JSON.stringify(applicationStepsEn || []),
          applicationStepsMr: typeof applicationStepsMr === 'string' ? applicationStepsMr : JSON.stringify(applicationStepsMr || []),
          applicationStepsHi: typeof applicationStepsHi === 'string' ? applicationStepsHi : JSON.stringify(applicationStepsHi || []),
          importantNotesEn: importantNotesEn || null,
          importantNotesMr: importantNotesMr || null,
          importantNotesHi: importantNotesHi || null,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : false,
          eligibilityCriteria: criteria
            ? {
                create: {
                  minAge: criteria.minAge ? parseInt(criteria.minAge, 10) : null,
                  maxAge: criteria.maxAge ? parseInt(criteria.maxAge, 10) : null,
                  allowedGenders: criteria.allowedGenders || 'Any',
                  allowedStates: criteria.allowedStates || 'All India',
                  allowedOccupations: typeof criteria.allowedOccupations === 'string' ? criteria.allowedOccupations : JSON.stringify(criteria.allowedOccupations || []),
                  allowedEducation: typeof criteria.allowedEducation === 'string' ? criteria.allowedEducation : JSON.stringify(criteria.allowedEducation || []),
                  maxAnnualIncome: criteria.maxAnnualIncome ? parseFloat(criteria.maxAnnualIncome) : null,
                  allowedCategories: typeof criteria.allowedCategories === 'string' ? criteria.allowedCategories : JSON.stringify(criteria.allowedCategories || []),
                  requiresDisability: Boolean(criteria.requiresDisability),
                  requiresBpl: Boolean(criteria.requiresBpl),
                  extraConditionsEn: criteria.extraConditionsEn || null,
                  extraConditionsMr: criteria.extraConditionsMr || null,
                  extraConditionsHi: criteria.extraConditionsHi || null,
                },
              }
            : undefined,
          requiredDocuments: documents && Array.isArray(documents)
            ? {
                create: documents.map((d: any) => ({
                  nameEn: d.nameEn,
                  nameMr: d.nameMr || d.nameEn,
                  nameHi: d.nameHi || d.nameEn,
                  descriptionEn: d.descriptionEn || null,
                  descriptionMr: d.descriptionMr || null,
                  descriptionHi: d.descriptionHi || null,
                  isMandatory: d.isMandatory !== undefined ? Boolean(d.isMandatory) : true,
                  issuanceAuthority: d.issuanceAuthority || null,
                  documentType: d.documentType || 'Other',
                })),
              }
            : undefined,
        },
        include: {
          category: true,
          eligibilityCriteria: true,
          requiredDocuments: true,
          source: true,
        },
      });

      res.status(201).json({ success: true, message: 'Scheme created successfully.', scheme });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create scheme.', error: error.message });
    }
  }

  public static async updateScheme(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        titleEn,
        titleMr,
        titleHi,
        shortSummaryEn,
        shortSummaryMr,
        shortSummaryHi,
        detailedDescriptionEn,
        detailedDescriptionMr,
        detailedDescriptionHi,
        benefitsEn,
        benefitsMr,
        benefitsHi,
        benefitType,
        department,
        level,
        state,
        categoryId,
        sourceId,
        applicationMode,
        applicationUrl,
        portalName,
        applicationDeadline,
        applicationStepsEn,
        applicationStepsMr,
        applicationStepsHi,
        importantNotesEn,
        importantNotesMr,
        importantNotesHi,
        isPublished,
        isFeatured,
        criteria,
        documents,
      } = req.body;

      const scheme = await prisma.scheme.update({
        where: { id },
        data: {
          titleEn: titleEn !== undefined ? titleEn : undefined,
          titleMr: titleMr !== undefined ? titleMr : undefined,
          titleHi: titleHi !== undefined ? titleHi : undefined,
          shortSummaryEn: shortSummaryEn !== undefined ? shortSummaryEn : undefined,
          shortSummaryMr: shortSummaryMr !== undefined ? shortSummaryMr : undefined,
          shortSummaryHi: shortSummaryHi !== undefined ? shortSummaryHi : undefined,
          detailedDescriptionEn: detailedDescriptionEn !== undefined ? detailedDescriptionEn : undefined,
          detailedDescriptionMr: detailedDescriptionMr !== undefined ? detailedDescriptionMr : undefined,
          detailedDescriptionHi: detailedDescriptionHi !== undefined ? detailedDescriptionHi : undefined,
          benefitsEn: benefitsEn !== undefined ? benefitsEn : undefined,
          benefitsMr: benefitsMr !== undefined ? benefitsMr : undefined,
          benefitsHi: benefitsHi !== undefined ? benefitsHi : undefined,
          benefitType: benefitType !== undefined ? benefitType : undefined,
          department: department !== undefined ? department : undefined,
          level: level !== undefined ? level : undefined,
          state: state !== undefined ? state : undefined,
          categoryId: categoryId !== undefined ? categoryId : undefined,
          sourceId: sourceId !== undefined ? sourceId : undefined,
          applicationMode: applicationMode !== undefined ? applicationMode : undefined,
          applicationUrl: applicationUrl !== undefined ? applicationUrl : undefined,
          portalName: portalName !== undefined ? portalName : undefined,
          applicationDeadline: applicationDeadline !== undefined ? applicationDeadline : undefined,
          applicationStepsEn: applicationStepsEn !== undefined ? (typeof applicationStepsEn === 'string' ? applicationStepsEn : JSON.stringify(applicationStepsEn)) : undefined,
          applicationStepsMr: applicationStepsMr !== undefined ? (typeof applicationStepsMr === 'string' ? applicationStepsMr : JSON.stringify(applicationStepsMr)) : undefined,
          applicationStepsHi: applicationStepsHi !== undefined ? (typeof applicationStepsHi === 'string' ? applicationStepsHi : JSON.stringify(applicationStepsHi)) : undefined,
          importantNotesEn: importantNotesEn !== undefined ? importantNotesEn : undefined,
          importantNotesMr: importantNotesMr !== undefined ? importantNotesMr : undefined,
          importantNotesHi: importantNotesHi !== undefined ? importantNotesHi : undefined,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
          isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
          lastVerifiedAt: new Date(),
        },
      });

      // Update eligibility criteria if provided
      if (criteria) {
        await prisma.eligibilityCriteria.upsert({
          where: { schemeId: id },
          create: {
            schemeId: id,
            minAge: criteria.minAge ? parseInt(criteria.minAge, 10) : null,
            maxAge: criteria.maxAge ? parseInt(criteria.maxAge, 10) : null,
            allowedGenders: criteria.allowedGenders || 'Any',
            allowedStates: criteria.allowedStates || 'All India',
            allowedOccupations: typeof criteria.allowedOccupations === 'string' ? criteria.allowedOccupations : JSON.stringify(criteria.allowedOccupations || []),
            allowedEducation: typeof criteria.allowedEducation === 'string' ? criteria.allowedEducation : JSON.stringify(criteria.allowedEducation || []),
            maxAnnualIncome: criteria.maxAnnualIncome ? parseFloat(criteria.maxAnnualIncome) : null,
            allowedCategories: typeof criteria.allowedCategories === 'string' ? criteria.allowedCategories : JSON.stringify(criteria.allowedCategories || []),
            requiresDisability: Boolean(criteria.requiresDisability),
            requiresBpl: Boolean(criteria.requiresBpl),
            extraConditionsEn: criteria.extraConditionsEn || null,
            extraConditionsMr: criteria.extraConditionsMr || null,
            extraConditionsHi: criteria.extraConditionsHi || null,
          },
          update: {
            minAge: criteria.minAge !== undefined ? (criteria.minAge ? parseInt(criteria.minAge, 10) : null) : undefined,
            maxAge: criteria.maxAge !== undefined ? (criteria.maxAge ? parseInt(criteria.maxAge, 10) : null) : undefined,
            allowedGenders: criteria.allowedGenders !== undefined ? criteria.allowedGenders : undefined,
            allowedStates: criteria.allowedStates !== undefined ? criteria.allowedStates : undefined,
            allowedOccupations: criteria.allowedOccupations !== undefined ? (typeof criteria.allowedOccupations === 'string' ? criteria.allowedOccupations : JSON.stringify(criteria.allowedOccupations)) : undefined,
            allowedEducation: criteria.allowedEducation !== undefined ? (typeof criteria.allowedEducation === 'string' ? criteria.allowedEducation : JSON.stringify(criteria.allowedEducation)) : undefined,
            maxAnnualIncome: criteria.maxAnnualIncome !== undefined ? (criteria.maxAnnualIncome ? parseFloat(criteria.maxAnnualIncome) : null) : undefined,
            allowedCategories: criteria.allowedCategories !== undefined ? (typeof criteria.allowedCategories === 'string' ? criteria.allowedCategories : JSON.stringify(criteria.allowedCategories)) : undefined,
            requiresDisability: criteria.requiresDisability !== undefined ? Boolean(criteria.requiresDisability) : undefined,
            requiresBpl: criteria.requiresBpl !== undefined ? Boolean(criteria.requiresBpl) : undefined,
            extraConditionsEn: criteria.extraConditionsEn !== undefined ? criteria.extraConditionsEn : undefined,
            extraConditionsMr: criteria.extraConditionsMr !== undefined ? criteria.extraConditionsMr : undefined,
            extraConditionsHi: criteria.extraConditionsHi !== undefined ? criteria.extraConditionsHi : undefined,
          },
        });
      }

      res.json({ success: true, message: 'Scheme updated successfully.', scheme });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update scheme.', error: error.message });
    }
  }

  public static async deleteScheme(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.scheme.delete({ where: { id } });
      res.json({ success: true, message: 'Scheme deleted successfully.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete scheme.', error: error.message });
    }
  }

  public static async getSources(req: Request, res: Response): Promise<void> {
    try {
      const sources = await prisma.governmentSource.findMany({
        include: {
          _count: { select: { schemes: true } },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, sources });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch sources.', error: error.message });
    }
  }

  public static async verifySource(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isVerified } = req.body;

      const source = await prisma.governmentSource.update({
        where: { id },
        data: {
          isVerified: Boolean(isVerified),
          lastVerifiedAt: new Date(),
        },
      });

      res.json({ success: true, message: 'Source verification status updated.', source });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update source verification.', error: error.message });
    }
  }
}
