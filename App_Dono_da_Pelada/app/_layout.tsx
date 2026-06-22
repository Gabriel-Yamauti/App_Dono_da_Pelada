import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import { useFonts } from 'expo-font';
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Lexend_400Regular, Lexend_700Bold } from '@expo-google-fonts/lexend';
import { Manrope_400Regular, Manrope_700Bold } from '@expo-google-fonts/manrope';

import { ThemeProvider, useTheme } from '../src/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { DataProvider } from '../src/context/DataContext';
import { LoginScreen } from '../src/screens/LoginScreen';

function AppContent() {
  const { user, isLoading } = useAuth();
  const t = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: t.colors.greenBackground, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={t.colors.lime} />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
    Lexend_400Regular,
    Lexend_700Bold,
    Manrope_400Regular,
    Manrope_700Bold,
    'Space Grotesk': SpaceGrotesk_700Bold,
    'Lexend': Lexend_400Regular,
    'Manrope': Manrope_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#131313', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#c3f400" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            {/* StatusBar clara sobre o fundo verde-escuro */}
            <StatusBar style="light" />
            <AppContent />
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
