import { create } from 'zustand';

const usePriceStore = create((set) => ({
  currentPrice: null,
  source: null,
  timestamp: null,
  loading: false,
  error: null,
  scheduleProgress: 0,

  // Actions
  fetchPrice: async (token, network, timestamp) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/price?token=${token}&network=${network}&timestamp=${timestamp}`
      );
      const data = await response.json();
      
      if (data.success) {
        set({ 
          currentPrice: data.price,
          source: data.source,
          timestamp: data.timestamp,
          loading: false 
        });
      } else {
        set({ error: data.message || 'Failed to fetch price', loading: false });
      }
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  scheduleHistoryFetch: async (token, network) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/schedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, network }),
        }
      );
      const data = await response.json();
      
      set({ loading: false });
      
      // Start polling for progress
      const progressInterval = setInterval(async () => {
        try {
          const progressResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/schedule/progress?jobId=${data.jobId}`
          );
          const progressData = await progressResponse.json();
          
          set({ scheduleProgress: progressData.progress });
          
          if (progressData.progress >= 100) {
            clearInterval(progressInterval);
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        }
      }, 5000);
      
      return data;
    } catch (error) {
      set({ error: error.message, loading: false });
      return null;
    }
  },

  resetState: () => set({ 
    currentPrice: null, 
    source: null,
    timestamp: null, 
    error: null 
  }),

  resetProgress: () => set({ scheduleProgress: 0 }),
}));

export default usePriceStore;
