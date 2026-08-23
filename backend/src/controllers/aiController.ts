import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { AIService } from '../services/aiService';

const prisma = new PrismaClient();

export class AIController {
  public static async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message, conversationId, language = 'en' } = req.body;

      if (!message || !message.trim()) {
        res.status(400).json({ success: false, message: 'Message content is required.' });
        return;
      }

      let userProfile: any = null;
      let convId = conversationId;

      if (req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          include: { profile: true },
        });
        userProfile = user?.profile;
      }

      // Fetch previous message history if conversation exists
      let history: { sender: string; content: string }[] = [];
      if (convId) {
        const existingConv = await prisma.aIConversation.findUnique({
          where: { id: convId },
          include: {
            messages: {
              orderBy: { createdAt: 'asc' },
              take: 10,
            },
          },
        });
        if (existingConv) {
          history = existingConv.messages.map((m) => ({
            sender: m.sender,
            content: m.content,
          }));
        }
      }

      // Generate AI response
      const aiResponse = await AIService.answerCivicQuery(
        message,
        history,
        language as any,
        userProfile
      );

      // Persist to database if authenticated
      if (req.user) {
        if (!convId) {
          const newConv = await prisma.aIConversation.create({
            data: {
              userId: req.user.id,
              title: message.slice(0, 45) + (message.length > 45 ? '...' : ''),
              language: aiResponse.language,
            },
          });
          convId = newConv.id;
        }

        // Save User Message
        await prisma.aIMessage.create({
          data: {
            conversationId: convId,
            sender: 'USER',
            content: message,
          },
        });

        // Save Assistant Message
        await prisma.aIMessage.create({
          data: {
            conversationId: convId,
            sender: 'ASSISTANT',
            content: aiResponse.reply,
            referencedSchemesJson: JSON.stringify(aiResponse.referencedSchemes),
          },
        });

        // Update conversation updatedAt
        await prisma.aIConversation.update({
          where: { id: convId },
          data: { updatedAt: new Date() },
        });
      }

      res.json({
        success: true,
        conversationId: convId,
        reply: aiResponse.reply,
        language: aiResponse.language,
        referencedSchemes: aiResponse.referencedSchemes,
        suggestedFollowUps: aiResponse.suggestedFollowUps,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'AI Assistant failed.', error: error.message });
    }
  }

  public static async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const conversations = await prisma.aIConversation.findMany({
        where: { userId: req.user.id },
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      res.json({
        success: true,
        conversations: conversations.map((c) => ({
          id: c.id,
          title: c.title,
          language: c.language,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
          lastMessage: c.messages[0]?.content || '',
        })),
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch conversations.', error: error.message });
    }
  }

  public static async getConversationById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { id } = req.params;

      const conversation = await prisma.aIConversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation || conversation.userId !== req.user.id) {
        res.status(404).json({ success: false, message: 'Conversation not found.' });
        return;
      }

      const formattedMessages = conversation.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        content: m.content,
        referencedSchemes: m.referencedSchemesJson ? JSON.parse(m.referencedSchemesJson) : [],
        createdAt: m.createdAt,
      }));

      res.json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          language: conversation.language,
          messages: formattedMessages,
          createdAt: conversation.createdAt,
          updatedAt: conversation.updatedAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch conversation messages.', error: error.message });
    }
  }
}
