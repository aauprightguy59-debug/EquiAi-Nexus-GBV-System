import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { Report, ResourceAllocation, CategoryType, TargetUserType, UrgencyType } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistence for reports and resources (initialized with rich realistic data from Gboko, Benue State)
let reports: Report[] = [
  {
    id: "rep-1",
    category: "Land/property rights",
    targetUser: "girls",
    description: "A young daughter in Yandev Ward, Gboko, has been denied her deceased father's land sharing inheritance by traditional family elders who claim custom forbids female land ownership.",
    date: "2026-06-11T14:30:00.000Z",
    location: "Yandev Ward, Gboko West",
    reportedBy: "Community Advocate",
    status: "Classified",
    urgency: "Medium",
    cleaningLog: "Anonymized the survivor's family name and exact farm plot coordinates to prevent community backlash."
  },
  {
    id: "rep-2",
    category: "Economic Barrier",
    targetUser: "women",
    description: "Women cassava traders at the Gboko Main Market are facing extortions and illegal taxes from unofficial trade union enforcers. Those who refuse to pay are physically bared from setting up their stalls.",
    date: "2026-06-12T09:15:00.000Z",
    location: "Central Ward, Gboko",
    reportedBy: "Survivor",
    status: "Pending",
    urgency: "High"
  },
  {
    id: "rep-3",
    category: "GBV",
    targetUser: "GBV victims",
    description: "Severe domestic violence incident. Husband threatened life after dispute over family finances. Needs immediate temporary shelter and legal mediation support.",
    date: "2026-06-13T22:11:00.000Z",
    location: "Abagu Area, Gboko South",
    reportedBy: "SMS Gateway",
    status: "Actioned",
    urgency: "Critical",
    smsContent: "HELP NEED SAFE PLACE in Abagu Gboko. Husband beat me up, locked house with key. I am hiding. Help.",
    cleaningLog: "Redacted phone number +2347031..., withheld exact street address, and substituted husband's name with [Spouse] for security.",
    assignedResource: {
      type: "Temporary Shelter",
      name: "GECN Safe Haven Gboko",
      contact: "+234 703 212 1178",
      status: "Dispatched"
    }
  },
  {
    id: "rep-4",
    category: "Healthcare Denial",
    targetUser: "sex workers",
    description: "Client was stigmatized and flatly refused basic reproductive health screening and HIV prophylaxis at a community health clinic in Adekaa after revealing her occupation.",
    date: "2026-06-13T11:00:00.000Z",
    location: "Adekaa Area, Gboko East",
    reportedBy: "Healthcare Worker",
    status: "Referred",
    urgency: "High",
    cleaningLog: "Removed explicit clinic identifier to keep report systemic, and redacted client's personal peer ID.",
    assignedResource: {
      type: "Medical Support",
      name: "Gboko General Hospital (Peer Wing)",
      contact: "+234 812 555 9090",
      status: "Completed"
    }
  },
  {
    id: "rep-5",
    category: "Education Barrier",
    targetUser: "girls",
    description: "Several teenage girls in Mkar district are being pulled out of senior high school classes to do commercial farm labor due to extreme economic hardship facing their parents.",
    date: "2026-06-14T01:45:00.000Z",
    location: "Mkar Ward, Gboko East",
    reportedBy: "Community Advocate",
    status: "Pending",
    urgency: "Medium"
  },
  {
    id: "rep-6",
    category: "Healthcare Denial",
    targetUser: "women",
    description: "A female survivor of domestic GBV in Wurukum, Makurdi, was delayed treatment at a public facility because reception staff insisted on a signed police report before providing emergency post-assault physical care.",
    date: "2026-06-14T02:05:00.000Z",
    location: "Wurukum Ward, Makurdi",
    reportedBy: "Healthcare Worker",
    status: "Pending",
    urgency: "Critical",
    cleaningLog: "Removed specific clinic ward name; replaced survivor identification codes with default gender response system values."
  },
  {
    id: "rep-7",
    category: "Economic Barrier",
    targetUser: "women",
    description: "Intimidation of female market cooperative administrators in Otukpo Town West. Traditional operators claimed women are customary property and cannot hold legal titles or Esusu group savings accounts.",
    date: "2026-06-13T16:40:00.000Z",
    location: "Otukpo Town West, Otukpo",
    reportedBy: "Survivor",
    status: "Actioned",
    urgency: "High",
    assignedResource: {
      type: "Economic Support",
      name: "A4HP Microfinance & Market Empowerment Club",
      contact: "+234 703 212 1178",
      status: "Dispatched"
    }
  },
  {
    id: "rep-8",
    category: "Land/property rights",
    targetUser: "girls",
    description: "A twenty-year-old widow in Wannune, Tarka, was forced off her maize tillage farm by extended step-relatives, claiming her customary marriage gave her no title over family agricultural soil.",
    date: "2026-06-13T10:12:00.000Z",
    location: "Wannune Ward, Tarka",
    reportedBy: "Community Advocate",
    status: "Referred",
    urgency: "Critical",
    cleaningLog: "Anonymized farming coordinates and redacted widow's local family cell phone line.",
    assignedResource: {
      type: "Legal Aid",
      name: "Gwan & Chambers Legal Aid",
      contact: "+234 901 222 3434",
      status: "Completed"
    }
  },
  {
    id: "rep-9",
    category: "Education Barrier",
    targetUser: "girls",
    description: "Young girls in riverine settlements near Buruku ferry crossing are kept away from completing compulsory primary schooling to assist community transit boats and dry fish for local markets.",
    date: "2026-06-12T11:20:00.000Z",
    location: "Buruku Town Ward, Buruku",
    reportedBy: "Community Advocate",
    status: "Classified",
    urgency: "Medium"
  },
  {
    id: "rep-10",
    category: "GBV",
    targetUser: "GBV victims",
    description: "Fleeing survivor of partner physical abuse arrived seeking shelter in Vendeikya Town Ward stating she has been trailed. Safe space needed immediately.",
    date: "2026-06-14T01:50:00.000Z",
    location: "Vendeikya Town Ward",
    reportedBy: "Survivor",
    status: "Pending",
    urgency: "Critical"
  },
  {
    id: "rep-11",
    category: "Other",
    targetUser: "GBV victims",
    description: "Marginalization of IDP female survivors in Ugba, Logo LGA. Distribution of sanitation packs and agricultural seed vouchers was denied to female heads of household by local camp gatekeepers.",
    date: "2026-06-11T08:32:00.000Z",
    location: "Ugba Ward, Logo",
    reportedBy: "Community Advocate",
    status: "Classified",
    urgency: "High"
  }
];

