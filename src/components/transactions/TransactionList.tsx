import { Transaction } from '../../types';
import TransactionRow from './TransactionRow';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onSplit: (transaction: Transaction) => void;
}

function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (sameDay(date, today)) return 'Today';
  if (sameDay(date, yesterday)) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function TransactionList({ transactions, onEdit, onSplit }: TransactionListProps) {
  // Group transactions by date (YYYY-MM-DD)
  const groups = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const key = t.date.split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  // Sort date keys descending
  const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-4">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* Date header */}
          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {formatGroupDate(dateKey)}
            </span>
          </div>

          {/* Transactions for this date */}
          <div className="divide-y divide-gray-50">
            {groups[dateKey].map((transaction) => (
              <TransactionRow
                key={transaction.id}
                transaction={transaction}
                onEdit={onEdit}
                onSplit={onSplit}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
