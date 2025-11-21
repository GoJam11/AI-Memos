import React from 'react';
import { Memo } from '../types';

interface HeatmapProps {
  memos: Memo[];
}

const Heatmap: React.FC<HeatmapProps> = ({ memos }) => {
  // Simple visualization: Last 84 days (12 weeks)
  const today = new Date();
  const days = Array.from({ length: 84 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (83 - i));
    return d;
  });

  const getMemoCount = (date: Date) => {
    return memos.filter(m => {
      const mDate = new Date(m.createdAt);
      return mDate.getDate() === date.getDate() && 
             mDate.getMonth() === date.getMonth() && 
             mDate.getFullYear() === date.getFullYear();
    }).length;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-gray-200';
    if (count === 1) return 'bg-green-200';
    if (count <= 3) return 'bg-green-300';
    if (count <= 5) return 'bg-green-500';
    return 'bg-green-700';
  };

  return (
    <div className="w-full overflow-hidden">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Activity</h3>
      <div className="flex flex-wrap gap-1 justify-center sm:justify-start">
        {days.map((date, i) => {
          const count = getMemoCount(date);
          return (
            <div
              key={i}
              title={`${date.toLocaleDateString()}: ${count} memos`}
              className={`w-3 h-3 rounded-sm ${getColor(count)}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Heatmap;