/**
 * SumulaDigitalModal — súmula digital ("gamificar a várzea").
 *
 * Mostra placar e desempenho por jogador (gols, assistências, conduta) de uma
 * partida encerrada. Mobile-first e tematizado (apenas tokens — CH-05/CH-12).
 *
 * Disciplina de modal (CH-03): conteúdo CONTIDO na viewport (área central rola,
 * cabeçalho e rodapé ficam fixos), botão de fechar "X" SEMPRE visível, e fecha
 * por toque no "X" OU toque fora (no overlay). Sem PII (sem CPF — CH-15).
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import type { Partida } from './PartidaCard';

export type Conduta = 'fair-play' | 'amarelo' | 'vermelho';

export type LinhaSumula = {
  id: string;
  /** Nome de exibição — NUNCA CPF (CH-15). */
  nome: string;
  gols: number;
  assistencias: number;
  conduta: Conduta;
  /** Destaque da partida (craque). */
  craque?: boolean;
};

const CONDUTA_META: Record<
  Conduta,
  { icone: keyof typeof Ionicons.glyphMap; rotulo: string; tom: 'success' | 'warning' | 'danger' }
> = {
  'fair-play': { icone: 'happy-outline', rotulo: 'Fair play', tom: 'success' },
  amarelo: { icone: 'warning-outline', rotulo: 'Amarelo', tom: 'warning' },
  vermelho: { icone: 'remove-circle-outline', rotulo: 'Vermelho', tom: 'danger' },
};

export function SumulaDigitalModal({
  visivel,
  partida,
  linhas,
  onClose,
}: {
  visivel: boolean;
  partida: Partida | null;
  linhas: LinhaSumula[];
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay: toque fora fecha (CH-03) */}
      <Pressable
        accessibilityLabel="Fechar súmula"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: t.colors.overlay, paddingTop: insets.top + 24 }]}
      >
        {/* Folha do modal: stopPropagation para não fechar ao tocar dentro */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.sheet,
            {
              backgroundColor: t.colors.greenSurface,
              borderColor: t.colors.greenBorder,
              borderTopLeftRadius: t.radius.lg,
              borderTopRightRadius: t.radius.lg,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          {/* Cabeçalho FIXO com X sempre visível (CH-03) */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: t.colors.greenSurfaceAlt,
                borderTopLeftRadius: t.radius.lg,
                borderTopRightRadius: t.radius.lg,
                borderBottomColor: t.colors.greenBorder,
                padding: t.spacing.md,
              },
            ]}
          >
            <View style={styles.headerText}>
              <Text style={[styles.kicker, { color: t.colors.lime, fontSize: t.typography.size.xs }]}>
                SÚMULA DIGITAL
              </Text>
              <Text
                style={[styles.headerTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]}
                numberOfLines={1}
              >
                {partida?.titulo ?? 'Partida'}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                {
                  backgroundColor: pressed ? t.colors.greenBorder : t.colors.greenSurface,
                  borderRadius: t.radius.pill,
                },
              ]}
            >
              <Ionicons name="close" size={22} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          {/* Placar em destaque */}
          {partida?.placar ? (
            <View style={[styles.placarBox, { paddingVertical: t.spacing.md }]}>
              <Text style={[styles.placar, { color: t.colors.lime, fontSize: t.typography.size.xxl }]}>
                {partida.placar}
              </Text>
              <Text style={[styles.placarSub, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
                {partida.local} · {partida.quando}
              </Text>
            </View>
          ) : null}

          {/* Corpo ROLÁVEL contido na viewport (CH-03) */}
          <ScrollView
            style={styles.body}
            contentContainerStyle={{ padding: t.spacing.md, paddingTop: 0 }}
            showsVerticalScrollIndicator={false}
          >
            {linhas.map((l) => {
              const cm = CONDUTA_META[l.conduta];
              return (
                <View
                  key={l.id}
                  style={[
                    styles.linha,
                    {
                      backgroundColor: l.craque ? t.colors.greenSurfaceAlt : 'transparent',
                      borderColor: l.craque ? t.colors.lime : t.colors.greenBorder,
                      borderRadius: t.radius.md,
                      padding: t.spacing.sm,
                      marginTop: t.spacing.sm,
                    },
                  ]}
                >
                  {/* Identificação do jogador */}
                  <View style={styles.linhaInfo}>
                    <View
                      style={[
                        styles.avatar,
                        { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill },
                      ]}
                    >
                      <Ionicons
                        name={l.craque ? 'star' : 'person-outline'}
                        size={16}
                        color={l.craque ? t.colors.lime : t.colors.textSecondary}
                      />
                    </View>
                    <View style={styles.linhaNomeBox}>
                      <Text
                        style={[styles.nome, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}
                        numberOfLines={1}
                      >
                        {l.nome}
                      </Text>
                      <View style={styles.condutaRow}>
                        <Ionicons name={cm.icone} size={12} color={t.colors[cm.tom]} />
                        <Text style={[styles.condutaText, { color: t.colors[cm.tom], fontSize: t.typography.size.xs }]}>
                          {cm.rotulo}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Stats: gols / assistências */}
                  <View style={styles.stats}>
                    <Stat icone="football-outline" valor={l.gols} />
                    <Stat icone="trending-up-outline" valor={l.assistencias} />
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/** Mini-stat (ícone + valor) reutilizado nas linhas da súmula. */
function Stat({ icone, valor }: { icone: keyof typeof Ionicons.glyphMap; valor: number }) {
  const t = useTheme();
  return (
    <View style={styles.stat}>
      <Ionicons name={icone} size={15} color={t.colors.lime} />
      <Text style={[styles.statValor, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}>
        {valor}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Overlay alinha a folha ao fundo (bottom-sheet), mas com teto: maxHeight contém na viewport.
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '88%',
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: { flex: 1, paddingRight: 12 },
  kicker: { fontWeight: '800', letterSpacing: 1.2 },
  headerTitle: { fontWeight: '800', marginTop: 2 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  placarBox: { alignItems: 'center' },
  placar: { fontWeight: '800', letterSpacing: 2 },
  placarSub: { marginTop: 4 },
  body: { flexGrow: 0 },
  linha: {
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  linhaNomeBox: { flex: 1 },
  nome: { fontWeight: '700' },
  condutaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  condutaText: { fontWeight: '600' },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingLeft: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValor: { fontWeight: '800' },
});
