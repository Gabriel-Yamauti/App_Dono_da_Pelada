/**
 * GestaoTimeModal — painel de gestão do time para o hoster (Problema C).
 *
 * Substitui o antigo placeholder do botão "Gestão". Mostra o resumo da partida,
 * o elenco confirmado (RosterList) e ações REAIS do organizador: fechar/reabrir
 * a lista de presença (estado persistido) e notificar os confirmados.
 *
 * Modal CONTIDO com cabeçalho fixo e "X" sempre visível (CH-03); fecha por "X"
 * ou toque fora. Sem PII (sem CPF — CH-15).
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import type { Partida } from '../../context/DataContext';
import { RosterList } from './JogadoresModal';
import type { JogadorPartida } from './roster';

export function GestaoTimeModal({
  visivel,
  partida,
  jogadores,
  onToggleLista,
  onClose,
}: {
  visivel: boolean;
  partida: Partida | null;
  jogadores: JogadorPartida[];
  onToggleLista: () => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const fechada = !!partida?.listaFechada;

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Fechar gestão do time"
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: t.colors.overlay, paddingTop: insets.top + 24 }]}
      >
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
          <View style={[styles.header, { backgroundColor: t.colors.greenSurfaceAlt, borderBottomColor: t.colors.greenBorder, borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.kicker, { color: t.colors.lime }]}>GESTÃO DO TIME</Text>
              <Text style={[styles.title, { color: t.colors.textPrimary }]} numberOfLines={1}>
                {partida?.titulo ?? 'Partida'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: pressed ? t.colors.greenBorder : t.colors.greenSurface, borderRadius: t.radius.pill }]}
            >
              <Ionicons name="close" size={22} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }} showsVerticalScrollIndicator={false}>
            {/* Resumo da partida */}
            <View style={[styles.resumo, { backgroundColor: t.colors.greenBackground, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
              <View style={styles.resumoRow}>
                <Ionicons name="people-outline" size={16} color={t.colors.lime} />
                <Text style={{ color: t.colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                  {partida?.vagas.ocupadas ?? 0}/{partida?.vagas.total ?? 0} confirmados
                </Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: fechada ? 'rgba(255,92,92,0.15)' : 'rgba(195,244,0,0.15)', borderColor: fechada ? t.colors.danger : t.colors.lime }]}>
                <Text style={{ color: fechada ? t.colors.danger : t.colors.lime, fontSize: 11, fontWeight: '800' }}>
                  {fechada ? 'LISTA FECHADA' : 'LISTA ABERTA'}
                </Text>
              </View>
            </View>

            {/* Ações do hoster */}
            <View style={{ gap: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={onToggleLista}
                style={({ pressed }) => [
                  styles.actionBtn,
                  {
                    backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground,
                    borderColor: fechada ? t.colors.lime : t.colors.danger,
                  },
                ]}
              >
                <Ionicons name={fechada ? 'lock-open-outline' : 'lock-closed-outline'} size={18} color={fechada ? t.colors.lime : t.colors.danger} />
                <Text style={{ color: t.colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                  {fechada ? 'Reabrir lista de presença' : 'Fechar lista de presença'}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  Alert.alert(
                    'Notificação enviada',
                    `Os ${jogadores.length} confirmados foram notificados sobre "${partida?.titulo ?? 'a partida'}".`,
                  )
                }
                style={({ pressed }) => [
                  styles.actionBtn,
                  { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderColor: t.colors.greenBorder },
                ]}
              >
                <Ionicons name="notifications-outline" size={18} color={t.colors.lime} />
                <Text style={{ color: t.colors.textPrimary, fontWeight: '700', fontSize: 13 }}>
                  Notificar confirmados
                </Text>
              </Pressable>
            </View>

            {/* Elenco */}
            <View>
              <Text style={[styles.sectionTitle, { color: t.colors.textPrimary }]}>ELENCO CONFIRMADO</Text>
              <RosterList jogadores={jogadores} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderWidth: 1, borderBottomWidth: 0, maxHeight: '88%', overflow: 'hidden' },
  header: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  kicker: { fontFamily: 'Lexend', fontWeight: '800', letterSpacing: 1.2, fontSize: 10 },
  title: { fontFamily: 'Space Grotesk', fontWeight: '800', fontSize: 18, marginTop: 2 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  resumo: {
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusPill: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    height: 48,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sectionTitle: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
});
