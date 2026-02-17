import React, { useState, useRef, useEffect } from "react";
import {
  UserInput,
  ReportType,
  NumerologyData,
  PageContent,
  SavedReport,
} from "./types";
import {
  calculateLifePath,
  calculatePersonalYear,
  calculateNameNumbers,
} from "./utils/numerology";
import { generateReportContent } from "./services/geminiService";
import ReportPage from "./components/ReportPage";
import { useReactToPrint } from "react-to-print";
import PrintableReport from "./components/PrintableReport";

const App: React.FC = () => {
  const [input, setInput] = useState<UserInput>({
    fullName: "",
    dob: "",
    reportType: ReportType.SEVEN_PAGE,
  });
  const [manualJson, setManualJson] = useState("");
  const [activeTab, setActiveTab] = useState<"AI" | "MANUAL">("AI");
  const [loading, setLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<SavedReport | null>(null);
  const [history, setHistory] = useState<SavedReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewingHistory, setViewingHistory] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // const handlePrint = useReactToPrint({
  //   contentRef: printRef,
  //   documentTitle: "Numerology_Report"
  // });

  const handlePrint = async () => {
    await document.fonts.ready;
    window.print();
  };

  useEffect(() => {
    const saved = localStorage.getItem("numera_reports");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveToHistory = (report: SavedReport) => {
    // Avoid duplicates in history
    const filteredHistory = history.filter((h) => h.id !== report.id);
    const newHistory = [report, ...filteredHistory].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem("numera_reports", JSON.stringify(newHistory));
  };

  const copyJsonToClipboard = () => {
    if (!currentReport) return;
    const json = JSON.stringify(currentReport, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleManualImport = () => {
    setError(null);
    if (!manualJson.trim()) {
      setError("Input Required: Please provide the blueprint JSON string.");
      return;
    }
    try {
      const parsed = JSON.parse(manualJson);

      // Intelligent data extraction to handle both root-level and nested structures
      const fullName = parsed.fullName || parsed.input?.fullName;
      const dob = parsed.dob || parsed.input?.dob || "Unknown";
      const reportType =
        parsed.reportType ||
        parsed.input?.reportType ||
        (parsed.pages?.length > 10
          ? ReportType.FOURTEEN_PAGE
          : ReportType.SEVEN_PAGE);
      const numData = parsed.numerology || parsed.data;

      // Robust validation
      if (!fullName || !parsed.pages || !parsed.glossary || !numData) {
        throw new Error(
          "Missing critical modules (Identity, Analytical Pages, or Mathematical Data).",
        );
      }

      const newReport: SavedReport = {
        id: parsed.id || crypto.randomUUID(),
        timestamp: parsed.timestamp || Date.now(),
        input: {
          fullName,
          dob,
          reportType,
        },
        data: numData,
        pages: parsed.pages,
        glossary: parsed.glossary,
      };

      setCurrentReport(newReport);
      saveToHistory(newReport);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setError("Blueprint Integrity Fault: " + err.message);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.fullName || !input.dob) return;

    setLoading(true);
    setError(null);
    try {
      const lifePath = calculateLifePath(input.dob);
      const personalYear = calculatePersonalYear(input.dob);
      const { expression, soulUrge } = calculateNameNumbers(input.fullName);

      const data: NumerologyData = {
        lifePath,
        personalYear,
        expression,
        soulUrge,
      };
      const { pages, glossary } = await generateReportContent(input, data);

      const newReport: SavedReport = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        input: { ...input },
        data,
        pages,
        glossary,
      };

      setCurrentReport(newReport);
      saveToHistory(newReport);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      setError(
        "The analytical engine encountered an interference. Please re-execute.",
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newHistory = history.filter((h) => h.id !== id);
    setHistory(newHistory);
    localStorage.setItem("numera_reports", JSON.stringify(newHistory));
  };

  const reset = () => {
    setCurrentReport(null);
    setViewingHistory(false);
    setManualJson("");
  };

  if (currentReport) {
    const { input: reportInput, data, pages, glossary } = currentReport;
    return (
      <div className="min-h-screen bg-[#FDFDFD] py-12 px-4 flex flex-col items-center">
        {/* Navigation / Actions bar */}
        <div className="no-print w-full max-w-[816px] flex justify-between items-center mb-10 px-4">
          <button
            onClick={reset}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-900 transition-all"
          >
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">
              ← Return
            </span>
          </button>

          <div className="flex items-center space-x-4">
            <button
              onClick={copyJsonToClipboard}
              className={`px-6 py-3 border rounded-full transition-all text-[10px] font-bold tracking-[0.2em] uppercase flex items-center space-x-2 ${
                copySuccess
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-white border-gray-100 text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>{copySuccess ? "Blueprint Copied" : "Export Archive"}</span>
              {copySuccess && (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              )}
            </button>
            <button
              onClick={() => handlePrint()}
              // onClick={() => window.print()}
              className="px-8 py-3 bg-[#1F2937] text-white rounded-full hover:bg-black transition-all text-[10px] font-bold tracking-[0.3em] uppercase shadow-xl"
            >
              Print Master Copy
            </button>
          </div>
        </div>
        <div className="hidden print:block">
          <PrintableReport ref={printRef} report={currentReport} />
        </div>

        <div className="report-container w-full flex flex-col items-center print:hidden">
          {/* --- ULTRA PREMIUM FRONT PAGE --- */}
          <div className="bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-24 shadow-2xl relative mb-16 flex flex-col justify-between page-break border border-gray-50 overflow-hidden print:hidden print:overflow-visible print:mb-0 print:shadow-none">
            {/* Architectural Design Elements */}
            <div className="absolute top-0 left-0 w-full h-[10px] bg-[#1F2937]"></div>
            <div className="absolute top-24 left-24 w-[1px] h-12 bg-gray-100"></div>
            <div className="absolute top-24 left-24 w-12 h-[1px] bg-gray-100"></div>
            <div className="absolute top-[30%] right-[-120px] w-80 h-80 bg-[#5B21B6]/[0.02] rounded-full blur-3xl"></div>

            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.6em] uppercase font-black text-[#5B21B6]">
                  Numera High-Fidelity
                </span>
                <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300">
                  Archive Serial: {currentReport.id.slice(0, 10).toUpperCase()}
                </p>
              </div>
              <div className="text-right border-l border-gray-100 pl-6">
                <p className="text-[9px] tracking-[0.3em] uppercase text-gray-400 font-bold">
                  Confidential // Executive Grade
                </p>
                <p className="text-[8px] tracking-[0.3em] uppercase text-gray-300 mt-1">
                  Ref 2.5-A-Structure
                </p>
              </div>
            </div>

            <div className="mt-20 relative z-10 text-center">
              <div className="mb-14 flex items-center justify-center space-x-12">
                <div className="h-[0.5px] w-24 bg-gray-100"></div>
                <h4 className="text-[#F97316] uppercase tracking-[0.6em] text-[12px] font-bold">
                  Strategic Wealth & Career Mapping
                </h4>
                <div className="h-[0.5px] w-24 bg-gray-100"></div>
              </div>

              <h1 className="text-gray-900 text-7xl font-serif font-bold leading-[1.05] mb-14 tracking-tighter">
                Executive <br />
                <span className="text-[#5B21B6] italic font-light opacity-95">
                  Career Blueprint
                </span>
              </h1>

              <div className="max-w-md mx-auto py-12 border-y border-gray-50 mb-10">
                <p className="text-gray-400 text-sm font-light leading-[2.2] tracking-wide italic px-6">
                  A professional analytical document decoding the vibrational
                  intersections of innate potential, career trajectory, and
                  financial behavioral archetypes.
                </p>
              </div>
            </div>

            <div className="mt-auto mb-12">
              <div className="grid grid-cols-2 border border-gray-100 divide-x divide-gray-100 rounded-3xl shadow-sm">
                <div className="p-16 text-right bg-gray-50/20 flex flex-col justify-center">
                  <label className="text-[9px] uppercase tracking-[0.5em] text-gray-300 block mb-4 font-black">
                    Identity
                  </label>
                  <p className="text-4xl text-gray-900 font-serif font-bold tracking-tight mb-2 break-words line-clamp-2">
                    {reportInput.fullName}
                  </p>
                  <p className="text-[10px] text-[#5B21B6] uppercase tracking-[0.4em] font-black opacity-40">
                    {reportInput.dob !== "Unknown"
                      ? new Date(reportInput.dob).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Blueprint Entry"}
                  </p>
                </div>
                <div className="p-16 flex items-center justify-center bg-white min-h-[200px]">
                  <div className="flex items-center space-x-10">
                    <span className="text-8xl font-serif font-bold text-[#F97316] leading-none tracking-tighter flex-shrink-0">
                      {data.lifePath}
                    </span>
                    <div className="h-16 w-[1px] bg-gray-100 flex-shrink-0"></div>
                    <div className="flex-shrink-0">
                      <p className="text-[11px] uppercase tracking-[0.4em] font-black text-[#5B21B6] leading-tight">
                        Vibrational
                      </p>
                      <p className="text-[11px] uppercase tracking-[0.4em] font-medium text-gray-300 leading-tight mt-1">
                        Determinant
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <footer className="flex justify-between items-end border-t border-gray-50 pt-16 text-gray-300">
              <div className="space-y-1">
                <p className="text-[8px] tracking-[0.6em] uppercase font-bold text-gray-400">
                  © 2025 Numera Consulting Unit
                </p>
                <p className="text-[8px] tracking-[0.4em] uppercase">
                  Pythagorean Standard Certified
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] tracking-[0.3em] uppercase font-black text-[#5B21B6] opacity-30">
                  Consult: @numera.19
                </p>
              </div>
            </footer>
          </div>

          {pages.map((page, idx) => (
            <ReportPage key={idx} content={page} pageNumber={idx + 2} />
          ))}

          <ReportPage content={glossary} pageNumber={pages.length + 2} />

          {/* --- Back Page --- */}
          <div className="bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-24 shadow-xl flex flex-col justify-between page-break text-left border-b-[32px] border-[#1F2937] print:hidden print:overflow-visible print:shadow-none print:border-b-0">
            <div>
              <div className="flex items-center space-x-10 mb-20">
                <h2 className="text-[#5B21B6] text-3xl font-serif font-bold tracking-tight">
                  Standard Provisions
                </h2>
                <div className="h-[0.5px] flex-grow bg-gray-100"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                <section>
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-[#F97316] font-black mb-8">
                    Executive Use
                  </h4>
                  <p className="text-gray-500 text-xs leading-[2.4] font-light text-justify">
                    This document provides strategic insights based on classical
                    numerological algorithms. It is intended to complement, not
                    replace, traditional business consultancy and psychological
                    self-reflection.
                  </p>
                </section>

                <section>
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-[#F97316] font-black mb-8">
                    Responsibility Bound
                  </h4>
                  <p className="text-gray-500 text-xs leading-[2.4] font-light text-justify">
                    Final professional decisions are the sole responsibility of
                    the client. Numera assumes no liability for legal or
                    financial outcomes derived from the use of this analytical
                    mapping.
                  </p>
                </section>

                <section className="md:col-span-2 border-t border-gray-50 pt-16">
                  <h4 className="text-[11px] uppercase tracking-[0.5em] text-[#F97316] font-black mb-8">
                    Data Methodology
                  </h4>
                  <p className="text-gray-500 text-xs leading-[2.4] font-light text-justify">
                    All calculations are executed using the Pythagorean
                    alphanumeric standard. Interpretations are weighted against
                    historical career success patterns and established
                    professional archetypes for maximum reliability.
                  </p>
                </section>
              </div>
            </div>

            <div className="flex justify-between items-center py-14 border-t border-gray-50">
              <div className="flex items-center space-x-10">
                <div className="bg-[#5B21B6] w-14 h-14 rounded-lg shadow-2xl shadow-purple-100/50"></div>
                <div>
                  <p className="text-[#1F2937] font-serif font-bold text-3xl tracking-tighter">
                    Numera<span className="text-[#F97316]">.</span>
                  </p>
                  <p className="text-gray-300 text-[9px] uppercase tracking-[0.6em] font-black">
                    Elite Analytical Group
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-[#5B21B6] font-black uppercase tracking-[0.5em]">
                  @numera.19
                </p>
                <p className="text-[9px] text-gray-300 uppercase tracking-[0.3em] mt-1 font-bold italic">
                  High Fidelity Blueprinting
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAFAFA]">
      <div className="w-full max-w-2xl bg-white p-12 md:p-20 rounded-[72px] shadow-2xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[8px] bg-[#5B21B6]"></div>

        <div className="text-center mb-16">
          <div className="inline-block px-8 py-3 bg-[#F97316]/5 text-[#F97316] text-[10px] font-black uppercase tracking-[0.6em] rounded-full mb-12 border border-[#F97316]/10">
            Laboratory Access
          </div>
          <h1 className="text-7xl font-serif font-bold text-gray-900 mb-4 tracking-tighter">
            Numera<span className="text-[#5B21B6]">.</span>
          </h1>
          <p className="text-slate-400 font-light text-sm tracking-[0.4em] uppercase opacity-50">
            Precision Career Mapping
          </p>
        </div>

        <div className="flex bg-slate-50 p-2.5 rounded-[36px] mb-14">
          <button
            onClick={() => setActiveTab("AI")}
            className={`flex-1 py-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all rounded-[28px] ${activeTab === "AI" ? "bg-white text-[#5B21B6] shadow-xl scale-[1.04]" : "text-slate-400 hover:text-slate-600"}`}
          >
            Intelligent Build
          </button>
          <button
            onClick={() => setActiveTab("MANUAL")}
            className={`flex-1 py-5 text-[12px] font-black uppercase tracking-[0.2em] transition-all rounded-[28px] ${activeTab === "MANUAL" ? "bg-white text-[#5B21B6] shadow-xl scale-[1.04]" : "text-slate-400 hover:text-slate-600"}`}
          >
            Direct Blueprint
          </button>
        </div>

        {viewingHistory ? (
          <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center border-b border-gray-50 pb-10">
              <h3 className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-800">
                Master Archives
              </h3>
              <button
                onClick={() => setViewingHistory(false)}
                className="text-[#5B21B6] text-[11px] font-black uppercase tracking-widest border-b-2 border-[#5B21B6]/20 pb-1 transition-all hover:border-[#5B21B6]"
              >
                ← Exit
              </button>
            </div>
            {history.length === 0 ? (
              <p className="text-center py-24 text-slate-300 text-xs italic tracking-widest uppercase opacity-60">
                No archives detected in system.
              </p>
            ) : (
              <div className="space-y-6 max-h-[480px] overflow-y-auto pr-6 custom-scrollbar">
                {history.map((h) => (
                  <div
                    key={h.id}
                    onClick={() => setCurrentReport(h)}
                    className="group flex justify-between items-center p-10 bg-slate-50 hover:bg-white hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[40px] border border-slate-100 transition-all cursor-pointer"
                  >
                    <div>
                      <p className="text-xl font-serif font-bold text-slate-900 mb-2">
                        {h.input.fullName}
                      </p>
                      <p className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-black">
                        {new Date(h.timestamp).toLocaleDateString()} // Path{" "}
                        {h.data.lifePath}
                      </p>
                    </div>
                    <div className="flex items-center space-x-6 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                      <span className="text-[11px] font-black text-[#5B21B6] uppercase tracking-[0.4em]">
                        Load →
                      </span>
                      <button
                        onClick={(e) => deleteFromHistory(h.id, e)}
                        className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "AI" ? (
          <form onSubmit={handleGenerate} className="space-y-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6 ml-3">
                  Legal Identity
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-10 py-7 focus:outline-none focus:ring-8 focus:ring-[#5B21B6]/5 focus:bg-white transition-all text-sm text-slate-800 placeholder:text-slate-300"
                  placeholder="e.g. Alexander Pierce"
                  value={input.fullName}
                  onChange={(e) =>
                    setInput({ ...input, fullName: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6 ml-3">
                  Origin Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full bg-slate-50 border border-slate-100 rounded-[32px] px-10 py-7 focus:outline-none focus:ring-8 focus:ring-[#5B21B6]/5 focus:bg-white transition-all text-sm text-slate-800"
                  value={input.dob}
                  onChange={(e) => setInput({ ...input, dob: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 mb-10 ml-3">
                Analytical Complexity
              </label>
              <div className="grid grid-cols-2 gap-10">
                <button
                  type="button"
                  onClick={() =>
                    setInput({ ...input, reportType: ReportType.SEVEN_PAGE })
                  }
                  className={`py-12 px-10 rounded-[48px] border text-sm transition-all text-left ${
                    input.reportType === ReportType.SEVEN_PAGE
                      ? "border-[#5B21B6] bg-[#5B21B6]/5 shadow-2xl shadow-purple-50"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <div
                    className={`font-serif font-bold text-3xl mb-3 ${input.reportType === ReportType.SEVEN_PAGE ? "text-[#5B21B6]" : "text-slate-700"}`}
                  >
                    Executive
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest opacity-40">
                    9-Page Synthesis
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setInput({ ...input, reportType: ReportType.FOURTEEN_PAGE })
                  }
                  className={`py-12 px-10 rounded-[48px] border text-sm transition-all text-left ${
                    input.reportType === ReportType.FOURTEEN_PAGE
                      ? "border-[#5B21B6] bg-[#5B21B6]/5 shadow-2xl shadow-purple-50"
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <div
                    className={`font-serif font-bold text-3xl mb-3 ${input.reportType === ReportType.FOURTEEN_PAGE ? "text-[#5B21B6]" : "text-slate-700"}`}
                  >
                    Master
                  </div>
                  <div className="text-[11px] font-black uppercase tracking-widest opacity-40">
                    16-Page High-Fidelity Mapping
                  </div>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-9 bg-[#1F2937] text-white rounded-[48px] font-black uppercase tracking-[0.6em] text-[12px] hover:bg-black transition-all shadow-2xl shadow-slate-200 disabled:opacity-50 group overflow-hidden"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-5 h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Engaging Analytical Engine...
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-6">
                  <span>Execute High-Fidelity Analysis</span>
                  <span className="opacity-40 group-hover:translate-x-4 transition-transform text-2xl">
                    →
                  </span>
                </span>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="bg-slate-50 rounded-[56px] p-12 md:p-16 border border-slate-100 shadow-inner">
              <label className="block text-[11px] font-black uppercase tracking-[0.6em] text-slate-400 mb-10 ml-4 italic">
                Injection: Blueprint JSON
              </label>
              <textarea
                className="w-full bg-white border border-slate-100 rounded-[40px] px-12 py-10 focus:outline-none focus:ring-8 focus:ring-[#5B21B6]/5 transition-all text-[12px] font-mono text-slate-500 h-[420px] scrollbar-thin resize-none shadow-sm"
                placeholder="Paste blueprint JSON here..."
                value={manualJson}
                onChange={(e) => setManualJson(e.target.value)}
              />
            </div>
            <button
              onClick={handleManualImport}
              className="w-full py-9 bg-[#1F2937] text-white rounded-[48px] font-black uppercase tracking-[0.6em] text-[12px] hover:bg-black transition-all shadow-2xl"
            >
              Construct Master Archive
            </button>
            <div className="text-center">
              <p className="text-slate-300 text-[10px] font-black tracking-[0.6em] uppercase border-t border-slate-50 pt-10 mt-6 opacity-60">
                Validation against Numera Standard 2.5 required
              </p>
            </div>
          </div>
        )}

        {history.length > 0 && !viewingHistory && (
          <div className="pt-20 flex justify-center">
            <button
              type="button"
              onClick={() => setViewingHistory(true)}
              className="group flex items-center space-x-6 text-slate-300 hover:text-[#5B21B6] transition-all"
            >
              <span className="text-[11px] font-black uppercase tracking-[0.7em]">
                Master Archives ({history.length})
              </span>
              <span className="opacity-20 group-hover:opacity-100 group-hover:translate-x-3 transition-all">
                →
              </span>
            </button>
          </div>
        )}

        {error && (
          <div className="mt-12 p-10 bg-red-50 text-red-500 text-[11px] rounded-[40px] text-center font-black tracking-[0.6em] uppercase border border-red-100 animate-in bounce-in">
            System Fault: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
