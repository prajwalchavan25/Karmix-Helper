import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class ReportController {
  public static async submitReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { schemeId, issueType, description, userEmail } = req.body;

      if (!schemeId || !issueType || !description) {
        res.status(400).json({ success: false, message: 'Scheme ID, issue type, and description are required.' });
        return;
      }

      const report = await prisma.report.create({
        data: {
          schemeId,
          issueType,
          description,
          userId: req.user ? req.user.id : null,
          userEmail: userEmail || (req.user ? req.user.email : null),
          status: 'PENDING',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Thank you for reporting this issue. Our civic data team will review and verify it against official gazettes.',
        report,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to submit report.', error: error.message });
    }
  }

  public static async getReports(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reports = await prisma.report.findMany({
        include: {
          scheme: {
            select: { id: true, titleEn: true, slug: true, portalName: true, applicationUrl: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, reports });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch reports.', error: error.message });
    }
  }

  public static async updateReportStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body; // PENDING, INVESTIGATING, RESOLVED, REJECTED

      const report = await prisma.report.update({
        where: { id },
        data: {
          status: status !== undefined ? status : undefined,
          adminNotes: adminNotes !== undefined ? adminNotes : undefined,
        },
      });

      res.json({ success: true, message: 'Report updated successfully.', report });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update report status.', error: error.message });
    }
  }
}
