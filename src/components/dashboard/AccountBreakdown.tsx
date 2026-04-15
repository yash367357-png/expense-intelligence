import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/currencyUtils';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface AccountBreakdownProps {
  data: {
    accountName: string;
    color: string;
    amount: number;
  }[];
}

export default function AccountBreakdown({ data }: AccountBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Spending by Account</h3>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No account data
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.accountName),
    datasets: [
      {
        label: 'Expenses',
        data: data.map((d) => d.amount),
        backgroundColor: data.map((d) => d.color),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { x: number } }) =>
            ` ${formatCurrency(context.parsed.x)}`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) =>
            typeof value === 'number' ? formatCurrency(value) : value,
          font: { size: 11 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: { font: { size: 12 } },
        grid: { display: false },
      },
    },
  };

  const chartHeight = Math.max(160, data.length * 52);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Spending by Account</h3>
      <div style={{ height: chartHeight }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
