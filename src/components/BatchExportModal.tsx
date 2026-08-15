import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  FileText,
  Bookmark,
  Search,
  BookOpen,
  Layers
} from 'lucide-react';
import { RegulationArticle, ExportFormat } from '../types';
import { LAW_PCODE, LAW_TITLE } from '../data/regulationsData';

interface BatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: RegulationArticle[];
  allArticles: RegulationArticle[];
  bookmarkedIds: Set<string>;
}

export const BatchExportModal: React.FC<BatchExportModalProps> = ({
  isOpen,
  onClose,
  searchResults,
  allArticles,
  bookmarkedIds
}) => {
  const [sourceType, setSourceType] = useState<'search' | 'bookmarks' | 'all'>('search');
  const [format, setFormat] = useState<ExportFormat>('markdown');
  const [copied, setCopied] = useState(false);

  // Target articles for export
  const targetArticles = useMemo(() => {
    switch (sourceType) {
      case 'bookmarks':
        return allArticles.filter((art) => bookmarkedIds.has(art.id));
      case 'all':
        return allArticles;
      case 'search':
      default:
        return searchResults;
    }
  }, [sourceType, searchResults, allArticles, bookmarkedIds]);

  // Generate Export String
  const generatedContent = useMemo(() => {
    if (targetArticles.length === 0) {
      return '（無選定條文可供匯出）';
    }

    const timestamp = new Date().toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    if (format === 'markdown') {
      let md = `# 中華民國《${LAW_TITLE}》法規檢討與佐證報告\n\n`;
      md += `* **法規識別碼 (PCode)**: ${LAW_PCODE}\n`;
      md += `* **資料來源**: 中華民國全國法規資料庫 (MOJ)\n`;
      md += `* **產生日製**: ${timestamp}\n`;
      md += `* **條文總數**: 共 ${targetArticles.length} 條\n\n`;
      md += `---\n\n`;

      targetArticles.forEach((art, idx) => {
        md += `### ${idx + 1}. ${art.articleNumber} ${art.title ? `(${art.title})` : ''}\n\n`;
        md += `* **編章體系**: ${art.section} > ${art.chapter}\n`;
        md += `* **官方連結**: [全國法規資料庫此條頁面](${art.mojUrl})\n`;
        if (art.lastAmended) md += `* **最後修正**: ${art.lastAmended}\n`;
        md += `\n**條文內容**:\n\`\`\`\n${art.content}\n\`\`\`\n\n`;

        if (art.tables && art.tables.length > 0) {
          art.tables.forEach((t) => {
            md += `#### 【法定附表】${t.title}\n\n`;
            if (t.description) md += `*說明: ${t.description}*\n\n`;
            md += `| ${t.headers.join(' | ')} |\n`;
            md += `| ${t.headers.map(() => '---').join(' | ')} |\n`;
            t.rows.forEach((r) => {
              md += `| ${r.join(' | ')} |\n`;
            });
            if (t.footnotes) {
              md += `\n${t.footnotes.join('\n\n')}\n`;
            }
            md += `\n`;
          });
        }
        md += `---\n\n`;
      });
      return md;
    } else if (format === 'text') {
      let txt = `=======================================================\n`;
      txt += `  中華民國《${LAW_TITLE}》法規佐證引用清單\n`;
      txt += `  全國法規資料庫 PCode: ${LAW_PCODE}\n`;
      txt += `  產生日期: ${timestamp} | 條文共 ${targetArticles.length} 條\n`;
      txt += `=======================================================\n\n`;

      targetArticles.forEach((art, idx) => {
        txt += `[${idx + 1}] ${art.section} ${art.chapter} ${art.articleNumber} ${art.title || ''}\n`;
        txt += `連結: ${art.mojUrl}\n`;
        txt += `內文:\n${art.content}\n\n`;
        txt += `-------------------------------------------------------\n\n`;
      });
      return txt;
    } else if (format === 'html') {
      let html = `<div style="font-family: sans-serif; max-width: 800px; margin: auto; padding: 20px;">\n`;
      html += `  <h1 style="color: #075985; border-bottom: 2px solid #075985; padding-bottom: 8px;">${LAW_TITLE} 法規佐證報告</h1>\n`;
      html += `  <p style="color: #64748b; font-size: 14px;">來源：全國法規資料庫 (PCode: ${LAW_PCODE}) | 匯出日期：${timestamp}</p>\n`;

      targetArticles.forEach((art) => {
        html += `  <div style="margin-bottom: 24px; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px;">\n`;
        html += `    <h2 style="margin-top: 0; color: #0f172a;">${art.articleNumber} ${art.title || ''} <span style="font-size: 12px; color: #0284c7;">(${art.section})</span></h2>\n`;
        html += `    <pre style="white-space: pre-wrap; font-family: inherit; font-size: 14px; line-height: 1.6; color: #334155;">${art.content}</pre>\n`;
        html += `    <p style="font-size: 12px; margin-bottom: 0;"><a href="${art.mojUrl}" target="_blank" style="color: #0284c7;">全國法規資料庫官方條文連結</a></p>\n`;
        html += `  </div>\n`;
      });
      html += `</div>`;
      return html;
    }
    return '';
  }, [targetArticles, format]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy export content:', err);
    }
  };

  const handleDownload = () => {
    const ext = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : 'html';
    const mime = format === 'markdown' ? 'text/markdown' : format === 'text' ? 'text/plain' : 'text/html';
    const blob = new Blob([generatedContent], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `建築技術規則佐證檢討報告_${new Date().toISOString().slice(0, 10)}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div
        id="batch-export-modal"
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-600 rounded-lg text-white">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                批量法規佐證與報告匯出工具
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                匯出標準建築法規佐證引用文本、Markdown 報告或供列印使用
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Source Selection */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">匯出範圍：</span>
            <div className="flex items-center bg-white rounded-lg border border-slate-300 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setSourceType('search')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sourceType === 'search'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                當前檢索條文 ({searchResults.length})
              </button>
              <button
                type="button"
                onClick={() => setSourceType('bookmarks')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sourceType === 'bookmarks'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                已收藏條文 ({bookmarkedIds.size})
              </button>
              <button
                type="button"
                onClick={() => setSourceType('all')}
                className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sourceType === 'all'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                全部條文 ({allArticles.length})
              </button>
            </div>
          </div>

          {/* Format Selection */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">格式：</span>
            <div className="flex items-center bg-white rounded-lg border border-slate-300 p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setFormat('markdown')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  format === 'markdown'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Markdown (.md)
              </button>
              <button
                type="button"
                onClick={() => setFormat('text')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  format === 'text'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                純文字 (.txt)
              </button>
              <button
                type="button"
                onClick={() => setFormat('html')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  format === 'html'
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HTML
              </button>
            </div>
          </div>
        </div>

        {/* Content Preview Box */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 bg-slate-900 text-slate-100 font-mono text-xs custom-scrollbar">
          <pre className="whitespace-pre-wrap font-sans leading-relaxed selection:bg-sky-600">
            {generatedContent}
          </pre>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-slate-500">
            共選定 <strong>{targetArticles.length}</strong> 條規範
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>列印 / 輸出 PDF</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-lg border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載檔案</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>已複製到剪貼簿</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>一鍵複製內容</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
