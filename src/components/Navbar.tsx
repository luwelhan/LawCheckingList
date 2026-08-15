import React from 'react';
import { BookOpen, ExternalLink, History, ShieldCheck, ZoomIn, ZoomOut } from 'lucide-react';
import { MOJ_MAIN_URL, LAW_PCODE } from '../data/regulationsData';

interface NavbarProps {
  historyCount: number;
  onOpenHistory: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  totalArticlesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  historyCount,
  onOpenHistory,
  fontSize,
  onChangeFontSize,
  totalArticlesCount
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-sky-800 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-sky-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                  建築技術規則 法規檢索工具
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  官方佐證
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 flex items-center gap-2">
                <span>全國法規資料庫識別碼: <strong className="font-mono text-slate-800">{LAW_PCODE}</strong></span>
                <span className="text-slate-300">|</span>
                <span>收錄條文: {totalArticlesCount} 條</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Font Size Adjuster */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium">
              <button
                id="font-size-normal-btn"
                type="button"
                onClick={() => onChangeFontSize('normal')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'normal' ? 'bg-white shadow-xs text-sky-700 font-semibold' : 'hover:text-slate-900'}`}
                title="標準字體"
              >
                標準
              </button>
              <button
                id="font-size-large-btn"
                type="button"
                onClick={() => onChangeFontSize('large')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'large' ? 'bg-white shadow-xs text-sky-700 font-semibold' : 'hover:text-slate-900'}`}
                title="大字體"
              >
                大字
              </button>
              <button
                id="font-size-xlarge-btn"
                type="button"
                onClick={() => onChangeFontSize('xlarge')}
                className={`px-2 py-1 rounded transition-colors ${fontSize === 'xlarge' ? 'bg-white shadow-xs text-sky-700 font-semibold' : 'hover:text-slate-900'}`}
                title="特大字體"
              >
                特大
              </button>
            </div>

            {/* Official MOJ Portal Direct Link */}
            <a
              id="moj-source-link"
              href={MOJ_MAIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
              title="前往全國法規資料庫檢視最新原始法規"
            >
              <span>全國法規資料庫 (MOJ)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Search History Button */}
            <button
              id="history-drawer-toggle-btn"
              type="button"
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-xs"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span>檢索歷史</span>
              {historyCount > 0 && (
                <span className="ml-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-sky-600 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
