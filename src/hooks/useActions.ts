import { useStore } from '../context/store';
import { storeActions } from '../context/store';

export const useActions = () => {
  const { dispatch } = useStore();

  return {
    setMapViewport: (viewport: any) => {
      dispatch(storeActions.setMapViewport(viewport));
    },
    setData: (data: any) => {
      dispatch(storeActions.setData(data));
    },
    setLoading: (isLoading: boolean) => {
      dispatch(storeActions.setLoading(isLoading));
    },
    setError: (error: string | null) => {
      dispatch(storeActions.setError(error));
    },
  };
};
