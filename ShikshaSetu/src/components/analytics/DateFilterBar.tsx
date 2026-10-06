import React, { useState } from 'react';
import { DateFilterPeriod, DateRangeFilter } from '../../types/analytics';
import { Calendar, Clock, ChevronDown } from 'lucide-react';

interface DateFilterBarProps {
  currentFilter: DateRangeFilter;
  onFilterChange: (filter: DateRangeFilter) => void;
  className?: string;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  currentFilter,
  onFilterChange,
  className = '',
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState(currentFilter.period === 'custom');
  const [customStart, setCustomStart] = useState(
    currentFilter.startDate ||
      new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [customEnd, setCustomEnd] = useState(
    currentFilter.endDate || new Date().toISOString().split('T')[0]
  );

  const periods: { id: DateFilterPeriod; label: string; description: string }[] = [
    { id: 'today', label: 'Today', description: 'Past 24 hours' },
    { id: '7d', label: '7 Days', description: 'Past 7 days' },
    { id: '30d', label: '30 Days', description: 'Past month' },
    { id: 'custom', label: 'Custom', description: 'Specific range' },
  ];

  const handleSelectPeriod = (period: DateFilterPeriod) => {
    if (period === 'custom') {
      setShowCustomInputs(true);
      onFilterChange({
        period: 'custom',
        startDate: customStart,
        endDate: customEnd,
      });
    } else {
      setShowCustomInputs(false);
      onFilterChange({ period });
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      period: 'custom',
      startDate: customStart,
      endDate: customEnd,
    });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {/* Period Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {periods.map((p) => {
            const isSelected = currentFilter.period === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPeriod(p.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                  isSelected
                    ? 'bg-brand-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
                aria-pressed={isSelected}
              >
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Period Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
          <Calendar className="w-3.5 h-3.5 text-brand-600" />
          <span>
            {currentFilter.period === 'today' && 'Viewing today’s activity'}
            {currentFilter.period === '7d' && 'Last 7 days of learning'}
            {currentFilter.period === '30d' && 'Last 30 days of learning'}
            {currentFilter.period === 'custom' &&
              `${customStart || 'Start'} to ${customEnd || 'End'}`}
          </span>
        </div>
      </div>

      {/* Custom Date Range Selector (Rendered when period === 'custom') */}
      {showCustomInputs && (
        <form
          onSubmit={handleApplyCustom}
          className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex flex-wrap items-center gap-3 text-xs animate-in fade-in"
        >
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">From:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">To:</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 shadow-2xs focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="min-h-[38px] px-4 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold transition-all shadow-xs"
          >
            Apply Range
          </button>
        </form>
      )}
    </div>
  );
};
