import { EligibilityService, ProfileInput } from './eligibilityService';

export interface ScoredScheme {
  scheme: any;
  eligibility: any;
  recommendationScore: number;
  recommendationReasonEn: string;
  recommendationReasonMr: string;
  recommendationReasonHi: string;
}

export class RecommendationService {
  /**
   * Scores and ranks schemes for a citizen profile
   */
  public static rankSchemes(profile: ProfileInput | null | undefined, schemes: any[]): ScoredScheme[] {
    const scoredList: ScoredScheme[] = schemes.map((scheme) => {
      const eligibility = EligibilityService.evaluate(profile, scheme.eligibilityCriteria);

      let score = 50; // base score
      const reasonsEn: string[] = [];
      const reasonsMr: string[] = [];
      const reasonsHi: string[] = [];

      if (scheme.isFeatured) {
        score += 15;
      }

      if (profile) {
        // Occupation match
        if (profile.occupation && scheme.eligibilityCriteria?.allowedOccupations) {
          const occs = scheme.eligibilityCriteria.allowedOccupations.toLowerCase();
          if (occs.includes(profile.occupation.toLowerCase()) || occs.includes('any')) {
            score += 30;
            reasonsEn.push(`Matches your occupation as ${profile.occupation}`);
            reasonsMr.push(`तुमचा व्यवसाय (${profile.occupation}) या योजनेशी सुसंगत आहे`);
            reasonsHi.push(`यह आपके व्यवसाय (${profile.occupation}) से मेल खाता है`);
          }
        }

        // State match
        if (profile.state && scheme.state) {
          if (scheme.state.toLowerCase() === profile.state.toLowerCase() || scheme.state === 'All India') {
            score += 20;
            reasonsEn.push(`Available in ${scheme.state === 'All India' ? 'All India' : profile.state}`);
            reasonsMr.push(`${scheme.state === 'All India' ? 'संपूर्ण भारतात' : profile.state + ' राज्यात'} लागू`);
            reasonsHi.push(`${scheme.state === 'All India' ? 'अखिल भारतीय' : profile.state + ' में'} उपलब्ध`);
          }
        }

        // Education match
        if (profile.education && scheme.eligibilityCriteria?.allowedEducation) {
          const edu = scheme.eligibilityCriteria.allowedEducation.toLowerCase();
          if (edu.includes(profile.education.toLowerCase()) || edu.includes('any')) {
            score += 15;
          }
        }

        // Category match
        if (profile.casteCategory && scheme.eligibilityCriteria?.allowedCategories) {
          const cats = scheme.eligibilityCriteria.allowedCategories.toLowerCase();
          if (cats.includes(profile.casteCategory.toLowerCase()) || cats.includes('any')) {
            score += 15;
          }
        }

        // Eligibility bonus/penalty
        if (eligibility.status === 'LIKELY_ELIGIBLE') {
          score += 40;
        } else if (eligibility.status === 'POSSIBLY_ELIGIBLE') {
          score += 15;
        } else if (eligibility.status === 'LIKELY_NOT_ELIGIBLE') {
          score -= 30;
        }
      } else {
        reasonsEn.push('Popular government initiative for citizens');
        reasonsMr.push('नागरिकांसाठी लोकप्रिय शासकीय योजना');
        reasonsHi.push('नागरिकों के लिए प्रमुख सरकारी पहल');
      }

      let reasonEn = reasonsEn.length > 0 ? reasonsEn.join(' • ') : 'Recommended based on overall civic criteria';
      let reasonMr = reasonsMr.length > 0 ? reasonsMr.join(' • ') : 'सर्वसाधारण निकषांवर आधारित शिफारस';
      let reasonHi = reasonsHi.length > 0 ? reasonsHi.join(' • ') : 'सामान्य मानदंडों के आधार पर अनुशंसित';

      return {
        scheme,
        eligibility,
        recommendationScore: score,
        recommendationReasonEn: reasonEn,
        recommendationReasonMr: reasonMr,
        recommendationReasonHi: reasonHi,
      };
    });

    // Sort descending by recommendationScore
    return scoredList.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }
}
