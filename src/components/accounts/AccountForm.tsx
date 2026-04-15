import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useAppStore } from '../../store';
import { Account, AccountType } from '../../types';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  editAccount?: Account;
}

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'wallet', label: 'Wallet' },
];

const PRESET_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

const defaultForm = {
  name: '',
  type: 'bank' as AccountType,
  color: PRESET_COLORS[0],
  balance: '',
};

export default function AccountForm({ isOpen, onClose, editAccount }: AccountFormProps) {
  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (editAccount) {
        setForm({
          name: editAccount.name,
          type: editAccount.type,
          color: editAccount.color,
          balance: String(editAccount.balance),
        });
      } else {
        setForm(defaultForm);
      }
      setErrors({});
    }
  }, [isOpen, editAccount]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (form.balance === '' || isNaN(Number(form.balance)))
      errs.balance = 'Enter a valid balance.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const now = new Date().toISOString();

    if (editAccount) {
      updateAccount(editAccount.id, {
        name: form.name.trim(),
        type: form.type,
        color: form.color,
        balance: Number(form.balance),
      });
    } else {
      addAccount({
        id: crypto.randomUUID(),
        name: form.name.trim(),
        type: form.type,
        color: form.color,
        balance: Number(form.balance),
        createdAt: now,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editAccount ? 'Edit Account' : 'Add Account'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. HDFC Savings"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as AccountType }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color
          </label>
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm((f) => ({ ...f, color }))}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: color,
                  borderColor: form.color === color ? '#1F2937' : 'transparent',
                  transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Balance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {editAccount ? 'Balance' : 'Initial Balance'}
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
              ₹
            </span>
            <input
              type="number"
              value={form.balance}
              onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
              placeholder="0"
              min="0"
              step="0.01"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          {errors.balance && <p className="mt-1 text-xs text-red-500">{errors.balance}</p>}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editAccount ? 'Save Changes' : 'Add Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
