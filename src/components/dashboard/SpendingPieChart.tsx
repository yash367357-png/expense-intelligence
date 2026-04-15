import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/currencyUtils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingPieChartProps {
  data: {
    categoryName: string;
    color: string;
    amount: number;
  }[];
}

export default function SpendingPieChart({ data }: SpendingPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Spending by Category</h3>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No spending data
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.categoryName),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: data.map((d) => d.color),
        borderColor: data.map((d) => d.color),
        borderWidth: 1,
        hoverOffset: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { parsed: number; label: string }) =>
            ` ${context.label}: ${formatCurrency(context.parsed)}`,
        },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Spending by Category</h3>
      <div className="flex flex-col sm:flex-row gap-6 items-center">
        <div className="relative w-44 h-44 flex-shrink-0">
          <Doughnut data={chartData} options={options} />
        </div>
        <ul className="flex flex-col gap-2 min-w-0 flex-1">
          {data.map((item) => (
            <li key={item.categoryName} className="flex items-center gap-2 text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 truncate flex-1">{item.categoryName}</span>
              <span className="font-medium text-gray-800 flex-shrink-0">
                {formatCurrency(item.amount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
