import React from 'react';
import { X, Copy, Check, Table as TableIcon } from 'lucide-react';
import { RegulationTable } from '../types';

interface TableModalProps {
  table: RegulationTable | null;
  onClose: () => void;
}

export const TableModal: React.FC<TableModalProps> = ({ table, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  if (!table) return null;

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        id="table-modal-dialog"
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-sky-600 rounded-lg text-white">
              <TableIcon className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {table.title}
              </h3>
              {table.description && (
                <p className="text-xs text-slate-300 mt-0.5">{table.description}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>複製表格文字</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Table Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                  {table.headers.map((h, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 font-semibold text-slate-800 tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {table.rows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`hover:bg-sky-50/70 transition-colors ${
                      rIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                    }`}
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`px-4 py-3 leading-relaxed ${
                          cIdx === 0 ? 'font-medium text-slate-900' : ''
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footnotes */}
          {table.footnotes && table.footnotes.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 space-y-1">
              <span className="font-semibold block mb-1">附表註解與施工說明：</span>
              {table.footnotes.map((fn, idx) => (
                <p key={idx} className="text-slate-700 leading-normal">
                  {fn}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            關閉檢視
          </button>
        </div>
      </div>
    </div>
  );
};
