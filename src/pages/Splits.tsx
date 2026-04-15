import { useState } from 'react';
import { Plus, SplitSquareHorizontal, Wallet, Filter } from 'lucide-react';
import { SplitExpense } from '../types';
import { useAppStore } from '../store';
import SplitList from '../components/splits/SplitList';
import BalanceSummary from '../components/splits/BalanceSummary';
import SplitForm from '../components/splits/SplitForm';
import SettleUpModal from '../components/splits/SettleUpModal';
import EmptyState from '../components/shared/EmptyState';

type Tab = 'expenses' | 'balances';
type FilterType = 'all' | 'unsettled' | 'settled';

export default function Splits() {
  const splitExpenses = useAppStore((s) => s.splitExpenses);

  const [activeTab, setActiveTab] = useState<Tab>('expenses');
  const [filter, setFilter] = useState<FilterType>('all');
  const [showSplitForm, setShowSplitForm] = useState(false);
  const [editingSplit, setEditingSplit] = useState<SplitExpense | undefined>(undefined);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [settleUpFriendId, setSettleUpFriendId] = useState<string | undefined>(undefined);

  const handleNewSplit = () => {
    setEditingSplit(undefined);
    setShowSplitForm(true);
  };

  const handleEditSplit = (split: SplitExpense) => {
    setEditingSplit(split);
    setShowSplitForm(true);
  };

  const handleSettleUp = (friendId: string) => {
    setSettleUpFriendId(friendId);
    setShowSettleUp(true);
  };

  const filteredSplits = splitExpenses.filter((s) => {
    if (filter === 'settled') return s.settled;
    if (filter === 'unsettled') return !s.settled;
    return true;
  });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'expenses', label: 'Expenses', icon: <SplitSquareHorizontal size={15} /> },
    { id: 'balances', label: 'Balances', icon: <Wallet size={15} /> },
  ];

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'unsettled', label: 'Unsettled' },
    { value: 'settled', label: 'Settled' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Split Expenses</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {splitExpenses.length} expense{splitExpenses.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleNewSplit}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Split
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Expenses tab */}
      {activeTab === 'expenses' && (
        <>
          {/* Filter bar */}
          {splitExpenses.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Filter size={14} className="text-gray-400 flex-shrink-0" />
              <div className="flex gap-1">
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                      filter === opt.value
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="ml-auto text-xs text-gray-400">
                {filteredSplits.length} result{filteredSplits.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {filteredSplits.length === 0 ? (
            splitExpenses.length === 0 ? (
              <EmptyState
                icon={<SplitSquareHorizontal />}
                title="No split expenses yet"
                description="Add your first split expense and start tracking shared costs with friends."
                action={{ label: 'New Split', onClick: handleNewSplit }}
              />
            ) : (
              <EmptyState
                icon={<SplitSquareHorizontal />}
                title="No matching expenses"
                description={`No ${filter} expenses found. Try changing the filter.`}
                action={{ label: 'Show All', onClick: () => setFilter('all') }}
              />
            )
          ) : (
            <SplitList splits={filteredSplits} onEdit={handleEditSplit} />
          )}
        </>
      )}

      {/* Balances tab */}
      {activeTab === 'balances' && (
        <BalanceSummary onSettleUp={handleSettleUp} />
      )}

      {/* Modals */}
      <SplitForm
        isOpen={showSplitForm}
        onClose={() => {
          setShowSplitForm(false);
          setEditingSplit(undefined);
        }}
        editSplit={editingSplit}
      />
      <SettleUpModal
        isOpen={showSettleUp}
        onClose={() => {
          setShowSettleUp(false);
          setSettleUpFriendId(undefined);
        }}
        friendId={settleUpFriendId}
      />
    </div>
  );
}
