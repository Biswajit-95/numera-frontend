
export enum ReportType {
  SEVEN_PAGE = '7_PAGE',
  FOURTEEN_PAGE = '14_PAGE'
}

export interface UserInput {
  fullName: string;
  dob: string;
  reportType: ReportType;
}

export interface PageContent {
  title: string;
  headline: string;
  paragraphs: string[];
  accentNote?: string;
  numberDisplay?: string | number;
}

export interface NumerologyData {
  lifePath: number;
  personalYear: number;
  expression: number;
  soulUrge: number;
}

export interface SavedReport {
  id: string;
  timestamp: number;
  input: UserInput;
  data: NumerologyData;
  pages: PageContent[];
  glossary: PageContent;
}
