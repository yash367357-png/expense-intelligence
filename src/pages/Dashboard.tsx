import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, DollarSign, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useDashboardStats } from '../hooks/useDashboardStats';
import SummaryCard from '../components/dashboard/SummaryCard';
import SpendingPieChart from '../components/dashboard/SpendingPieChart';
import MonthlyTrendChart from '../components/dashboard/MonthlyTrendChart';
import AccountBreakdown from '../components/dashboard/AccountBreakdown';
import OutstandingBalances from '../components/dashboard/OutstandingBalances';

export default function Dashboard() {
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

  const dateRange = {
    start: format(startOfMonth(currentMonth), 'yyyy-MM-dd'),
    end: format(endOfMonth(currentMonth), 'yyyy-MM-dd'),
  };

  const stats = useDashboardStats(dateRange);

  const goPrev = () => setCurrentMonth((d) => subMonths(d, 1));
  const goNext = () => setCurrentMonth((d) => addMonths(d, 1));

  const isCurrentMonth =
    format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), 'EEEE, d MMMM yyyy')}
          </p>
        </div>

        {/* Month selector */}
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-4 py-2 self-start sm:self-auto">
          <button
            onClick={goPrev}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold text-gray-700 w-28 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={goNext}
            disabled={isCurrentMonth}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Income"
          amount={stats.totalIncome}
          icon={<DollarSign className="w-5 h-5" />}
          trend="up"
          color="text-green-600"
        />
        <SummaryCard
          title="Expenses"
          amount={stats.totalExpenses}
          icon={<TrendingDown className="w-5 h-5" />}
          trend="down"
          color="text-red-500"
        />
        <SummaryCard
          title="Investments"
          amount={stats.totalInvestment}
          icon={<TrendingUp className="w-5 h-5" />}
          color="text-blue-600"
        />
        <SummaryCard
          title="Net Balance"
          amount={stats.net}
          icon={<Wallet className="w-5 h-5" />}
          trend={stats.net >= 0 ? 'up' : 'down'}
          color={stats.net >= 0 ? 'text-purple-600' : 'text-orange-500'}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <SpendingPieChart data={stats.categoryBreakdown} />
        <MonthlyTrendChart data={stats.monthlyTrend} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AccountBreakdown data={stats.accountBreakdown} />
        <OutstandingBalances />
      </div>
    </div>
  );
}
