import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest } from '../middleware/authMiddleware';

const prisma = new PrismaClient();

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, phone, preferredLanguage, profile } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone: phone || null,
          role: 'CITIZEN',
          preferredLanguage: preferredLanguage || 'en',
          profile: profile
            ? {
                create: {
                  age: profile.age ? parseInt(profile.age, 10) : null,
                  gender: profile.gender || null,
                  state: profile.state || null,
                  district: profile.district || null,
                  areaType: profile.areaType || null,
                  occupation: profile.occupation || null,
                  education: profile.education || null,
                  incomeRange: profile.incomeRange || null,
                  incomeAmount: profile.incomeAmount ? parseFloat(profile.incomeAmount) : null,
                  casteCategory: profile.casteCategory || null,
                  isMinority: Boolean(profile.isMinority),
                  isDisability: Boolean(profile.isDisability),
                  disabilityPercentage: profile.disabilityPercentage ? parseFloat(profile.disabilityPercentage) : null,
                  isBpl: Boolean(profile.isBpl),
                  rationCardType: profile.rationCardType || null,
                  landHoldingAcres: profile.landHoldingAcres ? parseFloat(profile.landHoldingAcres) : null,
                  maritalStatus: profile.maritalStatus || null,
                  hasFamilyMembers: profile.hasFamilyMembers ? parseInt(profile.hasFamilyMembers, 10) : null,
                },
              }
            : undefined,
        },
        include: { profile: true },
      });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
        expiresIn: '7d',
      });

      res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferredLanguage: user.preferredLanguage,
          profile: user.profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Registration failed.', error: error.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required.' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { profile: true },
      });

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, config.jwtSecret, {
        expiresIn: '7d',
      });

      res.json({
        success: true,
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferredLanguage: user.preferredLanguage,
          profile: user.profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Login failed.', error: error.message });
    }
  }

  public static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          preferredLanguage: user.preferredLanguage,
          profile: user.profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch user.', error: error.message });
    }
  }

  public static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { name, phone, preferredLanguage, profile } = req.body;

      // Update user base fields
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          name: name !== undefined ? name : undefined,
          phone: phone !== undefined ? phone : undefined,
          preferredLanguage: preferredLanguage !== undefined ? preferredLanguage : undefined,
        },
      });

      // Upsert profile
      if (profile) {
        await prisma.userProfile.upsert({
          where: { userId: req.user.id },
          create: {
            userId: req.user.id,
            age: profile.age ? parseInt(profile.age, 10) : null,
            gender: profile.gender || null,
            state: profile.state || null,
            district: profile.district || null,
            areaType: profile.areaType || null,
            occupation: profile.occupation || null,
            education: profile.education || null,
            incomeRange: profile.incomeRange || null,
            incomeAmount: profile.incomeAmount ? parseFloat(profile.incomeAmount) : null,
            casteCategory: profile.casteCategory || null,
            isMinority: Boolean(profile.isMinority),
            isDisability: Boolean(profile.isDisability),
            disabilityPercentage: profile.disabilityPercentage ? parseFloat(profile.disabilityPercentage) : null,
            isBpl: Boolean(profile.isBpl),
            rationCardType: profile.rationCardType || null,
            landHoldingAcres: profile.landHoldingAcres ? parseFloat(profile.landHoldingAcres) : null,
            maritalStatus: profile.maritalStatus || null,
            hasFamilyMembers: profile.hasFamilyMembers ? parseInt(profile.hasFamilyMembers, 10) : null,
          },
          update: {
            age: profile.age !== undefined ? (profile.age ? parseInt(profile.age, 10) : null) : undefined,
            gender: profile.gender !== undefined ? profile.gender : undefined,
            state: profile.state !== undefined ? profile.state : undefined,
            district: profile.district !== undefined ? profile.district : undefined,
            areaType: profile.areaType !== undefined ? profile.areaType : undefined,
            occupation: profile.occupation !== undefined ? profile.occupation : undefined,
            education: profile.education !== undefined ? profile.education : undefined,
            incomeRange: profile.incomeRange !== undefined ? profile.incomeRange : undefined,
            incomeAmount: profile.incomeAmount !== undefined ? (profile.incomeAmount ? parseFloat(profile.incomeAmount) : null) : undefined,
            casteCategory: profile.casteCategory !== undefined ? profile.casteCategory : undefined,
            isMinority: profile.isMinority !== undefined ? Boolean(profile.isMinority) : undefined,
            isDisability: profile.isDisability !== undefined ? Boolean(profile.isDisability) : undefined,
            disabilityPercentage: profile.disabilityPercentage !== undefined ? (profile.disabilityPercentage ? parseFloat(profile.disabilityPercentage) : null) : undefined,
            isBpl: profile.isBpl !== undefined ? Boolean(profile.isBpl) : undefined,
            rationCardType: profile.rationCardType !== undefined ? profile.rationCardType : undefined,
            landHoldingAcres: profile.landHoldingAcres !== undefined ? (profile.landHoldingAcres ? parseFloat(profile.landHoldingAcres) : null) : undefined,
            maritalStatus: profile.maritalStatus !== undefined ? profile.maritalStatus : undefined,
            hasFamilyMembers: profile.hasFamilyMembers !== undefined ? (profile.hasFamilyMembers ? parseInt(profile.hasFamilyMembers, 10) : null) : undefined,
          },
        });
      }

      const fullUser = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: { profile: true },
      });

      res.json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: fullUser?.id,
          name: fullUser?.name,
          email: fullUser?.email,
          role: fullUser?.role,
          phone: fullUser?.phone,
          preferredLanguage: fullUser?.preferredLanguage,
          profile: fullUser?.profile,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
    }
  }
}
