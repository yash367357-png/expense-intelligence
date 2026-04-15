import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Account, Transaction, Category, Friend, SplitExpense, Settlement } from '../types';
import { defaultCategories } from '../constants/defaultCategories';

interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  friends: Friend[];
  splitExpenses: SplitExpense[];
  settlements: Settlement[];

  // Account actions
  addAccount: (account: Account) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Transaction actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Category actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Friend actions
  addFriend: (friend: Friend) => void;
  updateFriend: (id: string, data: Partial<Friend>) => void;
  deleteFriend: (id: string) => void;

  // Split actions
  addSplitExpense: (split: SplitExpense) => void;
  updateSplitExpense: (id: string, data: Partial<SplitExpense>) => void;
  deleteSplitExpense: (id: string) => void;

  // Settlement actions
  addSettlement: (settlement: Settlement) => void;
  deleteSettlement: (id: string) => void;

  // Bulk actions
  importData: (data: {
    transactions?: Transaction[];
    accounts?: Account[];
    categories?: Category[];
    friends?: Friend[];
    splitExpenses?: SplitExpense[];
    settlements?: Settlement[];
  }) => void;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      accounts: [],
      transactions: [],
      categories: [...defaultCategories],
      friends: [],
      splitExpenses: [],
      settlements: [],

      // Account actions
      addAccount: (account) =>
        set((state) => ({ accounts: [...state.accounts, account] })),
      updateAccount: (id, data) =>
        set((state) => ({
          accounts: state.accounts.map((a) => (a.id === id ? { ...a, ...data } : a)),
        })),
      deleteAccount: (id) =>
        set((state) => ({ accounts: state.accounts.filter((a) => a.id !== id) })),

      // Transaction actions
      addTransaction: (transaction) =>
        set((state) => {
          const delta = transaction.type === 'income' ? transaction.amount : -transaction.amount;
          return {
            transactions: [...state.transactions, transaction],
            accounts: state.accounts.map((a) =>
              a.id === transaction.accountId ? { ...a, balance: a.balance + delta } : a
            ),
          };
        }),
      updateTransaction: (id, data) =>
        set((state) => {
          const old = state.transactions.find((t) => t.id === id);
          const updated = state.transactions.map((t) => (t.id === id ? { ...t, ...data } : t));
          if (!old) return { transactions: updated };
          const merged = { ...old, ...data };
          const oldDelta = old.type === 'income' ? old.amount : -old.amount;
          const newDelta = merged.type === 'income' ? merged.amount : -merged.amount;
          const accounts =
            old.accountId !== merged.accountId
              ? state.accounts.map((a) => {
                  if (a.id === old.accountId) return { ...a, balance: a.balance - oldDelta };
                  if (a.id === merged.accountId) return { ...a, balance: a.balance + newDelta };
                  return a;
                })
              : state.accounts.map((a) =>
                  a.id === old.accountId ? { ...a, balance: a.balance - oldDelta + newDelta } : a
                );
          return { transactions: updated, accounts };
        }),
      deleteTransaction: (id) =>
        set((state) => {
          const transaction = state.transactions.find((t) => t.id === id);
          if (!transaction) return { transactions: state.transactions.filter((t) => t.id !== id) };
          const delta = transaction.type === 'income' ? transaction.amount : -transaction.amount;
          return {
            transactions: state.transactions.filter((t) => t.id !== id),
            accounts: state.accounts.map((a) =>
              a.id === transaction.accountId ? { ...a, balance: a.balance - delta } : a
            ),
          };
        }),

      // Category actions
      addCategory: (category) =>
        set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, data) =>
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...data } : c
          ),
        })),
      deleteCategory: (id) =>
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        })),

      // Friend actions
      addFriend: (friend) =>
        set((state) => ({ friends: [...state.friends, friend] })),
      updateFriend: (id, data) =>
        set((state) => ({
          friends: state.friends.map((f) => (f.id === id ? { ...f, ...data } : f)),
        })),
      deleteFriend: (id) =>
        set((state) => ({ friends: state.friends.filter((f) => f.id !== id) })),

      // Split actions
      addSplitExpense: (split) =>
        set((state) => {
          let updatedTransactions = state.transactions;
          let updatedAccounts = state.accounts;

          if (split.paidBy === 'self' && split.accountId) {
            const newTransaction: Transaction = {
              id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              type: 'expense',
              amount: split.totalAmount,
              categoryId: split.categoryId,
              accountId: split.accountId,
              description: split.description,
              date: split.date,
              tags: ['split'],
              splitExpenseId: split.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updatedTransactions = [...state.transactions, newTransaction];
            updatedAccounts = state.accounts.map((a) =>
              a.id === split.accountId ? { ...a, balance: a.balance - split.totalAmount } : a
            );
          }

          return {
            splitExpenses: [...state.splitExpenses, split],
            transactions: updatedTransactions,
            accounts: updatedAccounts,
          };
        }),
      updateSplitExpense: (id, data) =>
        set((state) => ({
          splitExpenses: state.splitExpenses.map((s) =>
            s.id === id ? { ...s, ...data } : s
          ),
        })),
      deleteSplitExpense: (id) =>
        set((state) => {
          const relatedTxn = state.transactions.find((t) => t.splitExpenseId === id);
          let updatedTransactions = state.transactions;
          let updatedAccounts = state.accounts;

          if (relatedTxn) {
            updatedTransactions = state.transactions.filter((t) => t.splitExpenseId !== id);
            const delta = relatedTxn.type === 'income' ? relatedTxn.amount : -relatedTxn.amount;
            updatedAccounts = state.accounts.map((a) =>
              a.id === relatedTxn.accountId ? { ...a, balance: a.balance - delta } : a
            );
          }

          return {
            splitExpenses: state.splitExpenses.filter((s) => s.id !== id),
            transactions: updatedTransactions,
            accounts: updatedAccounts,
          };
        }),

      // Settlement actions
      addSettlement: (settlement) =>
        set((state) => {
          let updatedTransactions = state.transactions;
          let updatedAccounts = state.accounts;

          if (settlement.accountId && (settlement.fromPersonId === 'self' || settlement.toPersonId === 'self')) {
            const isIncome = settlement.toPersonId === 'self';
            const categoryId = isIncome
              ? state.categories.find((c) => c.type === 'income' || c.type === 'both')?.id || ''
              : state.categories.find((c) => c.type === 'expense' || c.type === 'both')?.id || '';

            const newTransaction: Transaction = {
              id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
              type: isIncome ? 'income' : 'expense',
              amount: settlement.amount,
              categoryId,
              accountId: settlement.accountId,
              description: settlement.note || 'Settle up',
              date: settlement.date,
              tags: ['settlement'],
              settlementId: settlement.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            updatedTransactions = [...state.transactions, newTransaction];
            const delta = isIncome ? settlement.amount : -settlement.amount;
            updatedAccounts = state.accounts.map((a) =>
              a.id === settlement.accountId ? { ...a, balance: a.balance + delta } : a
            );
          }

          return {
            settlements: [...state.settlements, settlement],
            transactions: updatedTransactions,
            accounts: updatedAccounts,
          };
        }),
      deleteSettlement: (id) =>
        set((state) => {
          const relatedTxn = state.transactions.find((t) => t.settlementId === id);
          let updatedTransactions = state.transactions;
          let updatedAccounts = state.accounts;

          if (relatedTxn) {
            updatedTransactions = state.transactions.filter((t) => t.settlementId !== id);
            const delta = relatedTxn.type === 'income' ? relatedTxn.amount : -relatedTxn.amount;
            updatedAccounts = state.accounts.map((a) =>
              a.id === relatedTxn.accountId ? { ...a, balance: a.balance - delta } : a
            );
          }

          return {
            settlements: state.settlements.filter((s) => s.id !== id),
            transactions: updatedTransactions,
            accounts: updatedAccounts,
          };
        }),

      // Bulk actions
      importData: (data) =>
        set((state) => ({
          accounts: data.accounts
            ? [...state.accounts, ...data.accounts]
            : state.accounts,
          transactions: data.transactions
            ? [...state.transactions, ...data.transactions]
            : state.transactions,
          categories: data.categories
            ? [...state.categories, ...data.categories]
            : state.categories,
          friends: data.friends
            ? [...state.friends, ...data.friends]
            : state.friends,
          splitExpenses: data.splitExpenses
            ? [...state.splitExpenses, ...data.splitExpenses]
            : state.splitExpenses,
          settlements: data.settlements
            ? [...state.settlements, ...data.settlements]
            : state.settlements,
        })),
      clearAllData: () =>
        set({
          accounts: [],
          transactions: [],
          categories: [...defaultCategories],
          friends: [],
          splitExpenses: [],
          settlements: [],
        }),
    }),
    {
      name: 'expense-tracker-v1',
    }
  )
);
