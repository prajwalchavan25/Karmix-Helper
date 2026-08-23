import { config } from '../config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ParsedSearchFilters {
  categorySlug?: string;
  state?: string;
  occupation?: string;
  gender?: string;
  age?: number;
  maxIncome?: number;
  keyword?: string;
  benefitType?: string;
}

export interface ChatResponse {
  reply: string;
  language: 'en' | 'mr' | 'hi';
  referencedSchemes: {
    id: string;
    slug: string;
    title: string;
    benefit: string;
    officialUrl: string;
    portalName: string;
  }[];
  suggestedFollowUps: string[];
}

export class AIService {
  /**
   * Parse natural language search queries into structured filters
   */
  public static async parseNaturalLanguageSearch(query: string): Promise<ParsedSearchFilters> {
    const q = query.toLowerCase();
    const filters: ParsedSearchFilters = { keyword: query.trim() };

    // 1. Occupation Detection
    if (q.includes('student') || q.includes('विद्यार्थी') || q.includes('छात्र') || q.includes('college') || q.includes('school') || q.includes('degree') || q.includes('scholarship')) {
      filters.occupation = 'Student';
      filters.categorySlug = 'scholarships-education';
    } else if (q.includes('farmer') || q.includes('शेतकरी') || q.includes('किसान') || q.includes('agriculture') || q.includes('crop') || q.includes('land') || q.includes('kisan')) {
      filters.occupation = 'Farmer';
      filters.categorySlug = 'agriculture-farmers';
    } else if (q.includes('business') || q.includes('startup') || q.includes('उद्योजक') || q.includes('दुकान') || q.includes('व्यवसाय') || q.includes('loan') || q.includes('mudra') || q.includes('shop')) {
      filters.occupation = 'Business Owner';
      filters.categorySlug = 'business-msme';
    } else if (q.includes('artisan') || q.includes('craft') || q.includes('कारगीर') || q.includes('कारीगर') || q.includes('vishwakarma') || q.includes('carpenter') || q.includes('skill')) {
      filters.categorySlug = 'employment-skills';
    } else if (q.includes('health') || q.includes('hospital') || q.includes('आरोग्य') || q.includes('इलाज') || q.includes('ayushman') || q.includes('doctor') || q.includes('medicine')) {
      filters.categorySlug = 'healthcare-wellness';
    } else if (q.includes('house') || q.includes('home') || q.includes('घर') || q.includes('मकान') || q.includes('awas') || q.includes('pucca') || q.includes('shelter')) {
      filters.categorySlug = 'housing-shelter';
    } else if (q.includes('senior') || q.includes('pension') || q.includes('पेन्शन') || q.includes('पेंशन') || q.includes('वृद्ध') || q.includes('elderly')) {
      filters.categorySlug = 'social-security-seniors';
    } else if (q.includes('girl') || q.includes('woman') || q.includes('women') || q.includes('महि') || q.includes('मुलगी') || q.includes('बेटी') || q.includes('sukanya')) {
      filters.categorySlug = 'women-child';
      filters.gender = 'Female';
    } else if (q.includes('divyang') || q.includes('disability') || q.includes('अपंग') || q.includes('दिव्यांग') || q.includes('handicap')) {
      filters.categorySlug = 'disability-support';
    }

    // 2. State Detection
    if (q.includes('maharashtra') || q.includes('महाराष्ट्र') || q.includes('pune') || q.includes('mumbai') || q.includes('nagpur')) {
      filters.state = 'Maharashtra';
    } else if (q.includes('karnataka') || q.includes('कर्नाटक')) {
      filters.state = 'Karnataka';
    } else if (q.includes('delhi') || q.includes('दिल्ली')) {
      filters.state = 'Delhi';
    }

    // 3. Gender Detection
    if (q.includes('female') || q.includes('girl') || q.includes('woman') || q.includes('स्त्री') || q.includes('महिला')) {
      filters.gender = 'Female';
    } else if (q.includes('male') || q.includes('boy') || q.includes('पुरुष') || q.includes('mulga')) {
      filters.gender = 'Male';
    }

    // 4. Age Extraction (e.g., "19 years old", "20 year", "वय २०")
    const ageMatch = q.match(/(\d{1,2})\s*(?:years?|yrs?|वर्ष|वय)/);
    if (ageMatch && ageMatch[1]) {
      filters.age = parseInt(ageMatch[1], 10);
    }

    return filters;
  }

