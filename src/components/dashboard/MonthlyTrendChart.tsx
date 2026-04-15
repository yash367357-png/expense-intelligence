import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatCurrency } from '../../utils/currencyUtils';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

interface MonthlyTrendChartProps {
  data: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col h-full">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Monthly Trend</h3>
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
          No trend data available
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: 'Income',
        data: data.map((d) => d.income),
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22,163,74,0.08)',
        pointBackgroundColor: '#16a34a',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Expenses',
        data: data.map((d) => d.expenses),
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220,38,38,0.08)',
        pointBackgroundColor: '#dc2626',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label?: string }; parsed: { y: number } }) =>
            ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) =>
            typeof value === 'number' ? formatCurrency(value) : value,
          font: { size: 11 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { font: { size: 11 } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex flex-col">
      <h3 className="text-base font-semibold text-gray-700 mb-4">Monthly Trend</h3>
      <div className="h-56">
        <Line data={chartData} options={options as any} />
      </div>
    </div>
  );
}
