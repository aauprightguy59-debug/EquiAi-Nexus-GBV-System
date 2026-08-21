import { Message } from '../types';

export const GECN_SYSTEM_INSTRUCTION = `
You are the AI for Her Power (A4HP) Business Assistant, developed by the Gender Equality Club Nigeria (GECN) based at No. 2 A.A. Iortyom Street, Adekaa, Gboko, Benue State, Nigeria (contact@gecnigeria.org).

Your mission is to provide warm, practical, localized business, agritech, and financial mentorship to women, girls, youth, and survivors of economic or gender barriers across Gboko, Makurdi, Otukpo, and Benue State ("The Food Basket of the Nation").

Core Guidance Principles:
1. Local Agricultural Value Addition:
   - Cassava: Advise on processing tubers into Garri (white/yellow), Fufu, high-grade cassava flour (HQCF), or industrial starch to double or triple profit margins compared to raw tuber sales at Gboko Main Market.
   - Yam: Storing tubers during harvest glut, processing into Elubo (yam flour), and navigating bulk sales.
   - Soya beans & Beniseed (Sesame): Value addition into soybean oil, soy flour, soy milk, and beniseed oil/paste.
   - Rice: Parboiling, de-stoning, and clean packaging.
   - Poultry & Fishery: Backyard broilers, egg production, and catfish smoking.

2. Micro-enterprise & Trades:
   - Fashion & Tailoring: Sourcing fabrics, bulk uniform sewing, bridal styling.
   - Soap & Detergent Making: Liquid wash, bar soaps, and disinfectant production.
   - Beadwork, Crafts & Catering: Event small chops, pastries, snacks for school canteens.
   - POS Agency Banking & Retail Mini-Marts: Cash flow management and security.

3. Financial Literacy & Savings:
   - Local Esusu / Bam Savings Circles: Rotating savings without high bank charges.
   - Business vs Personal Wallet Separation: Never mix household expenses with business capital.
   - GECN Microfinance Pool: Interest-free community revolving loans up to ₦100,000 for verified cooperative members.
   - Unit Economics: Always calculate: (Raw Materials + Transport + Labor + Packaging) vs Selling Price to ensure net margin > 30%.

4. Tone & Style:
   - Respectful, empathetic, highly motivating, and practical.
   - Use clear markdown formatting, bullet points, and actionable step-by-step checklists.
   - When relevant, incorporate encouraging local greetings (e.g. "Alo" in Tiv, "Nma" in Idoma, "Sannu" in Hausa).
`;

export interface AIConnectionStatus {
  mode: 'server' | 'client_key' | 'client_env' | 'offline_engine';
  label: string;
  isLiveAI: boolean;
  hasCustomKey: boolean;
}

const STORAGE_KEY = 'gecn_gemini_api_key';

export function getStoredApiKey(): string {
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return (
    localStorage.getItem(STORAGE_KEY) ||
    envKey ||
    ''
  ).trim();
}

