import React, { useState } from 'react';
import { Table as TableIcon, Copy, Check, Info, Maximize2, Search } from 'lucide-react';
import { RegulationTable } from '../types';
import { getHighlightedParts } from '../utils/searchEngine';

interface BeautifiedTableProps {
  table: RegulationTable;
  searchQuery?: string;
  onExpandModal?: (table: RegulationTable) => void;
}

export const BeautifiedTable: React.FC<BeautifiedTableProps> = ({
  table,
  searchQuery = '',
  onExpandModal
}) => {
  const [copied, setCopied] = useState(false);
  const [tableFilter, setTableFilter] = useState('');

  // Copy table to clipboard as Markdown
  const handleCopyMarkdown = async () => {
    const headerRow = `| ${table.headers.join(' | ')} |`;
    const dividerRow = `| ${table.headers.map(() => '---').join(' | ')} |`;
    const bodyRows = table.rows.map((row) => `| ${row.join(' | ')} |`).join('\n');
    const footnotes = table.footnotes ? '\n\n' + table.footnotes.join('\n') : '';
    const markdown = `### ${table.title}\n\n${headerRow}\n${dividerRow}\n${bodyRows}${footnotes}`;

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy table:', err);
    }
  };

  // Filter rows based on internal table filter
  const filteredRows = table.rows.filter((row) => {
    if (!tableFilter.trim()) return true;
    const q = tableFilter.toLowerCase();
    return row.some((cell) => cell.toLowerCase().includes(q));
  });

  const renderCellContent = (cell: string) => {
    const effectiveQuery = (tableFilter || searchQuery || '').trim();
    const parts = getHighlightedParts(cell, effectiveQuery);

    // If text contains numbers with units (e.g. 140 以上, 2.50 公尺, 1 小時, 1:6, 200 kgf/m2), add styling
    const isDimension = /\d+(\.\d+)?\s*(公分|公尺|小時|kgf|kN|%|度|以上|以下|間|席|具)/.test(cell);

    return (
      <span className={isDimension ? 'font-mono' : ''}>
        {parts.map((p, idx) =>
          p.isMatch ? (
            <mark
              key={idx}
              className="bg-amber-200 text-amber-950 font-semibold px-1 rounded-xs"
            >
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
    <div className="my-4 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
      {/* Table Header Bar */}
      <div className="bg-slate-800 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-sky-600 rounded text-white">
            <TableIcon className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-sm font-bold text-slate-100">{table.title}</h4>
            {table.description && (
              <p className="text-xs text-slate-300">{table.description}</p>
            )}
          </div>
        </div>

        {/* Table Action Controls */}
        <div className="flex items-center gap-2">
          {/* Quick filter in table */}
          <div className="relative">
            <input
              type="text"
              value={tableFilter}
              onChange={(e) => setTableFilter(e.target.value)}
              placeholder="表內即時篩選..."
              className="pl-7 pr-2 py-1 text-xs bg-slate-700/80 border border-slate-600 rounded-md text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400 w-32 sm:w-36"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-700 hover:bg-slate-600 rounded-md text-slate-200 transition-colors"
            title="複製 Markdown 格式表格"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300">已複製</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>複製表格</span>
              </>
            )}
          </button>

          {onExpandModal && (
            <button
              type="button"
              onClick={() => onExpandModal(table)}
              className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="展開全螢幕檢視"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Data Matrix */}
      <div className="overflow-x-auto max-h-[460px] scrollbar-thin">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
              {table.headers.map((header, idx) => (
                <th
                  key={idx}
                  className="px-4 py-3 font-semibold text-slate-800 tracking-wider whitespace-nowrap"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredRows.length > 0 ? (
              filteredRows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={`hover:bg-sky-50/70 transition-colors ${
                    rIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className={`px-4 py-2.5 leading-relaxed ${
                        cIdx === 0 ? 'font-medium text-slate-900' : ''
                      }`}
                    >
                      {renderCellContent(cell)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={table.headers.length}
                  className="px-4 py-6 text-center text-slate-600 italic bg-slate-50"
                >
                  查無符合「{tableFilter}」之表格項目
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footnotes */}
      {table.footnotes && table.footnotes.length > 0 && (
        <div className="bg-amber-50/70 border-t border-amber-200/60 p-3 text-xs text-amber-900 space-y-1">
          <div className="flex items-center gap-1 font-semibold text-amber-900 mb-1">
            <Info className="w-3.5 h-3.5" />
            <span>法規附表註解與施工說明：</span>
          </div>
          {table.footnotes.map((fn, idx) => (
            <p key={idx} className="pl-4 text-slate-700 leading-normal">
              {fn}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};