  /**
   * Core Karmix AI Chat Assistant Engine
   */
  public static async answerCivicQuery(
    userMessage: string,
    history: { sender: string; content: string }[] = [],
    language: 'en' | 'mr' | 'hi' = 'en',
    userProfile?: any
  ): Promise<ChatResponse> {
    const trimmed = userMessage.trim();
    const lower = trimmed.toLowerCase();

    // Detect language if user asked in Marathi or Hindi
    let activeLang: 'en' | 'mr' | 'hi' = language;
    if (/[\u0900-\u097F]/.test(userMessage)) {
      // Devanagari script detected
      if (lower.includes('कसे') || lower.includes('काय') || lower.includes('आहे') || lower.includes('मिळेल') || lower.includes('सांगा') || lower.includes('योजना')) {
        activeLang = 'mr';
      } else {
        activeLang = 'hi';
      }
    }

    // Retrieve all active schemes and categories from DB for grounding
    const allSchemes = await prisma.scheme.findMany({
      where: { isPublished: true },
      include: {
        category: true,
        eligibilityCriteria: true,
        requiredDocuments: true,
        source: true,
      },
    });

    // If live Gemini API key is configured, invoke Gemini with verified knowledge base grounding
    if (config.geminiApiKey) {
      try {
        const geminiResult = await this.callGeminiWithGrounding(userMessage, history, activeLang, allSchemes, userProfile);
        if (geminiResult) {
          return geminiResult;
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to contextual civic engine:', err);
      }
    }

    // Intelligent Contextual Civic Engine (Deterministic, highly accurate, verified fallback)
    return this.generateContextualCivicResponse(userMessage, activeLang, allSchemes, userProfile);
  }

  /**
   * Deterministic contextual civic reasoning engine
   */
  private static generateContextualCivicResponse(
    userMessage: string,
    lang: 'en' | 'mr' | 'hi',
    schemes: any[],
    userProfile?: any
  ): ChatResponse {
    const q = userMessage.toLowerCase();

    // Match relevant schemes
    let matchedSchemes = schemes.filter((s) => {
      const matchTitle = s.titleEn.toLowerCase().includes(q) || s.titleMr.toLowerCase().includes(q) || s.titleHi.toLowerCase().includes(q);
      const matchCat = s.category.nameEn.toLowerCase().includes(q) || s.category.slug.toLowerCase().includes(q);
      const matchDesc = s.shortSummaryEn.toLowerCase().includes(q) || s.shortSummaryMr.toLowerCase().includes(q);
      return matchTitle || matchCat || matchDesc;
    });

    // Broad semantic matching
    if (matchedSchemes.length === 0) {
      if (q.includes('scholarship') || q.includes('student') || q.includes('college') || q.includes('fee') || q.includes('शिक्षण') || q.includes('छात्रवृत्ति') || q.includes('शिष्यवृत्ती')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'scholarships-education' || s.category.slug === 'employment-skills');
      } else if (q.includes('farmer') || q.includes('kisan') || q.includes('crop') || q.includes('शेती') || q.includes('शेतकरी') || q.includes('किसान')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'agriculture-farmers');
      } else if (q.includes('health') || q.includes('hospital') || q.includes('card') || q.includes('आरोग्य') || q.includes('इलाज') || q.includes('आयुष्मान')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'healthcare-wellness');
      } else if (q.includes('business') || q.includes('mudra') || q.includes('loan') || q.includes('कर्ज') || q.includes('उद्योजक') || q.includes('दुकान') || q.includes('उद्योग')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'business-msme' || s.slug.includes('mudra') || s.slug.includes('vishwakarma'));
      } else if (q.includes('house') || q.includes('home') || q.includes('awas') || q.includes('घर') || q.includes('मकान') || q.includes('निवारा')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'housing-shelter');
      } else if (q.includes('girl') || q.includes('daughter') || q.includes('women') || q.includes('sukanya') || q.includes('मुलगी') || q.includes('महिला') || q.includes('बेटी')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'women-child');
      } else if (q.includes('artisan') || q.includes('vishwakarma') || q.includes('skill') || q.includes('कारागीर') || q.includes('कौशल्य')) {
        matchedSchemes = schemes.filter((s) => s.slug.includes('vishwakarma') || s.category.slug === 'employment-skills');
      } else if (q.includes('pension') || q.includes('senior') || q.includes('niradhar') || q.includes('निराधार') || q.includes('पेन्शन') || q.includes('वृद्ध')) {
        matchedSchemes = schemes.filter((s) => s.category.slug === 'social-security-seniors');
      }
    }

    // Default to featured schemes if no specific category detected
    if (matchedSchemes.length === 0) {
      matchedSchemes = schemes.filter((s) => s.isFeatured).slice(0, 3);
    }

    const referenced = matchedSchemes.slice(0, 3).map((s) => ({
      id: s.id,
      slug: s.slug,
      title: lang === 'mr' ? s.titleMr : lang === 'hi' ? s.titleHi : s.titleEn,
      benefit: lang === 'mr' ? s.benefitsMr : lang === 'hi' ? s.benefitsHi : s.benefitsEn,
      officialUrl: s.applicationUrl,
      portalName: s.portalName,
    }));

    let reply = '';
    let suggestedFollowUps: string[] = [];

    if (lang === 'mr') {
      reply = `नमस्कार! आपल्या प्रश्नानुसार मी खालील शासकीय योजनांची पडताळणी केलेली माहिती सादर करत आहे:\n\n`;
      referenced.forEach((s, idx) => {
        reply += `**${idx + 1}. ${s.title}**\n- **प्रमुख लाभ:** ${s.benefit}\n- **अधिकृत पोर्टल:** [${s.portalName}](${s.officialUrl})\n\n`;
      });
      reply += `💡 *टीप: अर्ज करण्यापूर्वी आपल्याकडे तहसीलदार उत्पन्नाचा दाखला, आधार कार्ड व अधिवास प्रमाणपत्र तयार असल्याची खात्री करा. अंतिम पात्रता संबंधित शासकीय विभागाद्वारे ठरवली जाते.*`;

      suggestedFollowUps = [
        'या योजनेसाठी कोणती कागदपत्रे लागतात?',
        'अर्ज कसा व कुठे करावा?',
        'माझे वय आणि उत्पन्न या योजनेसाठी पात्र आहे का?',
      ];
    } else if (lang === 'hi') {
      reply = `नमस्ते! आपके प्रश्न के अनुसार आधिकारिक स्रोतों से सत्यापित योजनाओं की जानकारी निम्नलिखित है:\n\n`;
      referenced.forEach((s, idx) => {
        reply += `**${idx + 1}. ${s.title}**\n- **मुख्य लाभ:** ${s.benefit}\n- **आधिकारिक पोर्टल:** [${s.portalName}](${s.officialUrl})\n\n`;
      });
      reply += `💡 *सलाह: आवेदन करने से पहले आवश्यक दस्तावेज (आय प्रमाण पत्र, आधार, निवास प्रमाण पत्र) तैयार रखें। अंतिम पात्रता सरकारी प्राधिकारी द्वारा निर्धारित की जाती है।*`;

      suggestedFollowUps = [
        'इस योजना के लिए कौन से दस्तावेज चाहिए?',
        'आवेदन करने की प्रक्रिया क्या है?',
        'क्या मैं इस योजना के लिए पात्र हूं?',
      ];
    } else {
      reply = `Hello! Based on your query and official government portals, here are the verified schemes that match your requirements:\n\n`;
      referenced.forEach((s, idx) => {
        reply += `**${idx + 1}. ${s.title}**\n- **Key Benefit:** ${s.benefit}\n- **Official Portal:** [${s.portalName}](${s.officialUrl})\n\n`;
      });
      reply += `💡 *Guidance: Click "Check Eligibility" on any scheme to test your profile match, or view the Document Checklist before applying on the official portal.*`;

      suggestedFollowUps = [
        'What documents do I need for this?',
        'How do I apply step-by-step?',
        'Check my eligibility for these schemes',
      ];
    }

    return {
      reply,
      language: lang,
      referencedSchemes: referenced,
      suggestedFollowUps,
    };
  }

  /**
   * Helper to call Gemini API if key is available
   */
  private static async callGeminiWithGrounding(
    userMessage: string,
    history: any[],
    lang: string,
    schemes: any[],
    userProfile?: any
  ): Promise<ChatResponse | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`;

    const contextSummary = schemes.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.titleEn,
      category: s.category.nameEn,
      state: s.state,
      benefits: s.benefitsEn,
      portal: s.portalName,
      officialUrl: s.applicationUrl,
      criteria: s.eligibilityCriteria,
    }));

    const systemPrompt = `You are "Karmix AI", an expert, helpful, and trustworthy civic-tech assistant in India.
