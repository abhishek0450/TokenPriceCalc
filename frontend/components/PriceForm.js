'use client';

import { useState } from 'react';
import usePriceStore from '../store/priceStore';

const PriceForm = () => {
  const { fetchPrice, scheduleHistoryFetch, loading } = usePriceStore();
  
  const [formData, setFormData] = useState({
    token: '',
    network: 'ethereum',
    timestamp: '',
  });
  
  const [tokenError, setTokenError] = useState('');
  const [timestampError, setTimestampError] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Reset validation errors on change
    if (name === 'token') setTokenError('');
    if (name === 'timestamp') setTimestampError('');
  };

  const validateToken = (address) => {
    // Basic Ethereum address validation
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  };

  const handleGetPrice = (e) => {
    e.preventDefault();
    
    // Validate token address
    if (!validateToken(formData.token)) {
      setTokenError('Please enter a valid token address (0x...)');
      return;
    }
    
    // Validate timestamp
    if (!formData.timestamp) {
      setTimestampError('Please enter a Unix timestamp');
      return;
    }
    
    // Validate if the timestamp is a number
    const unixTimestamp = parseInt(formData.timestamp);
    if (isNaN(unixTimestamp)) {
      setTimestampError('Please enter a valid Unix timestamp (number)');
      return;
    }
    
    // Fetch price
    fetchPrice(formData.token, formData.network, unixTimestamp);
  };

  const handleScheduleHistory = async (e) => {
    e.preventDefault();
    
    // Validate token address
    if (!validateToken(formData.token)) {
      setTokenError('Please enter a valid token address (0x...)');
      return;
    }
    
    // Schedule full history fetch
    const result = await scheduleHistoryFetch(formData.token, formData.network);
    
    if (result) {
      setScheduleMessage(`Job ${result.jobId} scheduled. Estimated completion: ${new Date(result.estimatedCompletion).toLocaleString()}`);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Token Address
          </label>
          <input
            type="text"
            name="token"
            value={formData.token}
            onChange={handleChange}
            placeholder="0x..."
            className={`mt-1 block w-full px-3 py-2 border ${
              tokenError ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          {tokenError && <p className="mt-1 text-sm text-red-500">{tokenError}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Network
          </label>
          <select
            name="network"
            value={formData.network}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Unix Timestamp
          </label>
          <input
            type="text"
            name="timestamp"
            value={formData.timestamp}
            onChange={handleChange}
            placeholder="e.g., 1626307200"
            className={`mt-1 block w-full px-3 py-2 border ${
              timestampError ? 'border-red-500' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white`}
          />
          <p className="mt-1 text-xs text-gray-500">Enter Unix timestamp in seconds</p>
          {timestampError && <p className="mt-1 text-sm text-red-500">{timestampError}</p>}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            onClick={handleGetPrice}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
          >
            {loading ? 'Loading...' : 'Get Price'}
          </button>
          
          <button
            type="button"
            onClick={handleScheduleHistory}
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
          >
            {loading ? 'Loading...' : 'Schedule Full History'}
          </button>
        </div>
      </form>
      
      {scheduleMessage && (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
          {scheduleMessage}
        </div>
      )}
    </div>
  );
};

export default PriceForm;
