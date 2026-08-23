export type Language = 'en' | 'mr' | 'hi';

export interface UserProfile {
  id?: string;
  userId?: string;
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  areaType?: string | null;
  occupation?: string | null;
  education?: string | null;
  incomeRange?: string | null;
  incomeAmount?: number | null;
  casteCategory?: string | null;
  isMinority?: boolean;
  isDisability?: boolean;
  disabilityPercentage?: number | null;
  isBpl?: boolean;
  rationCardType?: string | null;
  landHoldingAcres?: number | null;
  maritalStatus?: string | null;
  hasFamilyMembers?: number | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: 'CITIZEN' | 'ADMIN';
  preferredLanguage: Language;
  profile?: UserProfile | null;
}

export interface SchemeCategory {
  id: string;
  slug: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  icon: string;
  descriptionEn?: string;
  descriptionMr?: string;
  descriptionHi?: string;
  displayOrder: number;
  schemeCount?: number;
}

export interface GovernmentSource {
  id: string;
  name: string;
  domain: string;
  officialUrl: string;
  portalName: string;
  departmentName: string;
  level: 'CENTRAL' | 'STATE';
  state?: string | null;
  isVerified: boolean;
  lastVerifiedAt: string;
}

export interface RequiredDocument {
  id: string;
  schemeId: string;
  nameEn: string;
  nameMr: string;
  nameHi: string;
  descriptionEn?: string | null;
  descriptionMr?: string | null;
  descriptionHi?: string | null;
  isMandatory: boolean;
  issuanceAuthority?: string | null;
  documentType?: string | null;
}

export interface EligibilityCriteria {
  id?: string;
  schemeId?: string;
  minAge?: number | null;
  maxAge?: number | null;
  allowedGenders?: string | null;
  allowedStates?: string | null;
  allowedOccupations?: string | null;
  allowedEducation?: string | null;
  maxAnnualIncome?: number | null;
  allowedCategories?: string | null;
  requiresDisability?: boolean;
  requiresBpl?: boolean;
  requiresLandHoldingMax?: number | null;
  extraConditionsEn?: string | null;
  extraConditionsMr?: string | null;
  extraConditionsHi?: string | null;
}

export interface CriterionCheckResult {
  criterion: string;
  criterionNameEn: string;
  criterionNameMr: string;
  criterionNameHi: string;
  status: 'PASSED' | 'FAILED' | 'UNKNOWN';
  userValue: any;
  requiredValue: any;
  reasonEn: string;
  reasonMr: string;
  reasonHi: string;
}

export interface EligibilityEvaluationResult {
  status: 'LIKELY_ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'LIKELY_NOT_ELIGIBLE';
  badgeColor: 'green' | 'yellow' | 'red';
  overallScorePercentage: number;
  reasons: CriterionCheckResult[];
  summaryEn: string;
  summaryMr: string;
  summaryHi: string;
  disclaimer: string;
}

export interface Scheme {
  id: string;
  slug: string;
  titleEn: string;
  titleMr: string;
  titleHi: string;
  shortSummaryEn: string;
  shortSummaryMr: string;
  shortSummaryHi: string;
  detailedDescriptionEn: string;
  detailedDescriptionMr: string;
  detailedDescriptionHi: string;
  benefitsEn: string;
  benefitsMr: string;
  benefitsHi: string;
  benefitType: string;
  department: string;
  level: 'CENTRAL' | 'STATE';
  state?: string | null;
  categoryId: string;
  category: SchemeCategory;
  sourceId?: string | null;
  source?: GovernmentSource | null;
  applicationMode: 'ONLINE' | 'OFFLINE' | 'BOTH';
  applicationUrl: string;
  portalName: string;
  applicationDeadline?: string | null;
  applicationStepsEn: string;
  applicationStepsMr: string;
  applicationStepsHi: string;
  importantNotesEn?: string | null;
  importantNotesMr?: string | null;
  importantNotesHi?: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewsCount: number;
  savesCount: number;
  lastVerifiedAt: string;
  createdAt: string;
  updatedAt: string;

  isSaved?: boolean;
  calculatedEligibility?: EligibilityEvaluationResult;
  recommendationScore?: number;
  recommendationReasonEn?: string;
  recommendationReasonMr?: string;
  recommendationReasonHi?: string;
  eligibilityCriteria?: EligibilityCriteria;
  requiredDocuments?: RequiredDocument[];
  existingApplication?: any;
}

export interface Application {
  id: string;
  userId: string;
  schemeId: string;
  scheme: Scheme;
  status: 'INTERESTED' | 'DOCUMENTS_PENDING' | 'READY_TO_APPLY' | 'APPLIED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  referenceNumber?: string | null;
  appliedDate?: string | null;
  deadlineDate?: string | null;
  notes?: string | null;
  documentProgress?: Record<string, 'READY' | 'MISSING' | 'NA'>;
  readinessPercentage?: number;
  readyDocsCount?: number;
  totalDocsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  titleEn: string;
  titleMr: string;
  titleHi: string;
  messageEn: string;
  messageMr: string;
  messageHi: string;
  type: 'DEADLINE' | 'SCHEME_UPDATE' | 'DOCUMENT_PENDING' | 'SYSTEM';
  isRead: boolean;
  relatedSchemeId?: string | null;
  relatedApplicationId?: string | null;
  createdAt: string;
}

export interface ReportItem {
  id: string;
  userId?: string | null;
  user?: { id: string; name: string; email: string } | null;
  schemeId: string;
  scheme: { id: string; titleEn: string; slug: string; portalName: string; applicationUrl: string };
  issueType: string;
  description: string;
  userEmail?: string | null;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalSchemes: number;
  publishedSchemes: number;
  totalApplications: number;
  totalSavedSchemes: number;
  totalReports: number;
  pendingReports: number;
  totalSearches: number;
  categoryBreakdown: { name: string; count: number }[];
  applicationStats: Record<string, number>;
  popularSchemes: { id: string; titleEn: string; slug: string; viewsCount: number; savesCount: number; department: string }[];
  recentSearches: { id: string; query: string; createdAt: string }[];
}
