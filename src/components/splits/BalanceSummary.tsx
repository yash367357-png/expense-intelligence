import { CheckCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import { useSplitBalances } from '../../hooks/useSplitBalances';
import { formatCurrency } from '../../utils/currencyUtils';

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

interface BalanceSummaryProps {
  onSettleUp: (friendId: string) => void;
}

export default function BalanceSummary({ onSettleUp }: BalanceSummaryProps) {
  const friends = useAppStore((s) => s.friends);
  const { balances, totalOwedToYou, totalYouOwe } = useSplitBalances();

  const allSettled = balances.size === 0;

  // Build list: friends who have a non-zero balance
  const rows = friends
    .map((f) => ({ friend: f, balance: balances.get(f.id) ?? 0 }))
    .filter((r) => r.balance !== 0);

  if (allSettled) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CheckCircle size={48} className="text-green-400 mb-3" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-gray-700">All settled up!</h3>
        <p className="text-sm text-gray-400 mt-1">No outstanding balances with any friends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Summary totals */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-3">
          <p className="text-xs text-green-600 font-medium">Owed to you</p>
          <p className="text-lg font-bold text-green-700 mt-0.5">{formatCurrency(totalOwedToYou)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-xl p-3">
          <p className="text-xs text-red-600 font-medium">You owe</p>
          <p className="text-lg font-bold text-red-700 mt-0.5">{formatCurrency(totalYouOwe)}</p>
        </div>
      </div>

      {/* Per-friend rows */}
      <div className="space-y-2">
        {rows.map(({ friend, balance }) => {
          const owesYou = balance > 0;
          return (
            <div
              key={friend.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 ${friend.avatarColor}`}
              >
                {getInitials(friend.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{friend.name}</p>
                <p className={`text-xs font-medium ${owesYou ? 'text-green-600' : 'text-red-500'}`}>
                  {owesYou
                    ? `Owes you ${formatCurrency(Math.abs(balance))}`
                    : `You owe ${formatCurrency(Math.abs(balance))}`}
                </p>
              </div>
              <button
                onClick={() => onSettleUp(friend.id)}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                Settle Up
              </button>
            </div>
          );
        })}
      </div>

      {/* Net row */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mt-3">
        <span className="text-sm font-medium text-gray-600">Net balance</span>
        <span
          className={`text-sm font-bold ${
            totalOwedToYou >= totalYouOwe ? 'text-green-700' : 'text-red-600'
          }`}
        >
          {totalOwedToYou >= totalYouOwe
            ? `+${formatCurrency(totalOwedToYou - totalYouOwe)}`
            : `-${formatCurrency(totalYouOwe - totalOwedToYou)}`}
        </span>
      </div>
    </div>
  );
}
