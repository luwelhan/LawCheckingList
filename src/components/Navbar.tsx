import React from 'react';
import {
  BookOpen,
  ExternalLink,
  History,
  ShieldCheck,
  Columns2,
  LayoutGrid,
  List,
  PanelLeftClose,
  PanelLeft,
  FileDown,
  Keyboard,
  Printer
} from 'lucide-react';
import { MOJ_MAIN_URL, LAW_PCODE } from '../data/regulationsData';
import { ViewMode } from '../types';

interface NavbarProps {
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  historyCount: number;
  onOpenHistory: () => void;
  fontSize: 'normal' | 'large' | 'xlarge';
  onChangeFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
  totalArticlesCount: number;
  onOpenBatchExport: () => void;
  onOpenShortcuts: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  onChangeViewMode,
  isSidebarCollapsed,
  onToggleSidebar,
  historyCount,
  onOpenHistory,
  fontSize,
  onChangeFontSize,
  totalArticlesCount,
  onOpenBatchExport,
  onOpenShortcuts
}) => {
  return (
    <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs select-none">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Left Controls */}
          <div className="flex items-center space-x-3 shrink-0">
            {/* Sidebar toggle button for desktop */}
            <button
              id="sidebar-toggle-btn"
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex p-2 text-slate-500 hover:text-sky-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              title={isSidebarCollapsed ? '展開側邊目錄 (Ctrl+B)' : '收合側邊目錄 (Ctrl+B)'}
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-sky-700" />
              )}
            </button>

            <div className="w-10 h-10 rounded-lg bg-sky-800 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5 text-sky-100" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-none">
                  建築技術規則 法規檢索工具
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  桌面專業版
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                <span>PCode: <strong className="font-mono text-slate-700">{LAW_PCODE}</strong></span>
                <span className="text-slate-300">|</span>
                <span>收錄條文: {totalArticlesCount} 條</span>
              </p>
            </div>
          </div>

          {/* Center View Mode Switcher (Desktop Feature) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              id="view-mode-split-btn"
              type="button"
              onClick={() => onChangeViewMode('split')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="雙欄對照分屏檢視（推薦桌面使用，快捷鍵 Ctrl+1）"
            >
              <Columns2 className="w-3.5 h-3.5 text-sky-600" />
              <span>雙欄對照</span>
            </button>

            <button
              id="view-mode-cards-btn"
              type="button"
              onClick={() => onChangeViewMode('cards')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="卡片瀑布流模式（快捷鍵 Ctrl+2）"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-sky-600" />
              <span>卡片模式</span>
            </button>

            <button
              id="view-mode-dense-btn"
              type="button"
              onClick={() => onChangeViewMode('dense')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'dense'
                  ? 'bg-white text-sky-800 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="高密度總覽清單（快捷鍵 Ctrl+3）"
            >
              <List className="w-3.5 h-3.5 text-sky-600" />
              <span>總覽清單</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Batch Export & Report Button */}
            <button
              id="batch-export-btn"
              type="button"
              onClick={onOpenBatchExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="批量匯出法規佐證報告或列印"
            >
              <FileDown className="w-3.5 h-3.5 text-sky-700" />
              <span className="hidden sm:inline">匯出 / 列印</span>
            </button>

            {/* Font Size Adjuster */}
            <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs text-slate-600 font-medium">
              <button
                type="button"
                onClick={() => onChangeFontSize('normal')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  fontSize === 'normal' ? 'bg-white shadow-2xs text-sky-700 font-semibold' : 'hover:text-slate-900'
                }`}
                title="標準字體"
              >
                標準
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('large')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  fontSize === 'large' ? 'bg-white shadow-2xs text-sky-700 font-semibold' : 'hover:text-slate-900'
                }`}
                title="大字體"
              >
                大字
              </button>
              <button
                type="button"
                onClick={() => onChangeFontSize('xlarge')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  fontSize === 'xlarge' ? 'bg-white shadow-2xs text-sky-700 font-semibold' : 'hover:text-slate-900'
                }`}
                title="特大字體"
              >
                特大
              </button>
            </div>

            {/* Search History Button */}
            <button
              id="history-drawer-toggle-btn"
              type="button"
              onClick={onOpenHistory}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="檢索歷史與近期瀏覽"
            >
              <History className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">歷史</span>
              {historyCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-sky-600 rounded-full">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Keyboard Shortcuts Helper Button */}
            <button
              id="keyboard-shortcuts-btn"
              type="button"
              onClick={onOpenShortcuts}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200 cursor-pointer hidden md:flex"
              title="桌面快捷鍵指南 (?)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Official MOJ Portal Direct Link */}
            <a
              id="moj-source-link"
              href={MOJ_MAIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200 transition-colors"
              title="前往全國法規資料庫檢視最新原始法規"
            >
              <span>MOJ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

