import { useEffect } from 'react';
import { useActions } from '../useActions';
import { useStore } from '../../context/store';

/**
 * Hook for making API calls with automatic loading and error states
 * @param url - The API endpoint to fetch from
 * @param deps - Dependency array
 */
export const useFetchData = (url: string, deps: any[] = []) => {
  const { setLoading, setError, setData } = useActions();
  const { state } = useStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const data = await response.json();
        setData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, ...deps]);

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error,
  };
};
