import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const SHORTCUTS = [
    { key: 'Ctrl + K  /  /', desc: '快速聚焦關鍵字檢索框' },
    { key: 'Ctrl + B', desc: '切換側邊導航欄 展開 / 收合' },
    { key: 'Ctrl + 1', desc: '切換至「雙欄分屏對照模式」（推薦）' },
    { key: 'Ctrl + 2', desc: '切換至「標準卡片瀑布流模式」' },
    { key: 'Ctrl + 3', desc: '切換至「高密度總覽清單模式」' },
    { key: '[  /  ]', desc: '雙欄模式下切換 上一條 / 下一條 條文' },
    { key: 'Esc', desc: '關閉所有彈出視窗、側邊欄或清除搜尋' },
    { key: 'Ctrl + P', desc: '啟用桌面列印友好排版 / 匯出 PDF' },
    { key: '?', desc: '開啟 / 關閉本快捷鍵指南' }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        id="shortcuts-modal"
        className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-bold text-white">桌面版鍵盤快捷鍵指南</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-4 sm:p-5 divide-y divide-slate-100 text-xs">
          {SHORTCUTS.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
              <span className="text-slate-700 font-medium">{item.desc}</span>
              <kbd className="px-2.5 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-[11px] font-bold text-slate-800 shadow-2xs shrink-0">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer"
          >
            了解並關閉
          </button>
        </div>
      </div>
    </div>
  );
};
