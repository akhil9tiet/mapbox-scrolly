// Store Actions
export const storeActions = {
  // Map actions
  setMapViewport: (viewport: any) => ({
    type: 'SET_MAP_VIEWPORT' as const,
    payload: viewport,
  }),
  
  // Data actions
  setData: (data: any) => ({
    type: 'SET_DATA' as const,
    payload: data,
  }),
  
  // Loading states
  setLoading: (isLoading: boolean) => ({
    type: 'SET_LOADING' as const,
    payload: isLoading,
  }),
  
  // Error handling
  setError: (error: string | null) => ({
    type: 'SET_ERROR' as const,
    payload: error,
  }),
};

export type StoreAction = 
  | ReturnType<typeof storeActions.setMapViewport>
  | ReturnType<typeof storeActions.setData>
  | ReturnType<typeof storeActions.setLoading>
  | ReturnType<typeof storeActions.setError>;
