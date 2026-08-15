import { RegulationArticle } from '../types';

export interface SearchOptions {
  query: string;
  sectionFilter?: string; // 'ALL' or specific section
  onlyWithTables?: boolean;
}

export interface SearchResultItem {
  article: RegulationArticle;
  score: number;
  matchContexts: {
    field: 'articleNumber' | 'title' | 'content' | 'table' | 'chapter';
    preview: string;
  }[];
}

/**
 * Normalizes query string for flexible matching
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\s\t\n]+/g, ' ')
    .replace(/[條條]/g, '條')
    .replace(/[第]/g, '')
    .trim();
}

/**
 * Checks if query looks like a specific article number (e.g. "33", "第33條", "39-1", "39之1")
 */
function extractArticleNumberQuery(query: string): string | null {
  const match = query.match(/(?:第\s*)?(\d+)(?:\s*(?:條|之|-)\s*(\d+))?(?:\s*條)?/);
  if (match) {
    const mainNum = match[1];
    const subNum = match[2];
    if (subNum) {
      return `${mainNum}-${subNum}`;
    }
    return mainNum;
  }
  return null;
}

export function searchRegulations(
  database: RegulationArticle[],
  options: SearchOptions
): SearchResultItem[] {
  const { query, sectionFilter = 'ALL', onlyWithTables = false } = options;
  const rawQuery = (query || '').trim();

  // If query is empty and no filters, return list filtered by section/tables
  const tokens = rawQuery
    ? rawQuery.split(/\s+/).map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  const candidateArticles = database.filter((art) => {
    if (sectionFilter !== 'ALL' && art.section !== sectionFilter) {
      return false;
    }
    if (onlyWithTables && (!art.tables || art.tables.length === 0)) {
      return false;
    }
    return true;
  });

  if (tokens.length === 0) {
    return candidateArticles.map((art) => ({
      article: art,
      score: 1,
      matchContexts: []
    }));
  }

  const results: SearchResultItem[] = [];
  const articleNumQuery = extractArticleNumberQuery(rawQuery);

  for (const art of candidateArticles) {
    let score = 0;
    const matchContexts: SearchResultItem['matchContexts'] = [];

    // 1. Direct Article Number exact match (highest priority)
    const artNumDigits = `${art.articleNumberInt}${art.subArticle ? '-' + art.subArticle.replace(/[^\d]/g, '') : ''}`;
    if (articleNumQuery && (artNumDigits === articleNumQuery || art.articleNumber.includes(rawQuery))) {
      score += 150;
      matchContexts.push({
        field: 'articleNumber',
        preview: `條號完全符合：${art.articleNumber}`
      });
    }

    // 2. Check each search token
    let allTokensMatched = true;

    for (const token of tokens) {
      let tokenMatched = false;

      // Check Title
      if (art.title && art.title.toLowerCase().includes(token)) {
        score += 60;
        tokenMatched = true;
        matchContexts.push({
          field: 'title',
          preview: art.title
        });
      }

      // Check Article Number text
      if (art.articleNumber.toLowerCase().includes(token)) {
        score += 50;
        tokenMatched = true;
      }

      // Check Keywords
      if (art.keywords.some((k) => k.toLowerCase().includes(token))) {
        score += 40;
        tokenMatched = true;
      }

      // Check Tables (Headers, Titles, Rows, Footnotes)
      if (art.tables && art.tables.length > 0) {
        for (const tbl of art.tables) {
          if (tbl.title.toLowerCase().includes(token)) {
            score += 45;
            tokenMatched = true;
            matchContexts.push({
              field: 'table',
              preview: `附表標題：${tbl.title}`
            });
          }
          for (const row of tbl.rows) {
            const joinedRow = row.join(' ').toLowerCase();
            if (joinedRow.includes(token)) {
              score += 35;
              tokenMatched = true;
              if (matchContexts.length < 3) {
                matchContexts.push({
                  field: 'table',
                  preview: `附表項目：${row.slice(0, 2).join(' - ')}`
                });
              }
              break;
            }
          }
        }
      }

      // Check Content
      if (art.content.toLowerCase().includes(token)) {
        score += 20;
        tokenMatched = true;
        // Extract snippet
        const idx = art.content.toLowerCase().indexOf(token);
        const start = Math.max(0, idx - 30);
        const end = Math.min(art.content.length, idx + token.length + 50);
        const snippet = (start > 0 ? '...' : '') + art.content.slice(start, end).replace(/\n/g, ' ') + (end < art.content.length ? '...' : '');
        matchContexts.push({
          field: 'content',
          preview: snippet
        });
      }

      // Check Chapter name
      if (art.chapter.toLowerCase().includes(token)) {
        score += 15;
        tokenMatched = true;
      }

      if (!tokenMatched) {
        allTokensMatched = false;
      }
    }

    if (allTokensMatched && score > 0) {
      results.push({
        article: art,
        score,
        matchContexts
      });
    }
  }

  // Sort descending by score, then by section and article number
  return results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.article.articleNumberInt - b.article.articleNumberInt;
  });
}

/**
 * Safely splits a text string into matched and unmatched segments for visual highlighting
 */
export function getHighlightedParts(text: string, query: string): { text: string; isMatch: boolean }[] {
  if (!text) return [];
  if (!query || !query.trim()) return [{ text, isMatch: false }];

  const tokens = query
    .trim()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length); // match longer words first

  if (tokens.length === 0) return [{ text, isMatch: false }];

  // Escape regex special chars
  const escapedTokens = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');

  const parts = text.split(regex);
  return parts.map((part) => {
    const isMatch = tokens.some((t) => t.toLowerCase() === part.toLowerCase());
    return { text: part, isMatch };
  });
}
