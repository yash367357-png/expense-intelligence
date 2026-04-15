import { Pencil, Trash2, Users } from 'lucide-react';
import { Transaction } from '../../types';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import CategoryBadge from '../shared/CategoryBadge';

interface TransactionRowProps {
  transaction: Transaction;
  onEdit: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function TransactionRow({ transaction, onEdit, onSplit }: TransactionRowProps) {
  const deleteTransaction = useAppStore((s) => s.deleteTransaction);
  const accounts = useAppStore((s) => s.accounts);

  const account = accounts.find((a) => a.id === transaction.accountId);

  const amountColor =
    transaction.type === 'expense'
      ? 'text-red-600'
      : transaction.type === 'income'
      ? 'text-green-600'
      : 'text-blue-600';

  const amountPrefix = transaction.type === 'expense' ? '−' : '+';

  const handleDelete = () => {
    if (window.confirm('Delete this transaction? This cannot be undone.')) {
      deleteTransaction(transaction.id);
    }
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors group">
      {/* Left: date + description + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transaction.description || 'No description'}
          </p>
          <CategoryBadge categoryId={transaction.categoryId} />
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400">{formatDisplayDate(transaction.date)}</span>
          {account && (
            <>
              <span className="text-gray-300 text-xs">·</span>
              <span
                className="text-xs font-medium px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${account.color}1A`,
                  color: account.color,
                }}
              >
                {account.name}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: amount + actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-sm font-semibold ${amountColor}`}>
          {amountPrefix}{formatCurrency(transaction.amount)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSplit(transaction)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            aria-label="Split transaction"
            title="Split expense"
          >
            <Users size={14} />
          </button>
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            aria-label="Edit transaction"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            aria-label="Delete transaction"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
