import React from 'react';
import { Users } from 'lucide-react';
import { useSplitBalances } from '../../hooks/useSplitBalances';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';

export default function OutstandingBalances() {
  const friends = useAppStore((s) => s.friends);
  const { balances, totalOwedToYou, totalYouOwe } = useSplitBalances();

  const entries = Array.from(balances.entries()).map(([friendId, amount]) => {
    const friend = friends.find((f) => f.id === friendId);
    return { friendId, name: friend?.name ?? 'Unknown', amount };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-gray-500" />
        <h3 className="text-base font-semibold text-gray-700">Outstanding Balances</h3>
      </div>

      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-2xl mb-1">🎉</div>
            <p className="text-gray-500 text-sm font-medium">All settled up!</p>
          </div>
        </div>
      ) : (
        <>
          <ul className="flex flex-col divide-y divide-gray-100">
            {entries.map(({ friendId, name, amount }) => (
              <li key={friendId} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-700 font-medium">{name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {amount > 0 ? `+${formatCurrency(amount)}` : `-${formatCurrency(Math.abs(amount))}`}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {amount > 0 ? 'owes you' : 'you owe'}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">Owed to you</p>
              <p className="text-sm font-bold text-green-700">{formatCurrency(totalOwedToYou)}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-3 py-2">
              <p className="text-xs text-gray-500 mb-0.5">You owe</p>
              <p className="text-sm font-bold text-red-600">{formatCurrency(totalYouOwe)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
