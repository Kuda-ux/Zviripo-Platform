import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/lib/auth-context';
import { useOnReconnect } from '../src/lib/connectivity';
import { syncPendingSales } from '../src/lib/offline-pos';

function SyncOnReconnect() {
  useOnReconnect(() => {
    void syncPendingSales();
  });
  return null;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <SyncOnReconnect />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
