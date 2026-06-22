/**
 * Cartão de um post da comunidade (aba Coletivo).
 * Avatar é um placeholder com iniciais (sem imagem de rede — 100% local, CH-06).
 * Usa apenas tokens do tema (sem cores hardcoded — CH-05/CH-12).
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';

export type PostData = {
  id: string;
  name: string;
  time: string;
  content: string;
  likes: number;
  commentsCount: number;
  liked: boolean;
  comentarios?: { respostas: unknown[] }[];
};

export function PostCard({
  post,
  onLikePress,
  onCommentPress,
}: {
  post: PostData;
  onLikePress?: (postId: string) => void;
  onCommentPress?: (postId: string) => void;
}) {
  const t = useTheme();

  // Conta comentários + respostas quando há thread; senão usa o contador base.
  const totalComentarios = post.comentarios
    ? post.comentarios.reduce((sum, c) => sum + 1 + (c.respostas?.length ?? 0), 0)
    : post.commentsCount;

  // Função para pegar as iniciais do nome do autor
  const getIniciais = (nome: string) => {
    return (nome ?? '')
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurface,
          borderColor: t.colors.greenBorder,
          borderRadius: t.radius.md,
          padding: t.spacing.md,
          marginTop: t.spacing.md,
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: t.colors.greenSurfaceAlt, borderColor: t.colors.lime },
          ]}
        >
          <Text style={[styles.avatarText, { color: t.colors.lime }]}>{getIniciais(post.name)}</Text>
        </View>
        <View style={styles.headerText}>
          <Text
            style={[styles.author, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}
          >
            {post.name}
          </Text>
          <Text style={[styles.time, { color: t.colors.textSecondary, fontSize: t.typography.size.xs }]}>
            {post.time}
          </Text>
        </View>
      </View>

      <Text style={[styles.body, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}>
        {post.content}
      </Text>

      <View style={[styles.footer, { borderTopColor: t.colors.greenBorder, marginTop: t.spacing.md }]}>
        <Pressable
          onPress={() => onLikePress?.(post.id)}
          style={({ pressed }) => [
            styles.metric,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons
            name={post.liked ? 'heart' : 'heart-outline'}
            size={18}
            color={post.liked ? t.colors.lime : t.colors.textSecondary}
          />
          <Text style={[styles.metricText, { color: post.liked ? t.colors.lime : t.colors.textSecondary }]}>
            {post.likes}
          </Text>
        </Pressable>
        
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ver e responder comentários"
          onPress={() => onCommentPress?.(post.id)}
          style={({ pressed }) => [styles.metric, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Ionicons name="chatbubble-outline" size={18} color={t.colors.textSecondary} />
          <Text style={[styles.metricText, { color: t.colors.textSecondary }]}>
            {totalComentarios}
          </Text>
        </Pressable>

        <Pressable 
          onPress={() => Alert.alert('Compartilhar', 'Link do post copiado para a área de transferência.')}
          style={styles.metric}
        >
          <Ionicons name="share-social-outline" size={18} color={t.colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontWeight: '800', fontSize: 16 },
  headerText: { marginLeft: 12, flexShrink: 1 },
  author: { fontWeight: '700' },
  time: { marginTop: 2 },
  body: { marginTop: 12, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, gap: 24 },
  metric: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metricText: { fontSize: 14, fontWeight: '600' },
});
