import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyUtils';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: React.ReactNode;
  trend?: 'up' | 'down';
  color: string;
}

export default function SummaryCard({ title, amount, icon, trend, color }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`${color} flex items-center justify-center w-10 h-10 rounded-lg bg-current bg-opacity-10`}>
          <span className={color}>{icon}</span>
        </div>
        {trend && (
          <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-0.5 ${color}`}>
          {formatCurrency(amount)}
        </p>
      </div>
    </div>
  );
}
