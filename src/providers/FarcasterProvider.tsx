import { createContext, useContext, ReactNode } from 'react';
import { useFarcasterUser, FarcasterContext } from '@/hooks/useFarcasterUser';

const FarcasterCtx = createContext<FarcasterContext>({
  user: null,
  isLoading: true,
  isInMiniApp: false,
  isAdded: false,
});

export const useFarcaster = () => useContext(FarcasterCtx);

interface FarcasterProviderProps {
  children: ReactNode;
}

export const FarcasterProvider = ({ children }: FarcasterProviderProps) => {
  const farcasterContext = useFarcasterUser();

  return (
    <FarcasterCtx.Provider value={farcasterContext}>
      {children}
    </FarcasterCtx.Provider>
  );
};
