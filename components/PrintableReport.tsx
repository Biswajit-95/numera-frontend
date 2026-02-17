import React, { forwardRef } from "react";
import ReportPage from "./ReportPage";
import { SavedReport } from "../types";

interface Props {
  report: SavedReport | null;
}

const PrintableReport = forwardRef<HTMLDivElement, Props>(({ report }, ref) => {
  if (!report) return null;

  const { input: reportInput, data, pages, glossary } = report;

  return (
    <div
      ref={ref}
      className="report-container w-full flex flex-col items-center printable-root"
    >
      {/* --- ULTRA PREMIUM FRONT PAGE (match App.tsx front page exactly) --- */}
      <div className="bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-24 shadow-2xl relative mb-16 flex flex-col justify-between page-break border border-gray-50 overflow-hidden border-t-[10px] border-[#1F2937]">
        <div className="absolute top-24 left-24 w-[1px] h-12 bg-gray-100"></div>
        <div className="absolute top-24 left-24 w-12 h-[1px] bg-gray-100"></div>
        <div className="absolute top-[30%] right-[-120px] w-80 h-80 bg-[#5B21B6]/[0.02] rounded-full blur-3xl"></div>

        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.6em] uppercase font-black text-[#5B21B6]">
              Numera High-Fidelity
            </span>
            <p className="text-[9px] tracking-[0.2em] uppercase text-gray-300">
              Archive Serial: {report.id.slice(0, 10).toUpperCase()}
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

      {/* Render content pages exactly as App.tsx does */}
      {pages.map((page, idx) => (
        <ReportPage key={idx} content={page} pageNumber={idx + 2} />
      ))}

      <ReportPage content={glossary} pageNumber={pages.length + 2} />

      {/* Back page matching App.tsx */}
      <div className="bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-24 shadow-xl flex flex-col justify-between page-break text-left border-b-[32px] border-[#1F2937]">
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
                Final professional decisions are the sole responsibility of the
                client. Numera assumes no liability for legal or financial
                outcomes derived from the use of this analytical mapping.
              </p>
            </section>

            <section className="md:col-span-2 border-t border-gray-50 pt-16">
              <h4 className="text-[11px] uppercase tracking-[0.5em] text-[#F97316] font-black mb-8">
                Data Methodology
              </h4>
              <p className="text-gray-500 text-xs leading-[2.4] font-light text-justify">
                All calculations are executed using the Pythagorean alphanumeric
                standard. Interpretations are weighted against historical career
                success patterns and established professional archetypes for
                maximum reliability.
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
  );
});

PrintableReport.displayName = "PrintableReport";

export default PrintableReport;
