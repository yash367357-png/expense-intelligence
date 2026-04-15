import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import { useAppStore } from '../store';
import AccountCard from '../components/accounts/AccountCard';
import AccountForm from '../components/accounts/AccountForm';
import EmptyState from '../components/shared/EmptyState';
import { formatCurrency } from '../utils/currencyUtils';
import { Account } from '../types';

export default function Accounts() {
  const accounts = useAppStore((s) => s.accounts);
  const [formOpen, setFormOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | undefined>(undefined);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const handleEdit = (account: Account) => {
    setEditAccount(account);
    setFormOpen(true);
  };

  const handleAdd = () => {
    setEditAccount(undefined);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditAccount(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {accounts.length} account{accounts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Account
        </button>
      </div>

      {/* Total Balance Card */}
      {accounts.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 mb-6 text-white shadow-md">
          <p className="text-blue-100 text-sm font-medium">Total Balance</p>
          <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
          <p className="text-blue-200 text-xs mt-1">Across all {accounts.length} account{accounts.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Account Grid */}
      {accounts.length === 0 ? (
        <EmptyState
          icon={<Wallet />}
          title="No accounts yet"
          description="Add your bank accounts, credit cards, cash, and wallets to start tracking your finances."
          action={{ label: 'Add Account', onClick: handleAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AccountForm isOpen={formOpen} onClose={handleClose} editAccount={editAccount} />
    </div>
  );
}
