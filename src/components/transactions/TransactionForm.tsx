import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { useAppStore } from '../../store';
import { Transaction, TransactionType } from '../../types';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  editTransaction?: Transaction;
}

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'expense', label: 'Expense', color: 'bg-red-100 text-red-700 border-red-300' },
  { value: 'income', label: 'Income', color: 'bg-green-100 text-green-700 border-green-300' },
  { value: 'investment', label: 'Investment', color: 'bg-blue-100 text-blue-700 border-blue-300' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

const defaultForm = {
  type: 'expense' as TransactionType,
  amount: '',
  categoryId: '',
  accountId: '',
  description: '',
  date: todayStr(),
};

export default function TransactionForm({ isOpen, onClose, editTransaction }: TransactionFormProps) {
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filtered categories based on type
  const filteredCategories = categories.filter(
    (c) => c.type === form.type || c.type === 'both'
  );

  useEffect(() => {
    if (isOpen) {
      if (editTransaction) {
        setForm({
          type: editTransaction.type,
          amount: String(editTransaction.amount),
          categoryId: editTransaction.categoryId,
          accountId: editTransaction.accountId,
          description: editTransaction.description,
          date: editTransaction.date.split('T')[0],
        });
      } else {
        setForm({ ...defaultForm, date: todayStr() });
      }
      setErrors({});
    }
  }, [isOpen, editTransaction]);

  // Reset category when type changes (if the current category is not valid for new type)
  useEffect(() => {
    const valid = categories.find(
      (c) => c.id === form.categoryId && (c.type === form.type || c.type === 'both')
    );
    if (!valid) {
      setForm((f) => ({ ...f, categoryId: '' }));
    }
  }, [form.type, categories]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      errs.amount = 'Enter a valid amount greater than 0.';
    if (!form.categoryId) errs.categoryId = 'Please select a category.';
    if (!form.accountId) errs.accountId = 'Please select an account.';
    if (!form.date) errs.date = 'Please select a date.';
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

    if (editTransaction) {
      updateTransaction(editTransaction.id, {
        type: form.type,
        amount: Number(form.amount),
        categoryId: form.categoryId,
        accountId: form.accountId,
        description: form.description.trim(),
        date: form.date,
        updatedAt: now,
      });
    } else {
      addTransaction({
        id: crypto.randomUUID(),
        type: form.type,
        amount: Number(form.amount),
        categoryId: form.categoryId,
        accountId: form.accountId,
        description: form.description.trim(),
        date: form.date,
        tags: [],
        createdAt: now,
        updatedAt: now,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editTransaction ? 'Edit Transaction' : 'Add Transaction'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                  form.type === opt.value
                    ? opt.color + ' border-current font-semibold'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">₹</span>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0"
              min="0.01"
              step="0.01"
              className="flex-1 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select category</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Account */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
          <select
            value={form.accountId}
            onChange={(e) => setForm((f) => ({ ...f, accountId: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select account</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.accountId && <p className="mt-1 text-xs text-red-500">{errors.accountId}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="e.g. Grocery shopping"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
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
            {editTransaction ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
