import React from "react";
import { PageContent } from "../types";

interface ReportPageProps {
  content: PageContent;
  pageNumber: number;
}

const ReportPage: React.FC<ReportPageProps> = ({ content, pageNumber }) => {
  return (
    <div className="bg-white min-h-[1056px] w-full max-w-[816px] mx-auto p-24 shadow-xl relative mb-16 flex flex-col page-break border-x border-gray-50 overflow-hidden print:overflow-visible print:mb-0 print:shadow-none">
      {/* Premium pagination marker */}
      <div className="absolute right-0 top-0 opacity-10 p-12">
        <span className="text-[80px] font-serif font-bold text-gray-400 tabular-nums leading-none">
          {pageNumber.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Decorative hairline */}
      <div className="absolute left-0 top-0 w-[6px] h-full bg-[#5B21B6]/5"></div>

      <div className="flex justify-between items-center mb-24 opacity-40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-[1px] bg-[#5B21B6]"></div>
          <span className="text-[10px] tracking-[0.5em] font-bold text-[#5B21B6] uppercase">
            {content.title}
          </span>
        </div>
      </div>

      <header className="mb-20 max-w-[85%]">
        <h2 className="text-gray-900 text-4xl font-serif font-bold mb-8 tracking-tight leading-[1.2]">
          {content.headline}
        </h2>
        <div className="w-16 h-[2px] bg-[#F97316]/50"></div>
      </header>

      {content.numberDisplay && (
        <div className="mb-20 flex items-baseline space-x-8">
          <span className="text-9xl font-serif font-bold text-[#F97316] tracking-tighter tabular-nums leading-none">
            {content.numberDisplay}
          </span>
          <div className="h-16 w-[1px] bg-gray-100"></div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#C4B5FD] font-black leading-tight">
              Vibrational
            </p>
            <p className="text-[11px] uppercase tracking-[0.4em] text-[#C4B5FD] font-black leading-tight">
              Determinant
            </p>
          </div>
        </div>
      )}

      <main className="flex-grow space-y-12 max-w-[90%]">
        {content.paragraphs.map((p, idx) => (
          <p
            key={idx}
            className="text-[#374151] leading-[2.2] text-[16px] font-light text-justify tracking-wide opacity-90"
          >
            {p}
          </p>
        ))}
      </main>

      {content.accentNote && (
        <footer className="mt-20">
          <div className="bg-[#5B21B6]/[0.02] p-12 rounded-lg border-l-[4px] border-[#5B21B6]">
            <h5 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#5B21B6] mb-6 opacity-60">
              Strategic Advisory Point
            </h5>
            <p className="text-[#1F2937] text-lg italic font-serif leading-relaxed text-gray-700 opacity-90">
              "{content.accentNote}"
            </p>
          </div>
        </footer>
      )}

      <div className="mt-20 pt-10 border-t border-gray-50 flex justify-between items-center opacity-20">
        <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-gray-400">
          Section // Professional Architecture
        </p>
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 rounded-full bg-[#5B21B6]"></div>
          <p className="text-[9px] tracking-[0.4em] font-bold uppercase text-gray-400">
            Numera Precision Blueprint
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
