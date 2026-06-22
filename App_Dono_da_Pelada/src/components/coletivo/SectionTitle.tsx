/**
 * Título de seção da aba Coletivo (ícone outline + rótulo).
 * Componente puramente de apresentação; só consome tokens do tema.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function SectionTitle({ icon, label }: { icon: IconName; label: string }) {
  const t = useTheme();
  return (
    <View style={[styles.row, { marginTop: t.spacing.lg }]}>
      <Ionicons name={icon} size={20} color={t.colors.lime} />
      <Text
        style={[
          styles.label,
          { color: t.colors.textPrimary, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.bold },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: {},
});
