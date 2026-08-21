import React, { useState, useEffect } from "react";
import {
  Phone,
  Radio,
  WifiOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Sparkles,
  Info,
  ChevronRight,
  Trash2,
  Share2,
  Lock,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Report, UssdLanguage } from "../types";
import { processClientUssd } from "../services/ussdEngine";

interface UssdSimulatorProps {
  onReportCreated?: (newReport: Report) => void;
  pilotLgas?: string[];
}

interface QuickCodeItem {
  code: string;
  title: string;
  description: string;
  urgency: string;
  language?: string;
}

export const UssdSimulator: React.FC<UssdSimulatorProps> = ({ onReportCreated }) => {
  // USSD Session state
  const [phoneNumber, setPhoneNumber] = useState("+234 803 456 7890");
  const [inputVal, setInputVal] = useState("*384*55#");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionText, setSessionText] = useState(""); // Cumulative path e.g. "1*2*1"
  const [screenMessage, setScreenMessage] = useState<string>("");
  const [screenAction, setScreenAction] = useState<'CON' | 'END' | 'IDLE'>('IDLE');
  const [userInputBox, setUserInputBox] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastCreatedReport, setLastCreatedReport] = useState<Report | null>(null);
  const [sessionId, setSessionId] = useState(`sess-${Date.now()}`);
  const [sessionLogs, setSessionLogs] = useState<Array<{ step: string; prompt: string; response?: string }>>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedLanguageTab, setSelectedLanguageTab] = useState<UssdLanguage>("en");
  const [showPosterGuide, setShowPosterGuide] = useState(false);

  const quickCodes: QuickCodeItem[] = [
    {
      code: "*384*55*0#",
      title: "🚨 Instant SOS Beacon",
      description: "Direct zero-click distress alert. Dispatches rapid crisis team immediately without interactive menus.",
      urgency: "Critical"
    },
    {
      code: "*384*55*1*1#",
      title: "Immediate GBV Intake (English)",
      description: "Fast-track domestic violence and physical safety report in English.",
      urgency: "Critical",
      language: "English"
    },
    {
      code: "*384*55*2*1#",
      title: "GBV Intake in Tiv (Zwa Tiv)",
      description: "Ifan hen ya / Mzeyol u kasev ken zwa Tiv for Gboko, Buruku, Tarka, Vendeikya.",
      urgency: "Critical",
      language: "Tiv"
    },
    {
      code: "*384*55*3*1#",
      title: "GBV Intake in Idoma (Ony'Idoma)",
      description: "Ebi nu Onya rapid crisis reporting for Otukpo, Apa, Okpokwu, Ogbadibo.",
      urgency: "Critical",
      language: "Idoma"
    },
    {
      code: "*384*55*1*2#",
      title: "Land & Property Rights Denial",
      description: "Report inheritance seizure, farm land exclusion of widows or female orphans.",
      urgency: "High",
      language: "English"
    },
    {
      code: "*384*55*1*3#",
      title: "Market Extortion & Illegal Levies",
      description: "Report trade union harassment and illegal tax enforcement against women traders.",
      urgency: "High",
      language: "English"
    },
    {
      code: "*384*55*1*7#",
      title: "A4HP Microfinance & Farm Trade",
      description: "Sign up for interest-free agro-processing loan and cassava trade training.",
      urgency: "Medium",
      language: "English"
    },
    {
      code: "*384*55*99#",
      title: "Discreet History Wiper",
      description: "Instantly clear USSD cache and erase dial traces from feature phone memory.",
      urgency: "Security"
    }
  ];

  // Send request to backend USSD endpoint with graceful client fallback
  const sendUssdRequest = async (fullText: string) => {
    setIsLoading(true);
    let data: any = null;

    try {
      const res = await fetch("/api/ussd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          serviceCode: "*384*55#",
          phoneNumber: phoneNumber.replace(/\s+/g, ""),
          text: fullText
        })
      });

      if (res.ok) {
        data = await res.json();
      } else {
        // Fallback for static hosting / GitHub pages
        data = processClientUssd(fullText, phoneNumber.replace(/\s+/g, ""), sessionId);
      }
    } catch (err) {
      console.warn("USSD server call failed, using client GSM engine", err);
      data = processClientUssd(fullText, phoneNumber.replace(/\s+/g, ""), sessionId);
    }

    if (data) {
      setScreenMessage(data.message);
      setScreenAction(data.action);
      
      setSessionLogs(prev => [
        ...prev,
        {
          step: fullText || "ROOT",
          prompt: data.message,
          response: fullText
        }
      ]);

      if (data.reportCreated) {
        setLastCreatedReport(data.reportCreated);
        if (onReportCreated) {
          onReportCreated(data.reportCreated);
        }
      }

      if (data.action === "END") {
        setSessionActive(false);
      } else {
        setSessionActive(true);
      }
      setUserInputBox("");
    }
    setIsLoading(false);
  };

  // Start new USSD session with the string in inputVal
  const handleDial = (customCode?: string) => {
    const codeToDial = (customCode || inputVal).trim();
    if (!codeToDial) return;

    const newSessId = `sess-${Date.now()}`;
    setSessionId(newSessId);
    setSessionLogs([]);
    setLastCreatedReport(null);

    // If dialling directly with quick string e.g. *384*55*1*1#
    if (codeToDial.startsWith("*384*55#")) {
      setSessionText("");
      sendUssdRequest("");
    } else if (codeToDial.startsWith("*384*55*")) {
      // Sub-code
      const inner = codeToDial.replace("*384*55*", "").replace(/#$/, "");
      setSessionText(inner);
      sendUssdRequest(inner);
    } else {
      // Default to root
      setSessionText("");
      sendUssdRequest("");
    }
  };

  // Submit next step response
  const handleSendResponse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInputBox.trim()) return;

    const nextPath = sessionText ? `${sessionText}*${userInputBox.trim()}` : userInputBox.trim();
    setSessionText(nextPath);
    sendUssdRequest(nextPath);
  };

  // Reset or cancel
  const handleCancelSession = () => {
    setSessionActive(false);
    setScreenAction("IDLE");
    setScreenMessage("");
    setUserInputBox("");
    setSessionText("");
  };

  // Keypad button click
  const handleKeypadPress = (val: string) => {
    if (!sessionActive) {
      setInputVal(prev => prev + val);
    } else {
      setUserInputBox(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    if (!sessionActive) {
      setInputVal(prev => prev.slice(0, -1));
    } else {
      setUserInputBox(prev => prev.slice(0, -1));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6" id="ussd-simulator-root">
      {/* Top Banner: Zero-Data Rural Accessibility Explainer */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white rounded-2xl p-6 border-b-4 border-emerald-500 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none -mr-12 -mt-12">
          <Radio className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="max-w-3xl relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              100% ZERO-DATA USSD PROTOCOL
            </span>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              2G/3G/4G FEATURE PHONE READY (NO SMARTPHONE REQUIRED)
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-bold font-display text-white tracking-tight">
            Universal Rural Reporting Engine for Small Button Phones
          </h2>
          <p className="text-xs md:text-sm text-emerald-100/90 mt-2 leading-relaxed font-sans">
            Designed specifically for rural women, adolescent girls, elderly matriarchs, and community members in remote Benue wards without internet, mobile data bundles, or smartphones. Dial <strong className="text-emerald-300 font-mono">*384*55#</strong> on any Nokia, Itel, or basic button phone across MTN, Airtel, Glo, and 9mobile at <strong>zero airtime cost</strong>.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleDial("*384*55#")}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all transform active:scale-95"
            >
              <Phone className="w-4 h-4" />
              Simulate Dialing *384*55#
            </button>
            <button
              onClick={() => handleDial("*384*55*0#")}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all transform active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              Dial Instant SOS (*384*55*0#)
            </button>
            <button
              onClick={() => setShowPosterGuide(!showPosterGuide)}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              {showPosterGuide ? "Hide Rural Poster Guide" : "View Rural Print/Community Guide"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Phone Hardware on Left, Shortcodes & Localized Menus on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT: Realistic 2G Feature Phone Simulator (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-sm bg-slate-900 rounded-[38px] p-5 shadow-2xl border-4 border-slate-800 flex flex-col gap-4 relative">
            {/* Phone Speaker Earpiece & Branding */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-16 h-1.5 bg-slate-700 rounded-full" />
              <div className="flex items-center justify-between w-full px-2 text-[10px] text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400" />
                  GECN BENUE GSM
                </span>
                <span className="text-emerald-400 font-bold">2G / TOLL-FREE</span>
              </div>
            </div>

            {/* LCD Screen Display */}
            <div className="bg-[#8ba888] text-[#122814] rounded-2xl p-4 shadow-inner border-2 border-[#769373] min-h-[220px] flex flex-col justify-between font-mono relative overflow-hidden">
              {/* LCD Status Header */}
              <div className="flex items-center justify-between text-[10px] pb-1 border-b border-[#769373]/50 font-bold">
                <span className="flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#122814]" />
                  USSD FLASH
                </span>
                <span>{sessionActive ? "SESSION ACTIVE" : "READY"}</span>
              </div>

              {/* LCD Main Body Content */}
              <div className="py-2 grow flex flex-col justify-center">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#122814]" />
                    <p className="text-xs font-bold tracking-tight">USSD Querying Telco Base Station...</p>
                  </div>
                ) : sessionActive || screenAction !== 'IDLE' ? (
                  <div className="text-xs whitespace-pre-line leading-relaxed select-text font-bold">
                    {screenMessage}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center gap-1 py-4">
                    <p className="text-sm font-bold tracking-wider">EQUIAI USSD GATEWAY</p>
                    <p className="text-[11px] opacity-80 mt-1">Dial *384*55# for Zero-Data Help</p>
                    <p className="text-[10px] bg-[#769373]/40 px-2 py-0.5 rounded mt-2">
                      MTN • AIRTEL • GLO • 9MOBILE
                    </p>
                  </div>
                )}
              </div>

              {/* LCD Input Box when session is active and CON */}
              {sessionActive && screenAction === 'CON' && (
                <form onSubmit={handleSendResponse} className="mt-2 pt-2 border-t border-[#769373]/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={userInputBox}
                    onChange={(e) => setUserInputBox(e.target.value)}
                    placeholder="Enter choice (e.g. 1)"
                    autoFocus
                    className="w-full bg-[#9bb898] text-[#122814] px-2.5 py-1.5 rounded text-xs font-bold border border-[#769373] focus:outline-none placeholder-[#122814]/50"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#122814] text-[#8ba888] rounded text-xs font-bold uppercase hover:bg-black transition-colors shrink-0"
                  >
                    Send
                  </button>
                </form>
              )}

              {/* LCD Footer Softkeys */}
              <div className="flex items-center justify-between text-[10px] font-bold pt-1.5 border-t border-[#769373]/40">
                <span onClick={handleCancelSession} className="cursor-pointer hover:underline">
                  {sessionActive ? "CANCEL" : "CLEAR"}
                </span>
                <span className="text-[9px] opacity-75">
                  {sessionActive ? `${sessionText ? sessionText : "0"}` : "*384*55#"}
                </span>
                <span onClick={() => handleSendResponse()} className="cursor-pointer hover:underline">
                  {sessionActive && screenAction === 'CON' ? "OK" : "SELECT"}
                </span>
              </div>
            </div>

            {/* Simulating Phone Number / Caller MSISDN Selector */}
            <div className="bg-slate-800/90 rounded-xl p-2.5 flex items-center justify-between text-xs text-slate-300 border border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-slate-400 font-sans">Simulated Caller:</span>
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-emerald-300 px-2 py-0.5 rounded font-mono text-xs text-right w-36 focus:outline-none"
              />
            </div>

            {/* Dial String Input Bar (When not in session) */}
            {!sessionActive && (
              <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="*384*55#"
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
                />
                <button
                  onClick={() => handleDial()}
                  className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Dial
                </button>
              </div>
            )}

            {/* Tactile 12-Key Button Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1 pb-2">
              {[
                { num: "1", sub: "" },
                { num: "2", sub: "ABC" },
                { num: "3", sub: "DEF" },
                { num: "4", sub: "GHI" },
                { num: "5", sub: "JKL" },
                { num: "6", sub: "MNO" },
                { num: "7", sub: "PQRS" },
                { num: "8", sub: "TUV" },
                { num: "9", sub: "WXYZ" },
                { num: "*", sub: "" },
                { num: "0", sub: "+" },
                { num: "#", sub: "" }
              ].map((k) => (
                <button
                  key={k.num}
                  onClick={() => handleKeypadPress(k.num)}
                  className="bg-gradient-to-b from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl py-2.5 flex flex-col items-center justify-center border border-slate-600/50 shadow-md active:scale-95 transition-transform"
                >
                  <span className="text-base font-bold font-mono leading-none">{k.num}</span>
                  {k.sub && <span className="text-[8px] text-slate-400 font-sans tracking-widest mt-0.5">{k.sub}</span>}
                </button>
              ))}
            </div>

            {/* Bottom Soft Controls: Call / End / Backspace */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => handleDial()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                title="Send / Call"
              >
                <Phone className="w-3.5 h-3.5" />
                CALL
              </button>
              <button
                onClick={handleCancelSession}
                className="bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                title="End / Hangup"
              >
                END
              </button>
              <button
                onClick={handleBackspace}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-xl text-xs font-bold flex items-center justify-center"
                title="Backspace"
              >
                ⌫ DEL
              </button>
            </div>
          </div>

          {/* Success Feedback Card when report created via USSD */}
          {lastCreatedReport && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 w-full max-w-sm p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 shadow-sm"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-800 mb-1">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>USSD Report Generated Live!</span>
              </div>
              <p className="text-[11px] text-slate-700 mt-1">
                Ticket: <strong className="text-emerald-700 font-mono">{lastCreatedReport.ussdMeta?.ticketNumber || lastCreatedReport.id}</strong>
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Category: <strong>{lastCreatedReport.category}</strong> | Urgency: <strong>{lastCreatedReport.urgency}</strong>
              </p>
              <p className="text-[10px] text-slate-500 mt-1 italic">
                {lastCreatedReport.cleaningLog}
              </p>
            </motion.div>
          )}
        </div>

        {/* RIGHT: Quick Shortcodes Directory, Localized Scripts, & Safety Guides (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Rural Community Printable / Mobile Poster Guide */}
          <AnimatePresence>
            {showPosterGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-amber-950 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] uppercase">
                      Rural Outreach Bulletin
                    </span>
                    <h3 className="font-bold text-sm font-display">GECN Benue USSD Market & Village Quick Sheet</h3>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="text-xs px-2.5 py-1 bg-amber-200 hover:bg-amber-300 font-bold rounded text-amber-900 flex items-center gap-1 transition-colors"
                  >
                    Print Sheet
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-amber-900">
                  Volunteers and market leaders can print or transcribe these exact USSD shortcodes on community noticeboards in Gboko Main Market, Mkar, Wannune, Wurukum, Otukpo, and Adoka for zero-data emergency access.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <p className="font-bold text-slate-800">🚨 Critical GBV Distress</p>
                    <p className="font-mono text-emerald-700 font-bold mt-0.5">*384*55*0#</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Works without airtime or data. Alerts safe haven shelter.</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <p className="font-bold text-slate-800">🌾 Land Inheritance Exclusion</p>
                    <p className="font-mono text-purple-700 font-bold mt-0.5">*384*55*1*2#</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Frees legal aid for widows and female orphans.</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <p className="font-bold text-slate-800">🌽 Cassava / Market Levies</p>
                    <p className="font-mono text-blue-700 font-bold mt-0.5">*384*55*1*3#</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Report union extortion against women traders.</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-amber-200">
                    <p className="font-bold text-slate-800">🔒 Wipe Phone Screen / Log</p>
                    <p className="font-mono text-slate-700 font-bold mt-0.5">*384*55*99#</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Discreet tool to prevent perpetrators seeing report.</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Direct Codes Table */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Official USSD Shortcode Directory
                </h3>
                <p className="text-xs text-slate-500">
                  Direct shortcodes enable instant reporting on button phones in 1 step without navigating menus
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold shrink-0">
                Toll-Free Reverse Billed
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {quickCodes.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 hover:bg-emerald-50/40 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-900 text-emerald-400 px-2 py-0.5 rounded">
                        {item.code}
                      </span>
                      <span className="font-bold text-xs text-slate-800">{item.title}</span>
                      {item.language && (
                        <span className="text-[10px] bg-purple-50 text-gecn-purple px-1.5 py-0.2 rounded font-medium border border-purple-100">
                          {item.language}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => copyToClipboard(item.code)}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 text-xs transition-colors flex items-center gap-1"
                      title="Copy code"
                    >
                      {copiedCode === item.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDial(item.code)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition-all"
                    >
                      Dial on Sim
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Localized Language Prompts Breakdown (Tiv, Idoma, Hausa, Pidgin, English) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-base font-display text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gecn-purple" />
                  Multilingual Dialect Translation Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Native language flows engineered for low-literacy rural speakers in Benue State
                </p>
              </div>

              {/* Language Selector Pills */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
                {[
                  { code: "en", label: "English" },
                  { code: "tiv", label: "Zwa Tiv" },
                  { code: "idoma", label: "Ony'Idoma" },
                  { code: "hausa", label: "Hausa" },
                  { code: "pidgin", label: "Pidgin" }
                ].map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setSelectedLanguageTab(l.code as UssdLanguage)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                      selectedLanguageTab === l.code
                        ? "bg-white text-gecn-purple shadow-xs"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Content Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2.5">
              {selectedLanguageTab === "tiv" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Tiv Language USSD Flow (Gboko, Buruku, Tarka, Vendeikya, Logo)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono">Dial *384*55*2#</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {`[EquiAI Nexus - Zwa Tiv]
Kanyi u soo u yila / pase?
1. Ifan hen Ya / GBV (Domestic Violence)
2. Mbanyi u Tar man Inyaregh (Land Denial)
3. Mnyam u Kasua man Inyaregh (Market Extortion)
4. Mvend u Twero hen Clinic (Health Denial)
5. Mdue u Mbayev ken Makeranta (Child Labor)
6. Ijiir i Yinan i Bem (Safe Haven Shelter)
7. A4HP Inyaregh ki Sule man Kasua`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Tiv prompt translated for cultural resonance, ensuring rural widows and farmers can describe rights violations with dignity.
                  </p>
                </>
              )}

              {selectedLanguageTab === "idoma" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Idoma Language USSD Flow (Otukpo, Apa, Okpokwu, Ogbadibo, Obi)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono">Dial *384*55*3#</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {`[EquiAI Nexus - Ony'Idoma]
Odi a je ka ka / cho?
1. Ebi nu Onya (GBV / Violence)
2. Eje Oya nu Aje (Land / Property Denial)
3. Efe nu Ahia / Market Extortions
4. Otulo nu Owo Clinic / Health Stigma
5. Eche Ukola nu Ayi (Child Withdrawal)
6. Oyi Eche nu Owo (Safe Shelter)
7. A4HP Microfinance & Eje Okonu`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Idoma prompt tailored for Benue South agrarian communities and palm/cassava trading clusters.
                  </p>
                </>
              )}

              {selectedLanguageTab === "hausa" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Hausa Language USSD Flow (Makurdi North Bank, Wadata, Riverine)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono">Dial *384*55*4#</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {`[EquiAI Nexus - Hausa]
Me kake so ka bayar da rahoto?
1. Rikicin Cikin Gida / Cin Zarafi (GBV)
2. Hana Gadon Filaye da Dukiya
3. Karin Haraji da Matsalar Kasuwa
4. Kin Karba a Asibiti / Wariya
5. Cire Yara Mata Daga Makaranta
6. Neman Mafaka Mai Aminci (Safe Shelter)
7. Tallafin Kasuwanci na A4HP`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Hausa dialect prompts crafted for commercial hubs, fish markets, and peri-urban trading zones.
                  </p>
                </>
              )}

              {selectedLanguageTab === "pidgin" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Nigerian Pidgin USSD Flow (Universal Youth & Market Dialect)</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono">Dial *384*55*5#</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {`[EquiAI Nexus - Pidgin]
Wetin you wan report or get help for?
1. Husband / Partner beat or abuse (GBV)
2. Dem seize your Papa land or property
3. Market Union harassment & illegal tax
4. Clinic refuse treat you or insult you
5. Dem stop girl child from school
6. I need urgent Safe Shelter
7. A4HP Small business loan & advice`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Accessible everyday Pidgin flow for informal workers, adolescents, and transport operators.
                  </p>
                </>
              )}

              {selectedLanguageTab === "en" && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">English Standard USSD Flow</span>
                    <span className="text-[10px] bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-mono">Dial *384*55*1#</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">
                    {`[EquiAI Nexus - Incident Report]
What would you like to report?
1. Domestic Violence / GBV
2. Land & Property Rights Denial
3. Market Extortion & Illegal Levies
4. Healthcare Denial & Stigma
5. School Withdrawal & Child Labor
6. Request Safe Haven Emergency Shelter
7. A4HP Microfinance & Farm Trade`}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Clean, concise English prompt structure matching GSM 160-character flash packet limits.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Survivor Safety Features on Basic Phones */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200/70 rounded-2xl p-5 text-xs text-purple-950 flex flex-col gap-3">
            <div className="flex items-center gap-2 font-bold text-gecn-purple text-sm">
              <Shield className="w-4 h-4 text-gecn-magenta" />
              Specialized Survivor Protections for Button Phones
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <p className="font-bold text-slate-900">Zero Internet Footprint</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  USSD communicates over SS7 signalling channels, leaving no web history or browser cache.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <p className="font-bold text-slate-900">Automatic MSISDN Masking</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Caller phone numbers are encrypted into safe hashes before landing on responder screens.
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-purple-100 shadow-2xs">
                <p className="font-bold text-slate-900">Log Wiper Shortcode</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Dialing <span className="font-mono font-bold text-emerald-700">*384*55*99#</span> flushes volatile feature phone screen memory instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
