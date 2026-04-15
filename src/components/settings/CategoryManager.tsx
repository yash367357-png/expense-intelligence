import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react';
import { useAppStore } from '../../store';
import { Category } from '../../types';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#e11d48', '#6b7280',
];

const PRESET_ICONS = [
  'UtensilsCrossed', 'Plane', 'ShoppingBag', 'Receipt',
  'Gamepad2', 'Heart', 'Car', 'ShoppingCart',
  'GraduationCap', 'Home', 'Banknote', 'Laptop',
  'TrendingUp', 'Gift', 'MoreHorizontal', 'Star',
];

type CategoryType = 'expense' | 'income' | 'both';

interface FormState {
  name: string;
  color: string;
  icon: string;
  type: CategoryType;
}

const emptyForm: FormState = {
  name: '',
  color: '#6366f1',
  icon: 'MoreHorizontal',
  type: 'expense',
};

const TYPE_LABELS: Record<CategoryType, string> = {
  expense: 'Expense',
  income: 'Income',
  both: 'Both',
};

const TYPE_BADGE_COLORS: Record<CategoryType, string> = {
  expense: 'bg-red-100 text-red-700',
  income: 'bg-green-100 text-green-700',
  both: 'bg-blue-100 text-blue-700',
};

export default function CategoryManager() {
  const categories = useAppStore((s) => s.categories);
  const transactions = useAppStore((s) => s.transactions);
  const addCategory = useAppStore((s) => s.addCategory);
  const updateCategory = useAppStore((s) => s.updateCategory);
  const deleteCategory = useAppStore((s) => s.deleteCategory);

  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // ─── Helpers ─────────────────────────────────────────────────────────────

  function categoryUsageCount(categoryId: string): number {
    return transactions.filter((t) => t.categoryId === categoryId).length;
  }

  function generateId(): string {
    return `cat-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }

  // ─── Add ──────────────────────────────────────────────────────────────────

  function handleAdd() {
    if (!addForm.name.trim()) return;
    addCategory({
      id: generateId(),
      name: addForm.name.trim(),
      color: addForm.color,
      icon: addForm.icon,
      type: addForm.type,
    });
    setAddForm(emptyForm);
    setShowAddForm(false);
  }

  // ─── Edit ─────────────────────────────────────────────────────────────────

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditForm({
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type,
    });
    setDeleteWarning(null);
  }

  function confirmEdit(id: string) {
    if (!editForm.name.trim()) return;
    updateCategory(id, {
      name: editForm.name.trim(),
      color: editForm.color,
      icon: editForm.icon,
      type: editForm.type,
    });
    setEditingId(null);
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  function handleDelete(cat: Category) {
    const usage = categoryUsageCount(cat.id);
    if (usage > 0) {
      setDeleteWarning(
        `"${cat.name}" is used by ${usage} transaction${usage !== 1 ? 's' : ''} and cannot be deleted.`
      );
      return;
    }
    deleteCategory(cat.id);
  }

  // ─── Shared form renderer ─────────────────────────────────────────────────

  function renderForm(
    form: FormState,
    setForm: (f: FormState) => void,
    onSave: () => void,
    onCancel: () => void,
    saveLabel = 'Save'
  ) {
    return (
      <div className="mt-3 space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
            <option value="both">Both</option>
          </select>
        </div>

        {/* Color picker */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, color: c })}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full transition-transform ${
                  form.color === c
                    ? 'ring-2 ring-offset-2 ring-gray-500 scale-110'
                    : 'hover:scale-110'
                }`}
              />
            ))}
            {/* Custom color input */}
            <label className="w-7 h-7 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center cursor-pointer hover:border-gray-600 overflow-hidden relative">
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
              />
              <Plus size={12} className="text-gray-400" />
            </label>
          </div>
        </div>

        {/* Icon selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Icon</label>
          <select
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {PRESET_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onSave}
            disabled={!form.name.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Check size={14} />
            {saveLabel}
          </button>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Categories</h3>
          <p className="text-sm text-gray-500">Manage your spending and income categories.</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm((v) => !v);
            setDeleteWarning(null);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={15} />
          Add
        </button>
      </div>

      {/* Delete warning */}
      {deleteWarning && (
        <div className="mb-4 flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <span>{deleteWarning}</span>
          <button
            onClick={() => setDeleteWarning(null)}
            className="ml-auto text-yellow-600 hover:text-yellow-800"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Add Form */}
      {showAddForm &&
        renderForm(
          addForm,
          setAddForm,
          handleAdd,
          () => {
            setShowAddForm(false);
            setAddForm(emptyForm);
          },
          'Add Category'
        )}

      {/* Category List */}
      <ul className="mt-4 divide-y divide-gray-100">
        {categories.map((cat) => (
          <li key={cat.id}>
            <div className="flex items-center gap-3 py-3">
              {/* Color dot */}
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_BADGE_COLORS[cat.type]}`}
              >
                {TYPE_LABELS[cat.type]}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    editingId === cat.id ? setEditingId(null) : startEdit(cat)
                  }
                  className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  aria-label="Edit category"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Delete category"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Inline edit form */}
            {editingId === cat.id &&
              renderForm(
                editForm,
                setEditForm,
                () => confirmEdit(cat.id),
                () => setEditingId(null),
                'Update'
              )}
          </li>
        ))}
      </ul>

      {categories.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No categories yet.</p>
      )}
    </div>
  );
}