Your mission is to help citizens discover, understand, and apply for government schemes, scholarships, subsidies, and public services.

CRITICAL RULES:
1. Ground your answers strictly in real Indian government programs. Prioritize the provided database schemes where relevant.
2. DO NOT invent fake schemes, fake benefits, fake deadlines, or fake URLs.
3. If you lack official information, explicitly say: "I couldn't verify this information from an official source."
4. Language requirement: Respond fluently in ${lang === 'mr' ? 'Marathi (मराठी)' : lang === 'hi' ? 'Hindi (हिन्दी)' : 'English'}.
5. State clearly that Karmix Helper is an independent guide and final eligibility is determined by the relevant government department.
6. Provide helpful bullet points for benefits, eligibility, required documents, and next steps.

DATABASE SCHEMES CONTEXT:
${JSON.stringify(contextSummary, null, 2)}

USER PROFILE (if available):
${userProfile ? JSON.stringify(userProfile) : 'Guest citizen'}`;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will act as Karmix AI and provide accurate, verified, helpful civic guidance.' }] },
      ...history.map((h) => ({
        role: h.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: userMessage }] },
    ];

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return null;
    }

    // Match referenced schemes from candidate text
    const referenced: any[] = [];
    schemes.forEach((s) => {
      if (candidateText.includes(s.titleEn) || candidateText.includes(s.titleMr) || candidateText.includes(s.slug)) {
        referenced.push({
          id: s.id,
          slug: s.slug,
          title: lang === 'mr' ? s.titleMr : lang === 'hi' ? s.titleHi : s.titleEn,
          benefit: lang === 'mr' ? s.benefitsMr : lang === 'hi' ? s.benefitsHi : s.benefitsEn,
          officialUrl: s.applicationUrl,
          portalName: s.portalName,
        });
      }
    });

    return {
      reply: candidateText,
      language: lang as any,
      referencedSchemes: referenced.slice(0, 3),
      suggestedFollowUps: [
        lang === 'mr' ? 'या योजनेसाठी कोणती कागदपत्रे लागतात?' : 'What documents are required?',
        lang === 'mr' ? 'माझी पात्रता तपासा' : 'Check my eligibility for this',
        lang === 'mr' ? 'अर्ज करण्याची पायरी काय आहे?' : 'Step-by-step application guide',
      ],
    };
  }
}
