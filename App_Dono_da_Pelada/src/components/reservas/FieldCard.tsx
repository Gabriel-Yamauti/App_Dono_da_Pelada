/**
 * Cartão de um campo no marketplace de Reservas.
 *
 * A "foto" é um placeholder local (ícone outline sobre superfície tematizada) —
 * sem imagem de rede (CH-06), garantindo degradação graciosa offline. Mostra
 * nome, bairro, nota, preço/hora, horários livres (chips) e comodidades, com
 * CTA "Reservar". Só consome tokens do tema (CH-05/CH-12).
 */

import React from 'react';
import { StyleSheet, Text, View, Pressable, Alert, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '../../theme';
import type { Campo } from './data';

const FIELD_IMAGES: Record<string, any> = {
  'c1': require('../../../assets/images/v1_414.png'),
  'c2': require('../../../assets/images/v1_439.png'),
  'c3': require('../../../assets/images/v1_236.png'),
  'f1': require('../../../assets/images/v1_414.png'),
  'f2': require('../../../assets/images/v1_439.png'),
  'f3': require('../../../assets/images/v1_236.png'),
  'f4': require('../../../assets/images/v1_665.png'),
};

export function FieldCard({ campo, onReservePress }: { campo: Campo; onReservePress?: (campo: Campo) => void }) {
  const t = useTheme();

  const handleReserve = () => {
    Alert.alert(
      'Reserva Efetuada!',
      `Sua solicitação de reserva para o campo "${campo.nome}" foi enviada com sucesso.\n\nPreço: R$ ${campo.precoHora}/100 min.\nLocal: ${campo.bairro}.\nComodidades: ${campo.comodidades.join(', ')}.`
    );
  };

  const imageSource = FIELD_IMAGES[campo.id] || require('../../../assets/images/v1_414.png');

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: t.colors.greenSurface,
          borderColor: t.colors.greenBorder,
          borderRadius: t.radius.md,
          marginTop: t.spacing.md,
        },
      ]}
    >
      {/* Foto da Arena */}
      <ImageBackground
        source={imageSource}
        style={[
          styles.photo,
          {
            borderTopLeftRadius: t.radius.md,
            borderTopRightRadius: t.radius.md,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Overlay escuro para melhorar contraste dos elementos por cima da foto */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.35)' }]} />

        {campo.destaque ? (
          <View style={[styles.badge, { backgroundColor: t.colors.lime, borderRadius: t.radius.pill }]}>
            <Ionicons name="star" size={12} color={t.colors.textOnLime} />
            <Text style={[styles.badgeText, { color: t.colors.textOnLime }]}>Destaque</Text>
          </View>
        ) : null}
        <View style={[styles.priceTag, { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.sm }]}>
          <Text style={[styles.priceValue, { color: '#95d4b9' }]}>R$ {campo.precoHora}</Text>
          <Text style={[styles.priceUnit, { color: t.colors.textSecondary }]}>/100 min</Text>
        </View>
      </ImageBackground>

      <View style={{ padding: t.spacing.md }}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={1}
            style={[styles.name, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]}
          >
            {campo.nome}
          </Text>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color={t.colors.lime} />
            <Text style={[styles.ratingText, { color: t.colors.textPrimary }]}>
              {campo.nota.toFixed(1)}
            </Text>
            <Text style={[styles.ratingCount, { color: t.colors.textSecondary }]}>
              ({campo.avaliacoes})
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={t.colors.textSecondary} />
          <Text style={[styles.meta, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
            {campo.bairro} · {campo.tipo}
          </Text>
        </View>

        {/* Horários livres */}
        <Text style={[styles.label, { color: t.colors.textSecondary, marginTop: t.spacing.md }]}>
          Horários livres hoje
        </Text>
        <View style={[styles.chips, { marginTop: t.spacing.xs }]}>
          {campo.horarios.map((hora) => (
            <View
              key={hora}
              style={[
                styles.timeChip,
                {
                  backgroundColor: t.colors.greenBackground,
                  borderColor: t.colors.greenBorder,
                  borderRadius: t.radius.sm,
                },
              ]}
            >
              <Text style={[styles.timeText, { color: t.colors.textPrimary }]}>{hora}</Text>
            </View>
          ))}
        </View>

        {/* Comodidades */}
        <View style={[styles.chips, { marginTop: t.spacing.md }]}>
          {campo.comodidades.map((item) => (
            <View key={item} style={styles.amenity}>
              <Ionicons name="checkmark-circle-outline" size={14} color={t.colors.lime} />
              <Text style={[styles.amenityText, { color: t.colors.textSecondary }]}>{item}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Reservar no ${campo.nome}`}
          onPress={() => (onReservePress ? onReservePress(campo) : handleReserve())}
          style={({ pressed }) => [
            styles.cta,
            {
              backgroundColor: pressed ? t.colors.greenCtaPressed : t.colors.greenCta,
              borderRadius: t.radius.md,
              paddingVertical: t.spacing.sm,
              marginTop: t.spacing.md,
              borderColor: '#95d4b9',
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons name="calendar-outline" size={18} color="#95d4b9" />
          <Text style={[styles.ctaText, { color: '#95d4b9', fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold }]}>
            Reservar e Ser Hoster
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'hidden' },
  photo: { height: 140, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: { fontFamily: 'Manrope', fontWeight: '800', fontSize: 11 },
  priceTag: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  priceValue: { fontFamily: 'Lexend', fontWeight: '800', fontSize: 16 },
  priceUnit: { fontFamily: 'Manrope', fontSize: 11 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontFamily: 'Space Grotesk', fontWeight: '800', flexShrink: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontFamily: 'Lexend', fontWeight: '800', fontSize: 14 },
  ratingCount: { fontFamily: 'Manrope', fontSize: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  meta: { fontFamily: 'Manrope' },
  label: { fontFamily: 'Lexend', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeChip: { borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12 },
  timeText: { fontFamily: 'Lexend', fontWeight: '700', fontSize: 14 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  amenityText: { fontFamily: 'Manrope', fontSize: 13 },
  cta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  ctaText: { fontFamily: 'Manrope', fontWeight: '800' },
});
