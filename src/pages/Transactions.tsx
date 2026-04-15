import { useState, useMemo } from 'react';
import { Plus, ArrowDownCircle, ArrowUpCircle, TrendingUp, Receipt } from 'lucide-react';
import { useAppStore } from '../store';
import TransactionFilters, { FilterState, defaultFilters } from '../components/transactions/TransactionFilters';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import SplitForm from '../components/splits/SplitForm';
import EmptyState from '../components/shared/EmptyState';
import { formatCurrency } from '../utils/currencyUtils';
import { Transaction } from '../types';

export default function Transactions() {
  const transactions = useAppStore((s) => s.transactions);

  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [formOpen, setFormOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState<Transaction | undefined>(undefined);
  const [splitOpen, setSplitOpen] = useState(false);
  const [splitPrefill, setSplitPrefill] = useState<{ description: string; amount: string; date: string } | undefined>(undefined);

  const filtered = useMemo(() => {
    let list = [...transactions];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Type
    if (filters.type !== 'all') {
      list = list.filter((t) => t.type === filters.type);
    }

    // Category
    if (filters.categoryId) {
      list = list.filter((t) => t.categoryId === filters.categoryId);
    }

    // Account
    if (filters.accountId) {
      list = list.filter((t) => t.accountId === filters.accountId);
    }

    // Date range
    if (filters.startDate) {
      list = list.filter((t) => t.date.split('T')[0] >= filters.startDate);
    }
    if (filters.endDate) {
      list = list.filter((t) => t.date.split('T')[0] <= filters.endDate);
    }

    // Sort newest first
    list.sort((a, b) => b.date.localeCompare(a.date));

    return list;
  }, [transactions, filters]);

  const summary = useMemo(() => {
    let income = 0;
    let expense = 0;
    let investment = 0;
    for (const t of filtered) {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'expense') expense += t.amount;
      else if (t.type === 'investment') investment += t.amount;
    }
    return { income, expense, investment, net: income - expense - investment };
  }, [filtered]);

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditTransaction(undefined);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditTransaction(undefined);
  };

  const handleSplit = (transaction: Transaction) => {
    setSplitPrefill({
      description: transaction.description,
      amount: String(transaction.amount),
      date: transaction.date.split('T')[0],
    });
    setSplitOpen(true);
  };

  const handleSplitClose = () => {
    setSplitOpen(false);
    setSplitPrefill(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} of {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4">
        <TransactionFilters filters={filters} setFilters={setFilters} />
      </div>

      {/* Summary Bar */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle size={14} className="text-green-500" />
              <span className="text-xs text-gray-500 font-medium">Income</span>
            </div>
            <p className="text-sm font-bold text-green-600">{formatCurrency(summary.income)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle size={14} className="text-red-500" />
              <span className="text-xs text-gray-500 font-medium">Expenses</span>
            </div>
            <p className="text-sm font-bold text-red-600">{formatCurrency(summary.expense)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-blue-500" />
              <span className="text-xs text-gray-500 font-medium">Invested</span>
            </div>
            <p className="text-sm font-bold text-blue-600">{formatCurrency(summary.investment)}</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500 font-medium">Net</span>
            </div>
            <p className={`text-sm font-bold ${summary.net >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {summary.net >= 0 ? '+' : ''}{formatCurrency(summary.net)}
            </p>
          </div>
        </div>
      )}

      {/* List */}
      {transactions.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title="No transactions yet"
          description="Start tracking your income and expenses by adding your first transaction."
          action={{ label: 'Add Transaction', onClick: handleAdd }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Receipt />}
          title="No matching transactions"
          description="Try adjusting your filters to find what you're looking for."
        />
      ) : (
        <TransactionList transactions={filtered} onEdit={handleEdit} onSplit={handleSplit} />
      )}

      {/* Form Modal */}
      <TransactionForm isOpen={formOpen} onClose={handleClose} editTransaction={editTransaction} />
      <SplitForm isOpen={splitOpen} onClose={handleSplitClose} prefill={splitPrefill} />
    </div>
  );
}
