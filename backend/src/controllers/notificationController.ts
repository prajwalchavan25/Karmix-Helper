import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class NotificationController {
  public static async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const notifications = await prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });

      const unreadCount = notifications.filter((n) => !n.isRead).length;

      res.json({
        success: true,
        notifications,
        unreadCount,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications.', error: error.message });
    }
  }

  public static async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      await prisma.notification.updateMany({
        where: { id, userId: req.user.id },
        data: { isRead: true },
      });

      res.json({ success: true, message: 'Notification marked as read.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to mark notification as read.', error: error.message });
    }
  }

  public static async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await prisma.notification.updateMany({
        where: { userId: req.user.id },
        data: { isRead: true },
      });

      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update notifications.', error: error.message });
    }
  }
}
