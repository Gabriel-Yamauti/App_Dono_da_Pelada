import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FieldCard } from '../../src/components/reservas/FieldCard';
import { useTheme } from '../../src/theme';
import { useData } from '../../src/context/DataContext';

export default function ReservasScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { campos, reservarCampo } = useData();

  // Estados locais
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChip, setActiveChip] = useState<'Todos' | 'Society' | 'Futsal' | 'Abaixo de R$ 130'>('Todos');
  const [selectedCampo, setSelectedCampo] = useState<any | null>(null);
  const [bookingDate, setBookingDate] = useState('Hoje');
  const [bookingTime, setBookingTime] = useState('');

  // Lógica de filtragem dos campos
  const filteredCampos = campos.filter((campo) => {
    // 1. Filtro de pesquisa de texto
    const matchSearch = campo.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        campo.bairro.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Filtro dos Chips
    let matchChip = true;
    if (activeChip === 'Society') {
      matchChip = campo.tipo.toLowerCase().includes('society');
    } else if (activeChip === 'Futsal') {
      matchChip = campo.tipo.toLowerCase().includes('futsal');
    } else if (activeChip === 'Abaixo de R$ 130') {
      matchChip = campo.precoHora < 130;
    }

    return matchSearch && matchChip;
  });

  const handleOpenBooking = (campo: any) => {
    setSelectedCampo(campo);
    setBookingTime(campo.horarios[0] || '19:00');
  };

  const handleConfirmBooking = async () => {
    if (!selectedCampo) return;
    try {
      await reservarCampo(selectedCampo.id, bookingDate, bookingTime);
      setSelectedCampo(null);
      Alert.alert(
        'Reserva Confirmada!',
        `Você reservou o campo "${selectedCampo.nome}" para ${bookingDate} às ${bookingTime}.\n\nAgora você é o Hoster desse racha! Divirta-se! ⚽🏆`
      );
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua reserva.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.greenBackground }}>
      {/* Header Fiel ao Figma */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: t.colors.greenSurface,
            borderBottomColor: t.colors.greenBorder,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={styles.logoRow}>
            <Ionicons name="football" size={24} color={t.colors.lime} />
            <Text style={[styles.headerLogoText, { color: t.colors.textPrimary, fontWeight: t.typography.weight.bold }]}>
              Dono da Pelada
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            onPress={() =>
              Alert.alert(
                'Notificações',
                '• Arena Gol de Ouro abriu novos horários hoje\n• Campos abaixo de R$ 130 perto de você\n• Sua última reserva foi confirmada',
              )
            }
            style={({ pressed }) => [styles.bellIcon, { backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent' }]}
          >
            <Ionicons name="notifications-outline" size={22} color={t.colors.textPrimary} />
            <View style={[styles.bellDot, { backgroundColor: t.colors.danger }]} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* Page Header Fiel ao Figma */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: t.colors.textPrimary, fontWeight: t.typography.weight.bold }]}>
            RESERVAR ARENA
          </Text>
          <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>
            Encontre o palco perfeito para sua próxima vitória.
          </Text>
        </View>
        {/* Campo de Busca Ativo */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: t.colors.greenSurface,
              borderColor: t.colors.greenBorder,
              borderRadius: t.radius.md,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={t.colors.textSecondary} />
          <TextInput
            placeholder="Onde você quer jogar? (bairro ou nome)"
            placeholderTextColor={t.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[styles.searchInput, { color: t.colors.textPrimary }]}
          />
          {searchQuery !== '' && (
            <Pressable onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Ionicons name="close-circle" size={16} color={t.colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* Chips de Filtro */}
        <View style={styles.filterChipsRow}>
          {(['Todos', 'Society', 'Futsal', 'Abaixo de R$ 130'] as const).map((chip) => {
            const isActive = activeChip === chip;
            return (
              <Pressable
                key={chip}
                onPress={() => setActiveChip(chip)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? 'rgba(0, 69, 46, 0.3)' : t.colors.greenSurfaceAlt,
                    borderColor: isActive ? '#95d4b9' : t.colors.greenBorder,
                    borderRadius: t.radius.pill,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isActive ? '#95d4b9' : t.colors.textPrimary,
                    },
                  ]}
                >
                  {chip}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Contagem */}
        <Text style={[styles.count, { color: t.colors.textSecondary, marginTop: t.spacing.md }]}>
          {filteredCampos.length} campos encontrados
        </Text>

        {/* Lista de Campos */}
        {filteredCampos.map((campo) => (
          <FieldCard key={campo.id} campo={campo} onReservePress={handleOpenBooking} />
        ))}

        {filteredCampos.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={48} color={t.colors.greenBorder} />
            <Text style={[styles.emptyText, { color: t.colors.textSecondary }]}>
              Nenhum campo disponível correspondente aos filtros.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Agendamento */}
      {selectedCampo && (
        <Modal visible={selectedCampo !== null} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalBody,
                {
                  backgroundColor: t.colors.greenSurface,
                  borderColor: t.colors.greenBorder,
                  borderRadius: t.radius.lg,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: t.colors.textPrimary }]}>Agendar Campo</Text>
                <Pressable onPress={() => setSelectedCampo(null)} style={styles.closeBtn}>
                  <Ionicons name="close" size={24} color={t.colors.textPrimary} />
                </Pressable>
              </View>

              <Text style={{ color: t.colors.textSecondary, marginTop: 8, fontSize: t.typography.size.sm }}>
                Você está reservando:
              </Text>
              <Text style={{ color: t.colors.lime, fontWeight: '800', fontSize: t.typography.size.lg }}>
                {selectedCampo.nome}
              </Text>
              <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm }}>
                Preço: R$ {selectedCampo.precoHora}/100 min · {selectedCampo.bairro}
              </Text>

              <View style={{ gap: 12, marginTop: 16 }}>
                {/* Data */}
                <View>
                  <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>SELECIONAR DIA</Text>
                  <View style={styles.daysRow}>
                    {['Hoje', 'Amanhã', 'Depois de amanhã'].map((day) => {
                      const isSel = bookingDate === day;
                      return (
                        <Pressable
                          key={day}
                          onPress={() => setBookingDate(day)}
                          style={[
                            styles.dayBtn,
                            {
                              backgroundColor: isSel ? t.colors.lime : t.colors.greenBackground,
                              borderColor: isSel ? t.colors.lime : t.colors.greenBorder,
                              borderRadius: t.radius.sm,
                            },
                          ]}
                        >
                          <Text style={{ color: isSel ? t.colors.textOnLime : t.colors.textPrimary, fontSize: 11, fontWeight: '700' }}>
                            {day}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Horário */}
                <View>
                  <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>SELECIONAR HORÁRIO</Text>
                  <View style={styles.daysRow}>
                    {selectedCampo.horarios.map((hour: string) => {
                      const isSel = bookingTime === hour;
                      return (
                        <Pressable
                          key={hour}
                          onPress={() => setBookingTime(hour)}
                          style={[
                            styles.dayBtn,
                            {
                              backgroundColor: isSel ? t.colors.lime : t.colors.greenBackground,
                              borderColor: isSel ? t.colors.lime : t.colors.greenBorder,
                              borderRadius: t.radius.sm,
                            },
                          ]}
                        >
                          <Text style={{ color: isSel ? t.colors.textOnLime : t.colors.textPrimary, fontSize: 13, fontWeight: '800' }}>
                            {hour}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Botão de Confirmação */}
                <Pressable
                  onPress={handleConfirmBooking}
                  style={({ pressed }) => [
                    styles.btnConfirmar,
                    {
                      backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
                      borderRadius: t.radius.md,
                    },
                  ]}
                >
                  <Text style={[styles.btnConfirmarText, { color: t.colors.textOnLime }]}>
                    RESERVAR E SER HOSTER →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogoText: {
    fontFamily: 'Manrope',
    fontSize: 16,
    letterSpacing: 1.2,
  },
  bellIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  pageHeader: {
    marginBottom: 20,
    marginTop: 10,
  },
  pageTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontFamily: 'Manrope',
    fontSize: 14,
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
  },
  searchInput: {
    fontFamily: 'Lexend',
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    height: '100%',
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: 'Lexend',
    fontSize: 12,
    fontWeight: '700',
  },
  count: {
    fontFamily: 'Lexend',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'Manrope',
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 14,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  modalBody: {
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 18,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  inputLabel: {
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnConfirmar: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  btnConfirmarText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