export function saveStoredApiKey(key: string): void {
  if (key && key.trim()) {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getAIConnectionStatus(): AIConnectionStatus {
  const customKey = localStorage.getItem(STORAGE_KEY);
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  const isGitHubPages =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('github.io') ||
      window.location.protocol === 'file:');

  if (!isGitHubPages) {
    return {
      mode: 'server',
      label: 'Live Cloud Server AI',
      isLiveAI: true,
      hasCustomKey: !!customKey || !!envKey,
    };
  }

  if (customKey) {
    return {
      mode: 'client_key',
      label: 'Live Gemini 3.7 Flash (Custom Key)',
      isLiveAI: true,
      hasCustomKey: true,
    };
  }

  if (envKey) {
    return {
      mode: 'client_env',
      label: 'Live Gemini 3.7 Flash (Configured)',
      isLiveAI: true,
      hasCustomKey: true,
    };
  }

  return {
    mode: 'offline_engine',
    label: 'GECN Business Engine (GitHub Pages Mode)',
    isLiveAI: false,
    hasCustomKey: false,
  };
}

/**
 * Direct call to Google Gemini REST API for client-side / GitHub Pages mode
 */
async function callDirectGeminiApi(
  apiKey: string,
  messages: Message[]
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  // Convert messages to Gemini contents structure
  const contents = messages.map((m) => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  const payload = {
    system_instruction: {
      parts: [{ text: GECN_SYSTEM_INSTRUCTION }],
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gemini API call failed with status ${res.status}`
    );
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No response text generated by Gemini.');
  }
  return text;
}

/**
 * High-quality localized business intelligence offline engine
 */
function getOfflineGECNResponse(messages: Message[]): string {
  const lastUserMessage =
    messages[messages.length - 1]?.text?.toLowerCase() || '';

  if (
    lastUserMessage.includes('garri') ||
    lastUserMessage.includes('cassava') ||
    lastUserMessage.includes('gari')
  ) {
    return `### 🌾 Starting a High-Yield Garri Processing Business in Gboko

Alo! Cassava processing is one of the most profitable value-addition pathways in Benue State.

#### 1. Capital & Equipment Needed
- **Raw Tubers:** Buy farm-gate tubers from Gboko West/Yandev or Buruku rather than retail markets (₦30,000–₦50,000 per pickup load).
- **Processing Steps:** Peeling ➔ Washing ➔ Grating machine ➔ Hydraulic Bag Press (fermentation for 2-3 days) ➔ Sifting ➔ Frying (using stainless steel pans).
- **Fuel:** Use dry cassava peelings and firewood to minimize roasting costs.

#### 2. Margin Breakdown
- Raw cassava cost: ₦40,000 produces approximately 4–5 bags of dried Garri.
- Processing & labor: ~₦12,000.
- Total cost: ₦52,000.
- Selling price in Gboko Main Market: ₦22,000–₦28,000 per bag = **₦88,000–₦112,000**.
- **Net Profit:** ~₦36,000–₦60,000 per batch!

#### 3. GECN Recommendation
Form a 3-woman cooperative to share frying pan costs. You can apply for the **GECN ₦100,000 interest-free microloan** to procure a shared mechanized grater.`;
  }

  if (
    lastUserMessage.includes('esusu') ||
    lastUserMessage.includes('bam') ||
    lastUserMessage.includes('saving') ||
    lastUserMessage.includes('cooperative')
  ) {
    return `### 💰 How to Run a Safe & Successful Esusu (Savings Circle)

Esusu (or *Bam* in Tiv) is our trusted traditional banking model for pooling funds without predatory bank interest rates.

#### Key Rules for Success:
1. **Choose Trustworthy Members:** Keep initial groups small (5–10 vetted women, e.g., co-traders at Gboko Main Market or church peers).
2. **Fixed Contribution Schedule:** E.g., ₦2,000 daily or ₦10,000 weekly.
3. **Transparent Ledger:** Keep a physical hardcover book + duplicate digital records. Every payout must be signed with 2 witness signatures.
4. **Emergency Reserve Pool (5%):** Deduct 5% from every round to keep as an emergency safety net for members facing sudden hospital bills or domestic distress.
5. **Rotation by Need:** Allocate early collection rounds to members launching immediate agricultural harvesting or stock purchases.

Connect with GECN at **No. 2 A.A. Iortyom Street, Adekaa** to register your savings circle for formal mentoring!`;
  }

  if (
    lastUserMessage.includes('tailor') ||
    lastUserMessage.includes('fashion') ||
    lastUserMessage.includes('cloth') ||
    lastUserMessage.includes('sew')
  ) {
    return `### 👗 Step-by-Step Mini-Tailoring Business Plan

A tailoring enterprise offers reliable daily cash flow, especially around festive and wedding periods in Benue.

#### Startup Budget (Estimated ₦80,000–₦150,000):
- **Manual/Direct Drive Sewing Machine:** ₦55,000 – ₦85,000 (pre-owned or new Butterfly/Emel).
- **Scissors, Measuring Tapes, Threads, Needles:** ₦10,000.
- **Pressing Iron & Cutting Table:** ₦15,000.
- **Initial Fabric Samples / Ankara rolls:** ₦20,000.

#### High-Profit Niches in Gboko:
- **School Uniforms:** Partner with local primary and secondary schools in Mkar and Central Gboko before term resumption.
- **Traditional Tiv & Idoma Attire:** Sew Angur/A'nger fabric wrappers and embroidered vests for cultural occasions.
- **Alterations & Mending:** Set up a small kiosk near Gboko market for fast ₦500–₦1,500 daily zip replacements and resizing.`;
  }

  if (
    lastUserMessage.includes('loan') ||
    lastUserMessage.includes('capital') ||
    lastUserMessage.includes('grant') ||
    lastUserMessage.includes('money')
  ) {
    return `### 🏦 Accessing Business Capital in Gboko

Lack of collateral shouldn't stop you from building financial independence. Here are verified pathways:

1. **GECN Microfinance & Seed Fund:**
   - Interest-free microloans from ₦25,000 up to ₦100,000.
   - Priority given to women, single mothers, and survivors of GBV or property exclusion.
   - Inquire directly via GECN coordinators at No. 2 A.A. Iortyom Street, Adekaa, Gboko.

2. **Daily Cooperative Thrift (Adashe/Esusu):**
   - Save small daily amounts (₦500–₦2,000) with a recognized group to receive a lump sum at the end of the month.

3. **Vendor Credit Agreements:**
   - Negotiate with yam and grain wholesalers in Wannune or Buruku to take goods on 7-day credit after establishing a record of prompt repayment.

Always ensure your expected profit is greater than any repayment obligation!`;
  }

  if (
    lastUserMessage.includes('crop') ||
    lastUserMessage.includes('farm') ||
    lastUserMessage.includes('yam') ||
    lastUserMessage.includes('soil')
  ) {
    return `### 🌾 High-Yield Agricultural Strategies for Benue LGA Hubs

Benue's fertile soil gives local women entrepreneurs a strong competitive advantage:

- **Crop Rotation:** Alternate Yam/Cassava with Soya beans or Cowpeas to fix nitrogen in the soil naturally without spending heavily on chemical fertilizers.
- **Off-Season Storage:** Store high-quality yams in well-ventilated dry thatched barns rather than panic-selling during September harvest when prices drop. Sell in March–May for 2x–3x higher returns.
- **Soya Bean Value Addition:** Instead of selling raw grains, process into rich Soy Flour, Soy Milk, or Dadawa seasoning cubes for local kitchens in Gboko and Makurdi.

Would you like a tailored cost breakdown for any specific crop?`;
  }

  // Default response
  return `### 🤝 Welcome to GECN Business Mentorship

Alo! I am here to guide you toward financial independence and thriving small-scale enterprises in Gboko and across Benue State.

Here are key ways I can help you right now:
- 📊 **Cassava & Yam Processing:** Step-by-step cost breakdown and value-addition guides.
- 💡 **Trade Selection:** Low-capital ideas in tailoring, soap production, poultry, or retail.
- 💰 **Financial Literacy:** Managing Esusu savings loops, budgeting, and separating business funds.
- 🌾 **Market Access:** Tips for Gboko Main Market, Makurdi, and Otukpo trading hubs.

*Tip: Type in any trade idea or question below, and I will generate a step-by-step practical action plan!*`;
}

/**
 * Main send message function that auto-selects between server endpoint,
 * direct Gemini API (GitHub Pages with API key), or offline localized engine.
 */
export async function sendMentorMessage(
  messages: Message[],
  customKey?: string
): Promise<{ text: string; modeUsed: 'server' | 'direct_gemini' | 'offline_engine' }> {
  // 1. Try server API if not explicitly in static GitHub Pages environment
  const isGitHubPages =
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('github.io') ||
      window.location.protocol === 'file:');

  if (!isGitHubPages) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          return { text: data.text, modeUsed: 'server' };
        }
      }
    } catch (err) {
      console.warn('Server chat API unreachable, falling back to direct AI...', err);
    }
  }

  // 2. Direct client-side Gemini API (ideal for GitHub Pages deployment with user/env key)
  const apiKey = customKey || getStoredApiKey();
  if (apiKey) {
    try {
      const text = await callDirectGeminiApi(apiKey, messages);
      return { text, modeUsed: 'direct_gemini' };
    } catch (err: any) {
      console.error('Direct Gemini API error on GitHub Pages:', err);
      // If user provided an invalid key, notify gracefully with helpful details
      const fallback = getOfflineGECNResponse(messages);
      return {
        text: `*(Live Gemini API Error: ${err.message || 'Check your API Key'}. Switched to GECN Local Business Knowledge Engine)*\n\n${fallback}`,
        modeUsed: 'offline_engine',
      };
    }
  }

  // 3. Fallback to GECN rich localized business engine
  const offlineText = getOfflineGECNResponse(messages);
  return { text: offlineText, modeUsed: 'offline_engine' };
}
