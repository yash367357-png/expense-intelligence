import { useState } from 'react';
import { SplitExpense } from '../../types';
import SplitCard from './SplitCard';
import ConfirmDialog from '../shared/ConfirmDialog';
import { useAppStore } from '../../store';

interface SplitListProps {
  splits: SplitExpense[];
  onEdit: (split: SplitExpense) => void;
}

export default function SplitList({ splits, onEdit }: SplitListProps) {
  const deleteSplitExpense = useAppStore((s) => s.deleteSplitExpense);
  const [deleteTarget, setDeleteTarget] = useState<SplitExpense | null>(null);

  return (
    <>
      <div className="space-y-3">
        {splits.map((split) => (
          <SplitCard
            key={split.id}
            split={split}
            onEdit={onEdit}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteSplitExpense(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Split Expense"
        message={`Delete "${deleteTarget?.description ?? 'this expense'}"? This action cannot be undone.`}
      />
    </>
  );
}
