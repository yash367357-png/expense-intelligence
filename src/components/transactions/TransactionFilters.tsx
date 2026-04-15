import { Search, X } from 'lucide-react';
import { useAppStore } from '../../store';
import { TransactionType } from '../../types';

export interface FilterState {
  search: string;
  type: TransactionType | 'all';
  categoryId: string;
  accountId: string;
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const TYPE_OPTIONS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
  { value: 'investment', label: 'Investment' },
];

export const defaultFilters: FilterState = {
  search: '',
  type: 'all',
  categoryId: '',
  accountId: '',
  startDate: '',
  endDate: '',
};

export default function TransactionFilters({ filters, setFilters }: TransactionFiltersProps) {
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);

  const set = <K extends keyof FilterState>(key: K, value: FilterState[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const isFiltered =
    filters.search ||
    filters.type !== 'all' ||
    filters.categoryId ||
    filters.accountId ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
      {/* Search + Clear */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search transactions..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
          {filters.search && (
            <button onClick={() => set('search', '')} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={() => setFilters(defaultFilters)}
            className="px-3 py-2 text-xs font-medium text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Type */}
        <select
          value={filters.type}
          onChange={(e) => set('type', e.target.value as TransactionType | 'all')}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Category */}
        <select
          value={filters.categoryId}
          onChange={(e) => set('categoryId', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        {/* Account */}
        <select
          value={filters.accountId}
          onChange={(e) => set('accountId', e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
        >
          <option value="">All Accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>

        {/* Date Range (stacked in 1 col) */}
        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => set('startDate', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            placeholder="From"
            title="Start date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => set('endDate', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
            placeholder="To"
            title="End date"
          />
        </div>
      </div>
    </div>
  );
}
