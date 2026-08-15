import React, { useMemo } from 'react';
import {
  Layers,
  BookOpen,
  Table as TableIcon,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  ListOrdered,
  Building2,
  Flame,
  Accessibility,
  Car,
  ShieldAlert,
  HardHat
} from 'lucide-react';
import { RegulationArticle, RegulationSection } from '../types';
import { POPULAR_KEYWORDS } from '../data/regulationsData';

interface DesktopSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  articles: RegulationArticle[];
  selectedSection: string;
  onSelectSection: (sec: string) => void;
  selectedChapter: string | null;
  onSelectChapter: (chapter: string | null) => void;
  onlyWithTables: boolean;
  onToggleOnlyWithTables: (checked: boolean) => void;
  showBookmarksOnly: boolean;
  onToggleShowBookmarksOnly: (checked: boolean) => void;
  bookmarkedCount: number;
  onSelectKeyword: (kw: string) => void;
  activeQuery: string;
}

// Practical real-world topics with tailored icons
const TOPIC_PRESETS = [
  { name: '樓梯與走廊', icon: ListOrdered, query: '樓梯' },
  { name: '無障礙建築', icon: Accessibility, query: '無障礙' },
  { name: '防火時效與區劃', icon: Flame, query: '防火' },
  { name: '停車空間與車道', icon: Car, query: '停車位' },
  { name: '高度、建蔽與容積', icon: Building2, query: '建築面積' },
  { name: '構造載重與安全', icon: HardHat, query: '活載重' },
  { name: '避難與排煙設施', icon: ShieldAlert, query: '避難' }
];

