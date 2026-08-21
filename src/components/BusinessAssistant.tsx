import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Send,
  RefreshCw,
  Key,
  Check,
  Copy,
  Download,
  Trash2,
  Calculator,
  Briefcase,
  TrendingUp,
  Info,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Message } from "../types";
import {
  sendMentorMessage,
  getAIConnectionStatus,
  getStoredApiKey,
  saveStoredApiKey,
  AIConnectionStatus
} from "../services/aiMentor";

interface BusinessAssistantProps {
  decoyMode?: boolean;
}

export const BusinessAssistant: React.FC<BusinessAssistantProps> = ({ decoyMode = false }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Alo (Greetings)! I am your **AI for Her Power (A4HP) Business Assistant**, developed by Gender Equality Club Nigeria (GECN).\n\nI am connected to live AI to help women, youth, and entrepreneurs in Gboko and across Benue State thrive. Ask me about **starting a small trade, processing cassava/yams, managing Esusu savings loops, pricing your products, or calculating profits**!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<AIConnectionStatus>(getAIConnectionStatus());
  
  // Key Modal & Settings
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");
  const [keySaveMessage, setKeySaveMessage] = useState("");
  const [testingKey, setTestingKey] = useState(false);

  // Profit Margin Calculator Widget State
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcBusiness, setCalcBusiness] = useState("Garri Processing (Gboko)");
  const [calcRawMaterial, setCalcRawMaterial] = useState<number>(40000);
  const [calcLaborTransport, setCalcLaborTransport] = useState<number>(12000);
  const [calcOutputBags, setCalcOutputBags] = useState<number>(4);
  const [calcPricePerUnit, setCalcPricePerUnit] = useState<number>(25000);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setConnectionStatus(getAIConnectionStatus());
    const stored = getStoredApiKey();
    if (stored) {
      setTempApiKey(stored);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  // Handle sending message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSending) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    if (!textToSend) setInputMessage("");
    setIsSending(true);

    try {
      const response = await sendMentorMessage(newHistory);
      const assistMsg: Message = {
        id: `msg-${Date.now()}-assistant`,
        sender: "assistant",
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistMsg]);
      setConnectionStatus(getAIConnectionStatus());
    } catch (err: any) {
      console.error("AI chat error:", err);
      const errMsg: Message = {
        id: `msg-${Date.now()}-err`,
        sender: "assistant",
        text: `We ran into an issue connecting to the AI service (${err.message || "Network timeout"}). Please try again or check your API key settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSending(false);
    }
  };

  // Test and Save API Key
  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestingKey(true);
    setKeySaveMessage("");

    const keyTrimmed = tempApiKey.trim();
    if (!keyTrimmed) {
      saveStoredApiKey("");
      setKeySaveMessage("Custom API key removed. Using default mode.");
      setConnectionStatus(getAIConnectionStatus());
      setTestingKey(false);
      setTimeout(() => setShowKeyModal(false), 1200);
      return;
    }

    try {
      // Test the key against Gemini 3.7 Flash endpoint
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${encodeURIComponent(keyTrimmed)}`;
      const res = await fetch(testUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: "Hello! Respond in 3 words." }] }]
        })
      });

      if (res.ok) {
        saveStoredApiKey(keyTrimmed);
        setKeySaveMessage("✅ Gemini API Key connected and verified successfully!");
        setConnectionStatus(getAIConnectionStatus());
        setTimeout(() => {
          setShowKeyModal(false);
          setKeySaveMessage("");
        }, 1500);
      } else {
        const errorJson = await res.json().catch(() => ({}));
        setKeySaveMessage(`❌ Key verification failed: ${errorJson.error?.message || "Invalid Key"}`);
      }
    } catch (err: any) {
      setKeySaveMessage(`❌ Network error while verifying key: ${err.message}`);
    } finally {
      setTestingKey(false);
    }
  };

  // Profit Margin Math
  const totalCost = (Number(calcRawMaterial) || 0) + (Number(calcLaborTransport) || 0);
  const totalRevenue = (Number(calcOutputBags) || 0) * (Number(calcPricePerUnit) || 0);
  const netProfit = totalRevenue - totalCost;
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0";

  // Send calculation to AI for analysis
  const handleAnalyzeCalculation = () => {
    const calcPrompt = `Please analyze my business budget and unit economics for ${calcBusiness}:
- Raw Materials/Stock Cost: ₦${calcRawMaterial.toLocaleString()}
- Processing, Transport & Labor: ₦${calcLaborTransport.toLocaleString()}
- Total Production Cost: ₦${totalCost.toLocaleString()}
- Expected Yield/Units: ${calcOutputBags} units
- Selling Price per unit: ₦${calcPricePerUnit.toLocaleString()}
- Projected Total Revenue: ₦${totalRevenue.toLocaleString()}
- Projected Net Profit: ₦${netProfit.toLocaleString()} (Margin: ${profitMarginPercent}%)

Give me feedback on how to maximize this margin in Gboko/Benue markets, lower risks, and protect my profit with Esusu savings.`;
    
    handleSendMessage(calcPrompt);
  };

  // Copy individual message
  const handleCopyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Export full chat as Markdown
  const handleExportChat = () => {
    const content = `# GECN AI for Her Power (A4HP) - Business Mentorship Notes
Exported on: ${new Date().toLocaleString()}
Organization: Gender Equality Club Nigeria (GECN), Gboko, Benue State (contact@gecnigeria.org)

${messages
  .map(
    (m) =>
      `### ${m.sender === "user" ? "👤 You" : "🤝 GECN Business Mentor"} (${m.timestamp})\n\n${m.text}\n\n---`
  )
  .join("\n\n")}
