/**
 * "Ranking Local" — lista compacta de times com posição, iniciais e pontos.
 * A linha do próprio usuário (entry.voce) ganha destaque verde-limão.
 * Usa apenas tokens do tema (sem cores hardcoded — CH-05/CH-12).
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import type { RankingEntry } from './data';

/** Cor da medalha por pódio (1º/2º/3º); demais usam texto secundário. */
function medalColor(posicao: number, t: ReturnType<typeof useTheme>): string {
  if (posicao === 1) return t.colors.warning;
  if (posicao === 2) return t.colors.textSecondary;
  if (posicao === 3) return t.colors.limeMuted;
  return t.colors.textSecondary;
}

export function RankingList({ entries }: { entries: RankingEntry[] }) {
  const t = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurface,
          borderColor: t.colors.greenBorder,
          borderRadius: t.radius.md,
          padding: t.spacing.sm,
        },
      ]}
    >
      {entries.map((entry, index) => (
        <View
          key={entry.id}
          style={[
            styles.row,
            {
              borderTopWidth: index === 0 ? 0 : StyleSheet.hairlineWidth,
              borderTopColor: t.colors.greenBorder,
              backgroundColor: entry.voce ? t.colors.greenSurfaceAlt : 'transparent',
              borderRadius: entry.voce ? t.radius.sm : 0,
              padding: t.spacing.sm,
            },
          ]}
        >
          <Text
            style={[
              styles.position,
              { color: medalColor(entry.posicao, t), fontSize: t.typography.size.md },
            ]}
          >
            {entry.posicao}º
          </Text>

          <View style={[styles.badge, { backgroundColor: t.colors.greenBackground, borderColor: t.colors.greenBorder }]}>
            <Text style={[styles.badgeText, { color: t.colors.textPrimary }]}>{entry.iniciais}</Text>
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.name,
              {
                color: entry.voce ? t.colors.lime : t.colors.textPrimary,
                fontSize: t.typography.size.md,
                fontWeight: entry.voce ? '800' : '600',
              },
            ]}
          >
            {entry.nome}
          </Text>

          <Text style={[styles.points, { color: t.colors.lime, fontSize: t.typography.size.sm }]}>
            {entry.pontos} pts
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  position: { width: 36, fontWeight: '800' },
  badge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontWeight: '700', fontSize: 13 },
  name: { flex: 1 },
  points: { fontWeight: '800' },
});
