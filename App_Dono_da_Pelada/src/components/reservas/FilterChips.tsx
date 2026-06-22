/**
 * Barra de filtros (chips) do marketplace de Reservas.
 * Estado puramente visual/mock: o primeiro chip aparece selecionado.
 * Rola na horizontal; só consome tokens do tema.
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export function FilterChips({ filtros }: { filtros: string[] }) {
  const t = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, { gap: t.spacing.sm }]}
    >
      {filtros.map((filtro, index) => {
        const ativo = index === 0;
        return (
          <View
            key={filtro}
            style={[
              styles.chip,
              {
                backgroundColor: ativo ? t.colors.lime : t.colors.greenSurface,
                borderColor: ativo ? t.colors.lime : t.colors.greenBorder,
                borderRadius: t.radius.pill,
                paddingVertical: t.spacing.xs,
                paddingHorizontal: t.spacing.md,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: ativo ? t.colors.textOnLime : t.colors.textSecondary,
                  fontSize: t.typography.size.sm,
                },
              ]}
            >
              {filtro}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 4 },
  chip: { borderWidth: 1 },
  chipText: { fontWeight: '700' },
});