`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GECN_Business_Plan_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear chat
  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear your mentorship conversation history?")) {
      setMessages([
        {
          id: "welcome-reset",
          sender: "assistant",
          text: "Chat cleared! How can I assist your business or agricultural enterprise in Gboko today?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Column: Quick Mentorship Guides, Tools & Calculator */}
      <div className="flex flex-col gap-4">
        {/* Hub Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              {decoyMode ? "🌾 Agritech Mentoring Hub" : "🤝 AI for Her Power"}
            </h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-200">
              Live AI
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {decoyMode
              ? "Get customized tips on cassava processing machines, soil enrichment, and grain rotations."
              : "Economic independence is the strongest shield against systemic domestic abuse or land exclusion. Chat securely with our Digital Mentor to outline small-scale microcredit businesses in Gboko."}
          </p>

          {/* Quick Start Prompt Pills */}
          <div className="space-y-2 pt-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Quick Mentorship Topics:
            </h4>
            <div className="flex flex-col gap-2 text-xs">
              {[
                "How do I start a Garri processing business in Gboko?",
                "Explain how a local ESUSU savings loop works.",
                "Step-by-step budget for a mini-tailoring workshop.",
                "What agricultural crops yield best in Mkar/Yandev?",
                "How to brand and package smoked fish or poultry?",
                "How do I apply for the GECN ₦100k Microloan?"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isSending}
                  className="p-2.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 text-slate-700 border border-slate-200 hover:border-indigo-200 rounded-lg text-left text-[11px] leading-snug font-medium transition-all flex items-center justify-between group"
                >
                  <span className="line-clamp-2">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Unit Economics & Margin Calculator */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-800"
          >
            <span className="flex items-center gap-1.5 text-indigo-700">
              <Calculator className="w-4 h-4 text-indigo-600" />
              Margin & Profit Calculator
            </span>
            {showCalculator ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          <AnimatePresence>
            {showCalculator && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3 space-y-3 text-xs"
              >
                <div>
                  <label className="text-[10px] font-semibold text-slate-500">Business / Enterprise Name</label>
                  <input
                    type="text"
                    value={calcBusiness}
                    onChange={(e) => setCalcBusiness(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Raw Tubers/Stock (₦)</label>
                    <input
                      type="number"
                      value={calcRawMaterial}
                      onChange={(e) => setCalcRawMaterial(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Transport & Labor (₦)</label>
                    <input
                      type="number"
                      value={calcLaborTransport}
                      onChange={(e) => setCalcLaborTransport(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Output Quantity (Bags/Units)</label>
                    <input
                      type="number"
                      value={calcOutputBags}
                      onChange={(e) => setCalcOutputBags(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500">Price per Unit (₦)</label>
                    <input
                      type="number"
                      value={calcPricePerUnit}
                      onChange={(e) => setCalcPricePerUnit(Number(e.target.value))}
                      className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Total Investment:</span>
                    <span className="font-mono font-semibold text-slate-800">₦{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">Expected Revenue:</span>
                    <span className="font-mono font-semibold text-slate-800">₦{totalRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold pt-1 border-t border-indigo-200">
                    <span className="text-indigo-950">Net Profit:</span>
                    <span className={`font-mono ${netProfit >= 0 ? "text-emerald-700" : "text-red-600"}`}>
                      ₦{netProfit.toLocaleString()} ({profitMarginPercent}%)
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAnalyzeCalculation}
                  disabled={isSending}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze with AI Mentor
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Microfinance Notice */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-[11px] text-emerald-950 shadow-xs">
          <p className="font-bold flex items-center gap-1.5 text-emerald-900">
            <Briefcase className="w-4 h-4 text-emerald-700" />
            GECN Microfinance Pool
          </p>
          <p className="mt-1 text-emerald-800 leading-relaxed">
            Mentored women and survivors in Benue are eligible for interest-free microfinance loans up to ₦100,000 for local Gboko trading. Inquire via No. 2 A.A. Iortyom Street, Adekaa.
          </p>
        </div>
      </div>

      {/* Right Column (3 cols): Live Interactive Chat Window */}
      <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-4 flex flex-col h-[640px] shadow-xs">
        {/* Chat Top Banner */}
        <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between mb-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping absolute inset-0 opacity-75" />
            </div>
            <div>
              <p className="text-xs font-bold font-display flex items-center gap-2">
                A4HP Digital Business Assistant
                <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 border border-slate-700">
                  {connectionStatus.label}
                </span>
              </p>
              <p className="text-[10px] text-slate-300">
                Developed by Gender Equality Club Nigeria &bull; Live AI Mentorship
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Configure Live AI Key button (useful for GitHub Pages) */}
            <button
              onClick={() => setShowKeyModal(true)}
              title="Configure Google Gemini API Key for Live AI (GitHub Pages Mode)"
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-medium transition-colors flex items-center gap-1 border border-slate-700"
            >
              <Key className="w-3 h-3 text-amber-400" />
              <span className="hidden sm:inline">AI Settings</span>
            </button>

            {/* Export Business Plan / Chat Notes */}
            <button
              onClick={handleExportChat}
              title="Download Mentorship Notes / Business Plan"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearChat}
              title="Clear Conversation"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs transition-colors"
            >
              <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
            </button>
          </div>
        </div>

        {/* Live Messages Flow */}
        <div className="grow overflow-y-auto flex flex-col gap-3.5 p-2 mb-3 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[88%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-[10px] text-slate-400 font-medium">
                  {msg.sender === "user" ? "You" : "🤝 GECN Business Mentor"} &bull; {msg.timestamp}
                </span>
                {msg.sender === "assistant" && (
                  <button
                    onClick={() => handleCopyMessage(msg.text, msg.id)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5 transition-colors"
                    title="Copy advice"
                  >
                    {copiedMsgId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none font-sans shadow-xs whitespace-pre-wrap"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isSending && (
            <div className="mr-auto max-w-[85%] flex flex-col items-start bg-slate-50 border border-slate-200 p-3 rounded-2xl rounded-tl-none text-xs">
              <span className="text-[10px] text-slate-400 mb-1 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" />
                Mentor is preparing practical business guidance...
              </span>
              <div className="flex gap-1.5 py-1">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input & Send Area */}
        <div className="flex gap-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask about starting a business, cassava/yam farming, Esusu savings, or budgeting in Gboko..."
            className="grow p-3 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl text-xs transition-colors outline-none font-sans"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={isSending || !inputMessage.trim()}
            className="px-5 py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl transition-all shrink-0 flex items-center justify-center gap-1.5 text-xs font-semibold shadow-xs"
          >
            {isSending ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* GitHub Pages Live AI Key Configuration Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold font-display text-slate-900">
                    Live AI Settings (GitHub Pages)
                  </h3>
                </div>
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                When this app is published as a static site on <strong>GitHub Pages</strong>, you can connect directly to Google Gemini 3.7 Flash using your free Google AI Studio API key.
              </p>

              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Google Gemini API Key:
                  </label>
                  <input
                    type="password"
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Stored locally in your browser's private storage.
                  </p>
                </div>

                {keySaveMessage && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      keySaveMessage.startsWith("✅")
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {keySaveMessage}
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-800">Don't have a key?</p>
                  <p className="text-[11px]">
                    You can generate a free API key at Google AI Studio (takes ~30 seconds):
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 text-[11px] underline pt-1"
                  >
                    Get Free Gemini API Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={testingKey}
                    className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {testingKey ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing Key...
                      </>
                    ) : (
                      "Save & Connect"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
