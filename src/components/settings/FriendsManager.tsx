import { useState } from 'react';
import { UserPlus, Pencil, Trash2, Check, X, Users } from 'lucide-react';
import { useAppStore } from '../../store';
import { Friend } from '../../types';
import ConfirmDialog from '../shared/ConfirmDialog';

const AVATAR_COLORS = [
  'bg-rose-400',
  'bg-pink-400',
  'bg-fuchsia-400',
  'bg-violet-400',
  'bg-indigo-400',
  'bg-blue-400',
  'bg-sky-400',
  'bg-teal-400',
  'bg-emerald-400',
  'bg-amber-400',
  'bg-orange-400',
];

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function randomColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

interface AvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}

function Avatar({ name, color, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div
      className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

interface EditRowProps {
  friend: Friend;
  onSave: (name: string, email: string) => void;
  onCancel: () => void;
}

function EditRow({ friend, onSave, onCancel }: EditRowProps) {
  const [name, setName] = useState(friend.name);
  const [email, setEmail] = useState(friend.email ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), email.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 py-2">
      <Avatar name={name || friend.name} color={friend.avatarColor} size="sm" />
      <input
        className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        autoFocus
      />
      <input
        className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional)"
        type="email"
      />
      <button
        type="submit"
        className="p-1.5 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
        aria-label="Save"
      >
        <Check size={15} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 text-gray-500 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        aria-label="Cancel"
      >
        <X size={15} />
      </button>
    </form>
  );
}

export default function FriendsManager() {
  const friends = useAppStore((s) => s.friends);
  const addFriend = useAppStore((s) => s.addFriend);
  const updateFriend = useAppStore((s) => s.updateFriend);
  const deleteFriend = useAppStore((s) => s.deleteFriend);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Friend | null>(null);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [addError, setAddError] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setAddError('Name is required.');
      return;
    }
    const friend: Friend = {
      id: `friend_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: newName.trim(),
      email: newEmail.trim() || undefined,
      avatarColor: randomColor(),
    };
    addFriend(friend);
    setNewName('');
    setNewEmail('');
    setAddError('');
  };

  const handleSaveEdit = (id: string, name: string, email: string) => {
    updateFriend(id, { name, email: email || undefined });
    setEditingId(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Users size={18} className="text-blue-600" />
        <h2 className="text-base font-semibold text-gray-900">Friends</h2>
        <span className="ml-auto text-xs text-gray-400">{friends.length} friend{friends.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Add friend form */}
      <form
        onSubmit={handleAdd}
        className="flex items-start gap-2 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200"
      >
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <input
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  addError ? 'border-red-400' : 'border-gray-300'
                }`}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (addError) setAddError('');
                }}
                placeholder="Friend's name *"
              />
              {addError && <p className="mt-1 text-xs text-red-500">{addError}</p>}
            </div>
            <input
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email (optional)"
              type="email"
            />
          </div>
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <UserPlus size={15} />
          Add Friend
        </button>
      </form>

      {/* Friends list */}
      {friends.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">
          No friends added yet. Add someone above to start splitting expenses.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {friends.map((friend) =>
            editingId === friend.id ? (
              <li key={friend.id} className="px-1">
                <EditRow
                  friend={friend}
                  onSave={(name, email) => handleSaveEdit(friend.id, name, email)}
                  onCancel={() => setEditingId(null)}
                />
              </li>
            ) : (
              <li key={friend.id} className="flex items-center gap-3 py-3 px-1">
                <Avatar name={friend.name} color={friend.avatarColor} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{friend.name}</p>
                  {friend.email && (
                    <p className="text-xs text-gray-400 truncate">{friend.email}</p>
                  )}
                </div>
                <button
                  onClick={() => setEditingId(friend.id)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  aria-label={`Edit ${friend.name}`}
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setDeleteTarget(friend)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label={`Delete ${friend.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            )
          )}
        </ul>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteFriend(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Remove Friend"
        message={`Remove ${deleteTarget?.name ?? 'this friend'} from your friends list? This won't delete past split expenses.`}
      />
    </div>
  );
}
