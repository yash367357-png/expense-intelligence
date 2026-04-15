import { useRef, useState } from 'react';
import { Download, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useExcelIO } from '../../hooks/useExcelIO';

interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

export default function ExcelPanel() {
  const { exportToExcel, importFromExcel } = useExcelIO();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    const res = await importFromExcel(file);
    setResult(res);
    setImporting(false);

    // Reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function clearResult() {
    setResult(null);
  }

  return (
    <div className="space-y-6">
      {/* Export */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Export Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Download all your transactions and split expenses as an Excel file.
        </p>
        <button
          onClick={exportToExcel}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Download size={16} />
          Export to Excel
        </button>
      </div>

      {/* Import */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Import Data</h3>
        <p className="text-sm text-gray-500 mb-4">
          Import transactions from an Excel file. The file must contain a{' '}
          <span className="font-medium text-gray-700">Transactions</span> sheet with
          columns: Date, Type, Amount, Category, Account, Description, Tags.
        </p>

        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <Upload size={16} />
          {importing ? 'Importing…' : 'Choose File (.xlsx / .xls)'}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
            disabled={importing}
          />
        </label>

        {/* Result Banner */}
        {result && (
          <div
            className={`mt-4 rounded-xl border p-4 relative ${
              result.success && result.errors.length === 0
                ? 'bg-green-50 border-green-200'
                : result.imported > 0
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <button
              onClick={clearResult}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>

            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle size={18} className="text-green-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              )}
              <div className="text-sm">
                {result.imported > 0 && (
                  <p className="font-medium text-gray-800">
                    {result.imported} transaction{result.imported !== 1 ? 's' : ''}{' '}
                    imported successfully.
                  </p>
                )}
                {!result.success && result.imported === 0 && (
                  <p className="font-medium text-red-700">Import failed.</p>
                )}
                {result.errors.length > 0 && (
                  <ul className="mt-1 space-y-0.5 text-gray-600">
                    {result.errors.map((err, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-yellow-500 shrink-0">•</span>
                        {err}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
