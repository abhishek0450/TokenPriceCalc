'use client';

import { useEffect } from 'react';
import usePriceStore from '../store/priceStore';

const ProgressBar = () => {
  const { scheduleProgress, resetProgress } = usePriceStore();
  
  useEffect(() => {
    // Reset progress when component unmounts
    return () => resetProgress();
  }, [resetProgress]);
  
  if (scheduleProgress <= 0) {
    return null;
  }
  
  return (
    <div className="mt-6 p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="mb-2 flex justify-between">
        <span className="text-sm font-medium">History Fetch Progress</span>
        <span className="text-sm font-medium">{scheduleProgress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${scheduleProgress}%` }}
        />
      </div>
      {scheduleProgress >= 100 && (
        <p className="mt-2 text-sm text-green-600 font-medium">
          History fetch completed!
        </p>
      )}
    </div>
  );
};

export default ProgressBar;
