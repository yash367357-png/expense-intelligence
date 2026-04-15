import { useState } from 'react';
import { ChevronDown, ChevronUp, Pencil, Trash2, CheckCheck, RotateCcw } from 'lucide-react';
import { SplitExpense } from '../../types';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/dateUtils';
import LucideIcon from '../shared/LucideIcon';

interface SplitCardProps {
  split: SplitExpense;
  onEdit: (split: SplitExpense) => void;
  onDelete: (split: SplitExpense) => void;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function SplitCard({ split, onEdit, onDelete }: SplitCardProps) {
  const friends = useAppStore((s) => s.friends);
  const categories = useAppStore((s) => s.categories);
  const updateSplitExpense = useAppStore((s) => s.updateSplitExpense);
  const [expanded, setExpanded] = useState(false);

  const toggleSettled = () => updateSplitExpense(split.id, { settled: !split.settled });

  const category = categories.find((c) => c.id === split.categoryId);
  const paidByLabel = split.paidBy === 'self' ? 'You' : (friends.find((f) => f.id === split.paidBy)?.name ?? 'Unknown');

  const getPersonLabel = (personId: string) =>
    personId === 'self' ? 'You' : (friends.find((f) => f.id === personId)?.name ?? 'Unknown');
  const getPersonColor = (personId: string) =>
    personId === 'self' ? 'bg-blue-500' : (friends.find((f) => f.id === personId)?.avatarColor ?? 'bg-gray-400');

  const splitTypeLabel: Record<string, string> = {
    equal: 'Equal',
    percentage: 'Percentage',
    amount: 'Custom',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      {/* Main row */}
      <div className="flex items-center gap-3 p-4">
        {/* Category icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: category?.color ? category.color + '22' : '#e5e7eb' }}
        >
          {category?.icon ? (
            <LucideIcon name={category.icon} size={18} color={category.color} />
          ) : (
            <span className="text-lg">💸</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{split.description}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {formatDate(split.date)} · Paid by {paidByLabel} · {split.participants.length} people
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(split.totalAmount)}</p>
              <span
                className={`inline-block mt-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  split.settled
                    ? 'bg-green-100 text-green-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {split.settled ? 'Settled' : 'Unsettled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div className="flex items-center justify-between px-4 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {splitTypeLabel[split.splitType] ?? split.splitType}
          </span>
          {category && (
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {category.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleSettled}
            title={split.settled ? 'Mark as unsettled' : 'Mark as settled'}
            className={`p-1.5 rounded-lg transition-colors ${
              split.settled
                ? 'text-green-600 hover:text-amber-600 hover:bg-amber-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            {split.settled ? <RotateCcw size={14} /> : <CheckCheck size={14} />}
          </button>
          <button
            onClick={() => onEdit(split)}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            aria-label="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(split)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded participant breakdown */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 mb-2">Participant Breakdown</p>
          {split.participants.map((p) => {
            const label = getPersonLabel(p.personId);
            const color = getPersonColor(p.personId);
            return (
              <div key={p.personId} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${color}`}
                >
                  {getInitials(label)}
                </div>
                <span className="flex-1 text-sm text-gray-700">{label}</span>
                {p.sharePercentage !== undefined && (
                  <span className="text-xs text-gray-400">{p.sharePercentage}%</span>
                )}
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(p.shareAmount)}
                </span>
                {p.paid && (
                  <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full">
                    Paid
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