let resources: ResourceAllocation[] = [
  {
    id: "res-1",
    name: "GECN Safe Haven Gboko",
    type: "Temporary Shelter",
    location: "Secret Location, Gboko South",
    contact: "+234 703 212 1178",
    status: "Available"
  },
  {
    id: "res-2",
    name: "Gboko General Hospital (Peer Wing)",
    type: "Medical Support",
    location: "Hospital Road, Gboko Central",
    contact: "+234 812 555 9090",
    status: "Available"
  },
  {
    id: "res-3",
    name: "Gwan & Chambers Legal Aid",
    type: "Legal Aid",
    location: "Ahmadu Bello Way, Gboko",
    contact: "+234 901 222 3434",
    status: "Available"
  },
  {
    id: "res-4",
    name: "GECN Counseling & Healing Circle",
    type: "Counseling",
    location: "No. 62 Ahmadu Bello Way, Gboko",
    contact: "+234 703 212 1178",
    status: "Available"
  },
  {
    id: "res-5",
    name: "A4HP Microfinance & Market Empowerment Club",
    type: "Economic Support",
    location: "No. 62 Ahmadu Bello Way, Gboko",
    contact: "+234 703 212 1178",
    status: "Available"
  }
];

// Lazy-initialization helper for Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return aiClient;
}

// REST API Endpoints

// 1. Get all reports
app.get("/api/reports", (req, res) => {
  res.json(reports);
});

// 2. Get resources
app.get("/api/resources", (req, res) => {
  res.json(resources);
});

