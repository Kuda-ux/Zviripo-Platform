import * as Network from 'expo-network';
import { useEffect, useRef, useState } from 'react';

export type Connectivity = 'online' | 'offline' | 'unknown';

/**
 * Live connectivity state. Resolves to 'unknown' until the first check
 * completes so screens never claim "online" before we know.
 */
export function useConnectivity(): Connectivity {
  const [state, setState] = useState<Connectivity>('unknown');
  useEffect(() => {
    let mounted = true;
    Network.getNetworkStateAsync()
      .then((s) => mounted && setState(s.isInternetReachable === false ? 'offline' : 'online'))
      .catch(() => mounted && setState('unknown'));
    const sub = Network.addNetworkStateListener((s) => {
      if (!mounted) return;
      setState(s.isInternetReachable === false || s.isConnected === false ? 'offline' : 'online');
    });
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return state;
}

/** Fires `onReconnect` once each time connectivity transitions offline → online. */
export function useOnReconnect(onReconnect: () => void) {
  const status = useConnectivity();
  const previous = useRef<Connectivity>('unknown');
  useEffect(() => {
    if (previous.current === 'offline' && status === 'online') onReconnect();
    previous.current = status;
  }, [status, onReconnect]);
  return status;
}
