import { useMemo } from 'react';
import { subMonths, format, parseISO, isWithinInterval } from 'date-fns';
import { useAppStore } from '../store';
import { getMonthKey } from '../utils/dateUtils';

interface DateRange {
  start: string;
  end: string;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
}

export interface MonthlyTrendItem {
  month: string;
  income: number;
  expenses: number;
}

export interface AccountBreakdownItem {
  accountId: string;
  accountName: string;
  color: string;
  amount: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  totalInvestment: number;
  net: number;
  categoryBreakdown: CategoryBreakdownItem[];
  monthlyTrend: MonthlyTrendItem[];
  accountBreakdown: AccountBreakdownItem[];
}

export function useDashboardStats(dateRange?: DateRange): DashboardStats {
  const transactions = useAppStore((s) => s.transactions);
  const categories = useAppStore((s) => s.categories);
  const accounts = useAppStore((s) => s.accounts);

  return useMemo(() => {
    // Filter by date range when provided
    const filtered = dateRange
      ? transactions.filter((t) => {
          try {
            return isWithinInterval(parseISO(t.date), {
              start: parseISO(dateRange.start),
              end: parseISO(dateRange.end),
            });
          } catch {
            return false;
          }
        })
      : transactions;

    // Totals
    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalInvestment = filtered
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + t.amount, 0);

    const net = totalIncome - totalExpenses - totalInvestment;

    // Category breakdown for expenses
    const categoryMap = new Map<string, number>();
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        categoryMap.set(t.categoryId, (categoryMap.get(t.categoryId) ?? 0) + t.amount);
      });

    const categoryBreakdown: CategoryBreakdownItem[] = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const cat = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          categoryName: cat?.name ?? 'Unknown',
          color: cat?.color ?? '#6b7280',
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend — last 6 months regardless of filter
    const now = new Date();
    const last6Months: MonthlyTrendItem[] = Array.from({ length: 6 }, (_, i) => {
      const monthDate = subMonths(now, 5 - i);
      const monthKey = format(monthDate, 'yyyy-MM');
      const label = format(monthDate, 'MMM yy');

      const monthTransactions = transactions.filter(
        (t) => getMonthKey(t.date) === monthKey
      );

      return {
        month: label,
        income: monthTransactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0),
        expenses: monthTransactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0),
      };
    });

    // Account breakdown for expenses
    const accountMap = new Map<string, number>();
    filtered
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        accountMap.set(t.accountId, (accountMap.get(t.accountId) ?? 0) + t.amount);
      });

    const accountBreakdown: AccountBreakdownItem[] = Array.from(accountMap.entries())
      .map(([accountId, amount]) => {
        const acc = accounts.find((a) => a.id === accountId);
        return {
          accountId,
          accountName: acc?.name ?? 'Unknown',
          color: acc?.color ?? '#6b7280',
          amount,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpenses,
      totalInvestment,
      net,
      categoryBreakdown,
      monthlyTrend: last6Months,
      accountBreakdown,
    };
  }, [transactions, categories, accounts, dateRange]);
}
