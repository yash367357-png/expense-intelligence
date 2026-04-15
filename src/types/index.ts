export type TransactionType = 'expense' | 'income' | 'investment';
export type SplitType = 'equal' | 'percentage' | 'amount';
export type AccountType = 'bank' | 'credit_card' | 'cash' | 'wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  color: string;
  balance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income' | 'both';
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  description: string;
  date: string;
  tags: string[];
  splitExpenseId?: string;
  settlementId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Friend {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
}

export interface SplitParticipant {
  personId: string;
  shareAmount: number;
  sharePercentage?: number;
  paid: boolean;
}

export interface SplitExpense {
  id: string;
  description: string;
  totalAmount: number;
  date: string;
  categoryId: string;
  paidBy: string;
  accountId?: string;
  participants: SplitParticipant[];
  splitType: SplitType;
  settled: boolean;
  createdAt: string;
}

export interface Settlement {
  id: string;
  fromPersonId: string;
  toPersonId: string;
  amount: number;
  date: string;
  note?: string;
  accountId?: string;
  relatedSplitIds: string[];
}
