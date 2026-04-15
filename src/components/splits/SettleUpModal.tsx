import { useState, useEffect, useCallback } from 'react';
import { Settlement } from '../../types';
import { useAppStore } from '../../store';
import { useSplitBalances } from '../../hooks/useSplitBalances';
import { formatCurrency } from '../../utils/currencyUtils';
import Modal from '../shared/Modal';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  friendId?: string;
}

export default function SettleUpModal({ isOpen, onClose, friendId }: SettleUpModalProps) {
  const friends = useAppStore((s) => s.friends);
  const accounts = useAppStore((s) => s.accounts);
  const addSettlement = useAppStore((s) => s.addSettlement);
  const { balances } = useSplitBalances();

  const today = new Date().toISOString().slice(0, 10);

  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [direction, setDirection] = useState<'you_paid' | 'they_paid'>('you_paid');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today);
  const [accountId, setAccountId] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const suggestedAmount = useCallback(
    (fid: string): number => {
      const bal = balances.get(fid) ?? 0;
      return Math.abs(bal);
    },
    [balances]
  );

  const reset = useCallback(() => {
    const fid = friendId ?? '';
    setSelectedFriendId(fid);
    setDate(today);
    setAccountId('');
    setNote('');
    setErrors({});
    const bal = fid ? balances.get(fid) ?? 0 : 0;
    // If balance > 0: friend owes you → they paid. If < 0: you owe → you paid.
    setDirection(bal < 0 ? 'you_paid' : 'they_paid');
    setAmount(fid && Math.abs(bal) > 0 ? String(Math.abs(bal)) : '');
  }, [friendId, today, balances]);

  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  // Update suggested amount when friend changes
  const handleFriendChange = (fid: string) => {
    setSelectedFriendId(fid);
    const bal = balances.get(fid) ?? 0;
    setDirection(bal < 0 ? 'you_paid' : 'they_paid');
    setAmount(String(suggestedAmount(fid)) || '');
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!selectedFriendId) errs.friend = 'Select a friend.';
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) errs.amount = 'Enter a valid amount.';
    if (!date) errs.date = 'Date is required.';
    if (!accountId) errs.accountId = 'Select an account.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amt = parseFloat(amount);
    const settlement: Settlement = {
      id: `settlement_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      fromPersonId: direction === 'you_paid' ? 'self' : selectedFriendId,
      toPersonId: direction === 'you_paid' ? selectedFriendId : 'self',
      amount: amt,
      date,
      note: note.trim() || undefined,
      accountId,
      relatedSplitIds: [],
    };
    addSettlement(settlement);
    onClose();
  };

  const selectedFriend = friends.find((f) => f.id === selectedFriendId);
  const currentBalance = selectedFriendId ? balances.get(selectedFriendId) ?? 0 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settle Up">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Friend selector */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">With</label>
          <select
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.friend ? 'border-red-400' : 'border-gray-300'
            }`}
            value={selectedFriendId}
            onChange={(e) => handleFriendChange(e.target.value)}
          >
            <option value="">Select friend</option>
            {friends.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          {errors.friend && <p className="mt-1 text-xs text-red-500">{errors.friend}</p>}
        </div>

        {/* Balance hint */}
        {selectedFriend && currentBalance !== 0 && (
          <div
            className={`text-xs px-3 py-2 rounded-lg ${
              currentBalance > 0
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {currentBalance > 0
              ? `${selectedFriend.name} owes you ${formatCurrency(currentBalance)}`
              : `You owe ${selectedFriend.name} ${formatCurrency(Math.abs(currentBalance))}`}
          </div>
        )}

        {/* Direction toggle */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">Direction</label>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setDirection('you_paid')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                direction === 'you_paid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              You paid
            </button>
            <button
              type="button"
              onClick={() => setDirection('they_paid')}
              className={`flex-1 py-2 text-xs font-medium transition-colors ${
                direction === 'they_paid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              They paid
            </button>
          </div>
        </div>

        {/* Amount + Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₹</span>
              <input
                className={`w-full pl-7 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount ? 'border-red-400' : 'border-gray-300'
                }`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
            <input
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-400' : 'border-gray-300'
              }`}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
        </div>

        {/* Account */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Account</label>
          <select
            className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
              errors.accountId ? 'border-red-400' : 'border-gray-300'
            }`}
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

        {/* Note */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Note (optional)</label>
          <input
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. UPI payment"
          />
        </div>

        <div className="flex justify-end gap-3 pt-1">
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
            Record Settlement
          </button>
        </div>
      </form>
    </Modal>
  );
}
