import { Pencil, Trash2, CreditCard, Banknote, Wallet, Building2 } from 'lucide-react';
import { Account, AccountType } from '../../types';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
}

const TYPE_LABELS: Record<AccountType, string> = {
  bank: 'Bank',
  credit_card: 'Credit Card',
  cash: 'Cash',
  wallet: 'Wallet',
};

const TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  bank: <Building2 size={16} />,
  credit_card: <CreditCard size={16} />,
  cash: <Banknote size={16} />,
  wallet: <Wallet size={16} />,
};

export default function AccountCard({ account, onEdit }: AccountCardProps) {
  const deleteAccount = useAppStore((s) => s.deleteAccount);

  const handleDelete = () => {
    if (window.confirm(`Delete "${account.name}"? This cannot be undone.`)) {
      deleteAccount(account.id);
    }
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderLeftColor: account.color, borderLeftWidth: 4 }}
    >
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{account.name}</h3>
            <span
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${account.color}1A`,
                color: account.color,
              }}
            >
              {TYPE_ICONS[account.type]}
              {TYPE_LABELS[account.type]}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(account)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Edit account"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Delete account"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400 mb-0.5">Balance</p>
          <p
            className="text-xl font-bold"
            style={{ color: account.balance >= 0 ? '#111827' : '#EF4444' }}
          >
            {formatCurrency(account.balance)}
          </p>
        </div>
      </div>
    </div>
  );
}
