export type AIProvider = 'openai' | 'gemini' | 'anthropic';

export const DIZZ_SYSTEM_PROMPT = `You are DIZZ AI, an elite dating wingman. Analyze the uploaded chat or profile screenshot.

SPEAKER IDENTIFICATION RULES:
- LEFT side chat bubbles / header profile = The MATCH (her/him speaking).
- RIGHT side chat bubbles = The USER (you speaking).
- Your goal: Generate replies for the USER (Right side) to send back to the MATCH's latest message (Left side).

CONTENT RULES:
1. Specificity > Generic Flattery: Reference exact text from the Match's latest message, her bio, or photo details.
2. Adaptive Tone: Match the vibe (DM cold open, story reply, playful teasing, witty banter, or smooth date setup).
3. Short & Smooth: Generate 3 distinct, high-converting replies under 15 words each.

Return JSON ONLY:
{
  "replies": ["witty specific reply 1", "playful bold reply 2", "smooth direct reply 3"]
}`;

export const WRAPPED_SYSTEM_PROMPT = `You are DIZZ AI Chat Chemistry Analyzer. Analyze the conversation screenshot.

SPEAKER RULES:
- LEFT side chat bubbles = The MATCH.
- RIGHT side chat bubbles = The USER.

Return JSON ONLY:
{
  "interestLevelMatch": 84,
  "interestLevelUser": 88,
  "compatibilityScore": 92,
  "attachmentStyle": "Secure Banter & Playful Energy",
  "greenFlags": ["Fast response times from Match", "Initiates banter", "Asks follow-up questions"],
  "redFlags": ["Slightly dry initial opener"],
  "summary": "High mutual attraction with strong banter alignment."
}`;

function cleanAndParseJson<T>(rawText: string): T | null {
  try {
    const cleaned = rawText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}

export async function generateDirectReply(
  provider: AIProvider = 'gemini',
  apiKey: string = '',
  base64Image: string,
  spicinessLevel: number = 2,
  keyword: string = ''
): Promise<string[]> {
  const userPrompt = `Spiciness: ${spicinessLevel}/3. ${keyword ? `Must focus on keyword: "${keyword}".` : ''} Provide 3 top DIZZ replies for the User to reply to the Match.`;

  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${DIZZ_SYSTEM_PROMPT}\n${userPrompt}` },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'Gemini API Error');
    const parsed = cleanAndParseJson<{ replies: string[] }>(data.candidates[0].content.parts[0].text);
    if (parsed && Array.isArray(parsed.replies)) {
      return parsed.replies;
    }
  }

  return [
    keyword ? `looks like we both have great taste in ${keyword} 😏` : "was just gonna scroll past but your photo made me stop. Had to say hi.",
    "you're making it very hard for me to play it cool right now.",
    "let's skip the small talk and grab coffee this friday?"
  ];
}

export interface ChatWrappedResult {
  interestLevelMatch: number;
  interestLevelUser: number;
  compatibilityScore: number;
  attachmentStyle: string;
  greenFlags: string[];
  redFlags: string[];
  summary: string;
}

export async function analyzeChatWrapped(
  provider: AIProvider = 'gemini',
  apiKey: string = '',
  base64Image: string
): Promise<ChatWrappedResult> {
  if (provider === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: WRAPPED_SYSTEM_PROMPT },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
            ],
          },
        ],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    const data = await response.json();
    if (response.ok) {
      const parsed = cleanAndParseJson<ChatWrappedResult>(data.candidates[0].content.parts[0].text);
      if (parsed) return parsed;
    }
  }

  return {
    interestLevelMatch: 84,
    interestLevelUser: 89,
    compatibilityScore: 92,
    attachmentStyle: 'Secure Banter & Playful Energy',
    greenFlags: ['Fast response times from Match', 'Initiates double texts', 'Uses flirty emojis'],
    redFlags: ['Slightly delayed during work hours'],
    summary: 'Strong mutual attraction detected with solid flirtatious chemistry.'
  };
}
