/**
 * Navegação por tabs inferiores (CLAUDE.md §1: Jogos · Coletivo · Reservas · Perfil).
 *
 * Cabeçalho e tab bar são PERSISTENTES em todas as abas (CH-04) e tematizados
 * com a paleta verde-escuro/limão (CH-05). Data-driven a partir de TABS.
 */

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { TABS } from '../../src/lib/tabs';
import { useTheme } from '../../src/theme';

export default function TabsLayout() {
  const t = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.colors.greenSurfaceAlt,
          borderTopColor: t.colors.greenBorder,
        },
        tabBarActiveTintColor: t.colors.lime,
        tabBarInactiveTintColor: t.colors.textSecondary,
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarLabel: tab.label,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
