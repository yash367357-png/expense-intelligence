import { Category } from '../types';

export const defaultCategories: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#ef4444', type: 'expense' },
  { id: 'travel', name: 'Travel', icon: 'Plane', color: '#3b82f6', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'ShoppingBag', color: '#a855f7', type: 'expense' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'Receipt', color: '#f97316', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Gamepad2', color: '#ec4899', type: 'expense' },
  { id: 'health', name: 'Health', icon: 'Heart', color: '#10b981', type: 'expense' },
  { id: 'transport', name: 'Transport', icon: 'Car', color: '#6366f1', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'ShoppingCart', color: '#14b8a6', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'GraduationCap', color: '#8b5cf6', type: 'expense' },
  { id: 'rent', name: 'Rent', icon: 'Home', color: '#f59e0b', type: 'expense' },
  { id: 'salary', name: 'Salary', icon: 'Banknote', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: 'Laptop', color: '#06b6d4', type: 'income' },
  { id: 'investment', name: 'Investment', icon: 'TrendingUp', color: '#0ea5e9', type: 'both' },
  { id: 'gift', name: 'Gifts', icon: 'Gift', color: '#e11d48', type: 'both' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', type: 'both' },
];
