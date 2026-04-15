import { useMemo, useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfWeek,
  endOfWeek,
  eachWeekOfInterval,
  eachMonthOfInterval,
  parseISO,
  isWithinInterval,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';
import { formatCurrency } from '../utils/currencyUtils';

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = 'monthly' | 'weekly';

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * Map a 0-255 "heat" value to a Tailwind-compatible inline background colour.
 * Returns undefined when amount is 0 so the cell stays white.
 */
function heatColor(amount: number, max: number): string | undefined {
  if (amount === 0 || max === 0) return undefined;
  const ratio = Math.min(amount / max, 1);
  // Indigo 100 → Indigo 700 interpolation via opacity trick is not possible in
  // inline styles easily, so we use a hand-picked palette of 5 steps.
  if (ratio < 0.2) return '#e0e7ff'; // indigo-100
  if (ratio < 0.4) return '#c7d2fe'; // indigo-200
  if (ratio < 0.6) return '#a5b4fc'; // indigo-300
  if (ratio < 0.8) return '#818cf8'; // indigo-400
  return '#6366f1';                   // indigo-500
}

function textForHeat(amount: number, max: number): string {
  if (amount === 0 || max === 0) return 'text-gray-400';
  const ratio = Math.min(amount / max, 1);
  return ratio >= 0.6 ? 'text-white' : 'text-gray-900';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PeriodNavigatorProps {
  label: string;
  onPrev: () => void;
  onNext: () => void;
  disableNext?: boolean;
}

function PeriodNavigator({ label, onPrev, onNext, disableNext }: PeriodNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="text-sm font-semibold text-gray-800 min-w-[110px] text-center">
        {label}
      </span>
      <button
        onClick={onNext}
        disabled={disableNext}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ─── Monthly Report ───────────────────────────────────────────────────────────

function MonthlyReport() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories]
  );

  // Generate month objects for the selected year
  const months = useMemo(() => {
    return eachMonthOfInterval({
      start: new Date(year, 0, 1),
      end: new Date(year, 11, 31),
    });
  }, [year]);

  // Filter transactions to the selected year
  const yearTransactions = useMemo(
    () => transactions.filter((t) => t.date.startsWith(String(year))),
    [transactions, year]
  );

  // Build data matrix: monthIndex → categoryId → amount
  const matrix = useMemo(() => {
    const m: Record<number, Record<string, number>> = {};
    months.forEach((_, idx) => {
      m[idx] = {};
    });

    yearTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const monthIdx = parseISO(t.date).getMonth();
        if (!(monthIdx in m)) return;
        m[monthIdx][t.categoryId] = (m[monthIdx][t.categoryId] ?? 0) + t.amount;
      });

    return m;
  }, [yearTransactions, months]);

  // Income per month
  const incomeByMonth = useMemo(() => {
    const inc: Record<number, number> = {};
    months.forEach((_, idx) => (inc[idx] = 0));
    yearTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const idx = parseISO(t.date).getMonth();
        inc[idx] = (inc[idx] ?? 0) + t.amount;
      });
    return inc;
  }, [yearTransactions, months]);

  // Row totals (expense per month)
  const rowTotals = useMemo(
    () =>
      months.map((_, idx) =>
        expenseCategories.reduce((sum, cat) => sum + (matrix[idx][cat.id] ?? 0), 0)
      ),
    [matrix, expenseCategories, months]
  );

  // Column totals (expense per category across year)
  const colTotals = useMemo(
    () =>
      expenseCategories.map((cat) =>
        months.reduce((sum, _, idx) => sum + (matrix[idx][cat.id] ?? 0), 0)
      ),
    [matrix, expenseCategories, months]
  );

  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  // Max cell value for heat mapping
  const allCellValues = months.flatMap((_, idx) =>
    expenseCategories.map((cat) => matrix[idx][cat.id] ?? 0)
  );
  const maxCell = Math.max(...allCellValues, 1);

  const hasData = yearTransactions.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PeriodNavigator
          label={String(year)}
          onPrev={() => setYear((y) => y - 1)}
          onNext={() => setYear((y) => y + 1)}
          disableNext={year >= currentYear}
        />
        <span className="text-xs text-gray-400">
          Grand total: <span className="font-semibold text-gray-700">{formatCurrency(grandTotal)}</span>
        </span>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No data for {year}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                  Month
                </th>
                {/* Income column */}
                <th className="px-3 py-3 text-right font-semibold text-green-700 border-b border-gray-200 whitespace-nowrap bg-green-50">
                  Income
                </th>
                {expenseCategories.map((cat) => (
                  <th
                    key={cat.id}
                    className="px-3 py-3 text-right font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap"
                  >
                    <span className="flex items-center justify-end gap-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold text-gray-800 border-b border-gray-200 whitespace-nowrap bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {months.map((monthDate, idx) => {
                const monthLabel = format(monthDate, 'MMM');
                const rowTotal = rowTotals[idx];
                const income = incomeByMonth[idx] ?? 0;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/60 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {monthLabel}
                    </td>
                    {/* Income */}
                    <td className="px-3 py-2.5 text-right text-green-700 bg-green-50/40 whitespace-nowrap">
                      {income > 0 ? formatCurrency(income) : <span className="text-gray-300">—</span>}
                    </td>
                    {expenseCategories.map((cat) => {
                      const val = matrix[idx][cat.id] ?? 0;
                      const bg = heatColor(val, maxCell);
                      const fg = textForHeat(val, maxCell);
                      return (
                        <td
                          key={cat.id}
                          className={`px-3 py-2.5 text-right whitespace-nowrap transition-colors ${fg}`}
                          style={{ backgroundColor: bg }}
                        >
                          {val > 0 ? formatCurrency(val) : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800 bg-gray-50 whitespace-nowrap">
                      {rowTotal > 0 ? formatCurrency(rowTotal) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td className="sticky left-0 bg-gray-100 px-4 py-2.5 font-bold text-gray-800">
                  Total
                </td>
                {/* Income total */}
                <td className="px-3 py-2.5 text-right font-bold text-green-700 bg-green-50 whitespace-nowrap">
                  {formatCurrency(
                    months.reduce((sum, _, idx) => sum + (incomeByMonth[idx] ?? 0), 0)
                  )}
                </td>
                {colTotals.map((total, i) => (
                  <td key={i} className="px-3 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">
                    {total > 0 ? formatCurrency(total) : <span className="text-gray-400">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Weekly Report ────────────────────────────────────────────────────────────

function WeeklyReport() {
  const now = new Date();
  const [viewDate, setViewDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === 'expense' || c.type === 'both'),
    [categories]
  );

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const monthLabel = format(viewDate, 'MMMM yyyy');

  // Weeks that overlap with the month
  const weeks = useMemo(() => {
    return eachWeekOfInterval(
      { start: monthStart, end: monthEnd },
      { weekStartsOn: 1 }
    );
  }, [monthStart, monthEnd]);

  // Filter transactions to the current month
  const monthTransactions = useMemo(
    () =>
      transactions.filter((t) => {
        try {
          return isWithinInterval(parseISO(t.date), {
            start: monthStart,
            end: monthEnd,
          });
        } catch {
          return false;
        }
      }),
    [transactions, monthStart, monthEnd]
  );

  // Build matrix: weekIdx → categoryId → amount
  const matrix = useMemo(() => {
    const m: Record<number, Record<string, number>> = {};
    weeks.forEach((_, idx) => (m[idx] = {}));

    monthTransactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        const tDate = parseISO(t.date);
        weeks.forEach((weekStart, idx) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          if (isWithinInterval(tDate, { start: weekStart, end: weekEnd })) {
            m[idx][t.categoryId] = (m[idx][t.categoryId] ?? 0) + t.amount;
          }
        });
      });

    return m;
  }, [monthTransactions, weeks]);

  // Income per week
  const incomeByWeek = useMemo(() => {
    const inc: Record<number, number> = {};
    weeks.forEach((_, idx) => (inc[idx] = 0));
    monthTransactions
      .filter((t) => t.type === 'income')
      .forEach((t) => {
        const tDate = parseISO(t.date);
        weeks.forEach((weekStart, idx) => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          if (isWithinInterval(tDate, { start: weekStart, end: weekEnd })) {
            inc[idx] = (inc[idx] ?? 0) + t.amount;
          }
        });
      });
    return inc;
  }, [monthTransactions, weeks]);

  const rowTotals = useMemo(
    () =>
      weeks.map((_, idx) =>
        expenseCategories.reduce((sum, cat) => sum + (matrix[idx][cat.id] ?? 0), 0)
      ),
    [matrix, expenseCategories, weeks]
  );

  const colTotals = useMemo(
    () =>
      expenseCategories.map((cat) =>
        weeks.reduce((sum, _, idx) => sum + (matrix[idx][cat.id] ?? 0), 0)
      ),
    [matrix, expenseCategories, weeks]
  );

  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  const allCellValues = weeks.flatMap((_, idx) =>
    expenseCategories.map((cat) => matrix[idx][cat.id] ?? 0)
  );
  const maxCell = Math.max(...allCellValues, 1);

  const hasData = monthTransactions.length > 0;

  const isCurrentMonth =
    viewDate.getFullYear() === now.getFullYear() &&
    viewDate.getMonth() === now.getMonth();

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <PeriodNavigator
          label={monthLabel}
          onPrev={prevMonth}
          onNext={nextMonth}
          disableNext={isCurrentMonth}
        />
        <span className="text-xs text-gray-400">
          Month total: <span className="font-semibold text-gray-700">{formatCurrency(grandTotal)}</span>
        </span>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
          No data for {monthLabel}.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 bg-gray-50 text-left px-4 py-3 font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap">
                  Week
                </th>
                <th className="px-3 py-3 text-right font-semibold text-green-700 border-b border-gray-200 whitespace-nowrap bg-green-50">
                  Income
                </th>
                {expenseCategories.map((cat) => (
                  <th
                    key={cat.id}
                    className="px-3 py-3 text-right font-semibold text-gray-600 border-b border-gray-200 whitespace-nowrap"
                  >
                    <span className="flex items-center justify-end gap-1">
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.name}
                    </span>
                  </th>
                ))}
                <th className="px-3 py-3 text-right font-semibold text-gray-800 border-b border-gray-200 whitespace-nowrap bg-gray-100">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((weekStart, idx) => {
                const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
                const label = `${format(weekStart, 'dd MMM')} – ${format(weekEnd, 'dd MMM')}`;
                const rowTotal = rowTotals[idx];
                const income = incomeByWeek[idx] ?? 0;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-gray-50/60 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <td className="sticky left-0 bg-white px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                      {label}
                    </td>
                    <td className="px-3 py-2.5 text-right text-green-700 bg-green-50/40 whitespace-nowrap">
                      {income > 0 ? formatCurrency(income) : <span className="text-gray-300">—</span>}
                    </td>
                    {expenseCategories.map((cat) => {
                      const val = matrix[idx][cat.id] ?? 0;
                      const bg = heatColor(val, maxCell);
                      const fg = textForHeat(val, maxCell);
                      return (
                        <td
                          key={cat.id}
                          className={`px-3 py-2.5 text-right whitespace-nowrap transition-colors ${fg}`}
                          style={{ backgroundColor: bg }}
                        >
                          {val > 0 ? formatCurrency(val) : <span className="text-gray-300">—</span>}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-right font-semibold text-gray-800 bg-gray-50 whitespace-nowrap">
                      {rowTotal > 0 ? formatCurrency(rowTotal) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 border-t-2 border-gray-300">
                <td className="sticky left-0 bg-gray-100 px-4 py-2.5 font-bold text-gray-800">
                  Total
                </td>
                <td className="px-3 py-2.5 text-right font-bold text-green-700 bg-green-50 whitespace-nowrap">
                  {formatCurrency(
                    weeks.reduce((sum, _, idx) => sum + (incomeByWeek[idx] ?? 0), 0)
                  )}
                </td>
                {colTotals.map((total, i) => (
                  <td key={i} className="px-3 py-2.5 text-right font-bold text-gray-800 whitespace-nowrap">
                    {total > 0 ? formatCurrency(total) : <span className="text-gray-400">—</span>}
                  </td>
                ))}
                <td className="px-3 py-2.5 text-right font-bold text-gray-900 whitespace-nowrap">
                  {formatCurrency(grandTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
  const [tab, setTab] = useState<TabKey>('monthly');

  return (
    <div className="p-6 max-w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track spending patterns by month and week.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-6">
        {(['monthly', 'weekly'] as TabKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              tab === t
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'monthly' ? 'Monthly' : 'Weekly'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'monthly' ? <MonthlyReport /> : <WeeklyReport />}
    </div>
  );
}
