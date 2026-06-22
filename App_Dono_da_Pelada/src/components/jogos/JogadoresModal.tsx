/**
 * JogadoresModal — lista de jogadores confirmados de uma partida (Problema D).
 *
 * Modal CONTIDO na viewport com cabeçalho fixo e "X" sempre visível (CH-03);
 * fecha por "X" ou toque fora. A `RosterList` é reutilizável (também usada no
 * modal de gestão do hoster). Sem PII (sem CPF — CH-15).
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import type { JogadorPartida } from './roster';

/** Iniciais do nome (sem o sufixo "(Você)"). */
function iniciais(nome: string): string {
  return nome
    .replace(/\(você\)/i, '')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/** Lista de jogadores reutilizável (sem o invólucro de modal). */
export function RosterList({ jogadores }: { jogadores: JogadorPartida[] }) {
  const t = useTheme();
  if (jogadores.length === 0) {
    return (
      <Text style={{ color: t.colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
        Nenhum jogador confirmado ainda.
      </Text>
    );
  }
  return (
    <View style={{ gap: 8 }}>
      {jogadores.map((j) => (
        <View
          key={j.id}
          style={[
            styles.linha,
            {
              backgroundColor: j.voce ? t.colors.greenSurfaceAlt : 'transparent',
              borderColor: j.voce ? t.colors.lime : t.colors.greenBorder,
              borderRadius: t.radius.md,
            },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: t.colors.greenBackground, borderColor: j.voce ? t.colors.lime : t.colors.greenBorder }]}>
            <Text style={{ color: j.voce ? t.colors.lime : t.colors.textSecondary, fontWeight: '800', fontSize: 12 }}>
              {iniciais(j.nome)}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.colors.textPrimary, fontWeight: '700', fontSize: 14 }} numberOfLines={1}>
              {j.nome}
            </Text>
            <Text style={{ color: t.colors.textSecondary, fontSize: 11 }}>{j.posicao}</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={t.colors.success} />
        </View>
      ))}
    </View>
  );
}

export function JogadoresModal({
  visivel,
  titulo,
  jogadores,
  onClose,
}: {
  visivel: boolean;
  titulo: string;
  jogadores: JogadorPartida[];
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Fechar lista de jogadores"
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
              <Text style={[styles.kicker, { color: t.colors.lime }]}>JOGADORES CONFIRMADOS</Text>
              <Text style={[styles.title, { color: t.colors.textPrimary }]} numberOfLines={1}>
                {titulo} · {jogadores.length}
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

          <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
            <RosterList jogadores={jogadores} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  sheet: { borderWidth: 1, borderBottomWidth: 0, maxHeight: '85%', overflow: 'hidden' },
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
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    padding: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
