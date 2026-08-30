import { createContext, ReactNode, useReducer } from 'react';
import { storeReducer, StoreState } from './reducer';
import { StoreAction } from './actions';

interface StoreContextType {
  state: StoreState;
  dispatch: (action: StoreAction) => void;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [state, dispatch] = useReducer(storeReducer, storeReducer(undefined as any, {} as any));

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
