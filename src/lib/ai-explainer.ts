import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ScanResults } from '@/types';

// Use placeholders to prevent initialization crashes if keys are not present yet
const groqApiKey = process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('your_groq_api_key') 
  ? process.env.GROQ_API_KEY 
  : '';

const geminiApiKey = process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your_gemini_api_key') 
  ? process.env.GEMINI_API_KEY 
  : '';

const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;
const gemini = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Generate a personalized summary for the scan results
export async function generateScanSummary(
  domain: string,
  results: ScanResults
): Promise<string> {
  const failedChecks = Object.entries(results.checks)
    .filter(([, check]) => check.status === 'fail' || check.status === 'missing')
    .map(([name]) => name);

  const prompt = `
You are an email deliverability expert helping a non-technical small business owner.
Their domain "${domain}" scored ${results.score}/100 on an email health check.

Failed checks: ${failedChecks.join(', ') || 'none'}
Score: ${results.score}/100
Grade: ${results.grade}

Write a 2-3 sentence plain English summary of their email health situation.
Be direct, friendly, and specific about the biggest risk.
Do not use technical jargon. Do not use bullet points. Just conversational sentences.
Maximum 60 words.
  `.trim();

  // 1. Try Groq (Llama 3.3 70B)
  if (groq) {
    try {
      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3,
      });
      const content = response.choices[0]?.message?.content;
      if (content) return content.trim();
    } catch (error) {
      console.warn('Groq AI explanation failed, trying Gemini fallback...', error);
    }
  }

  // 2. Try Gemini Fallback
  if (gemini) {
    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text.trim();
    } catch (error) {
      console.warn('Gemini AI explanation failed, using static explanation...', error);
    }
  }

  // 3. Fallback to high-quality static explanation
  return getStaticSummary(results);
}

function getStaticSummary(results: ScanResults): string {
  if (results.score >= 90) {
    return `Your email setup looks outstanding! All key authentication standards (SPF, DKIM, and DMARC) are fully passed, and your domain is completely clear of major blacklists. Your emails should arrive in customer inboxes reliably.`;
  } else if (results.score >= 75) {
    return `Your email deliverability is in a good spot but has minor warnings. Fixing these secondary issues will prevent random delivery glitches and guarantee your emails stay out of the spam folder.`;
  } else if (results.score >= 60) {
    return `Your email setup has notable gaps. While you have basic records active, missing pieces are causing email spam filters to view your domain with suspicion. We highly recommend applying the copy-paste fixes below.`;
  } else {
    return `Your email configuration has critical security risks and authentication failures. Spammers can easily spoof your domain, and Gmail or Microsoft may block your emails entirely. You should apply these DNS fixes immediately to restore your reputation.`;
  }
}
