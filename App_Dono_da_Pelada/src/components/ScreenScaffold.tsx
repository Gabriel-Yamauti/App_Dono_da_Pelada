/**
 * Esqueleto de tela reutilizável e tematizado.
 * Renderiza título, subtítulo e uma lista de cards a partir de um TabMock.
 * Mobile-first; usa apenas tokens do tema (sem cores hardcoded — CH-05/CH-12).
 */

import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { getTabMock } from '../lib/mocks';
import { useTheme } from '../theme';

export function ScreenScaffold({ tabKey }: { tabKey: string }) {
  const t = useTheme();
  const mock = getTabMock(tabKey);

  return (
    <ScrollView
      style={{ backgroundColor: t.colors.greenBackground }}
      contentContainerStyle={styles.content}
    >
      <Text
        style={[
          styles.title,
          { color: t.colors.textPrimary, fontSize: t.typography.size.xxl, fontWeight: t.typography.weight.bold },
        ]}
      >
        {mock.titulo}
      </Text>
      <Text style={[styles.subtitle, { color: t.colors.textSecondary, fontSize: t.typography.size.md }]}>
        {mock.subtitulo}
      </Text>

      {mock.itens.length === 0 ? (
        <Text style={[styles.empty, { color: t.colors.textSecondary }]}>Nada por aqui ainda.</Text>
      ) : (
        mock.itens.map((item) => (
          <View
            key={item.id}
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
            <Text style={[styles.cardTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]}>
              {item.titulo}
            </Text>
            <Text style={[styles.cardDetail, { color: t.colors.lime, fontSize: t.typography.size.sm }]}>
              {item.detalhe}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 48 },
  title: { marginTop: 8 },
  subtitle: { marginTop: 4 },
  empty: { marginTop: 24 },
  card: { borderWidth: 1 },
  cardTitle: { fontWeight: '700' },
  cardDetail: { marginTop: 4 },
});
