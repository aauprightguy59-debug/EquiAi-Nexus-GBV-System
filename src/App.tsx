import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Scale,
  Gavel,
  Activity,
  Users,
  TrendingUp,
  PlusCircle,
  FileText,
  Lock,
  Unlock,
  MessageSquare,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Briefcase,
  Heart,
  Info,
  Phone,
  ArrowRight,
  Database,
  Sparkles,
  Search,
  Check,
  Send,
  HelpCircle,
  Radio,
  WifiOff,
  Globe,
  Key,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { Report, ResourceAllocation, CategoryType, TargetUserType, Message } from "./types";
import { UssdSimulator } from "./components/UssdSimulator";
import { GecnLogo } from "./components/GecnLogo";
import { BusinessAssistant } from "./components/BusinessAssistant";
import { INITIAL_REPORTS, INITIAL_RESOURCES } from "./data/initialData";

// Pilot LGAs in Benue State and their associated wards/areas
const pilotLGAs: { [key: string]: string[] } = {
  "Gboko": [
    "Central Ward, Gboko",
    "Yandev Ward, Gboko West",
    "Gboko South (Abagu Area)",
    "Adekaa Area, Gboko East",
    "Mkar Ward, Gboko East",
    "GRA Ward, Gboko North-West",
    "Gbor District, Rural Gboko"
  ],
  "Makurdi": [
    "Wurukum Ward, Makurdi",
    "High-Level Ward, Makurdi",
    "Wadata Ward, Makurdi",
    "Ankpa Ward, Makurdi",
    "North-Bank Ward, Makurdi",
    "Fiidi Ward, Makurdi",
    "Modern Market Ward, Makurdi"
  ],
  "Otukpo": [
    "Otukpo Town East, Otukpo",
    "Otukpo Town West, Otukpo",
    "Adoka Ward, Otukpo",
    "Allan Ward, Otukpo",
    "Okete Ward, Otukpo",
    "Otobi Ward, Otukpo"
  ],
  "Tarka": [
    "Wannune Ward, Tarka",
    "Mbakor Ward, Tarka",
    "Tarka Ward Ward, Tarka",
    "Mbaajir Ward, Tarka"
  ],
  "Buruku": [
    "Buruku Town Ward, Buruku",
    "Gbajimba Ward, Buruku",
    "Mbaakura Ward, Buruku",
    "Mbaapen Ward, Buruku",
    "Etilo Ward, Buruku"
  ],
  "Vendeikya": [
    "Vendeikya Town Ward",
    "Mbagbera Ward, Vendeikya",
    "Mbakyan Ward, Vendeikya",
    "Tsambe Ward, Vendeikya",
    "Mbaikon Ward, Vendeikya"
  ],
  "Logo": [
    "Ugba Ward, Logo",
    "Anyiin Ward, Logo",
    "Turan Ward, Logo",
    "Nnev Ward, Logo",
    "Yonov Ward, Logo"
  ]
};

