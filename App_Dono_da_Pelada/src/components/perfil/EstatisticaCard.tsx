/**
 * EstatisticaCard — card de métrica da aba Perfil.
 *
 * Exibe uma estatística (ícone outline + valor em destaque + rótulo) e uma
 * tendência opcional (alta/baixa/estável). Mobile-first e tematizado (apenas
 * tokens — CH-05/CH-12). Pensado para grade de 2 colunas.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export type Tendencia = 'alta' | 'baixa' | 'estavel';

export type Estatistica = {
  id: string;
  icone: keyof typeof Ionicons.glyphMap;
  valor: string;
  rotulo: string;
  /** Texto curto de variação (ex.: "+3 no mês"). */
  variacao?: string;
  tendencia?: Tendencia;
  /** Realça o card com a cor verde-limão (métrica-herói). */
  destaque?: boolean;
};

const TENDENCIA_META: Record<
  Tendencia,
  { icone: keyof typeof Ionicons.glyphMap; tom: 'success' | 'danger' | 'textSecondary' }
> = {
  alta: { icone: 'arrow-up', tom: 'success' },
  baixa: { icone: 'arrow-down', tom: 'danger' },
  estavel: { icone: 'remove', tom: 'textSecondary' },
};

export function EstatisticaCard({ estatistica }: { estatistica: Estatistica }) {
  const t = useTheme();
  const { destaque } = estatistica;
  const iconBg = destaque ? t.colors.lime : t.colors.greenSurfaceAlt;
  const iconFg = destaque ? t.colors.textOnLime : t.colors.lime;
  const tend = estatistica.tendencia ? TENDENCIA_META[estatistica.tendencia] : null;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurface,
          borderColor: destaque ? t.colors.lime : t.colors.greenBorder,
          borderRadius: t.radius.lg,
          padding: t.spacing.md,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: iconBg, borderRadius: t.radius.md },
        ]}
      >
        <Ionicons name={estatistica.icone} size={20} color={iconFg} />
      </View>

      <Text
        style={[
          styles.valor,
          { color: t.colors.textPrimary, fontSize: t.typography.size.xl, fontWeight: t.typography.weight.bold },
        ]}
        numberOfLines={1}
      >
        {estatistica.valor}
      </Text>
      <Text style={[styles.rotulo, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
        {estatistica.rotulo}
      </Text>

      {estatistica.variacao ? (
        <View style={[styles.variacaoRow, { marginTop: t.spacing.sm }]}>
          {tend ? <Ionicons name={tend.icone} size={13} color={t.colors[tend.tom]} /> : null}
          <Text
            style={[
              styles.variacao,
              { color: tend ? t.colors[tend.tom] : t.colors.textSecondary, fontSize: t.typography.size.xs },
            ]}
          >
            {estatistica.variacao}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, flex: 1 },
  iconWrap: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  valor: { letterSpacing: 0.3 },
  rotulo: { marginTop: 2, fontWeight: '500' },
  variacaoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  variacao: { fontWeight: '700' },
});
