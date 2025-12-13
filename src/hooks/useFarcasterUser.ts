import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

export interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface FarcasterContext {
  user: FarcasterUser | null;
  isLoading: boolean;
  isInMiniApp: boolean;
  isAdded: boolean;
}

export const useFarcasterUser = (): FarcasterContext => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInMiniApp, setIsInMiniApp] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const context = await sdk.context;
        
        if (context?.user) {
          setIsInMiniApp(true);
          setIsAdded(context.client?.added ?? false);
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl,
          });
        }
      } catch (err) {
        console.warn('Not running in Farcaster Mini App:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initFarcaster();
  }, []);

  return { user, isLoading, isInMiniApp, isAdded };
};