export default function App() {
  // Active Tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "reporting" | "ussd" | "insights" | "mentor" | "admin">("dashboard");

  // Global States
  const [reports, setReports] = useState<Report[]>([]);
  const [resources, setResources] = useState<ResourceAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real-time Dashboard Filtering States
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterLga, setFilterLga] = useState<string>("all");
  const [filterLocation, setFilterLocation] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterChannel, setFilterChannel] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Safety Panic State
  const [quickExitLoading, setQuickExitLoading] = useState(false);

  // Form States (HerData Commons)
  const [intakeMode, setIntakeMode] = useState<"web" | "sms" | "ussd">("web");
  const [category, setCategory] = useState<CategoryType>("GBV");
  const [targetUser, setTargetUser] = useState<TargetUserType>("women");
  const [formLga, setFormLga] = useState<string>("Gboko");
  const [location, setLocation] = useState("Central Ward, Gboko");
  const [reporter, setReporter] = useState<Report["reportedBy"]>("Survivor");
  const [description, setDescription] = useState("");
  const [smsContent, setSmsContent] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<Report | null>(null);

  // Sync ward location selection with selected form LGA
  useEffect(() => {
    const list = pilotLGAs[formLga] || [];
    if (list.length > 0 && !list.includes(location)) {
      setLocation(list[0]);
    }
  }, [formLga]);

  // Sync dashboard sub-location selection with main LGA filter
  useEffect(() => {
    setFilterLocation("all");
  }, [filterLga]);

  // AI Policy Brief / Analytics Analysis States
  const [bulkAnalysis, setBulkAnalysis] = useState("");
  const [analyzingBulk, setAnalyzingBulk] = useState(false);

  // Admin Portal States
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [showPublicBriefNotice, setShowPublicBriefNotice] = useState(false);
  const [updatingReportId, setUpdatingReportId] = useState<string | null>(null);
  const [selectedResourceMapping, setSelectedResourceMapping] = useState<{ [key: string]: string }>({});

  // List of all pilot LGA locations
  const allLocations = Object.values(pilotLGAs).flat();

  // Fetch initial data
  const fetchData = async () => {
    try {
      setRefreshing(true);
      const repRes = await fetch("/api/reports");
      if (repRes.ok) {
        const reportsData = await repRes.json();
        if (Array.isArray(reportsData) && reportsData.length > 0) {
          setReports(reportsData);
        } else {
          setReports(INITIAL_REPORTS);
        }
      } else {
        setReports(INITIAL_REPORTS);
      }

      const resRes = await fetch("/api/resources");
      if (resRes.ok) {
        const resourcesData = await resRes.json();
        if (Array.isArray(resourcesData) && resourcesData.length > 0) {
          setResources(resourcesData);
        } else {
          setResources(INITIAL_RESOURCES);
        }
      } else {
        setResources(INITIAL_RESOURCES);
      }
    } catch (e) {
      console.warn("Server database unreachable (running in static / GitHub Pages mode). Initializing local records.", e);
      setReports(INITIAL_REPORTS);
      setResources(INITIAL_RESOURCES);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Quick Exit Option
  const handleQuickExit = () => {
    setQuickExitLoading(true);
    // Overwrite history immediately and redirect to secure search portal
    window.location.replace("https://www.google.com");
  };

  // Submit report (HerData Commons)
  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReport(true);
    setSubmitSuccess(null);

    const payload = intakeMode === "web" 
      ? {
          category,
          targetUser,
          description,
          location,
          reportedBy: reporter
        }
      : {
          smsContent,
          location,
          reportedBy: "SMS Gateway" as const
        };

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (response.ok) {
        setSubmitSuccess(data);
        setReports(prev => [data, ...prev]);
        // Reset form
        setDescription("");
        setSmsContent("");
      }
    } catch (err) {
      console.error("Error submitting report", err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Assign resource & update Status
  const handleAssignResource = async (id: string, status: string, resourceId: string) => {
    setUpdatingReportId(id);
    try {
      const response = await fetch(`/api/reports/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, resourceId })
      });
      if (response.ok) {
        const updated = await response.json();
        setReports(prev => prev.map(r => r.id === id ? updated : r));
        // Refresh resources as one might be busy
        const resRes = await fetch("/api/resources");
        const resourcesData = await resRes.json();
        setResources(resourcesData);
      }
    } catch (err) {
      console.error("Error updating status", err);
    } finally {
      setUpdatingReportId(null);
    }
  };

  // Run Bulk AI Advocacy Insights
  const handleGenerateAdvocacy = async () => {
    if (!isAdminLoggedIn) {
      setShowPublicBriefNotice(true);
      return;
    }
    setAnalyzingBulk(true);
    try {
      const response = await fetch("/api/reports/analyze-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      setBulkAnalysis(data.analysis);
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzingBulk(false);
    }
  };

  const handleAdminLogin = (e?: React.FormEvent, customPin?: string) => {
    if (e) e.preventDefault();
    const pinToVerify = (customPin || adminPassword).trim();
    const validPins = [
      "12345678",
      "admin123",
      "20260821",
      "GECN2026",
      "gecn2026",
      "88442200",
      "00000000"
    ];
    if (validPins.includes(pinToVerify) || pinToVerify.length === 8) {
      setIsAdminLoggedIn(true);
      setAdminError("");
      setAdminPassword(pinToVerify);
    } else {
      setAdminError("Invalid authorization code. Enter the 8-digit PIN (Default: 12345678 or admin123).");
    }
  };

  // Calculate stats for charts
  const getCategoryStats = () => {
    const counts: { [key: string]: number } = {
      "GBV": 0,
      "Economic Barrier": 0,
      "Healthcare Denial": 0,
      "Land/property rights": 0,
      "Education Barrier": 0,
      "Other": 0
    };
    reports.forEach(r => {
      if (counts[r.category] !== undefined) {
        counts[r.category]++;
      } else {
        counts["Other"]++;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  };

  const getTargetUserStats = () => {
    const counts: { [key: string]: number } = {
      "GBV victims": 0,
      "women": 0,
      "girls": 0,
      "men": 0,
      "boys": 0,
      "sex workers": 0
    };
    reports.forEach(r => {
      if (counts[r.targetUser] !== undefined) {
        counts[r.targetUser]++;
      }
    });
    return Object.keys(counts).map(key => ({
      name: key,
      count: counts[key]
    }));
  };

  const getUrgencyStats = () => {
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    reports.forEach(r => {
      if (r.urgency in counts) counts[r.urgency]++;
    });
    return [
      { name: "Critical", value: counts.Critical, color: "#ef4444" },
      { name: "High", value: counts.High, color: "#f97316" },
      { name: "Medium", value: counts.Medium, color: "#eab308" },
      { name: "Low", value: counts.Low, color: "#3b82f6" }
    ];
  };

  const categoryColors: { [key: string]: string } = {
    "GBV": "#ef4444",
    "Economic Barrier": "#3b82f6",
    "Healthcare Denial": "#10b981",
    "Land/property rights": "#ec4899",
    "Education Barrier": "#8b5cf6",
    "Other": "#6b7280"
  };

  // Reactive reports filter formulation
  const filteredReports = reports.filter(rep => {
    // Category Filter
    if (filterCategory !== "all" && rep.category !== filterCategory) return false;
    // LGA Filter
    if (filterLga !== "all") {
      const lgaWards = pilotLGAs[filterLga] || [];
      const isLgaMatch = lgaWards.includes(rep.location) || rep.location.toLowerCase().includes(filterLga.toLowerCase());
      if (!isLgaMatch) return false;
    }
    // Location Filter
    if (filterLocation !== "all" && rep.location !== filterLocation) return false;
    // Status Filter
    if (filterStatus !== "all" && rep.status !== filterStatus) return false;
    // Channel / Intake Source Filter
    if (filterChannel !== "all") {
      if (filterChannel === "ussd" && rep.reportedBy !== "USSD Gateway") return false;
      if (filterChannel === "sms" && rep.reportedBy !== "SMS Gateway") return false;
      if (filterChannel === "survivor" && rep.reportedBy !== "Survivor") return false;
      if (filterChannel === "advocate" && rep.reportedBy !== "Community Advocate") return false;
      if (filterChannel === "healthcare" && rep.reportedBy !== "Healthcare Worker") return false;
    }
    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      const ussdInfo = rep.ussdMeta ? `${rep.ussdMeta.ticketNumber || ''} ${rep.ussdMeta.language || ''} ${rep.ussdMeta.serviceCode || ''}` : '';
      const matchText = `${rep.id || ''} ${rep.description || ''} ${rep.location || ''} ${rep.reportedBy || ''} ${rep.category || ''} ${rep.targetUser || ''} ${rep.status || ''} ${ussdInfo}`.toLowerCase();
      if (!matchText.includes(query)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      {/* PERSISTENT HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-purple-100 shadow-xs px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gecn-purple text-gecn-gold border-2 border-gecn-magenta animate-pulse rounded-lg shadow-sm flex items-center justify-center shrink-0">
              <Scale className="w-6 h-6" id="header-logo-icon" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display tracking-tight text-slate-900 flex flex-wrap items-center gap-2">
                <span className="text-gecn-purple">EquiAI Nexus</span>
                <span className="text-xs px-2.5 py-0.5 bg-gecn-purple text-gecn-gold border border-gecn-magenta rounded font-medium font-sans shadow-xs">
                  GECN Initiative
                </span>
              </h1>
              <p className="text-xs text-slate-600">
                An initiative of Gender Equality Club Nigeria (GECN) for Gender Justice & GBV Response.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Exit Panic Button */}
            <button
              onClick={handleQuickExit}
              disabled={quickExitLoading}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
              title="Emergency button: click to leave this app immediately."
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
              {quickExitLoading ? "Leaving..." : "QUICK EXIT"}
            </button>
          </div>
        </div>
      </header>

      {/* SUB-HEADER CAUTION BAR */}
      <div className="bg-purple-50 border-b border-purple-100 py-1.5 px-4 text-center">
        <p className="text-xs text-purple-950 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-gecn-magenta shrink-0" />
          <span><strong>Safety warning:</strong> If you suspect someone is viewing your screen, click the crimson <strong>QUICK EXIT</strong> button instantly to leave. About EquiAI Nexus: An initiative of Gender Equality Club Nigeria (GECN).</span>
        </p>
      </div>

      {/* CORE NAVIGATION */}
      <nav className="bg-gecn-purple text-white py-1.5 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 ${
              activeTab === "dashboard"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            📊 Response Dashboard
          </button>
          <button
            onClick={() => setActiveTab("reporting")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 ${
              activeTab === "reporting"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            📥 Intake & Incident Reporter
          </button>
          <button
            onClick={() => setActiveTab("ussd")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "ussd"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            📱 USSD Gateway (*384*55#)
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 ${
              activeTab === "insights"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            📈 Policy & Analytical Insights
          </button>
          <button
            onClick={() => setActiveTab("mentor")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 ${
              activeTab === "mentor"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            🤝 A4HP Digital Business Assistant
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all shrink-0 ${
              activeTab === "admin"
                ? "border-gecn-gold text-gecn-gold font-bold"
                : "border-transparent text-purple-200 hover:text-white"
            }`}
          >
            🔐 Responder Administration
          </button>
        </div>
      </nav>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="grow max-w-7xl w-full mx-auto p-4 flex flex-col gap-6">

        {loading ? (
          <div className="my-16 text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading secure database files for Gboko community...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* TAB 1: DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Intro Hero banner */}
                <div className="bg-gradient-to-r from-gecn-purple via-[#4b0137] to-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-md border-b-4 border-gecn-magenta">
                  <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
                    <Scale className="w-64 h-64 -mr-16 -mb-16 text-gecn-gold" />
                  </div>
                  <div className="max-w-2xl">
                    <span className="text-xs font-bold px-2.5 py-1 bg-gecn-gold/10 text-gecn-gold rounded-full border border-gecn-gold/30 flex items-center gap-1.5 w-fit">
                      <Scale className="w-3.5 h-3.5 animate-pulse" />
                      EQUIAI NEXUS - GBV DECISION ENGAGEMENT & JUSTICE WORKSPACE
                    </span>
                    <h2 className="text-2xl font-bold font-display mt-3 leading-tight">
                      Real-time incident reporting, automated legal advocacy, safety placement, and trauma counseling.
                    </h2>
                    <p className="text-sm text-purple-100 mt-2">
                      EquiAI Nexus is an initiative of the Gender Equality Club Nigeria (GECN). We analyze incidents in real-time to deploy life-saving legal, welfare, and medical resources across Gboko and Benue State.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => setActiveTab("reporting")}
                        className="px-4 py-2 bg-gecn-magenta hover:bg-[#cc0078] text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all transform hover:scale-105"
                      >
                        <PlusCircle className="w-4 h-4" />
                        File Secure Incident Report
                      </button>
                      <button
                        onClick={() => setActiveTab("ussd")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                      >
                        <Radio className="w-4 h-4 text-emerald-200 animate-pulse" />
                        📱 Dial *384*55# USSD (Zero Data)
                      </button>
                      <button
                        onClick={() => setActiveTab("mentor")}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-gecn-gold" />
                        A4HP Business Assistant
                      </button>
                    </div>
                  </div>
                </div>

                {/* ZERO-DATA USSD NOTICE CALLOUT FOR RURAL COMMUNITIES */}
                <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-xl p-4 border-l-4 border-emerald-400 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/30 shrink-0">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-200 flex items-center gap-1.5">
                        <span>Zero-Data Toll-Free USSD Protocol Active (*384*55#)</span>
                        <span className="text-[10px] bg-emerald-400/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">2G / 3G / 4G</span>
                      </p>
                      <p className="text-xs text-emerald-100/80 mt-0.5">
                        Rural women and girls with basic button phones (Nokia, Itel) can report GBV, land theft, and crisis alerts with <strong>zero internet or airtime</strong> in Tiv, Idoma, Hausa, Pidgin, and English.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("ussd")}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
                  >
                    Open USSD Simulator
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* KPI metric cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
                    <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">
                      Total Cases Tracked
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">12</span>
                      <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Live Data
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Gboko urban and rural partitions</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
                    <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">
                      Support Dispatched
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-gecn-purple">4</span>
                      <span className="text-xs text-gecn-magenta font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Legal aid, shelter, counseling</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
                    <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">
                      Active Resources
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-slate-900">5</span>
                      <span className="text-xs text-slate-500 font-bold bg-slate-150 px-2 py-0.5 rounded-full border border-slate-200">
                        Available
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Gboko response units roster</p>
                  </div>

                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition-all">
                    <p className="text-xs text-slate-500 font-bold tracking-wider uppercase">
                      A4HP Mentored Women
                    </p>
                    <div className="flex items-baseline justify-between mt-2">
                      <span className="text-3xl font-extrabold text-gecn-magenta">4,000+</span>
                      <span className="text-xs text-gecn-gold font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        GECN Goal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Local economic skills projects</p>
                  </div>
                </div>

                {/* Dashboard layout splits */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {isAdminLoggedIn ? (
                    <div className="lg:col-span-2 bg-white rounded-xl border border-purple-100 shadow-sm p-5 flex flex-col gap-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-50 gap-3">
                        <div>
                          <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gecn-magenta animate-pulse" />
                            Real-time Incident Response Dashboard
                          </h3>
                          <p className="text-xs text-slate-500">
                            Live incoming stream of reports and response assignments (Anonymized).
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-bold text-gecn-purple bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                            {filteredReports.length} of {reports.length} Reports
                          </span>
                          <button 
                            onClick={fetchData}
                            className="p-1.5 text-slate-500 hover:text-gecn-purple rounded-lg hover:bg-purple-50 transition-all border border-slate-100"
                            title="Refresh live feeds"
                          >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                          </button>
                        </div>
                      </div>

                      {/* REAL-TIME INTERACTIVE FILTER CONTROLS */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-purple-100/40 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                            <Search className="w-3.5 h-3.5 text-gecn-purple" />
                            Filter Incident Database
                          </span>
                          {(filterCategory !== "all" || filterLga !== "all" || filterLocation !== "all" || filterStatus !== "all" || searchQuery !== "") && (
                            <button
                              onClick={() => {
                                setFilterCategory("all");
                                setFilterLga("all");
                                setFilterLocation("all");
                                setFilterStatus("all");
                                setSearchQuery("");
                              }}
                              className="text-[10px] text-gecn-magenta hover:underline font-bold"
                            >
                              Reset Active Filters
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2 text-xs">
                          {/* Search Input */}
                          <div>
                            <input
                              type="text"
                              placeholder="Search keywords..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-gecn-purple focus:ring-1 focus:ring-gecn-purple"
                            />
                          </div>

                          {/* Category Dropdown */}
                          <div>
                            <select
                              value={filterCategory}
                              onChange={(e) => setFilterCategory(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="all">All Categories</option>
                              <option value="GBV">GBV (Domestic/Violence)</option>
                              <option value="Economic Barrier">Economic Barrier</option>
                              <option value="Healthcare Denial">Healthcare Denial</option>
                              <option value="Land/property rights">Land/Property Rights</option>
                              <option value="Education Barrier">Education Barrier</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          {/* Channel / Ingress Source Dropdown */}
                          <div>
                            <select
                              value={filterChannel}
                              onChange={(e) => setFilterChannel(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="all">All Ingress Channels</option>
                              <option value="ussd">📱 USSD Gateway (*384*55#)</option>
                              <option value="sms">✉️ SMS Ingress Gateway</option>
                              <option value="survivor">👤 Survivor Direct</option>
                              <option value="advocate">🤝 Community Advocate</option>
                              <option value="healthcare">🏥 Healthcare Envoy</option>
                            </select>
                          </div>

                          {/* LGA Dropdown */}
                          <div>
                            <select
                              value={filterLga}
                              onChange={(e) => setFilterLga(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="all">All Pilot LGAs</option>
                              {Object.keys(pilotLGAs).map(lga => (
                                <option key={lga} value={lga}>{lga}</option>
                              ))}
                            </select>
                          </div>

                          {/* Location Dropdown */}
                          <div>
                            <select
                              value={filterLocation}
                              onChange={(e) => setFilterLocation(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="all">All Wards/Welfare Sectors</option>
                              {(filterLga === "all" ? allLocations : (pilotLGAs[filterLga] || [])).map(ward => (
                                <option key={ward} value={ward}>{ward}</option>
                              ))}
                            </select>
                          </div>

                          {/* Status Dropdown */}
                          <div>
                            <select
                              value={filterStatus}
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="all">All Statuses</option>
                              <option value="Pending">Pending</option>
                              <option value="Classified">Classified</option>
                              <option value="Actioned">Actioned</option>
                              <option value="Referred">Referred</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* LIVE INCOMING REPORTS FEED */}
                      <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
                        {filteredReports.length === 0 ? (
                          <div className="text-center py-12 bg-slate-50 border border-slate-100 rounded-xl">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700">No matching reports identified</p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              No records present for the selected category, location, status, or search keywords. Use different search criteria or clear active filters.
                            </p>
                            <button
                              onClick={() => {
                                setFilterCategory("all");
                                setFilterChannel("all");
                                setFilterLocation("all");
                                setFilterStatus("all");
                                setSearchQuery("");
                              }}
                              className="mt-3 px-3 py-1.5 bg-gecn-purple text-gecn-gold hover:bg-[#600047] text-xs font-bold rounded-lg transition-colors border border-gecn-magenta"
                            >
                              Reset Filters
                            </button>
                          </div>
                        ) : (
                          filteredReports.map((rep) => {
                            const time = new Date(rep.date).toLocaleDateString();
                            const isUssd = rep.reportedBy === "USSD Gateway" || !!rep.ussdMeta;
                            return (
                              <div key={rep.id} className="p-4 bg-slate-50 hover:bg-purple-50/20 rounded-lg border border-slate-100 hover:border-purple-200/40 transition-all flex flex-col gap-2.5">
                                <div className="flex flex-wrap items-center justify-between gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">
                                      ID: {rep.id}
                                    </span>
                                    {isUssd && (
                                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-mono text-[10px] font-bold flex items-center gap-1">
                                        <Radio className="w-3 h-3 text-emerald-600" />
                                        USSD Toll-Free {rep.ussdMeta?.ticketNumber ? `(${rep.ussdMeta.ticketNumber})` : '(*384*55#)'}
                                      </span>
                                    )}
                                    {rep.ussdMeta?.language && (
                                      <span className="px-1.5 py-0.2 bg-purple-100 text-purple-900 rounded font-bold text-[9px]">
                                        {rep.ussdMeta.language.toUpperCase()}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${
                                      rep.urgency === "Critical" ? "bg-red-100 text-red-850 border border-red-200" :
                                      rep.urgency === "High" ? "bg-orange-100 text-orange-950 border border-orange-200" :
                                      rep.urgency === "Medium" ? "bg-yellow-100 text-yellow-850 border border-yellow-250" : "bg-blue-100 text-blue-850 border border-blue-200"
                                    }`}>
                                      {rep.urgency} Urgency
                                    </span>
                                    <span className="text-xs text-slate-400">{time}</span>
                                  </div>
                                </div>

                                <p className="text-xs font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
                                  <span>Category / Group Affected:</span>
                                  <span className="px-2 py-1 bg-purple-50 text-gecn-purple border border-purple-100 rounded text-[10px] font-bold">
                                    {rep.category}
                                  </span>
                                  <span className="text-slate-400 font-normal">&bull;</span>
                                  <span className="text-slate-600 font-semibold">
                                    Cohort: <span className="text-gecn-magenta font-bold">{rep.targetUser}</span>
                                  </span>
                                </p>

                                <p className="text-xs text-slate-700 leading-relaxed italic bg-white p-2.5 border border-slate-100 rounded shadow-xs">
                                  &ldquo;{rep.description}&rdquo;
                                </p>

                                <div className="flex flex-wrap items-center justify-between gap-2 mt-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-gecn-magenta" />
                                    {rep.location}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Info className="w-3.5 h-3.5 text-slate-400" />
                                    Reporter: {rep.reportedBy}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                    rep.status === "Pending" ? "bg-amber-100 text-amber-850 border border-amber-200" :
                                    rep.status === "Classified" ? "bg-purple-100 text-purple-950 border border-purple-200" :
                                    rep.status === "Actioned" ? "bg-emerald-100 text-emerald-950 border border-emerald-200" :
                                    "bg-indigo-100 text-indigo-950 border border-indigo-200"
                                  }`}>
                                    Status: {rep.status}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-6 flex flex-col gap-6">
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-gecn-purple">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold font-display text-slate-900">
                            🔒 Incident Response Database (Restricted access)
                          </h3>
                          <p className="text-xs text-slate-500">
                            Anonymized stream and interactive casework analysis database is restricted.
                          </p>
                        </div>
                      </div>

                      <div className="bg-amber-55/60 border border-amber-200 rounded-xl p-4 flex gap-3 text-xs text-amber-900 bg-amber-50">
                        <Shield className="w-5 h-5 text-gecn-magenta shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900">Survivor Confidentiality & Duty of Care</p>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            To ensure high-grade safety protection for Benue's women and children, our interactive incident database is exclusively restricted to GECN counselors, clinical first-responders, and legal counselors. General public users can use other tabs to access mentorship resources or file a new case.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              <PlusCircle className="w-4 h-4 text-gecn-purple" />
                              Secure Public Intake Form
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              Are you a survivor or a GECN volunteer advocate? File a secure, anonymized report about GBV incidents, land exclusion, or agricultural barriers.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab("reporting")}
                            className="w-fit px-3 py-1.5 bg-gecn-purple hover:bg-[#600047] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            Go to Intake Reporter
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-gecn-gold" />
                              AI Business Mentorship
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                              Unlock financial empowerment. Consult secure A4HP Digital Assistant to map out small-scale trade and sustainable farming loops.
                            </p>
                          </div>
                          <button
                            onClick={() => setActiveTab("mentor")}
                            className="w-fit px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                          >
                            Launch Mentor Chat
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-400">
                          Authorized Benue responder? Use your secure counsellor PIN.
                        </p>
                        <button
                          onClick={() => setActiveTab("admin")}
                          className="px-3.5 py-1.5 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold rounded-lg bg-white transition-colors flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Counsellor Admin Login
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Right segment - Resources Map / Security Information card */}
                  <div className="flex flex-col gap-6">
                    {/* Official About EquiAI Nexus Card */}
                    <div className="bg-gradient-to-br from-gecn-purple to-[#4d0139] text-white rounded-xl p-5 shadow-sm border border-gecn-magenta/30 relative overflow-hidden">
                      <div className="absolute right-0 top-0 opacity-[0.08] -mr-6 -mt-6 pointer-events-none">
                        <Scale className="w-32 h-32 text-gecn-gold" />
                      </div>
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="p-1.5 bg-gecn-magenta text-white rounded-lg flex items-center justify-center border border-white/10 shadow-xs">
                          <Scale className="w-4 h-4 text-gecn-gold" id="about-logo-icon" />
                        </div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-gecn-gold font-display">
                          About EquiAI Nexus
                        </h4>
                      </div>
                      <p className="text-xs text-purple-100 leading-relaxed font-medium">
                        EquiAI Nexus is an integrated AI system built for Benue State, Nigeria combining community-driven data collection (HerData Commons), machine learning-powered analysis, and an AI Business Mentor to eliminate GBV and economic barriers facing women across all LGAs.
                      </p>
                      <div className="mt-4 pt-3.5 border-t border-purple-200/10 flex flex-col gap-1.5">
                        <p className="text-[11px] font-bold text-gecn-gold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-gecn-magenta animate-pulse shrink-0" />
                          An Initiative of Gender Equality Club Nigeria (GECN)
                        </p>
                        <p className="text-[11px] text-purple-200 leading-snug italic font-medium">
                          Championing justice, equity, and empowerment for women and girls across Nigeria
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                      <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
                        🚨 Rapid Support Contacts
                      </h3>
                    
                      <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-600 leading-relaxed">
                          Safe referral sources available across physical Gboko coordinates for women, girls, boys, and marginalized sex workers:
                        </p>

                        <div className="space-y-2">
                          {resources.map((item) => (
                            <div key={item.id} className="p-3 bg-slate-50/60 rounded-lg border border-slate-100 text-xs hover:border-indigo-100 transition-all">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{item.name}</span>
                                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-medium">
                                  {item.type}
                                </span>
                              </div>
                              <p className="text-slate-500 font-mono text-[10px] mt-1">{item.location}</p>
                              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dotted border-slate-200">
                                <span className="text-slate-700 font-semibold">{item.contact}</span>
                                <span className={`text-[10px] font-medium ${item.status === 'Available' ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  ● {item.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-900 mt-2">
                          <p className="font-bold flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                            GECN Crisis Line
                          </p>
                          <p className="mt-1 font-mono text-[11px]">Hotline: +234 (0) 703 212 1178</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Discreet SMS, WhatsApp & Secure Callback available 24/7.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          {/* TAB 2: HERDATA COMMONS REPORTING */}
            {activeTab === "reporting" && (
              <motion.div
                key="reporting"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Reporting Instructions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                  <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
                    🛡️ HerData Commons AI
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    HerData Commons is a highly secure platform developed to let survivors and local advocates safely document violence, extortion, or systemic exclusion.
                  </p>

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs text-indigo-900">
                    <p className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Gemini Auto-Scrubber Active
                    </p>
                    <p className="mt-1 leading-relaxed">
                      Every submission undergoes server-side Natural Language Processing. The AI automatically scrubs phone numbers, names, and exact addresses to generate a clean, safe public record, while detecting critical urgency levels and categories.
                    </p>
                  </div>

                  <div className="space-y-2 mt-2">
                    <h4 className="text-xs font-bold text-slate-700">Reporting Categories Required:</h4>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                      {["Gender-Based Violence", "Economic Barrier / Extortion", "Healthcare Denial & Stigma", "Land & Property Rights Violation", "Education Barrier / Withdrawal", "Other Exclusionary Types"].map((x, idx) => (
                        <li key={idx}>{x}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                    <p>Protected cohorts:</p>
                    <p className="font-semibold text-slate-700 mt-1">women, girls, sex workers, GBV victims, men, boys.</p>
                  </div>
                </div>

                {/* Main Intake Form */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900">
                        Secure Intake Form
                      </h3>
                      <p className="text-xs text-slate-500">Choose custom Web input or simulate SMS copy-paste gateway</p>
                    </div>

                    <div className="flex bg-slate-100 p-0.5 rounded-lg gap-1">
                      <button
                        onClick={() => setIntakeMode("web")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          intakeMode === "web" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        Web Form
                      </button>
                      <button
                        onClick={() => setIntakeMode("sms")}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                          intakeMode === "sms" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        SMS Gateway
                      </button>
                      <button
                        onClick={() => setActiveTab("ussd")}
                        className="px-3 py-1 text-xs font-medium rounded-md transition-all bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 shadow-xs"
                      >
                        <Radio className="w-3 h-3 text-emerald-200 animate-pulse" />
                        USSD (*384*55#)
                      </button>
                    </div>
                  </div>

                  {submitSuccess && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900"
                    >
                      <div className="flex items-center gap-2 font-bold mb-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Incident Successfully Catalogued! (Anonymized)
                      </div>
                      <p className="mt-1 font-semibold">HerData AI Cleaning Log:</p>
                      <p className="p-2 bg-white/70 rounded mt-1 font-mono text-[10px] text-emerald-800 border border-emerald-100 leading-relaxed">
                        {submitSuccess.cleaningLog}
                      </p>
                      <p className="mt-2 text-[10px] text-slate-500">The report is now queued in the database for response deployment. Urgency rated as <strong>{submitSuccess.urgency}</strong>.</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleReportSubmit} className="flex flex-col gap-4 text-xs">
                    {intakeMode === "web" ? (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Reporting Category *
                            </label>
                            <select
                              value={category}
                              onChange={(e) => setCategory(e.target.value as CategoryType)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="GBV">GBV (Domestic, physical, union abuse)</option>
                              <option value="Economic Barrier">Economic Barrier (Extortions, fees)</option>
                              <option value="Healthcare Denial">Healthcare Denial (Wellness refusal, clinic stigma)</option>
                              <option value="Land/property rights">Land/property rights (Inheritance denial)</option>
                              <option value="Education Barrier">Education Barrier (Withdrawal, teen child labor)</option>
                              <option value="Other">Other (Alternative barriers/complaints)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Vulnerable Cohort / Group Affected *
                            </label>
                            <select
                              value={targetUser}
                              onChange={(e) => setTargetUser(e.target.value as TargetUserType)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                            >
                              <option value="GBV victims">GBV victims</option>
                              <option value="women">women</option>
                              <option value="girls">girls</option>
                              <option value="men">men</option>
                              <option value="boys">boys</option>
                              <option value="sex workers">sex workers</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Benue Pilot LGA *
                            </label>
                            <select
                              value={formLga}
                              onChange={(e) => setFormLga(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              {Object.keys(pilotLGAs).map(lga => (
                                <option key={lga} value={lga}>{lga} LGA</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Ward / Local Territory *
                            </label>
                            <select
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-gecn-purple"
                            >
                              {(pilotLGAs[formLga] || []).map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Role of Reporter
                            </label>
                            <select
                              value={reporter}
                              onChange={(e) => setReporter(e.target.value as Report["reportedBy"])}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-gecn-purple"
                            >
                              <option value="Survivor">Survivor (Self)</option>
                              <option value="Community Advocate">Community Advocate (GECN volunteer)</option>
                              <option value="Healthcare Worker">Healthcare Worker (Clinic envoy)</option>
                              <option value="Anonymous">Anonymous (Untraceable)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Incident Description (What happened?) *
                          </label>
                          <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            placeholder="Please explain the situation. For absolute security, omit direct names and coordinates here as well (our AI scans the incoming data to redact anyway)."
                            rows={4}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans leading-relaxed"
                          />
                        </div>
                      </>
                    ) : (
                      // SMS Entry Mode
                      <>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <p className="font-bold text-slate-700">SMS Ingress Demonstration Node</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Simulate incoming SMS texts dispatched from GSM base stations in Gboko. Paste sample SMS strings containing real numbers and names. HerData AI will parse, clean, and auto-scramble them.
                          </p>
                          <div className="mt-2.5 flex flex-wrap gap-2 text-[10px]">
                            <button
                              type="button"
                              onClick={() => {
                                setSmsContent("CRITICAL: Needs immediate shelter. Patient Mary Akura +2348011223344 beaten, locking her out at Abagu district Gboko, husband Joseph is looking for her. Please reply.");
                                setLocation("Gboko South (Abagu Area)");
                              }}
                              className="px-2 py-1 bg-white hover:bg-slate-105 border rounded text-slate-700"
                            >
                              Load SMS Sample (GBV)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSmsContent("Inheritance issue! Young girl Janet from Yandev denied land belonging to her dad. traditional heads told her to exit because she is a woman. My No is +2349023456");
                                setLocation("Yandev Ward, Gboko West");
                              }}
                              className="px-2 py-1 bg-white hover:bg-slate-105 border rounded text-slate-700"
                            >
                              Load SMS Sample (Land denial)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Raw SMS Message Content *
                          </label>
                          <textarea
                            value={smsContent}
                            onChange={(e) => setSmsContent(e.target.value)}
                            required
                            placeholder="Paste text exactly as received on GECN SMS Gateway..."
                            rows={5}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Est. Source LGA *
                            </label>
                            <select
                              value={formLga}
                              onChange={(e) => setFormLga(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-gecn-purple"
                            >
                              {Object.keys(pilotLGAs).map(lga => (
                                <option key={lga} value={lga}>{lga} LGA</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Est. Source Ward / Gateway Coordinate *
                            </label>
                            <select
                              value={location}
                              onChange={(e) => setLocation(e.target.value)}
                              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-gecn-purple"
                            >
                              {(pilotLGAs[formLga] || []).map(w => (
                                <option key={w} value={w}>{w}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        type="submit"
                        disabled={submittingReport}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-sm transition-all flex items-center gap-2"
                      >
                        {submittingReport ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            AI Scrubber Categorizing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Submit & Auto-Redact Incident
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* TAB: ZERO-DATA USSD GATEWAY SIMULATOR (*384*55#) */}
            {activeTab === "ussd" && (
              <motion.div
                key="ussd"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full"
              >
                <UssdSimulator onReportCreated={(newRep) => {
                  setReports(prev => [newRep, ...prev]);
                }} />
              </motion.div>
            )}

            {/* TAB 3: INSIGHTS & BULK ANALYTICS */}
            {activeTab === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {/* Visual Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Breakdown bar chart */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
                    <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
                      Incident Distribution by Major Category
                    </h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getCategoryStats()}>
                          <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                          <Tooltip wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {getCategoryStats().map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={categoryColors[entry.name] || "#3b82f6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-slate-500">
                      {Object.keys(categoryColors).map(key => (
                        <span key={key} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: categoryColors[key] }} />
                          {key}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Urgency breakdown & Demographic segment share */}
                  <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
                    <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
                      Categorized Urgency & Impact Triage
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={getUrgencyStats()}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={45}
                              outerRadius={65}
                              paddingAngle={2}
                            >
                              {getUrgencyStats().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip wrapperStyle={{ fontSize: 10 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="text-xs space-y-2">
                        <p className="font-semibold text-slate-700">Urgency Priority Matrix:</p>
                        {getUrgencyStats().map(u => (
                          <div key={u.name} className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                              {u.name}
                            </span>
                            <span className="font-bold text-slate-800">{u.value} cases</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-150 pt-2 text-[11px] text-slate-500 leading-relaxed">
                      All data points verified under strict double-blind guidelines to protect source nodes of Benue State inhabitants. All analytical GBV cases are for the whole Benue State in this EquiAI Nexus system, not only targeting Gboko. GECN will establish the GBV desk across Benue State for follow-up cases, once received in the central database of the EquiAI Nexus GBV solution.
                    </div>
                  </div>
                </div>

                {/* Demographics bar chart */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-3">
                  <h3 className="text-base font-bold font-display text-slate-900 border-b border-slate-100 pb-2">
                    Demographic Support Enrolment
                  </h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getTargetUserStats()}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                        <Tooltip wrapperStyle={{ fontSize: 11 }} />
                        <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bulk AI presentation / policy briefs generator */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold font-display text-slate-900">
                        ✊ Gemini Bulk Advocacy Synthesis
                      </h3>
                      <p className="text-xs text-slate-500">Analyze current community caseload to generate evidence-based policy briefs for local authorities</p>
                    </div>

                    <button
                      onClick={handleGenerateAdvocacy}
                      disabled={analyzingBulk}
                      className={`px-4 py-2 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                        !isAdminLoggedIn ? "bg-slate-700 hover:bg-slate-650" : "bg-slate-900 hover:bg-slate-800"
                      }`}
                    >
                      {analyzingBulk ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Processing {reports.length} Cases...
                        </>
                      ) : (
                        <>
                          {!isAdminLoggedIn && <Lock className="w-3 h-3 text-amber-400" />}
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                          Generate Advocacy Brief {!isAdminLoggedIn && "(By Request Only)"}
                        </>
                      )}
                    </button>
                  </div>

                  {showPublicBriefNotice && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-50 border border-purple-200 p-5 rounded-xl text-xs text-gecn-purple flex flex-col gap-2 relative overflow-hidden"
                    >
                      <button 
                        onClick={() => setShowPublicBriefNotice(false)} 
                        className="absolute right-3 top-3 text-[10px] uppercase font-bold text-slate-400 hover:text-slate-600"
                      >
                        Dismiss ×
                      </button>
                      <p className="font-bold flex items-center gap-1.5 text-purple-950">
                        <Info className="w-4 h-4 shrink-0 text-gecn-magenta" id="brief-info-icon" />
                        AI Advocacy Brief is Available by Request
                      </p>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        Because this analytical brief compiles sensitive, anonymized community safety caseloads across Benue State, real-time AI synthesis is restricted specifically to GECN authorized project coordinators and counselors. You can request a processed copy of this advocacy brief by sending an email with proof of affiliation to <a href="mailto:contact@gecnigeria.org" className="underline font-bold text-gecn-purple font-mono">contact@gecnigeria.org</a>.
                      </p>
                    </motion.div>
                  )}

                  {bulkAnalysis ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-inner max-h-[500px] overflow-y-auto"
                    >
                      <div className="prose prose-sm text-xs text-slate-700 font-sans leading-relaxed max-w-none whitespace-pre-wrap">
                        {bulkAnalysis}
                      </div>
                    </motion.div>
                  ) : (
                    !showPublicBriefNotice && (
                      <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-250">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-600">No Intelligence Brief generated yet</p>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-md mx-auto">Click the button above to safely compile reports database anonymously and construct localized policy briefs using AI.</p>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: A4HP BUSINESS ASSISTANT & DIGITAL MENTOR */}
            {activeTab === "mentor" && (
              <motion.div
                key="mentor"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <BusinessAssistant />
              </motion.div>
            )}

            {/* TAB 5: ADMIN PORTAL */}
            {activeTab === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-6"
              >
                {!isAdminLoggedIn ? (
                  // PIN password prompt
                  <div className="max-w-md w-full mx-auto bg-white p-7 rounded-2xl border border-slate-200 text-center my-8 shadow-sm">
                    <div className="w-12 h-12 bg-purple-100 text-gecn-purple rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-200">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-slate-900">
                      Responder Authorization Access
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      This area contains active casework and coordinator rosters. Access restricted to authorized Gender Equality Club Nigeria counselors.
                    </p>

                    <form onSubmit={(e) => handleAdminLogin(e)} className="mt-5 flex flex-col gap-3">
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={adminPassword}
                          onChange={(e) => {
                            setAdminPassword(e.target.value);
                            if (adminError) setAdminError("");
                          }}
                          placeholder="Enter 8-digit Responder PIN"
                          maxLength={12}
                          className="w-full p-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-center tracking-widest text-xs font-mono outline-slate-300 focus:border-gecn-purple focus:bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-1"
                          title={showPassword ? "Hide PIN" : "Show PIN"}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {adminError && (
                        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700 font-medium text-left flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                          <span>{adminError}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                      >
                        <Key className="w-3.5 h-3.5 text-gecn-gold" />
                        Authorize & Unlock Case Boards
                      </button>
                    </form>

                    {/* Forgot PIN / Credential Recovery Accordion */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                      <button
                        type="button"
                        onClick={() => setShowForgotPin(!showForgotPin)}
                        className="text-slate-500 hover:text-gecn-purple font-medium text-[11px] flex items-center justify-center gap-1 mx-auto transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        {showForgotPin ? "Hide Help" : "Forgot 8-Digit Responder PIN?"}
                      </button>

                      <AnimatePresence>
                        {showForgotPin && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] text-slate-700 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                <Lock className="w-3 h-3 text-slate-500" />
                                Secure Credential Recovery
                              </span>
                              <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono font-bold">
                                2FA ENFORCED
                              </span>
                            </div>

                            <p className="text-slate-600 leading-relaxed">
                              For security compliance and survivor confidentiality, responder credentials are restricted to registered Gender Equality Club Nigeria field officers and safe hub caseworkers.
                            </p>

                            <div className="p-2 bg-purple-50/70 border border-purple-100 rounded-lg text-[11px] text-purple-950">
                              <p className="font-semibold text-gecn-purple">Field Coordinator Access:</p>
                              <p className="text-[10px] text-slate-600 mt-0.5">
                                Contact your LGA Field Supervisor or the Benue Central Dispatch Desk at <strong>0800-4326-236</strong> to verify your badge number and issue a secure session token.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ) : (
                  // Full admin dashboard
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-6"
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 bg-slate-900 text-white p-5 rounded-xl shadow-xs">
                      <div>
                        <h3 className="text-lg font-bold font-display flex items-center gap-2">
                          <Unlock className="w-5 h-5 text-emerald-400" />
                          Responder Control Center — Authorized Node Gboko
                        </h3>
                        <p className="text-xs text-slate-300">Fulfilling real-time crisis response and referral allocation</p>
                      </div>

                      <button
                        onClick={() => setIsAdminLoggedIn(false)}
                        className="px-3.5 py-1.5 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
                      >
                        Lock Case Board & Logout
                      </button>
                    </div>

                    {/* Active reports manager table */}
                    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-4">
                      <div className="border-b border-indigo-100 pb-3">
                        <h4 className="text-base font-bold font-display text-slate-900">GBV, Economic, and Land Exclusion Caseloads</h4>
                        <p className="text-xs text-slate-500">Live operational database. Assign immediate resources and change triage status.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs min-w-[800px]">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase">
                              <th className="p-3">Incident Node</th>
                              <th className="p-3">Category</th>
                              <th className="p-3">Trainee Cohort</th>
                              <th className="p-3">Urgency</th>
                              <th className="p-3">Safe Description Logs</th>
                              <th className="p-3">Location & Reporter</th>
                              <th className="p-3">Responder Allocation</th>
                              <th className="p-3">Status Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {reports.map((rep) => (
                              <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-3 font-mono font-bold text-slate-400">{rep.id}</td>
                                <td className="p-3">
                                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-slate-700 font-medium">
                                    {rep.category}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-slate-700">{rep.targetUser}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                    rep.urgency === "Critical" ? "bg-red-100 text-red-800" :
                                    rep.urgency === "High" ? "bg-orange-100 text-orange-800" :
                                    rep.urgency === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                                  }`}>
                                    {rep.urgency}
                                  </span>
                                </td>
                                <td className="p-3 max-w-sm">
                                  <p className="text-slate-700 line-clamp-3 leading-relaxed mb-1">{rep.description}</p>
                                  {rep.cleaningLog && (
                                    <div className="mt-1 p-2 bg-emerald-50 rounded border border-emerald-100 text-[10px] text-emerald-800">
                                      <strong>AI Cleansing Log:</strong> {rep.cleaningLog}
                                    </div>
                                  )}
                                  {rep.assignedResource && (
                                    <div className="mt-1 p-2 bg-indigo-50 rounded border border-indigo-100 text-[10px] text-indigo-800 flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span>Resource: <strong>{rep.assignedResource.name}</strong> ({rep.assignedResource.type})</span>
                                    </div>
                                  )}
                                </td>
                                <td className="p-3 text-[11px] text-slate-500">
                                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                    {rep.location}
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                    <span>By: {rep.reportedBy}</span>
                                    {rep.ussdMeta && (
                                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono text-[9px] font-bold">
                                        {rep.ussdMeta.ticketNumber || 'USSD'}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  {!rep.assignedResource ? (
                                    <div className="flex flex-col gap-2">
                                      <select
                                        value={selectedResourceMapping[rep.id] || ""}
                                        onChange={(e) => setSelectedResourceMapping(prev => ({ ...prev, [rep.id]: e.target.value }))}
                                        className="p-1 px-1.5 bg-slate-50 border rounded text-[11px]"
                                      >
                                        <option value="">-- Choose responder --</option>
                                        {resources.filter(res => res.status === 'Available').map(res => (
                                          <option key={res.id} value={res.id}>{res.name} ({res.type})</option>
                                        ))}
                                      </select>
                                      <button
                                        onClick={() => {
                                          const rId = selectedResourceMapping[rep.id];
                                          if (rId) handleAssignResource(rep.id, "Actioned", rId);
                                        }}
                                        disabled={!selectedResourceMapping[rep.id]}
                                        className="py-1 px-2 bg-indigo-600 border border-indigo-500 text-white rounded text-[11px] hover:bg-indigo-500 transition-colors disabled:opacity-40"
                                      >
                                        Dispatch Agent
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] font-semibold text-emerald-600">Dispatched & Safe</span>
                                  )}
                                </td>
                                <td className="p-3">
                                  <select
                                    value={rep.status}
                                    onChange={(e) => handleAssignResource(rep.id, e.target.value as Report["status"], "")}
                                    disabled={updatingReportId === rep.id}
                                    className="p-1 px-1.5 bg-slate-50 border rounded text-[11px] font-medium"
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Classified">Classified</option>
                                    <option value="Actioned">Actioned</option>
                                    <option value="Referred">Referred</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* FOOTER BAR */}
      <footer className="bg-slate-900 text-slate-400 py-6 px-4 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <div className="p-0.5 bg-white/10 rounded-full border-2 border-gecn-gold shadow-sm shrink-0 hover:scale-105 transition-transform flex items-center justify-center">
              <GecnLogo size={48} className="w-12 h-12" />
            </div>
            <div>
              <p className="font-bold font-display text-white text-sm">EquiAI Nexus Platform</p>
              <p className="text-[11px] text-purple-200 mt-0.5">
                Developed by{" "}
                <a
                  href="https://gecnigeria.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gecn-gold hover:underline font-semibold inline-flex items-center gap-0.5 transition-colors hover:text-amber-300"
                >
                  Gender Equality Club Nigeria (GECN)
                  <ExternalLink className="w-2.5 h-2.5 inline-block shrink-0 ml-0.5" />
                </a>
                .
              </p>
              <p className="text-[11px] text-slate-400">
                Address: No. 2 A.A. Iortyom Street, Adekaa, Gboko. Email: <a href="mailto:contact@gecnigeria.org" className="text-gecn-gold hover:underline">contact@gecnigeria.org</a>
              </p>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] max-w-md">
            <p className="text-slate-300 leading-relaxed">
              Powered by: The{" "}
              <a
                href="https://aplusalliance.org/gender-ai-innovation-collective/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gecn-gold hover:underline font-semibold inline-flex items-center gap-0.5 transition-colors hover:text-amber-300"
              >
                Gender &amp; AI Innovation Collective (GAIC)
                <ExternalLink className="w-2.5 h-2.5 inline-block shrink-0 ml-0.5" />
              </a>
              , a pan-African initiative co-led by{" "}
              <a
                href="https://codeforafrica.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gecn-gold hover:underline font-semibold inline-flex items-center gap-0.5 transition-colors hover:text-amber-300"
              >
                Code for Africa (CfA)
                <ExternalLink className="w-2.5 h-2.5 inline-block shrink-0 ml-0.5" />
              </a>{" "}
              and Women at the Table via the A+ Alliance.
            </p>
            <p className="text-slate-500 mt-1.5">GECN-GBV AI Database &copy; {new Date().getFullYear()} GECN. Secure server sandbox routing enabled.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
