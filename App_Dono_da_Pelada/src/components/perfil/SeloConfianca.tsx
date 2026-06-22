/**
 * SeloConfianca — selo de confiança / assiduidade do jogador.
 *
 * Card-herói da aba Perfil: comunica o nível de confiança (ligado ao combate
 * ao No-Show — CLAUDE.md §1) com uma barra de assiduidade e um selo nível.
 * Mobile-first e tematizado (apenas tokens — CH-05/CH-12). Sem PII (CH-15):
 * nome é só exibição.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export type NivelConfianca = 'novato' | 'confiavel' | 'exemplar';

export type SeloConfiancaProps = {
  /** Nome de exibição — NUNCA CPF (CH-15). */
  nome: string;
  nivel: NivelConfianca;
  /** Assiduidade em porcentagem (0–100). */
  assiduidade: number;
  /** Número de faltas (No-Show). */
  faltas: number;
};

const NIVEL_META: Record<
  NivelConfianca,
  { rotulo: string; icone: keyof typeof Ionicons.glyphMap }
> = {
  novato: { rotulo: 'Novato', icone: 'leaf-outline' },
  confiavel: { rotulo: 'Confiável', icone: 'shield-checkmark-outline' },
  exemplar: { rotulo: 'Exemplar', icone: 'ribbon-outline' },
};

/** Clampa a porcentagem ao intervalo válido (degradação tolerante). */
function clampPct(v: number): number {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

export function SeloConfianca({ nome, nivel, assiduidade, faltas }: SeloConfiancaProps) {
  const t = useTheme();
  const meta = NIVEL_META[nivel];
  const pct = clampPct(assiduidade);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurfaceAlt,
          borderColor: t.colors.lime,
          borderRadius: t.radius.lg,
          padding: t.spacing.lg,
        },
      ]}
    >
      <View style={styles.topo}>
        {/* Selo (medalha) */}
        <View
          style={[
            styles.selo,
            { backgroundColor: t.colors.lime, borderRadius: t.radius.pill },
          ]}
        >
          <Ionicons name={meta.icone} size={28} color={t.colors.textOnLime} />
        </View>

        <View style={styles.topoText}>
          <Text style={[styles.nome, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]} numberOfLines={1}>
            {nome}
          </Text>
          <View style={[styles.nivelPill, { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill }]}>
            <Ionicons name="checkmark-circle" size={13} color={t.colors.lime} />
            <Text style={[styles.nivelText, { color: t.colors.lime, fontSize: t.typography.size.xs }]}>
              Selo {meta.rotulo}
            </Text>
          </View>
        </View>
      </View>

      {/* Assiduidade — rótulo + valor */}
      <View style={[styles.assidRow, { marginTop: t.spacing.lg }]}>
        <Text style={[styles.assidLabel, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
          Assiduidade
        </Text>
        <Text style={[styles.assidValor, { color: t.colors.lime, fontSize: t.typography.size.lg }]}>
          {pct}%
        </Text>
      </View>

      {/* Barra de assiduidade */}
      <View
        style={[
          styles.barTrack,
          { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill, marginTop: t.spacing.sm },
        ]}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: pct }}
      >
        <View
          style={[
            styles.barFill,
            { backgroundColor: t.colors.lime, borderRadius: t.radius.pill, width: `${pct}%` },
          ]}
        />
      </View>

      {/* Faltas (No-Show) */}
      <View style={[styles.faltasRow, { marginTop: t.spacing.md }]}>
        <Ionicons
          name={faltas === 0 ? 'happy-outline' : 'alert-circle-outline'}
          size={15}
          color={faltas === 0 ? t.colors.success : t.colors.warning}
        />
        <Text style={[styles.faltasText, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
          {faltas === 0 ? 'Nenhuma falta registrada' : `${faltas} falta${faltas > 1 ? 's' : ''} (No-Show)`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  selo: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  topoText: { flex: 1 },
  nome: { fontWeight: '800' },
  nivelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 6,
  },
  nivelText: { fontWeight: '800', letterSpacing: 0.5 },
  assidRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  assidLabel: { fontWeight: '600' },
  assidValor: { fontWeight: '800' },
  barTrack: { height: 10, overflow: 'hidden' },
  barFill: { height: '100%' },
  faltasRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  faltasText: { fontWeight: '500' },
});
