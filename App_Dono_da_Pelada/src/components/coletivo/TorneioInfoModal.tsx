/**
 * TorneioInfoModal — detalhes de um torneio (Problema F, "Mais Informações").
 *
 * Modal contido com cabeçalho fixo e "X" sempre visível (CH-03). Mostra os
 * dados do torneio e oferece a ação principal conforme o estado (inscrever ou
 * cancelar inscrição). Sem PII (CH-15).
 */
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import type { Torneio } from '../../context/DataContext';

function Linha({ icone, rotulo, valor }: { icone: keyof typeof Ionicons.glyphMap; rotulo: string; valor: string }) {
  const t = useTheme();
  return (
    <View style={styles.linha}>
      <Ionicons name={icone} size={16} color={t.colors.lime} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>{rotulo}</Text>
        <Text style={{ color: t.colors.textPrimary, fontSize: 14, fontWeight: '700' }}>{valor}</Text>
      </View>
    </View>
  );
}

export function TorneioInfoModal({
  visivel,
  torneio,
  onInscrever,
  onCancelar,
  onClose,
}: {
  visivel: boolean;
  torneio: Torneio | null;
  onInscrever: () => void;
  onCancelar: () => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const inscrito = !!torneio?.inscrito;

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Fechar informações do torneio"
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
          <View style={[styles.header, { backgroundColor: t.colors.greenSurfaceAlt, borderBottomColor: t.colors.greenBorder, borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.kicker, { color: t.colors.lime }]}>TORNEIO</Text>
              <Text style={[styles.title, { color: t.colors.textPrimary }]} numberOfLines={2}>
                {torneio?.nome ?? 'Torneio'}
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

          <ScrollView contentContainerStyle={{ padding: 16, gap: 6 }} showsVerticalScrollIndicator={false}>
            <View style={[styles.statusPill, { backgroundColor: inscrito ? 'rgba(195,244,0,0.15)' : t.colors.greenSurfaceAlt, borderColor: inscrito ? t.colors.lime : t.colors.greenBorder, alignSelf: 'flex-start' }]}>
              <Text style={{ color: inscrito ? t.colors.lime : t.colors.textSecondary, fontSize: 11, fontWeight: '800' }}>
                {inscrito ? 'VOCÊ ESTÁ INSCRITO' : 'INSCRIÇÕES ABERTAS'}
              </Text>
            </View>

            <Linha icone="location-outline" rotulo="Local" valor={torneio?.local ?? 'A definir'} />
            <Linha icone="ribbon-outline" rotulo="Categoria" valor={torneio?.categoria ?? 'Várzea'} />
            <Linha icone="calendar-outline" rotulo="Encerramento das inscrições" valor={torneio?.deadline ?? 'A definir'} />
            {inscrito && torneio?.nextMatch ? (
              <Linha icone="football-outline" rotulo="Próximo jogo" valor={torneio.nextMatch} />
            ) : null}
            <Linha icone="cash-outline" rotulo="Formato" valor="Mata-mata · taxa por equipe" />

            {inscrito ? (
              <Pressable
                accessibilityRole="button"
                onPress={onCancelar}
                style={({ pressed }) => [styles.cta, { backgroundColor: pressed ? 'rgba(255,92,92,0.15)' : 'transparent', borderColor: t.colors.danger }]}
              >
                <Ionicons name="close-circle-outline" size={18} color={t.colors.danger} />
                <Text style={{ color: t.colors.danger, fontWeight: '800', fontSize: 13 }}>Cancelar inscrição</Text>
              </Pressable>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={onInscrever}
                style={({ pressed }) => [styles.cta, { backgroundColor: pressed ? t.colors.limePressed : t.colors.lime, borderColor: t.colors.lime }]}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color={t.colors.textOnLime} />
                <Text style={{ color: t.colors.textOnLime, fontWeight: '800', fontSize: 13 }}>Inscrever meu time</Text>
              </Pressable>
            )}
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
  statusPill: { borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, marginBottom: 8 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    height: 48,
    borderRadius: 8,
    marginTop: 16,
  },
});
