/**
 * PartidaCard — card de partida da aba Jogos.
 *
 * Mobile-first, tematizado (apenas tokens do tema — CH-05/CH-12). Apresenta a
 * pelada com badge de status, local, horário, vagas e — quando encerrada — um
 * CTA verde-limão para abrir a súmula digital.
 *
 * Sem PII (sem CPF — CH-15): apenas nomes de exibição fictícios.
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../theme';

export type StatusPartida = 'hoster' | 'confirmada' | 'aberta' | 'encerrada';

export type Partida = {
  id: string;
  titulo: string;
  local: string;
  quando: string;
  vagas: { ocupadas: number; total: number };
  status: StatusPartida;
  /** Placar exibido apenas em partidas encerradas (ex.: "6 x 4"). */
  placar?: string;
  confirmado?: boolean;
};

const STATUS_META: Record<
  StatusPartida,
  { rotulo: string; icone: keyof typeof Ionicons.glyphMap }
> = {
  hoster: { rotulo: 'Você organiza', icone: 'megaphone-outline' },
  confirmada: { rotulo: 'Confirmada', icone: 'checkmark-circle-outline' },
  aberta: { rotulo: 'Completar time', icone: 'people-outline' },
  encerrada: { rotulo: 'Encerrada', icone: 'flag-outline' },
};

export function PartidaCard({
  partida,
  onVerSumula,
  onTogglePresenca,
  onVerJogadores,
}: {
  partida: Partida;
  onVerSumula?: (partida: Partida) => void;
  onTogglePresenca?: (partidaId: string) => void;
  onVerJogadores?: (partida: Partida) => void;
}) {
  const t = useTheme();
  const meta = STATUS_META[partida.status];
  const encerrada = partida.status === 'encerrada';
  const destaque = partida.status === 'hoster';

  // Cor do badge: hoster ganha o verde-limão; demais usam acento sutil.
  const badgeBg = destaque ? t.colors.lime : t.colors.greenSurfaceAlt;
  const badgeFg = destaque ? t.colors.textOnLime : t.colors.lime;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurface,
          borderColor: destaque ? t.colors.lime : t.colors.greenBorder,
          borderRadius: t.radius.lg,
          padding: t.spacing.md,
          marginTop: t.spacing.md,
        },
      ]}
    >
      {/* Cabeçalho: badge de status + placar (se encerrada) */}
      <View style={styles.header}>
        <View
          style={[
            styles.badge,
            { backgroundColor: badgeBg, borderRadius: t.radius.pill, paddingVertical: t.spacing.xs },
          ]}
        >
          <Ionicons name={meta.icone} size={13} color={badgeFg} />
          <Text style={[styles.badgeText, { color: badgeFg, fontSize: t.typography.size.xs }]}>
            {meta.rotulo}
          </Text>
        </View>

        {encerrada && partida.placar ? (
          <Text style={[styles.placar, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]}>
            {partida.placar}
          </Text>
        ) : null}
      </View>

      {/* Título da partida */}
      <Text
        style={[
          styles.titulo,
          { color: t.colors.textPrimary, fontSize: t.typography.size.xl, fontWeight: t.typography.weight.bold },
        ]}
        numberOfLines={1}
      >
        {partida.titulo}
      </Text>

      {/* Metadados: quando · local */}
      <View style={[styles.metaRow, { marginTop: t.spacing.sm }]}>
        <Ionicons name="time-outline" size={15} color={t.colors.lime} />
        <Text style={[styles.metaText, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
          {partida.quando}
        </Text>
      </View>
      <View style={[styles.metaRow, { marginTop: t.spacing.xs }]}>
        <Ionicons name="location-outline" size={15} color={t.colors.lime} />
        <Text style={[styles.metaText, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
          {partida.local}
        </Text>
      </View>

      {/* Rodapé: vagas + CTA súmula / presença */}
      <View
        style={[
          styles.footer,
          { borderTopColor: t.colors.greenBorder, marginTop: t.spacing.md, paddingTop: t.spacing.md },
        ]}
      >
        {onVerJogadores ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver jogadores de ${partida.titulo}`}
            onPress={() => onVerJogadores(partida)}
            style={({ pressed }) => [styles.metaRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="people-outline" size={15} color={t.colors.lime} />
            <Text style={[styles.metaText, { color: t.colors.lime, fontSize: t.typography.size.sm, textDecorationLine: 'underline' }]}>
              {partida.vagas.ocupadas}/{partida.vagas.total} jogadores
            </Text>
          </Pressable>
        ) : (
          <View style={styles.metaRow}>
            <Ionicons name="people-outline" size={15} color={t.colors.textSecondary} />
            <Text style={[styles.metaText, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
              {partida.vagas.ocupadas}/{partida.vagas.total} jogadores
            </Text>
          </View>
        )}

        {encerrada ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Ver súmula de ${partida.titulo}`}
            onPress={() => onVerSumula?.(partida)}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
                borderRadius: t.radius.pill,
                paddingVertical: t.spacing.xs,
                paddingHorizontal: t.spacing.md,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={15} color={t.colors.textOnLime} />
            <Text style={[styles.ctaText, { color: t.colors.textOnLime, fontSize: t.typography.size.sm }]}>
              Súmula
            </Text>
          </Pressable>
        ) : (
          partida.status !== 'hoster' && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={partida.confirmado ? "Cancelar Presença" : "Confirmar Presença"}
              onPress={() => onTogglePresenca?.(partida.id)}
              style={({ pressed }) => [
                styles.cta,
                {
                  backgroundColor: partida.confirmado 
                    ? 'transparent'
                    : (pressed ? t.colors.greenCtaPressed : t.colors.greenCta),
                  borderColor: partida.confirmado ? t.colors.danger : 'transparent',
                  borderWidth: partida.confirmado ? 1 : 0,
                  borderRadius: t.radius.pill,
                  paddingVertical: t.spacing.xs,
                  paddingHorizontal: t.spacing.md,
                },
              ]}
            >
              {partida.confirmado ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Ionicons name="checkmark-circle-outline" size={15} color={t.colors.success} />
                  <Text style={[styles.ctaText, { color: t.colors.success, fontSize: t.typography.size.sm }]}>
                    Confirmado
                  </Text>
                </View>
              ) : (
                <Text style={[styles.ctaText, { color: t.colors.textOnGreen, fontSize: t.typography.size.sm }]}>
                  Confirmar Presença
                </Text>
              )}
            </Pressable>
          )
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
  },
  badgeText: { fontWeight: '700', letterSpacing: 0.3 },
  placar: { fontWeight: '800', letterSpacing: 1 },
  titulo: { marginTop: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontWeight: '500' },
  footer: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ctaText: { fontWeight: '800' },
});
