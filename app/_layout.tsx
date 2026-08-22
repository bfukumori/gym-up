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

// Configure EAS Observe with Expo Router integration at module scope
Observe.configure({
  integrations: { 'expo-router': true },
});

// Ensure native window background is dark
SystemUI.setBackgroundColorAsync(Colors.background).catch(() => {});

// Dismiss splash screen immediately
SplashScreen.hideAsync().catch(() => {});

function RootLayout() {
  const { markInteractive } = useObserve();

  useEffect(() => {
    markInteractive();
  }, [markInteractive]);
  useEffect(() => {
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

    // Re-sync notifications when app returns to foreground
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        NotificationService.syncWorkoutReminders().catch(() => {});
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

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