interface SectionInfo {
  count: number;
  chapters: Record<string, number>;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  articles,
  selectedSection,
  onSelectSection,
  selectedChapter,
  onSelectChapter,
  onlyWithTables,
  onToggleOnlyWithTables,
  showBookmarksOnly,
  onToggleShowBookmarksOnly,
  bookmarkedCount,
  onSelectKeyword,
  activeQuery
}) => {
  // Aggregate sections and chapters dynamically
  const sectionTree = useMemo<Record<string, SectionInfo>>(() => {
    const sections: Record<string, SectionInfo> = {
      '總則編': { count: 0, chapters: {} },
      '建築設計施工編': { count: 0, chapters: {} },
      '建築構造編': { count: 0, chapters: {} },
      '建築設備編': { count: 0, chapters: {} }
    };

    articles.forEach((art) => {
      if (!sections[art.section]) {
        sections[art.section] = { count: 0, chapters: {} };
      }
      sections[art.section].count += 1;

      // Extract simplified chapter title
      const chapName = art.chapter.split(' - ')[0] || art.chapter;
      sections[art.section].chapters[chapName] = (sections[art.section].chapters[chapName] || 0) + 1;
    });

    return sections;
  }, [articles]);


  const totalTableCount = useMemo(() => {
    return articles.reduce((acc, art) => acc + (art.tables ? art.tables.length : 0), 0);
  }, [articles]);

  if (isCollapsed) {
    return (
      <aside
        id="desktop-sidebar-collapsed"
        className="w-14 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col items-center py-4 justify-between transition-all select-none sticky top-16 h-[calc(100vh-4rem)]"
      >
        <div className="flex flex-col items-center space-y-4">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 text-slate-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
            title="展開側邊導航目錄 (Ctrl+B)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <div className="w-8 h-[1px] bg-slate-200 my-1" />

          {/* Quick icon toggles */}
          <button
            type="button"
            onClick={() => onSelectSection('ALL')}
            className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
              selectedSection === 'ALL'
                ? 'bg-sky-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="全部法規編章"
          >
            <Layers className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleOnlyWithTables(!onlyWithTables)}
            className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
              onlyWithTables
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="僅顯示含法定附表"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onToggleShowBookmarksOnly(!showBookmarksOnly)}
            className={`p-2.5 rounded-lg transition-colors cursor-pointer ${
              showBookmarksOnly
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={`已收藏條文 (${bookmarkedCount})`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[10px] text-slate-400 font-mono rotate-90 whitespace-nowrap mb-6">
          法規導航
        </div>
      </aside>
    );
  }

  return (
    <aside
      id="desktop-sidebar"
      className="w-72 bg-white border-r border-slate-200 shrink-0 hidden lg:flex flex-col justify-between transition-all select-none sticky top-16 h-[calc(100vh-4rem)] overflow-hidden shadow-xs"
    >
      {/* Top Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-sky-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            法規章節目錄樹
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors text-xs flex items-center gap-0.5 cursor-pointer"
          title="收合側邊欄 (Ctrl+B)"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-[11px] font-medium text-slate-500">收合</span>
        </button>
      </div>

      {/* Middle Scrollable Section Tree & Presets */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-5 text-xs">
        {/* Quick Toggles */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => {
              onSelectSection('ALL');
              onSelectChapter(null);
            }}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer ${
              selectedSection === 'ALL' && selectedChapter === null
                ? 'bg-sky-800 text-white font-semibold shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>全部法規條文</span>
            </div>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                selectedSection === 'ALL' && selectedChapter === null
                  ? 'bg-sky-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {articles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleOnlyWithTables(!onlyWithTables)}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between border cursor-pointer ${
              onlyWithTables
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-amber-50/60 hover:bg-amber-100/70 text-amber-900 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <TableIcon className="w-3.5 h-3.5" />
              <span>法定附表專區</span>
            </div>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                onlyWithTables ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-950'
              }`}
            >
              {totalTableCount} 表
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleShowBookmarksOnly(!showBookmarksOnly)}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between border cursor-pointer ${
              showBookmarksOnly
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bookmark className="w-3.5 h-3.5" />
              <span>已收藏條文</span>
            </div>
            <span
              className={`text-[11px] font-mono px-1.5 py-0.2 rounded ${
                showBookmarksOnly ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {bookmarkedCount}
            </span>
          </button>
        </div>

        {/* Sections & Chapters Tree */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
            <span>各編條文分類</span>
            <span className="text-[10px] text-slate-500 font-normal">點擊過濾</span>
          </div>

          <div className="space-y-2">
            {(Object.entries(sectionTree) as [string, SectionInfo][]).map(([secName, { count, chapters }]) => {
              const isSectionSelected = selectedSection === secName;
              return (
                <div key={secName} className="rounded-lg border border-slate-200 overflow-hidden bg-slate-50/40">
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedSection === secName) {
                        onSelectSection('ALL');
                        onSelectChapter(null);
                      } else {
                        onSelectSection(secName);
                        onSelectChapter(null);
                      }
                    }}
                    className={`w-full text-left px-2.5 py-2 font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                      isSectionSelected
                        ? 'bg-sky-100/80 text-sky-950 border-b border-sky-200'
                        : 'hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span className="truncate pr-1">{secName}</span>
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600 shrink-0">
                      {count}
                    </span>
                  </button>

                  {/* Chapter sub items */}
                  {isSectionSelected && (
                    <div className="p-1.5 bg-white space-y-1">
                      {Object.entries(chapters).map(([chapTitle, chapCount]) => {
                        const isChapSelected = selectedChapter === chapTitle;
                        return (
                          <button
                            key={chapTitle}
                            type="button"
                            onClick={() =>
                              onSelectChapter(isChapSelected ? null : chapTitle)
                            }
                            className={`w-full text-left px-2 py-1.5 rounded text-[11px] flex items-center justify-between transition-colors cursor-pointer ${
                              isChapSelected
                                ? 'bg-sky-700 text-white font-medium'
                                : 'hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span className="truncate pr-1">{chapTitle}</span>
                            <span
                              className={`font-mono text-[10px] ${
                                isChapSelected ? 'text-sky-200' : 'text-slate-400'
                              }`}
                            >
                              {chapCount}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Practical Topic Presets */}
        <div>
          <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>實務熱門主題快搜</span>
          </div>

          <div className="grid grid-cols-1 gap-1">
            {TOPIC_PRESETS.map((topic) => {
              const Icon = topic.icon;
              const isActive = activeQuery === topic.query;
              return (
                <button
                  key={topic.name}
                  type="button"
                  onClick={() => onSelectKeyword(topic.query)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-50 text-sky-800 font-semibold border border-sky-200'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-700' : 'text-slate-400'}`} />
                  <span className="truncate">{topic.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Footer Tip */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span>桌面專業版</span>
        <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] font-mono text-slate-700 shadow-2xs">
          Ctrl+K 搜尋
        </kbd>
      </div>
    </aside>
  );
};
