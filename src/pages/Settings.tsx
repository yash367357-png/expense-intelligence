import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import FriendsManager from '../components/settings/FriendsManager';
import CategoryManager from '../components/settings/CategoryManager';
import ExcelPanel from '../components/settings/ExcelPanel';
import { useAppStore } from '../store';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function Settings() {
  const clearAllData = useAppStore((s) => s.clearAllData);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your friends, categories, and app data.
        </p>
      </div>

      {/* Friends section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <FriendsManager />
      </section>

      {/* Categories section — placeholder for CategoryManager */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Categories
        </h2>
        <CategoryManager />
      </section>

      {/* Import / Export section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Import / Export
        </h2>
        <ExcelPanel />
      </section>

      {/* Danger Zone */}
      <section className="bg-white border border-red-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
            Danger Zone
          </h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Permanently delete all your data including transactions, accounts, splits, settlements, and friends. This action cannot be undone.
        </p>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 active:bg-red-800 transition-colors"
        >
          <Trash2 size={15} />
          Clear All Data
        </button>
      </section>

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={() => {
          clearAllData();
          setShowClearConfirm(false);
        }}
        title="Clear All Data"
        message="This will permanently delete ALL your transactions, accounts, categories, friends, split expenses, and settlements. This cannot be undone. Are you absolutely sure?"
      />
    </div>
  );
}