// 3. Create a report & analyze with Gemini automatically or trigger rule-based triage
app.post("/api/reports", async (req, res) => {
  const { category, targetUser, description, location, reportedBy, smsContent } = req.body;

  if (!description && !smsContent) {
    return res.status(400).json({ error: "Description or SMS source is required" });
  }

  const rawText = smsContent || description;
  const newId = `rep-${Date.now()}`;
  let cleanedDesc = rawText;
  let detectedCategory = category || "Other";
  let detectedUrgency: UrgencyType = "Medium";
  let cleaningLog = "Standard system screening applied to details.";
  let detectedTarget = targetUser || "women";

  // Check if we can use Gemini
  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `
      You are the specialized NLP agent "HerData Commons AI" running on the backend of Gender Equality Club Nigeria in Gboko.
      Your primary duty is to analyze, sanitize, categorize, and prioritize incident reports to support women, girls, and marginalized survivors safely.

      TASK:
      1. Redact direct, dangerous, and sensitive personal identifiers (phone numbers, exact street numbers, names, specific family details) from the raw report text to protect the safety of survivors in a small community. Replace them with standard labels like [Survivor], [Relative], [Contact Info], etc.
      2. Categorize the incident into exactly one of these: 'GBV', 'Economic Barrier', 'Healthcare Denial', 'Land/property rights', 'Education Barrier', 'Other'.
      3. Classify target group affected from: 'GBV victims', 'women', 'girls', 'men', 'boys', 'sex workers'.
      4. Rate the Urgency into exactly one of: 'Low', 'Medium', 'High', 'Critical'.
      5. Provide an concise logs string explaining what was cleaned/redacted for audit compliance.

      RAW REPORT: "${rawText}"
      PROPOSED CATEGORY (if any / might be incorrect): "${category}"
      PROPOSED TARGET USER (if any): "${targetUser}"

      Return strictly a JSON object with the following schema:
      {
        "cleanedDescription": "...",
        "category": "GBV" | "Economic Barrier" | "Healthcare Denial" | "Land/property rights" | "Education Barrier" | "Other",
        "targetUser": "GBV victims" | "women" | "girls" | "men" | "boys" | "sex workers",
        "urgency": "Low" | "Medium" | "High" | "Critical",
        "cleaningLog": "..."
      }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text?.trim() || "";
      if (responseText) {
        const parsed = JSON.parse(responseText);
        cleanedDesc = parsed.cleanedDescription || rawText;
        detectedCategory = parsed.category || detectedCategory;
        detectedUrgency = parsed.urgency || "Medium";
        cleaningLog = parsed.cleaningLog || "Anonymized via Gemini Auto-redact.";
        detectedTarget = parsed.targetUser || detectedTarget;
      }
    } catch (err: any) {
      console.error("Gemini classification failed, using rules-based triage:", err.message);
      // Fallback heuristics
      cleaningLog = "Rules-based local scrubbing matching phone and email patterns.";
      // simple phone scrub
      cleanedDesc = rawText.replace(/\+?\d{10,14}/g, "[Redacted Phone]");
      if (rawText.toLowerCase().includes("beat") || rawText.toLowerCase().includes("abuse") || rawText.toLowerCase().includes("husband") || rawText.toLowerCase().includes("violence")) {
        detectedCategory = "GBV";
        detectedUrgency = "Critical";
      } else if (rawText.toLowerCase().includes("land") || rawText.toLowerCase().includes("inherit") || rawText.toLowerCase().includes("property")) {
        detectedCategory = "Land/property rights";
        detectedUrgency = "Medium";
      } else if (rawText.toLowerCase().includes("unions") || rawText.toLowerCase().includes("money") || rawText.toLowerCase().includes("market") || rawText.toLowerCase().includes("levy")) {
        detectedCategory = "Economic Barrier";
        detectedUrgency = "High";
      } else if (rawText.toLowerCase().includes("school") || rawText.toLowerCase().includes("withdraw") || rawText.toLowerCase().includes("tuition")) {
        detectedCategory = "Education Barrier";
        detectedUrgency = "Medium";
      }
    }
  } else {
    // Basic local rules when no API key is set
    cleaningLog = "Local automated screening (No Active Gemini Connection). Please activate API Key in panel.";
    cleanedDesc = rawText.replace(/\+?\d{10,14}/g, "[Phone Redacted]");
    if (rawText.toLowerCase().includes("beat") || rawText.toLowerCase().includes("violence") || rawText.toLowerCase().includes("hit")) {
      detectedCategory = "GBV";
      detectedUrgency = "Critical";
    }
  }

  const newReport: Report = {
    id: newId,
    category: detectedCategory as CategoryType,
    targetUser: detectedTarget as TargetUserType,
    description: cleanedDesc,
    date: new Date().toISOString(),
    location: location || "Gboko Wards",
    reportedBy: reportedBy || (smsContent ? "SMS Gateway" : "Survivor"),
    status: "Classified",
    urgency: detectedUrgency,
    smsContent: smsContent,
    cleaningLog: cleaningLog
  };

  reports.unshift(newReport);
  res.status(201).json(newReport);
});

// 4. Update status and resource allocation
app.post("/api/reports/:id/status", (req, res) => {
  const reportId = req.params.id;
  const { status, resourceId } = req.body;

  const reportIndex = reports.findIndex((r) => r.id === reportId);
  if (reportIndex === -1) {
    return res.status(404).json({ error: "Report not found" });
  }

  const report = reports[reportIndex];
  if (status) report.status = status;

  if (resourceId) {
    const resrc = resources.find((r) => r.id === resourceId);
    if (resrc) {
      report.assignedResource = {
        type: resrc.type,
        name: resrc.name,
        contact: resrc.contact,
        status: status === "Actioned" ? "Completed" : "Dispatched"
      };
      resrc.status = "Busy";
    }
  }

  res.json(report);
});

// 5. Bulk analysis report generated using all reports
app.post("/api/reports/analyze-all", async (req, res) => {
  const ai = getGeminiClient();
  const summaryText = reports.map(r => `[Category: ${r.category}, Urgency: ${r.urgency}, Location: ${r.location}, Target Group: ${r.targetUser}, Description: ${r.description}]`).join("\n");

  if (ai) {
    try {
      const prompt = `
      You are HerData Commons AI, the lead data analyst for Gender Equality Club Nigeria in Benue State.
      Analyze the following aggregated anonymous reports in Gboko, and generate a concise, professional advocacy report.

      REPORTS DATABASE:
      ${summaryText}

      Please structure your output with these specific headers:
      ### 📈 Key Hotspots & Pattern Detection
      (Summarize where incidents are mostly occurring and which categories are prevalent)

      ### 👥 Demographics At Risk
      (Highlight which vulnerable cohorts like girls, women, or sex workers are bearing the brunt)

      ### 🚨 Recommended Resource Allocation
      (Direct suggestions on where local agencies, safe homes, and counseling centres should redirect their limited resources)

      ### ✊ Actionable Advocacy Strategy
      (Provide 2-3 specific evidence-based tips to present in council meetings or circles to drive systemic change, mentioning Tiv or Benue local framework context)
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ analysis: response.text });
    } catch (err: any) {
      res.json({
        analysis: "### 📈 Local Pattern Analysis\n- Major cases of GBV are flagged as *Critical* urgency focusing around Abagu area.\n- Land/property rights remains a slow-burning cultural conflict in rural Gboko West/Yandev.\n- High economic barrier and levies noted for women cassava sellers at Gboko Main Market.\n\n### 👥 Cohorts at Risk\n- **Women and Young Girls** are most affected by inheritance barriers.\n- **Sex Workers** report severe stigmatization and denial of healthcare in Adekaa clinics.\n\n### 🚨 Suggested Resource Plan\n- Redirection of Legal Aid to Yandev to support inheritance litigation and Tiv Traditional Council mediation.\n- Security patrolling and cooperative microfinancing at Gboko Main Market.\n\n### ✊ Local Advocacy Drive\n1. Partner with the **Tiv Traditional Council** to expand the Female Child Property Sharing Campaign.\n2. Engage local clinics in Adekaa with health inclusion workshops."
      });
    }
  } else {
    // Mock local analytical report when API key is not present
    res.json({
      analysis: "### 📈 Local Pattern Analysis (Demo Mock)\n- Major cases of GBV are flagged as *Critical* urgency focusing around Abagu area, needing immediate temporary safe homes.\n- Land/property rights remains a slow-burning cultural conflict in rural Gboko West/Yandev where daughters face traditional exclusion.\n- High economic barrier and levies noted for women cassava sellers at Gboko Main Market.\n\n### 👥 Cohorts at Risk\n- **Women and Young Girls** are most affected by inheritance barriers.\n- **Sex Workers** report severe stigmatization and denial of healthcare in Adekaa clinics.\n\n### 🚨 Suggested Resource Plan\n- Redirection of Legal Aid to Yandev to support inheritance litigation and Tiv Traditional Council mediation.\n- Security patrolling and cooperative microfinancing at Gboko Main Market.\n\n### ✊ Local Advocacy Drive\n1. Partner with the **Tiv Traditional Council** to expand the Female Child Property Sharing Campaign.\n2. Engage local clinics in Adekaa with health inclusion workshops."
    });
  }
});

