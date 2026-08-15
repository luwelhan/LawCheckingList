import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  BookmarkCheck,
  FileText,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { RegulationArticle, RegulationTable } from '../types';
import { getHighlightedParts } from '../utils/searchEngine';
import { LAW_PCODE, LAW_TITLE } from '../data/regulationsData';

interface DenseTableViewProps {
  articles: RegulationArticle[];
  searchQuery: string;
  bookmarkedIds: Set<string>;
  onToggleBookmark: (articleId: string) => void;
  onOpenArticleDetail: (articleId: string) => void;
  onExpandTableModal: (table: RegulationTable) => void;
}

export const DenseTableView: React.FC<DenseTableViewProps> = ({
  articles,
  searchQuery,
  bookmarkedIds,
  onToggleBookmark,
  onOpenArticleDetail,
  onExpandTableModal
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyCitation = async (article: RegulationArticle) => {
    const citationText = `【法規佐證引用】
法規名稱：${LAW_TITLE}（全國法規資料庫 PCode: ${LAW_PCODE}）
編章條號：${article.section} ${article.chapter} ${article.articleNumber}${article.title ? ' (' + article.title + ')' : ''}
法規連結：${article.mojUrl}
條文內容摘要：
${article.content}
（資料來源：中華民國全國法規資料庫）`;

    try {
      await navigator.clipboard.writeText(citationText);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy citation:', err);
    }
  };

  const getSectionBadgeColor = (section: string) => {
    switch (section) {
      case '總則編':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case '建築設計施工編':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case '建築構造編':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '建築設備編':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderSnippet = (content: string) => {
    const clean = content.replace(/\n+/g, ' ');
    const parts = getHighlightedParts(clean.substring(0, 140) + (clean.length > 140 ? '...' : ''), searchQuery);

    return (
      <span className="text-xs text-slate-600 line-clamp-2">
        {parts.map((p, idx) =>
          p.isMatch ? (
            <mark key={idx} className="bg-amber-200 text-amber-950 font-semibold px-0.5 rounded-2xs">
              {p.text}
            </mark>
          ) : (
            <span key={idx}>{p.text}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-700 select-none">
              <th className="py-3 px-3 w-10 text-center">收藏</th>
              <th className="py-3 px-4 w-28 font-bold">條號</th>
              <th className="py-3 px-4 w-40 font-bold">編章分類</th>
              <th className="py-3 px-4 w-48 font-bold">條文名稱</th>
              <th className="py-3 px-4 font-bold">條文要點摘要</th>
              <th className="py-3 px-3 w-28 text-center font-bold">法定附表</th>
              <th className="py-3 px-4 w-40 text-right font-bold">操作佐證</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {articles.map((art, idx) => {
              const isBookmarked = bookmarkedIds.has(art.id);
              const hasTables = art.tables && art.tables.length > 0;
              const isCopied = copiedId === art.id;

              return (
                <tr
                  key={art.id}
                  className={`hover:bg-sky-50/60 transition-colors ${
                    idx % 2 === 1 ? 'bg-slate-50/40' : 'bg-white'
                  }`}
                >
                  {/* Bookmark Column */}
                  <td className="py-2.5 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(art.id)}
                      className="text-slate-400 hover:text-amber-600 transition-colors cursor-pointer p-1 rounded hover:bg-amber-50"
                      title={isBookmarked ? '取消收藏' : '收藏此條文'}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  {/* Article Number */}
                  <td className="py-2.5 px-4 font-serif font-bold text-sm text-sky-950 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onOpenArticleDetail(art.id)}
                      className="hover:underline text-left cursor-pointer"
                      title="點擊切換至雙欄檢視詳細內容"
                    >
                      {art.articleNumber}
                    </button>
                  </td>

                  {/* Section & Chapter */}
                  <td className="py-2.5 px-4">
                    <div className="space-y-1">
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-medium border ${getSectionBadgeColor(
                          art.section
                        )}`}
                      >
                        {art.section}
                      </span>
                      <p className="text-[11px] text-slate-500 truncate max-w-[140px]" title={art.chapter}>
                        {art.chapter}
                      </p>
                    </div>
                  </td>

                  {/* Title */}
                  <td className="py-2.5 px-4 font-medium text-slate-800">
                    {art.title || <span className="text-slate-400 font-normal">（無副標題）</span>}
                  </td>

                  {/* Summary */}
                  <td className="py-2.5 px-4 max-w-md">
                    {renderSnippet(art.content)}
                  </td>

                  {/* Tables */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    {hasTables ? (
                      <div className="flex flex-col items-center gap-1">
                        {art.tables!.map((tbl) => (
                          <button
                            key={tbl.id}
                            type="button"
                            onClick={() => onExpandTableModal(tbl)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-medium transition-colors cursor-pointer"
                            title="放大檢視法定附表"
                          >
                            <FileText className="w-3 h-3 text-amber-700" />
                            <span>附表檢視</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[11px]">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenArticleDetail(art.id)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
                        title="開啟完整詳情"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCopyCitation(art)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-md transition-colors text-[11px] cursor-pointer shadow-2xs"
                        title="複製法規佐證引用"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700 font-medium">已複製</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>佐證</span>
                          </>
                        )}
                      </button>

                      <a
                        href={art.mojUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-md transition-colors"
                        title="前往全國法規資料庫官方頁面"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
