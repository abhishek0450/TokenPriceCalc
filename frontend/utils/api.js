const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Fetch token price
export const fetchTokenPrice = async (token, network, timestamp) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/price?token=${token}&network=${network}&timestamp=${timestamp}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching token price:', error);
    throw error;
  }
};

// Schedule full history fetch
export const scheduleHistoryFetch = async (token, network) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/schedule`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, network }),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error scheduling history fetch:', error);
    throw error;
  }
};

// Get job progress
export const getJobProgress = async (jobId) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/schedule/progress?jobId=${jobId}`
    );
    return await response.json();
  } catch (error) {
    console.error('Error fetching job progress:', error);
    throw error;
  }
};