// 6. Mentor Chat Endpoint (A4HP Assistant)
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  // Extract instructions
  const systemInstruction = `
  You are the AI for Her Power (A4HP) Business Assistant, developed by the Gender Equality Club Nigeria.
  Your role is to empower women, girls, and survivors of economic or social barriers in Gboko, Benue State, Nigeria.
  You are a highly encouraging, sensible, and supportive digital business mentor.

  Conform to this localized context:
  - Gboko is a prominent agricultural and trading hub in Benue State (the Food Basket of the Nation).
  - Main local crops: Yam, Cassava, Rice, Soybeans, Beniseed (Sesame). Recommend processing crops rather than selling raw (e.g., cassava into garri/starch, soybeans into soy flour/milk) to maximize profit.
  - Suggest small-scale, accessible trades: Tailoring, catering, soap making, mini-retail, beadwork, or agricultural value addition.
  - Emphasize financial literacy: Saving circles (known locally as Esusu or Bam), separating business and family wallets, calculating raw materials vs profit.
  - Guide on leveraging local communities: GECN microloan scheme, GECN Soft Skills STEM Project, or local farming cooperatives in Gboko East/Central.
  - Keep tone respectful, warm, and highly practical. Avoid corporate jargon. Ensure responses are direct, empathetic, and broken down in bullet points for easy reading.
  `;

  const ai = getGeminiClient();
  if (ai) {
    try {
      // Reformat message history to matching Gemini SDK formats
      // Our message shape: sender: 'user' | 'assistant', text: string
      const chatMessages = messages.map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const latestMsg = chatMessages[chatMessages.length - 1];
      const previousHistory = chatMessages.slice(0, -1);

      const chat = ai.chats.create({
        model: "gemini-3.5-flash",
        config: {
          systemInstruction: systemInstruction,
        },
        history: previousHistory
      });

      const response = await chat.sendMessage({ message: latestMsg.parts[0].text });
      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini mentorship chat failed:", err.message);
      res.json({ text: "I hear you, and I am here for you! Trade and self-sufficiency are powerful steps. In Gboko, many of our women excel by pooling resources through Esusu groups to buy quality farming seed or processors for cassava. Tell me about your business goal, and let's structure it together step-by-step!" });
    }
  } else {
    // Local fallback
    const lastUserMessage = messages[messages.length - 1]?.text?.toLowerCase() || "";
    let responseText = "I am so glad you reached out. As your A4HP Mentor, let me share some core advice for thriving right here in Gboko:\n\n- **Cassava & Yam Processing:** If you deal in farming, turning cassava into garri or starch yields twice the margin of selling raw raw tubers at Gboko Main Market.\n- **Support Groups:** Connect with women's cooperatives at No. 62 Ahmadu Bello Way, where we support with micro-credit and savings.\n- **Keep Records:** Write down every Naira you spend and make. Do you have a specific trade idea you'd like to share?";

    if (lastUserMessage.includes("yam") || lastUserMessage.includes("farm")) {
      responseText = "Farming represents the heartbeat of Benue! For small-scale farming in Yandev or Mkar:\n\n- **Soil Enrichment:** Plant soya crops in rotation to replenish nitrogen in the soil naturally.\n- **Direct Supply:** Try to pool transport with fellow GECN cooperative members to bypass middle-agents on market days.\n- **Seed Quality:** We can examine GECN microfinancing options to procure high-yielding seed varieties.";
    } else if (lastUserMessage.includes("loan") || lastUserMessage.includes("money") || lastUserMessage.includes("capital")) {
      responseText = "Understood. Access to capital is a major barrier we are tackling! Here are key local pathways in Gboko:\n\n- **Esusu Circles:** Join a daily/weekly savings club to acquire rotating interest-free lump sums.\n- **GECN Microloan Scheme:** We offer microloans with gentle repayment terms specially for women expanding agricultural retail or tailoring workshops.\n- **Staging Capital:** Start very small, proving your business model before borrowing.";
    }

    res.json({ text: responseText });
  }
});


// Dev & Production routes

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Setup Vite as middleware in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static compiled UI files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      // Avoid intercepting API routes
      if (req.path.startsWith("/api/")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[EquiAI Nexus Backend] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
