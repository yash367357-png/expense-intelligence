interface AmountInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function AmountInput({ value, onChange, className = '' }: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow only digits and a single decimal point
    if (/^\d*\.?\d{0,2}$/.test(raw)) {
      onChange(raw);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3 text-gray-500 text-sm font-medium select-none">₹</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleChange}
        placeholder="0.00"
        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
}
