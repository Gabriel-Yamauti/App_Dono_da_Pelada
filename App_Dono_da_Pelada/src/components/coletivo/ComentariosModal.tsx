/**
 * ComentariosModal — thread de comentários com RESPOSTAS (Problema E).
 *
 * Lista os comentários de um post e as respostas aninhadas (um nível). Permite
 * comentar OU responder a um comentário específico (o input mostra "respondendo
 * a X"). Modal contido com cabeçalho fixo e "X" sempre visível (CH-03).
 *
 * Sem PII (sem CPF — CH-15): autores são nomes de exibição.
 */
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../theme';
import type { Post } from '../../context/DataContext';

export function ComentariosModal({
  visivel,
  post,
  onComentar,
  onResponder,
  onClose,
}: {
  visivel: boolean;
  post: Post | null;
  onComentar: (texto: string) => void;
  onResponder: (comentarioId: string, texto: string) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [texto, setTexto] = useState('');
  const [respondendoA, setRespondendoA] = useState<{ id: string; autor: string } | null>(null);

  const comentarios = post?.comentarios ?? [];

  const handleEnviar = () => {
    const conteudo = texto.trim();
    if (!conteudo) return;
    if (respondendoA) {
      onResponder(respondendoA.id, conteudo);
    } else {
      onComentar(conteudo);
    }
    setTexto('');
    setRespondendoA(null);
  };

  const fechar = () => {
    setTexto('');
    setRespondendoA(null);
    onClose();
  };

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent onRequestClose={fechar}>
      <Pressable
        accessibilityLabel="Fechar comentários"
        onPress={fechar}
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
            },
          ]}
        >
          {/* Cabeçalho FIXO com X (CH-03) */}
          <View style={[styles.header, { backgroundColor: t.colors.greenSurfaceAlt, borderBottomColor: t.colors.greenBorder, borderTopLeftRadius: t.radius.lg, borderTopRightRadius: t.radius.lg }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.kicker, { color: t.colors.lime }]}>COMENTÁRIOS</Text>
              <Text style={[styles.title, { color: t.colors.textPrimary }]} numberOfLines={1}>
                {post?.name ?? 'Publicação'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              hitSlop={12}
              onPress={fechar}
              style={({ pressed }) => [styles.closeBtn, { backgroundColor: pressed ? t.colors.greenBorder : t.colors.greenSurface, borderRadius: t.radius.pill }]}
            >
              <Ionicons name="close" size={22} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }} showsVerticalScrollIndicator={false}>
            {comentarios.length === 0 && (
              <Text style={{ color: t.colors.textSecondary, textAlign: 'center', paddingVertical: 16 }}>
                Seja o primeiro a comentar.
              </Text>
            )}
            {comentarios.map((c) => (
              <View key={c.id}>
                <View style={[styles.comentario, { borderColor: t.colors.greenBorder, backgroundColor: t.colors.greenBackground, borderRadius: t.radius.md }]}>
                  <View style={styles.comentarioHeader}>
                    <Text style={{ color: t.colors.textPrimary, fontWeight: '800', fontSize: 13 }}>{c.autor}</Text>
                    <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>{c.tempo}</Text>
                  </View>
                  <Text style={{ color: t.colors.textPrimary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>{c.texto}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Responder a ${c.autor}`}
                    onPress={() => setRespondendoA({ id: c.id, autor: c.autor })}
                    style={styles.replyLink}
                  >
                    <Ionicons name="return-down-forward-outline" size={14} color={t.colors.lime} />
                    <Text style={{ color: t.colors.lime, fontSize: 11, fontWeight: '700' }}>Responder</Text>
                  </Pressable>
                </View>

                {/* Respostas aninhadas */}
                {c.respostas.map((r) => (
                  <View key={r.id} style={[styles.resposta, { borderLeftColor: t.colors.greenBorder }]}>
                    <View style={styles.comentarioHeader}>
                      <Text style={{ color: t.colors.textPrimary, fontWeight: '700', fontSize: 12 }}>{r.autor}</Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>{r.tempo}</Text>
                    </View>
                    <Text style={{ color: t.colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 17 }}>{r.texto}</Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>

          {/* Barra de input FIXA */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={[styles.inputBar, { borderTopColor: t.colors.greenBorder, paddingBottom: insets.bottom + 10 }]}>
              {respondendoA && (
                <View style={[styles.replyingChip, { backgroundColor: t.colors.greenSurfaceAlt }]}>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 11, flex: 1 }} numberOfLines={1}>
                    Respondendo a <Text style={{ color: t.colors.lime, fontWeight: '700' }}>{respondendoA.autor}</Text>
                  </Text>
                  <Pressable accessibilityLabel="Cancelar resposta" onPress={() => setRespondendoA(null)} hitSlop={8}>
                    <Ionicons name="close-circle" size={16} color={t.colors.textSecondary} />
                  </Pressable>
                </View>
              )}
              <View style={styles.inputRow}>
                <TextInput
                  placeholder={respondendoA ? `Responder a ${respondendoA.autor}…` : 'Escreva um comentário…'}
                  placeholderTextColor={t.colors.textSecondary}
                  value={texto}
                  onChangeText={setTexto}
                  multiline
                  style={[styles.input, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, backgroundColor: t.colors.greenBackground, borderRadius: t.radius.sm }]}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Enviar"
                  onPress={handleEnviar}
                  style={({ pressed }) => [styles.sendBtn, { backgroundColor: pressed ? t.colors.limePressed : t.colors.lime, borderRadius: t.radius.sm }]}
                >
                  <Ionicons name="send" size={18} color={t.colors.textOnLime} />
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
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
  comentario: { borderWidth: 1, padding: 12 },
  comentarioHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  replyLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  resposta: {
    borderLeftWidth: 2,
    marginLeft: 18,
    marginTop: 8,
    paddingLeft: 12,
    paddingVertical: 4,
  },
  inputBar: { borderTopWidth: 1, paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  replyingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 44,
    maxHeight: 100,
    fontSize: 14,
  },
  sendBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
