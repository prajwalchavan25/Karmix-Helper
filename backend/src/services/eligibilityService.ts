export interface ProfileInput {
  age?: number | null;
  gender?: string | null;
  state?: string | null;
  district?: string | null;
  occupation?: string | null;
  education?: string | null;
  incomeAmount?: number | null;
  incomeRange?: string | null;
  casteCategory?: string | null;
  isMinority?: boolean | null;
  isDisability?: boolean | null;
  isBpl?: boolean | null;
  rationCardType?: string | null;
  landHoldingAcres?: number | null;
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

export class EligibilityService {
  /**
   * Evaluates citizen profile against scheme criteria
   */
  public static evaluate(profile: ProfileInput | null | undefined, criteria: any): EligibilityEvaluationResult {
    const disclaimer = 'Eligibility shown is indicative and calculated based on your profile inputs. Final eligibility and document sanction is subject to verification by the respective government department or portal.';

    if (!criteria) {
      return {
        status: 'POSSIBLY_ELIGIBLE',
        badgeColor: 'yellow',
        overallScorePercentage: 50,
        reasons: [],
        summaryEn: 'No specific restrictive criteria defined. Open for general public application.',
        summaryMr: 'कोणतेही विशेष निर्बंध नाहीत. सर्वसामान्य नागरिकांसाठी खुली योजना.',
        summaryHi: 'कोई विशिष्ट प्रतिबंधात्मक मानदंड नहीं हैं। आम जनता के लिए खुला है।',
        disclaimer,
      };
    }

    if (!profile) {
      return {
        status: 'POSSIBLY_ELIGIBLE',
        badgeColor: 'yellow',
        overallScorePercentage: 50,
        reasons: [
          {
            criterion: 'profile_missing',
            criterionNameEn: 'Citizen Profile',
            criterionNameMr: 'नागरिक प्रोफाइल',
            criterionNameHi: 'नागरिक प्रोफाइल',
            status: 'UNKNOWN',
            userValue: null,
            requiredValue: 'Completed Profile',
            reasonEn: 'Please complete or provide your profile to verify age, income, and state eligibility.',
            reasonMr: 'कृपया वय, उत्पन्न आणि राज्याची पात्रता तपासण्यासाठी तुमची प्रोफाइल पूर्ण करा.',
            reasonHi: 'कृपया आयु, आय और राज्य पात्रता सत्यापित करने के लिए अपनी प्रोफ़ाइल पूरी करें।',
          },
        ],
        summaryEn: 'More profile information required to calculate precise eligibility.',
        summaryMr: 'अचूक पात्रता तपासण्यासाठी अधिक प्रोफाइल माहिती आवश्यक आहे.',
        summaryHi: 'सटीक पात्रता की गणना के लिए अधिक प्रोफ़ाइल जानकारी आवश्यक है।',
        disclaimer,
      };
    }

    const checks: CriterionCheckResult[] = [];
    let passedCount = 0;
    let failedCount = 0;
    let unknownCount = 0;
    let totalCriteria = 0;

    // 1. Age Check
    if (criteria.minAge !== null || criteria.maxAge !== null) {
      totalCriteria++;
      if (profile.age === undefined || profile.age === null) {
        unknownCount++;
        checks.push({
          criterion: 'age',
          criterionNameEn: 'Age Requirement',
          criterionNameMr: 'वयाची अट',
          criterionNameHi: 'आयु सीमा',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: `${criteria.minAge || 0} - ${criteria.maxAge || 'Any'} years`,
          reasonEn: `Requires age between ${criteria.minAge || 0} and ${criteria.maxAge || '100'} years.`,
          reasonMr: `वय ${criteria.minAge || 0} ते ${criteria.maxAge || '१००'} वर्षांच्या दरम्यान असणे आवश्यक आहे.`,
          reasonHi: `आयु ${criteria.minAge || 0} से ${criteria.maxAge || '100'} वर्ष के बीच होनी चाहिए।`,
        });
      } else {
        const minOk = criteria.minAge === null || profile.age >= criteria.minAge;
        const maxOk = criteria.maxAge === null || profile.age <= criteria.maxAge;
        if (minOk && maxOk) {
          passedCount++;
          checks.push({
            criterion: 'age',
            criterionNameEn: 'Age Requirement',
            criterionNameMr: 'वयाची अट',
            criterionNameHi: 'आयु सीमा',
            status: 'PASSED',
            userValue: `${profile.age} years`,
            requiredValue: `${criteria.minAge || 0} - ${criteria.maxAge || 'Any'} years`,
            reasonEn: `Your age (${profile.age} years) satisfies the requirement.`,
            reasonMr: `तुमचे वय (${profile.age} वर्षे) या निकषात बसते.`,
            reasonHi: `आपकी आयु (${profile.age} वर्ष) आवश्यकता को पूरा करती है।`,
          });
        } else {
          failedCount++;
          checks.push({
            criterion: 'age',
            criterionNameEn: 'Age Requirement',
            criterionNameMr: 'वयाची अट',
            criterionNameHi: 'आयु सीमा',
            status: 'FAILED',
            userValue: `${profile.age} years`,
            requiredValue: `${criteria.minAge || 0} - ${criteria.maxAge || 'Any'} years`,
            reasonEn: `Age ${profile.age} is outside the eligible range (${criteria.minAge || 0} to ${criteria.maxAge || 'Max'}).`,
            reasonMr: `वय ${profile.age} हे पात्र वयोमर्यादेच्या (${criteria.minAge || 0} ते ${criteria.maxAge || 'कमाल'}) बाहेर आहे.`,
            reasonHi: `आयु ${profile.age} पात्र आयु सीमा से बाहर है।`,
          });
        }
      }
    }

    // 2. State Domicile Check
    if (criteria.allowedStates && criteria.allowedStates !== 'All India' && criteria.allowedStates !== 'Any') {
      totalCriteria++;
      const states = criteria.allowedStates.split(',').map((s: string) => s.trim().toLowerCase());
      if (!profile.state) {
        unknownCount++;
        checks.push({
          criterion: 'state',
          criterionNameEn: 'State / Domicile',
          criterionNameMr: 'राज्य / अधिवास',
          criterionNameHi: 'राज्य / निवास',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: criteria.allowedStates,
          reasonEn: `Requires residence in: ${criteria.allowedStates}.`,
          reasonMr: `या राज्यांचे अधिवास आवश्यक: ${criteria.allowedStates}.`,
          reasonHi: `इस राज्य का निवासी होना आवश्यक: ${criteria.allowedStates}.`,
        });
      } else {
        const userState = profile.state.trim().toLowerCase();
        if (states.includes(userState) || states.includes('all india')) {
          passedCount++;
          checks.push({
            criterion: 'state',
            criterionNameEn: 'State / Domicile',
            criterionNameMr: 'राज्य / अधिवास',
            criterionNameHi: 'राज्य / निवास',
            status: 'PASSED',
            userValue: profile.state,
            requiredValue: criteria.allowedStates,
            reasonEn: `State requirement satisfied (${profile.state}).`,
            reasonMr: `राज्य अधिवास निकष पूर्ण झाला (${profile.state}).`,
            reasonHi: `राज्य आवश्यकता पूरी हुई (${profile.state})।`,
          });
        } else {
          failedCount++;
          checks.push({
            criterion: 'state',
            criterionNameEn: 'State / Domicile',
            criterionNameMr: 'राज्य / अधिवास',
            criterionNameHi: 'राज्य / निवास',
            status: 'FAILED',
            userValue: profile.state,
            requiredValue: criteria.allowedStates,
            reasonEn: `Scheme is restricted to residents of: ${criteria.allowedStates}.`,
            reasonMr: `ही योजना केवळ ${criteria.allowedStates} मधील रहिवाशांसाठी लागू आहे.`,
            reasonHi: `यह योजना केवल ${criteria.allowedStates} के निवासियों के लिए है।`,
          });
        }
      }
    }

    // 3. Gender Check
    if (criteria.allowedGenders && criteria.allowedGenders !== 'Any') {
      totalCriteria++;
      let allowedGenders: string[] = [];
      try {
        allowedGenders = criteria.allowedGenders.startsWith('[')
          ? JSON.parse(criteria.allowedGenders)
          : criteria.allowedGenders.split(',').map((g: string) => g.trim());
      } catch {
        allowedGenders = [criteria.allowedGenders];
      }

      if (!profile.gender) {
        unknownCount++;
        checks.push({
          criterion: 'gender',
          criterionNameEn: 'Gender Requirement',
          criterionNameMr: 'लिंग निकष',
          criterionNameHi: 'लिंग आवश्यकता',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: allowedGenders.join(', '),
          reasonEn: `Requires gender: ${allowedGenders.join(', ')}.`,
          reasonMr: `पात्र लिंग: ${allowedGenders.join(', ')}.`,
          reasonHi: `पात्र लिंग: ${allowedGenders.join(', ')}।`,
        });
      } else {
        const match = allowedGenders.some((g: string) => g.toLowerCase() === profile.gender?.toLowerCase());
        if (match) {
          passedCount++;
          checks.push({
            criterion: 'gender',
            criterionNameEn: 'Gender Requirement',
            criterionNameMr: 'लिंग निकष',
            criterionNameHi: 'लिंग आवश्यकता',
            status: 'PASSED',
            userValue: profile.gender,
            requiredValue: allowedGenders.join(', '),
            reasonEn: `Gender requirement satisfied (${profile.gender}).`,
            reasonMr: `लिंग निकष पूर्ण झाला (${profile.gender}).`,
            reasonHi: `लिंग आवश्यकता पूरी हुई (${profile.gender})।`,
          });
        } else {
          failedCount++;
          checks.push({
            criterion: 'gender',
            criterionNameEn: 'Gender Requirement',
            criterionNameMr: 'लिंग निकष',
            criterionNameHi: 'लिंग आवश्यकता',
            status: 'FAILED',
            userValue: profile.gender,
            requiredValue: allowedGenders.join(', '),
            reasonEn: `Scheme is exclusively for ${allowedGenders.join(', ')} applicants.`,
            reasonMr: `ही योजना केवळ ${allowedGenders.join(', ')} अर्जदारांसाठी आहे.`,
            reasonHi: `यह योजना केवल ${allowedGenders.join(', ')} आवेदकों के लिए है।`,
          });
        }
      }
    }

    // 4. Occupation Check
    if (criteria.allowedOccupations && criteria.allowedOccupations !== 'Any') {
      totalCriteria++;
      let allowedOccupations: string[] = [];
      try {
        allowedOccupations = criteria.allowedOccupations.startsWith('[')
          ? JSON.parse(criteria.allowedOccupations)
          : criteria.allowedOccupations.split(',').map((o: string) => o.trim());
      } catch {
        allowedOccupations = [criteria.allowedOccupations];
      }

      if (!profile.occupation) {
        unknownCount++;
        checks.push({
          criterion: 'occupation',
          criterionNameEn: 'Occupation / Category',
          criterionNameMr: 'व्यवसाय / वर्ग',
          criterionNameHi: 'व्यवसाय श्रेणी',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: allowedOccupations.join(', '),
          reasonEn: `Targeted for: ${allowedOccupations.join(', ')}.`,
          reasonMr: `पात्र व्यवसाय: ${allowedOccupations.join(', ')}.`,
          reasonHi: `लक्षित व्यवसाय: ${allowedOccupations.join(', ')}।`,
        });
      } else {
        const match = allowedOccupations.some((o: string) => o.toLowerCase() === profile.occupation?.toLowerCase());
        if (match) {
          passedCount++;
          checks.push({
            criterion: 'occupation',
            criterionNameEn: 'Occupation / Category',
            criterionNameMr: 'व्यवसाय / वर्ग',
            criterionNameHi: 'व्यवसाय श्रेणी',
            status: 'PASSED',
            userValue: profile.occupation,
            requiredValue: allowedOccupations.join(', '),
            reasonEn: `Occupation matches target group (${profile.occupation}).`,
            reasonMr: `व्यवसाय निकष जुळतो (${profile.occupation}).`,
            reasonHi: `व्यवसाय समूह मेल खाता है (${profile.occupation})।`,
          });
        } else {
          // Soft fail or possible if other criteria allow
          failedCount++;
          checks.push({
            criterion: 'occupation',
            criterionNameEn: 'Occupation / Category',
            criterionNameMr: 'व्यवसाय / वर्ग',
            criterionNameHi: 'व्यवसाय श्रेणी',
            status: 'FAILED',
            userValue: profile.occupation,
            requiredValue: allowedOccupations.join(', '),
            reasonEn: `Intended for ${allowedOccupations.join(', ')} (Current: ${profile.occupation}).`,
            reasonMr: `योजना ${allowedOccupations.join(', ')} साठी आहे (सध्या: ${profile.occupation}).`,
            reasonHi: `यह योजना ${allowedOccupations.join(', ')} के लिए है।`,
          });
        }
      }
    }

    // 5. Income Ceiling Check
    if (criteria.maxAnnualIncome !== null && criteria.maxAnnualIncome !== undefined && criteria.maxAnnualIncome > 0) {
      totalCriteria++;
      // Parse user income
      let estimatedIncome = profile.incomeAmount;
      if (estimatedIncome === undefined || estimatedIncome === null) {
        if (profile.incomeRange === 'Below 1L') estimatedIncome = 75000;
        else if (profile.incomeRange === '1L - 2.5L') estimatedIncome = 175000;
        else if (profile.incomeRange === '2.5L - 5L') estimatedIncome = 350000;
        else if (profile.incomeRange === '5L - 8L') estimatedIncome = 650000;
        else if (profile.incomeRange === 'Above 8L') estimatedIncome = 950000;
      }

      if (estimatedIncome === undefined || estimatedIncome === null) {
        unknownCount++;
        checks.push({
          criterion: 'income',
          criterionNameEn: 'Income Ceiling',
          criterionNameMr: 'उत्पन्नाची मर्यादा',
          criterionNameHi: 'वार्षिक आय सीमा',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: `Max ₹${(criteria.maxAnnualIncome / 100000).toFixed(2)} Lakhs/year`,
          reasonEn: `Requires family income below ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}/year.`,
          reasonMr: `वार्षिक कौटुंबिक उत्पन्न ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')} पेक्षा कमी असणे आवश्यक.`,
          reasonHi: `वार्षिक पारिवारिक आय ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')} से कम होनी चाहिए।`,
        });
      } else {
        if (estimatedIncome <= criteria.maxAnnualIncome) {
          passedCount++;
          checks.push({
            criterion: 'income',
            criterionNameEn: 'Income Ceiling',
            criterionNameMr: 'उत्पन्नाची मर्यादा',
            criterionNameHi: 'वार्षिक आय सीमा',
            status: 'PASSED',
            userValue: `₹${estimatedIncome.toLocaleString('en-IN')}/yr`,
            requiredValue: `Max ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}/yr`,
            reasonEn: `Family income meets ceiling limit (₹${estimatedIncome.toLocaleString('en-IN')} <= ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}).`,
            reasonMr: `उत्पन्न मर्यादेचा निकष पूर्ण होतो.`,
            reasonHi: `पारिवारिक आय सीमा मानदंड पूरा होता है।`,
          });
        } else {
          failedCount++;
          checks.push({
            criterion: 'income',
            criterionNameEn: 'Income Ceiling',
            criterionNameMr: 'उत्पन्नाची मर्यादा',
            criterionNameHi: 'वार्षिक आय सीमा',
            status: 'FAILED',
            userValue: `₹${estimatedIncome.toLocaleString('en-IN')}/yr`,
            requiredValue: `Max ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}/yr`,
            reasonEn: `Annual income exceeds scheme limit of ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')}.`,
            reasonMr: `वार्षिक उत्पन्न कमाल मर्यादा ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')} पेक्षा जास्त आहे.`,
            reasonHi: `वार्षिक आय योजना की सीमा ₹${criteria.maxAnnualIncome.toLocaleString('en-IN')} से अधिक है।`,
          });
        }
      }
    }

    // 6. Social Category / Caste Check
    if (criteria.allowedCategories && criteria.allowedCategories !== 'Any') {
      totalCriteria++;
      let allowedCategories: string[] = [];
      try {
        allowedCategories = criteria.allowedCategories.startsWith('[')
          ? JSON.parse(criteria.allowedCategories)
          : criteria.allowedCategories.split(',').map((c: string) => c.trim());
      } catch {
        allowedCategories = [criteria.allowedCategories];
      }

      if (!profile.casteCategory) {
        unknownCount++;
        checks.push({
          criterion: 'casteCategory',
          criterionNameEn: 'Social Category (Caste)',
          criterionNameMr: 'सामाजिक प्रवर्ग (जात)',
          criterionNameHi: 'सामाजिक श्रेणी (जाति)',
          status: 'UNKNOWN',
          userValue: 'Not Provided',
          requiredValue: allowedCategories.join(', '),
          reasonEn: `Requires category: ${allowedCategories.join(', ')}.`,
          reasonMr: `पात्र प्रवर्ग: ${allowedCategories.join(', ')}.`,
          reasonHi: `पात्र श्रेणी: ${allowedCategories.join(', ')}।`,
        });
      } else {
        const match = allowedCategories.some(
          (c: string) => c.toLowerCase() === profile.casteCategory?.toLowerCase() || c.toLowerCase() === 'any'
        );
        if (match) {
          passedCount++;
          checks.push({
            criterion: 'casteCategory',
            criterionNameEn: 'Social Category (Caste)',
            criterionNameMr: 'सामाजिक प्रवर्ग (जात)',
            criterionNameHi: 'सामाजिक श्रेणी (जाति)',
            status: 'PASSED',
            userValue: profile.casteCategory,
            requiredValue: allowedCategories.join(', '),
            reasonEn: `Social category matched (${profile.casteCategory}).`,
            reasonMr: `सामाजिक प्रवर्ग निकष जुळतो (${profile.casteCategory}).`,
            reasonHi: `सामाजिक श्रेणी आवश्यकता पूरी हुई (${profile.casteCategory})।`,
          });
        } else {
          failedCount++;
          checks.push({
            criterion: 'casteCategory',
            criterionNameEn: 'Social Category (Caste)',
            criterionNameMr: 'सामाजिक प्रवर्ग (जात)',
            criterionNameHi: 'सामाजिक श्रेणी (जाति)',
            status: 'FAILED',
            userValue: profile.casteCategory,
            requiredValue: allowedCategories.join(', '),
            reasonEn: `Scheme is restricted to: ${allowedCategories.join(', ')}.`,
            reasonMr: `योजना केवळ ${allowedCategories.join(', ')} प्रवर्गासाठी आहे.`,
            reasonHi: `यह योजना ${allowedCategories.join(', ')} श्रेणी के लिए आरक्षित है।`,
          });
        }
      }
    }

    // 7. BPL requirement check
    if (criteria.requiresBpl) {
      totalCriteria++;
      if (profile.isBpl === true || profile.rationCardType?.includes('Yellow') || profile.rationCardType?.includes('Orange')) {
        passedCount++;
        checks.push({
          criterion: 'bpl',
          criterionNameEn: 'BPL / Ration Card Status',
          criterionNameMr: 'दारिद्र्यरेषा / रेशन कार्ड स्थिती',
          criterionNameHi: 'बीपीएल / राशन कार्ड स्थिति',
          status: 'PASSED',
          userValue: profile.rationCardType || 'BPL Card Holder',
          requiredValue: 'BPL / Eligible Priority Household',
          reasonEn: 'BPL/Poverty Line condition satisfied.',
          reasonMr: 'दारिद्र्यरेषा निकष पूर्ण झाला.',
          reasonHi: 'बीपीएल स्थिति आवश्यकता पूरी हुई।',
        });
      } else if (profile.isBpl === false && profile.rationCardType?.includes('White')) {
        failedCount++;
        checks.push({
          criterion: 'bpl',
          criterionNameEn: 'BPL / Ration Card Status',
          criterionNameMr: 'दारिद्र्यरेषा / रेशन कार्ड स्थिती',
          criterionNameHi: 'बीपीएल / राशन कार्ड स्थिति',
          status: 'FAILED',
          userValue: 'Non-BPL (White Card)',
          requiredValue: 'BPL / Priority Ration Card',
          reasonEn: 'Scheme requires BPL or Priority Household ration card status.',
          reasonMr: 'योजनेसाठी दारिद्र्यरेषेखालील (पिवळे/केशरी) रेशन कार्ड आवश्यक आहे.',
          reasonHi: 'इस योजना के लिए बीपीएल या प्राथमिकता राशन कार्ड आवश्यक है।',
        });
      } else {
        unknownCount++;
        checks.push({
          criterion: 'bpl',
          criterionNameEn: 'BPL / Ration Card Status',
          criterionNameMr: 'दारिद्र्यरेषा / रेशन कार्ड स्थिती',
          criterionNameHi: 'बीपीएल / राशन कार्ड स्थिति',
          status: 'UNKNOWN',
          userValue: 'Not Specified',
          requiredValue: 'BPL / Priority Ration Card',
          reasonEn: 'Requires BPL status or Yellow/Orange Ration Card proof.',
          reasonMr: 'दारिद्र्यरेषा दाखला किंवा पिवळे/केशरी रेशन कार्ड आवश्यक.',
          reasonHi: 'बीपीएल प्रमाण पत्र या प्राथमिकता राशन कार्ड आवश्यक।',
        });
      }
    }

    // Determine Overall Status
    let status: 'LIKELY_ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'LIKELY_NOT_ELIGIBLE' = 'POSSIBLY_ELIGIBLE';
    let badgeColor: 'green' | 'yellow' | 'red' = 'yellow';
    const effectiveTotal = Math.max(totalCriteria, 1);
    const score = Math.round((passedCount / effectiveTotal) * 100);

    if (failedCount > 0) {
      status = 'LIKELY_NOT_ELIGIBLE';
      badgeColor = 'red';
    } else if (unknownCount > 0 || totalCriteria === 0) {
      status = 'POSSIBLY_ELIGIBLE';
      badgeColor = 'yellow';
    } else if (passedCount > 0 && failedCount === 0 && unknownCount === 0) {
      status = 'LIKELY_ELIGIBLE';
      badgeColor = 'green';
    }

    let summaryEn = '';
    let summaryMr = '';
    let summaryHi = '';

    if (status === 'LIKELY_ELIGIBLE') {
      summaryEn = `You satisfy all ${passedCount} key verified criteria for this scheme.`;
      summaryMr = `तुम्ही या योजनेच्या सर्व ${passedCount} मुख्य अटी व शर्तींची पूर्तता करता.`;
      summaryHi = `आप इस योजना के सभी ${passedCount} प्रमुख सत्यापित मानदंडों को पूरा करते हैं।`;
    } else if (status === 'POSSIBLY_ELIGIBLE') {
      summaryEn = `${passedCount} criteria matched, while ${unknownCount} require document or profile verification.`;
      summaryMr = `${passedCount} अटी जुळल्या असून ${unknownCount} बाबींची अधिक पडताळणी आवश्यक आहे.`;
      summaryHi = `${passedCount} मानदंड मेल खाते हैं, जबकि ${unknownCount} को सत्यापन की आवश्यकता है।`;
    } else {
      summaryEn = `Your current profile does not satisfy ${failedCount} requirement(s) for this scheme.`;
      summaryMr = `सध्याच्या प्रोफाइलनुसार तुम्ही या योजनेच्या ${failedCount} निकषांची पूर्तता करत नाही.`;
      summaryHi = `आपकी वर्तमान प्रोफ़ाइल इस योजना की ${failedCount} आवश्यकताओं को पूरा नहीं करती है।`;
    }

    return {
      status,
      badgeColor,
      overallScorePercentage: score,
      reasons: checks,
      summaryEn,
      summaryMr,
      summaryHi,
      disclaimer,
    };
  }
}
