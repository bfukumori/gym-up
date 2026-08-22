import { Observe, ObserveRoot, useObserve } from 'expo-observe';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/theme';
import { NotificationService } from '../src/services/notifications';

// Configure observe for startup metrics without locking route transitions
Observe.configure({});

// Set native window root background to dark theme (fixes white notch/cutout)
SystemUI.setBackgroundColorAsync(Colors.background).catch(() => {});

// Ensure splash screen is hidden safely without blocking UI
SplashScreen.hideAsync().catch(() => {});

function RootLayout() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
      try {
        markInteractive();
      } catch {}
    }, 50);

    // Initial sync of workout reminders if already permitted
    const initNotifications = async () => {
      try {
        const hasPerms = await NotificationService.hasPermissions();
        if (hasPerms) {
          await NotificationService.syncWorkoutReminders();
        }
      } catch (e) {
        console.error('Error initializing notifications:', e);
      }
    };

    initNotifications();

    // Silently pre-fetch OTA updates in background without abruptly reloading the UI
    const checkUpdates = async () => {
      if (__DEV__) return;
      try {
        const Updates = await import('expo-updates');
        const check = await Updates.checkForUpdateAsync();
        if (check.isAvailable) {
          await Updates.fetchUpdateAsync();
        }
      } catch {}
    };

    checkUpdates();

    // Re-sync notifications when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NotificationService.syncWorkoutReminders().catch(() => {});
        checkUpdates();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [markInteractive]);

  return (
    <SafeAreaProvider style={{ backgroundColor: Colors.background, flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="onboarding/quiz"
          options={{
            headerShown: true,
            title: 'Montar Treino com IA',
            headerStyle: { backgroundColor: Colors.card },
            headerTintColor: Colors.textPrimary,
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
        <Stack.Screen
          name="workout/[dayId]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default ObserveRoot.wrap(RootLayout);
