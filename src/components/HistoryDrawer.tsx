import React from 'react';
import { X, History, Trash2, ArrowRight, Clock, Search, BookOpen, ExternalLink } from 'lucide-react';
import { SearchHistoryItem, ViewedArticleItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  searchHistory: SearchHistoryItem[];
  viewedArticles: ViewedArticleItem[];
  onSelectHistory: (item: SearchHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearAllHistory: () => void;
  onSelectArticleById: (articleId: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  searchHistory,
  viewedArticles,
  onSelectHistory,
  onDeleteHistoryItem,
  onClearAllHistory,
  onSelectArticleById
}) => {
  if (!isOpen) return null;

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div
        id="history-drawer-panel"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-sky-700" />
            <h2 className="text-base font-bold text-slate-900">檢索歷史與閱讀紀錄</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* 1. Keyword Search History */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-600" />
                <span>關鍵字檢索歷史 ({searchHistory.length})</span>
              </h3>
              {searchHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAllHistory}
                  className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>清除全紀錄</span>
                </button>
              )}
            </div>

            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-lg p-3 transition-all flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectHistory(item);
                        onClose();
                      }}
                      className="flex-1 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">
                          {item.query || '（全條文瀏覽）'}
                        </span>
                        {item.sectionFilter !== 'ALL' && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                            {item.sectionFilter}
                          </span>
                        )}
                        {item.onlyWithTables && (
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-medium">
                            含附表
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600 font-mono">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>{formatTime(item.timestamp)}</span>
                        <span>·</span>
                        <span>{item.resultCount} 筆結果</span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSelectHistory(item);
                          onClose();
                        }}
                        className="p-1.5 text-sky-600 hover:bg-sky-100 rounded-md transition-colors"
                        title="重新執行此檢索"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHistoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="刪除紀錄"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-600 text-xs bg-slate-50 rounded-lg border border-dashed border-slate-200">
                尚未有檢索歷史，請於上方搜尋框輸入關鍵字
              </div>
            )}
          </div>

          {/* 2. Recently Viewed Articles */}
          {viewedArticles.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>近期瀏覽條文 ({viewedArticles.length})</span>
                </h3>
              </div>

              <div className="space-y-1.5">
                {viewedArticles.map((v, idx) => (
                  <button
                    key={`${v.articleId}-${idx}`}
                    type="button"
                    onClick={() => {
                      onSelectArticleById(v.articleId);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 transition-colors flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 mr-2">{v.articleNumber}</span>
                      <span className="text-slate-600">{v.title || v.section}</span>
                    </div>
                    <span className="text-[10px] text-slate-600 font-mono">
                      {formatTime(v.timestamp)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Source Notice */}
          <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs text-sky-900 space-y-1">
            <p className="font-semibold">💡 檢索備註說明：</p>
            <p className="text-sky-800 text-[11px] leading-relaxed">
              本工具採即時本機純程式碼全文搜尋（不調用第三方語言模型、無幻覺）。檢索歷史儲存於目前工作階段（Session），關閉或重新整理即清空。
            </p>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-600">建築技術規則檢索系統</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-lg transition-colors"
          >
            關閉面版
          </button>
        </div>
      </div>
    </div>
  );
};
