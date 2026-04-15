import { useState, useEffect, useCallback } from 'react';
import { SplitExpense, SplitType, SplitParticipant } from '../../types';
import { useAppStore } from '../../store';
import { calculateSplit } from '../../utils/splitCalculator';
import { formatCurrency } from '../../utils/currencyUtils';
import Modal from '../shared/Modal';

interface SplitFormProps {
  isOpen: boolean;
  onClose: () => void;
  editSplit?: SplitExpense;
  prefill?: { description: string; amount: string; date: string };
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function SplitForm({ isOpen, onClose, editSplit, prefill }: SplitFormProps) {
  const friends = useAppStore((s) => s.friends);
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);
  const addSplitExpense = useAppStore((s) => s.addSplitExpense);
  const updateSplitExpense = useAppStore((s) => s.updateSplitExpense);

  const expenseCategories = categories.filter((c) => c.type === 'expense' || c.type === 'both');

  const today = new Date().toISOString().slice(0, 10);

  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [date, setDate] = useState(today);
  const [categoryId, setCategoryId] = useState('');
  const [paidBy, setPaidBy] = useState('self');
  const [accountId, setAccountId] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set(['self']));
  const [splitType, setSplitType] = useState<SplitType>('equal');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(() => {
    if (editSplit) {
      setDescription(editSplit.description);
      setTotalAmount(String(editSplit.totalAmount));
      setDate(editSplit.date);
      setCategoryId(editSplit.categoryId);
      setPaidBy(editSplit.paidBy);
      setAccountId(editSplit.accountId ?? '');
      const parts = new Set(editSplit.participants.map((p) => p.personId));
      setSelectedParticipants(parts);
      setSplitType(editSplit.splitType);
      const cv: Record<string, string> = {};
      for (const p of editSplit.participants) {
        if (editSplit.splitType === 'percentage') {
          cv[p.personId] = String(p.sharePercentage ?? '');
        } else if (editSplit.splitType === 'amount') {
          cv[p.personId] = String(p.shareAmount);
        }
      }
      setCustomValues(cv);
    } else {
      setDescription(prefill?.description ?? '');
      setTotalAmount(prefill?.amount ?? '');
      setDate(prefill?.date ?? today);
      setCategoryId(expenseCategories[0]?.id ?? '');
      setPaidBy('self');
      setAccountId('');
      setSelectedParticipants(new Set(['self']));
      setSplitType('equal');
      setCustomValues({});
    }
    setErrors({});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editSplit, isOpen]);

  useEffect(() => {
    if (isOpen) reset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const participantList = [
    { id: 'self', label: 'You' },
    ...friends.map((f) => ({ id: f.id, label: f.name })),
  ];

  const selectedList = participantList.filter((p) => selectedParticipants.has(p.id));

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const total = parseFloat(totalAmount) || 0;

  const computedPreview = (): SplitParticipant[] | null => {
    if (selectedList.length < 2 || total <= 0) return null;
    try {
      const ids = selectedList.map((p) => p.id);
      if (splitType === 'equal') {
        return calculateSplit(total, ids, 'equal');
      }
      const cv: Record<string, number> = {};
      for (const id of ids) {
        cv[id] = parseFloat(customValues[id] ?? '0') || 0;
      }
      return calculateSplit(total, ids, splitType, cv);
    } catch {
      return null;
    }
  };

  const preview = computedPreview();

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!description.trim()) errs.description = 'Description is required.';
    if (!total || total <= 0) errs.totalAmount = 'Enter a valid amount.';
    if (!date) errs.date = 'Date is required.';
    if (!categoryId) errs.categoryId = 'Select a category.';
    if (paidBy === 'self' && !accountId) errs.accountId = 'Select an account.';
    if (selectedList.length < 2) errs.participants = 'Select at least 2 participants.';
    if (splitType === 'percentage') {
      const sum = selectedList.reduce((s, p) => s + (parseFloat(customValues[p.id] ?? '0') || 0), 0);
      if (Math.round(sum) !== 100) errs.customValues = `Percentages must sum to 100 (currently ${sum.toFixed(1)}).`;
    }
    if (splitType === 'amount') {
      const sum = selectedList.reduce((s, p) => s + (parseFloat(customValues[p.id] ?? '0') || 0), 0);
      if (Math.abs(sum - total) > 0.01) errs.customValues = `Amounts must sum to ${formatCurrency(total)} (currently ${formatCurrency(sum)}).`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const ids = selectedList.map((p) => p.id);
    let cv: Record<string, number> | undefined;
    if (splitType !== 'equal') {
      cv = {};
      for (const id of ids) {
        cv[id] = parseFloat(customValues[id] ?? '0') || 0;
      }
    }
    const participants = calculateSplit(total, ids, splitType, cv);

    if (editSplit) {
      updateSplitExpense(editSplit.id, {
        description: description.trim(),
        totalAmount: total,
        date,
        categoryId,
        paidBy,
        accountId: paidBy === 'self' ? accountId : undefined,
        participants,
        splitType,
        settled: editSplit.settled,
      });
    } else {
      const newSplit: SplitExpense = {
        id: `split_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        description: description.trim(),
        totalAmount: total,
        date,
        categoryId,
        paidBy,
        accountId: paidBy === 'self' ? accountId : undefined,
        participants,
        splitType,
        settled: false,
        createdAt: new Date().toISOString(),
      };
      addSplitExpense(newSplit);
    }
    onClose();
  };

  const labelFor = (id: string) => (id === 'self' ? 'You' : (friends.find((f) => f.id === id)?.name ?? id));
  const colorFor = (id: string) => (id === 'self' ? 'bg-blue-500' : (friends.find((f) => f.id === id)?.avatarColor ?? 'bg-gray-400'));

  const splitTypes: { type: SplitType; label: string }[] = [
    { type: 'equal', label: 'Equal' },
    { type: 'percentage', label: 'Percentage' },
    { type: 'amount', label: 'Amount' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editSplit ? 'Edit Split Expense' : 'New Split Expense'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
          <input
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-400' : 'border-gray-300'}`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Dinner at restaurant"
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
              <input
                className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.totalAmount ? 'border-red-400' : 'border-gray-300'}`}
                type="number"
                min="0.01"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            {errors.totalAmount && <p className="mt-1 text-xs text-red-500">{errors.totalAmount}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-400' : 'border-gray-300'}`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
          <select
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.categoryId ? 'border-red-400' : 'border-gray-300'}`}
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">Select category</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        {/* Paid by & Account */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Paid by</label>
            <select
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={paidBy}
              onChange={(e) => {
                setPaidBy(e.target.value);
                if (e.target.value !== 'self') setAccountId('');
              }}
            >
              <option value="self">You</option>
              {friends.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          {paidBy === 'self' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
              <select
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.accountId ? 'border-red-400' : 'border-gray-300'}`}
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              {errors.accountId && <p className="mt-1 text-xs text-red-500">{errors.accountId}</p>}
            </div>
          )}
        </div>

        {/* Participants */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Participants</label>
          <div className="flex flex-wrap gap-2">
            {participantList.map((p) => {
              const selected = selectedParticipants.has(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleParticipant(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    selected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      selected ? 'bg-white/30 text-white' : colorFor(p.id) + ' text-white'
                    }`}
                  >
                    {getInitials(p.label)}
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
          {errors.participants && <p className="mt-1 text-xs text-red-500">{errors.participants}</p>}
        </div>

        {/* Split type */}
        {selectedList.length >= 2 && (
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Split type</label>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {splitTypes.map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSplitType(type)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    splitType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom values for percentage / amount */}
        {selectedList.length >= 2 && splitType !== 'equal' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              {splitType === 'percentage' ? 'Percentages (must sum to 100%)' : `Amounts (must sum to ${formatCurrency(total)})`}
            </label>
            {selectedList.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0 ${colorFor(p.id)}`}
                >
                  {getInitials(p.label)}
                </div>
                <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{p.label}</span>
                <div className="relative w-28">
                  {splitType === 'amount' && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                  )}
                  <input
                    className="w-full pl-6 pr-7 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                    type="number"
                    min="0"
                    step={splitType === 'percentage' ? '0.1' : '0.01'}
                    value={customValues[p.id] ?? ''}
                    onChange={(e) =>
                      setCustomValues((prev) => ({ ...prev, [p.id]: e.target.value }))
                    }
                    placeholder="0"
                  />
                  {splitType === 'percentage' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
                  )}
                </div>
              </div>
            ))}
            {errors.customValues && <p className="text-xs text-red-500">{errors.customValues}</p>}
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-2">Preview</p>
            <div className="space-y-1.5">
              {preview.map((p) => (
                <div key={p.personId} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white ${colorFor(p.personId)}`}
                    >
                      {getInitials(labelFor(p.personId))}
                    </div>
                    <span className="text-sm text-gray-700">{labelFor(p.personId)}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(p.shareAmount)}
                    {p.sharePercentage !== undefined && (
                      <span className="ml-1 text-xs font-normal text-gray-400">({p.sharePercentage}%)</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editSplit ? 'Save Changes' : 'Add Split'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
