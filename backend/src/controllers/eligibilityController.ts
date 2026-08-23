import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { EligibilityService } from '../services/eligibilityService';

const prisma = new PrismaClient();

export class EligibilityController {
  public static async checkEligibility(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { schemeId, profile } = req.body;

      if (!schemeId) {
        res.status(400).json({ success: false, message: 'Scheme ID is required.' });
        return;
      }

      const scheme = await prisma.scheme.findUnique({
        where: { id: schemeId },
        include: {
          eligibilityCriteria: true,
          category: true,
          source: true,
          requiredDocuments: true,
        },
      });

      if (!scheme) {
        res.status(404).json({ success: false, message: 'Scheme not found.' });
        return;
      }

      let evaluatedProfile = profile;

      if (!evaluatedProfile && req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { profile: true },
        });
        evaluatedProfile = user?.profile;
      }

      const result = EligibilityService.evaluate(evaluatedProfile, scheme.eligibilityCriteria);

      res.json({
        success: true,
        scheme: {
          id: scheme.id,
          titleEn: scheme.titleEn,
          titleMr: scheme.titleMr,
          titleHi: scheme.titleHi,
          slug: scheme.slug,
          benefitsEn: scheme.benefitsEn,
          portalName: scheme.portalName,
          applicationUrl: scheme.applicationUrl,
        },
        eligibility: result,
        profileUsed: evaluatedProfile,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to evaluate eligibility.', error: error.message });
    }
  }
}
