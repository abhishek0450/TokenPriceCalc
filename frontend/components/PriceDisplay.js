'use client';

import { useEffect } from 'react';
import usePriceStore from '../store/priceStore';

const sourceColors = {
  cache: 'text-blue-600',
  alchemy: 'text-green-600',
  interpolated: 'text-orange-600',
};

const PriceDisplay = () => {
  const { currentPrice, source, error, timestamp } = usePriceStore();
  
  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }
  
  if (currentPrice === null) {
    return null;
  }
  
  return (
    <div className="mt-6 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Token Price</h2>
        <div className="text-4xl font-bold">${currentPrice.toFixed(6)}</div>
        <div className="mt-2">
          Source: <span className={`font-medium ${sourceColors[source] || ''}`}>
            {source === 'cache' ? 'Cache' : 
             source === 'alchemy' ? 'Alchemy API' : 
             source === 'interpolated' ? 'Interpolated' : 'Unknown'}
          </span>
        </div>
        {timestamp && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Time: {new Date(timestamp * 1000).toLocaleString()}
            <div className="text-xs">Unix: {timestamp}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceDisplay;
