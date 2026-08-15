export type RegulationSection = 
  | '總則編'
  | '建築設計施工編'
  | '建築構造編'
  | '建築設備編';

export interface RegulationTable {
  id: string;
  title: string;
  description?: string;
  headers: string[];
  rows: string[][];
  footnotes?: string[];
  category?: string;
}

export interface RegulationArticle {
  id: string;
  section: RegulationSection;
  chapter: string;
  articleNumber: string; // e.g. "第 33 條", "第 60 條"
  articleNumberInt: number;
  subArticle?: string; // e.g. "之 1"
  title?: string;
  content: string; // Original full-text
  tables?: RegulationTable[];
  mojUrl: string; // Link to official MOJ Law single article
  lastAmended?: string; // e.g. "民國 112 年 12 月 29 日"
  keywords: string[];
  practicalNotes?: string; // Technical summary for architects & engineers
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  sectionFilter: string;
  onlyWithTables: boolean;
  timestamp: number;
  resultCount: number;
}

export interface ViewedArticleItem {
  articleId: string;
  articleNumber: string;
  section: string;
  title?: string;
  timestamp: number;
}
