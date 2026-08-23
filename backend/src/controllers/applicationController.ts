import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class ApplicationController {
  public static async getApplications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const applications = await prisma.application.findMany({
        where: { userId: req.user.id },
        include: {
          scheme: {
            include: {
              category: true,
              source: true,
              requiredDocuments: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      const formatted = applications.map((app) => {
        const docProgress = app.documentProgressJson ? JSON.parse(app.documentProgressJson) : {};
        const totalDocs = app.scheme.requiredDocuments.length;
        let readyDocs = 0;

        app.scheme.requiredDocuments.forEach((doc) => {
          if (docProgress[doc.id] === 'READY') {
            readyDocs++;
          }
        });

        const readinessPercentage = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 100;

        return {
          ...app,
          documentProgress: docProgress,
          readinessPercentage,
          readyDocsCount: readyDocs,
          totalDocsCount: totalDocs,
        };
      });

      res.json({
        success: true,
        applications: formatted,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch applications.', error: error.message });
    }
  }

  public static async createApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { schemeId, status, referenceNumber, notes, deadlineDate } = req.body;

      if (!schemeId) {
        res.status(400).json({ success: false, message: 'Scheme ID is required.' });
        return;
      }

      const scheme = await prisma.scheme.findUnique({
        where: { id: schemeId },
        include: { requiredDocuments: true },
      });

      if (!scheme) {
        res.status(404).json({ success: false, message: 'Scheme not found.' });
        return;
      }

      // Check existing application
      const existing = await prisma.application.findFirst({
        where: { userId: req.user.id, schemeId },
      });

      if (existing) {
        res.status(400).json({
          success: false,
          message: 'You are already tracking an application for this scheme.',
          existingApplicationId: existing.id,
        });
        return;
      }

      // Initialize default document checklist
      const initialDocProgress: Record<string, string> = {};
      scheme.requiredDocuments.forEach((doc) => {
        initialDocProgress[doc.id] = 'MISSING';
      });

      const application = await prisma.application.create({
        data: {
          userId: req.user.id,
          schemeId,
          status: status || 'INTERESTED',
          referenceNumber: referenceNumber || null,
          deadlineDate: deadlineDate ? new Date(deadlineDate) : null,
          notes: notes || null,
          documentProgressJson: JSON.stringify(initialDocProgress),
        },
        include: {
          scheme: {
            include: { category: true, requiredDocuments: true },
          },
        },
      });

      // Also ensure it is marked saved
      await prisma.savedScheme.upsert({
        where: { userId_schemeId: { userId: req.user.id, schemeId } },
        create: { userId: req.user.id, schemeId, notes: 'Added to Application Tracker' },
        update: {},
      });

      res.status(201).json({
        success: true,
        message: 'Application added to tracker successfully.',
        application,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to create application entry.', error: error.message });
    }
  }

  public static async updateApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { status, referenceNumber, appliedDate, deadlineDate, notes } = req.body;

      const app = await prisma.application.findUnique({
        where: { id },
      });

      if (!app || app.userId !== req.user.id) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          status: status !== undefined ? status : undefined,
          referenceNumber: referenceNumber !== undefined ? referenceNumber : undefined,
          appliedDate: appliedDate !== undefined ? (appliedDate ? new Date(appliedDate) : null) : undefined,
          deadlineDate: deadlineDate !== undefined ? (deadlineDate ? new Date(deadlineDate) : null) : undefined,
          notes: notes !== undefined ? notes : undefined,
        },
        include: {
          scheme: {
            include: { category: true, requiredDocuments: true },
          },
        },
      });

      res.json({
        success: true,
        message: 'Application updated successfully.',
        application: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update application.', error: error.message });
    }
  }

  public static async updateDocumentProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;
      const { documentId, status } = req.body; // status: 'READY' | 'MISSING' | 'NA'

      if (!documentId || !status) {
        res.status(400).json({ success: false, message: 'Document ID and status are required.' });
        return;
      }

      const app = await prisma.application.findUnique({
        where: { id },
        include: { scheme: { include: { requiredDocuments: true } } },
      });

      if (!app || app.userId !== req.user.id) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      const currentProgress = app.documentProgressJson ? JSON.parse(app.documentProgressJson) : {};
      currentProgress[documentId] = status;

      // Auto update status if all documents ready
      let newAppStatus = app.status;
      const allReady = app.scheme.requiredDocuments.every((d) => currentProgress[d.id] === 'READY' || currentProgress[d.id] === 'NA');
      if (allReady && app.status === 'DOCUMENTS_PENDING') {
        newAppStatus = 'READY_TO_APPLY';
      }

      const updated = await prisma.application.update({
        where: { id },
        data: {
          documentProgressJson: JSON.stringify(currentProgress),
          status: newAppStatus,
        },
      });

      res.json({
        success: true,
        message: 'Document readiness updated.',
        documentProgress: currentProgress,
        applicationStatus: updated.status,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update document checklist.', error: error.message });
    }
  }

  public static async deleteApplication(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const app = await prisma.application.findUnique({
        where: { id },
      });

      if (!app || app.userId !== req.user.id) {
        res.status(404).json({ success: false, message: 'Application not found.' });
        return;
      }

      await prisma.application.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Application removed from tracker.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to delete application.', error: error.message });
    }
  }
}
