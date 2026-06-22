// Aba Jogos (rota inicial) — lista de partidas + súmula digital, adaptada ao papel do usuário logado.
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PartidaCard } from '../../src/components/jogos/PartidaCard';
import {
  SumulaDigitalModal,
  type LinhaSumula,
} from '../../src/components/jogos/SumulaDigitalModal';
import { JogadoresModal } from '../../src/components/jogos/JogadoresModal';
import { GestaoTimeModal } from '../../src/components/jogos/GestaoTimeModal';
import { buildRoster } from '../../src/components/jogos/roster';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useData, type Partida } from '../../src/context/DataContext';

// Súmulas indexadas por id da partida (apenas encerradas têm súmula). O nome do
// usuário da sessão entra na linha "(Você)" — sem hardcode de nome (Problema G).
function buildSumulas(userName: string): Record<string, LinhaSumula[]> {
  return {
    'p-passada-1': [
      { id: 's1', nome: `${userName} (Você)`, gols: 2, assistencias: 1, conduta: 'fair-play', craque: true },
      { id: 's2', nome: 'Lucas Silva', gols: 1, assistencias: 1, conduta: 'fair-play' },
      { id: 's3', nome: 'Gabriel Santos', gols: 1, assistencias: 0, conduta: 'amarelo' },
      { id: 's4', nome: 'Mateus Oliveira', gols: 0, assistencias: 2, conduta: 'fair-play' },
    ],
    'p-passada-2': [
      { id: 's11', nome: 'Lucas Silva', gols: 3, assistencias: 1, conduta: 'fair-play', craque: true },
      { id: 's12', nome: `${userName} (Você)`, gols: 1, assistencias: 0, conduta: 'fair-play' },
      { id: 's13', nome: 'Diego Souza', gols: 1, assistencias: 0, conduta: 'amarelo' },
    ],
  };
}

export default function JogosScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { partidas, togglePresenca, toggleListaPartida, criarPartida } = useData();

  const [sumulaDe, setSumulaDe] = useState<Partida | null>(null);
  const [jogadoresDe, setJogadoresDe] = useState<Partida | null>(null);
  const [gestaoDe, setGestaoDe] = useState<Partida | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [matchTitle, setMatchTitle] = useState('');
  const [matchLocal, setMatchLocal] = useState('');
  const [matchQuando, setMatchQuando] = useState('');
  const [matchVagas, setMatchVagas] = useState('14');

  const isHoster = user?.role === 'jogador-hoster';
  const isDonoCampo = user?.role === 'dono-campo';

  // Súmulas com o nome do usuário da sessão na linha "(Você)" (Problema G).
  const SUMULAS = buildSumulas(user?.name ?? 'Você');

  // Filtra as partidas: próximo jogo, futuras e passadas
  const proximoJogo = partidas.find((p) => p.id === 'p-proximo');
  const partidasFuturas = partidas.filter((p) => p.status !== 'encerrada' && p.id !== 'p-proximo');
  const partidasPassadas = partidas.filter((p) => p.status === 'encerrada');

  const handleCreateMatch = async () => {
    if (!matchTitle || !matchLocal || !matchQuando) {
      Alert.alert('Erro', 'Por favor preencha todos os campos do jogo.');
      return;
    }
    try {
      await criarPartida(matchTitle, matchLocal, matchQuando, parseInt(matchVagas, 10) || 12);
      setIsCreateOpen(false);
      setMatchTitle('');
      setMatchLocal('');
      setMatchQuando('');
      Alert.alert('Sucesso', 'Partida organizada com sucesso!');
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao criar a partida.');
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
                '• Confirme sua presença na "Copa SC - Oitavas de Final"\n• A lista do próximo jogo está quase cheia (12/14)\n• Súmula da última partida disponível',
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
        style={{ backgroundColor: t.colors.greenBackground }}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* Page Title & Subtitle Fiel ao Figma */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: t.colors.textPrimary }]}>
            MEUS JOGOS
          </Text>
          <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>
            Controle total da sua agenda de campo
          </Text>
        </View>
        {/* Banner de Dono de Campo */}
        {isDonoCampo && (
          <View style={[styles.banner, { backgroundColor: t.colors.greenSurfaceAlt, borderColor: t.colors.lime, borderRadius: t.radius.sm }]}>
            <Ionicons name="information-circle-outline" size={16} color={t.colors.lime} />
            <Text style={[styles.bannerText, { color: t.colors.lime, fontSize: t.typography.size.xs }]}>
              Modo Proprietário: Gerenciando as partidas agendadas no "Society do Zé".
            </Text>
          </View>
        )}

        {/* 1. SEÇÃO PRÓXIMO JOGO */}
        {proximoJogo && (
          <View style={{ marginTop: t.spacing.md }}>
            <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
              PRÓXIMO JOGO
            </Text>
            <View
              style={[
                styles.proximoCard,
                {
                  backgroundColor: t.colors.greenSurface,
                  borderColor: t.colors.lime,
                  borderRadius: t.radius.lg,
                  padding: t.spacing.md,
                },
              ]}
            >
              <View style={styles.proximoHeader}>
                <View style={[styles.badgeProximo, { backgroundColor: t.colors.lime, borderRadius: t.radius.pill }]}>
                  <Ionicons name="star" size={12} color={t.colors.textOnLime} />
                  <Text style={[styles.badgeTextProximo, { color: t.colors.textOnLime }]}>
                    Destaque
                  </Text>
                </View>
                <Text style={[styles.vagasProximo, { color: t.colors.textSecondary }]}>
                  {proximoJogo.vagas.ocupadas}/{proximoJogo.vagas.total} Confirmados
                </Text>
              </View>

              <Text style={[styles.tituloProximo, { color: t.colors.textPrimary, fontSize: t.typography.size.xl }]}>
                {proximoJogo.titulo}
              </Text>

              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={t.colors.lime} />
                <Text style={[styles.metaText, { color: t.colors.textSecondary }]}>
                  {proximoJogo.quando}
                </Text>
              </View>
              <View style={[styles.metaRow, { marginTop: 4 }]}>
                <Ionicons name="location-outline" size={14} color={t.colors.lime} />
                <Text style={[styles.metaText, { color: t.colors.textSecondary }]}>
                  {proximoJogo.local}
                </Text>
              </View>

              {/* Ações Rápidas de Hoster */}
              <View style={[styles.proximoActions, { borderTopColor: t.colors.greenBorder }]}>
                <Pressable
                  onPress={() => setSumulaDe(proximoJogo)}
                  style={({ pressed }) => [styles.proximoBtn, { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderRadius: t.radius.sm }]}
                >
                  <Ionicons name="document-text-outline" size={16} color={t.colors.lime} />
                  <Text style={[styles.proximoBtnText, { color: t.colors.textPrimary }]}>Súmula</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Ver jogadores confirmados"
                  onPress={() => setJogadoresDe(proximoJogo)}
                  style={({ pressed }) => [styles.proximoBtn, { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderRadius: t.radius.sm }]}
                >
                  <Ionicons name="people-outline" size={16} color={t.colors.lime} />
                  <Text style={[styles.proximoBtnText, { color: t.colors.textPrimary }]}>Jogadores</Text>
                </Pressable>

                {isHoster && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Abrir gestão do time"
                    onPress={() => setGestaoDe(proximoJogo)}
                    style={({ pressed }) => [styles.proximoBtn, { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderRadius: t.radius.sm }]}
                  >
                    <Ionicons name="settings-outline" size={16} color={t.colors.lime} />
                    <Text style={[styles.proximoBtnText, { color: t.colors.textPrimary }]}>Gestão</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 2. RESUMO TÉCNICO */}
        {!isDonoCampo && (
          <View style={{ marginTop: t.spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
              RESUMO TÉCNICO
            </Text>
            <View style={[styles.resumoCard, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md, padding: t.spacing.md }]}>
              <View style={styles.resumoHeader}>
                <Text style={[styles.resumoAproveitamento, { color: t.colors.textPrimary }]}>
                  Aproveitamento Técnico
                </Text>
                <Text style={[styles.resumoPct, { color: t.colors.lime }]}>78%</Text>
              </View>
              {/* Barra de progresso */}
              <View style={[styles.progressBarBg, { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill }]}>
                <View style={[styles.progressBarFill, { backgroundColor: t.colors.lime, borderRadius: t.radius.pill, width: '78%' }]} />
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: t.colors.textPrimary }]}>12</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textSecondary }]}>Vitórias</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: t.colors.textPrimary }]}>45</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textSecondary }]}>Gols</Text>
                </View>
                <View style={styles.statCol}>
                  <Text style={[styles.statValue, { color: t.colors.textPrimary }]}>ST</Text>
                  <Text style={[styles.statLabel, { color: t.colors.textSecondary }]}>Posição</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 3. PARTIDAS FUTURAS */}
        <View style={{ marginTop: t.spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
            PARTIDAS FUTURAS
          </Text>
          {partidasFuturas.map((p) => (
            <PartidaCard
              key={p.id}
              partida={p as any}
              onTogglePresenca={togglePresenca}
              onVerJogadores={() => setJogadoresDe(p)}
            />
          ))}
          {partidasFuturas.length === 0 && (
            <Text style={[styles.emptyText, { color: t.colors.textSecondary }]}>
              Nenhuma partida agendada.
            </Text>
          )}
        </View>

        {/* 4. PRÓXIMO DESTINO */}
        {proximoJogo && (
          <View style={{ marginTop: t.spacing.lg }}>
            <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
              PRÓXIMO DESTINO
            </Text>
            <View style={[styles.mapCard, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
              <View style={[styles.mapPlaceholder, { backgroundColor: t.colors.greenSurfaceAlt }]}>
                <Ionicons name="map-outline" size={40} color={t.colors.greenBorder} />
                <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm, marginTop: 4 }}>
                  Society: Amigos & Bola
                </Text>
              </View>
              <View style={{ padding: t.spacing.md }}>
                <Text style={[styles.mapTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}>
                  Arena Central Society
                </Text>
                <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm }}>
                  Rua do Futebol, 100 - São Paulo, SP
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 5. PARTIDAS ANTERIORES */}
        <View style={{ marginTop: t.spacing.lg }}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm, marginBottom: 0 }]}>
              PARTIDAS ANTERIORES
            </Text>
            <Pressable onPress={() => Alert.alert('Histórico', 'Histórico completo de súmulas visualizado.')}>
              <Text style={{ color: t.colors.lime, fontSize: t.typography.size.sm, fontWeight: '700' }}>
                VER TODAS
              </Text>
            </Pressable>
          </View>

          {partidasPassadas.map((p) => (
            <View
              key={p.id}
              style={[
                styles.passadaCard,
                {
                  backgroundColor: t.colors.greenSurface,
                  borderColor: t.colors.greenBorder,
                  borderRadius: t.radius.md,
                  padding: t.spacing.md,
                },
              ]}
            >
              <View style={styles.passadaHeader}>
                <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm }}>
                  {p.quando}
                </Text>
                <Text style={[styles.passadaPlacar, { color: t.colors.lime }]}>{p.placar}</Text>
              </View>

              <Text style={[styles.passadaTitle, { color: t.colors.textPrimary }]}>{p.titulo}</Text>

              {/* Estatísticas Pessoais no Jogo */}
              <View style={styles.passadaStats}>
                <View style={styles.pStatBadge}>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>GOLS</Text>
                  <Text style={[styles.pStatVal, { color: t.colors.textPrimary }]}>{p.gols ?? 0}</Text>
                </View>
                <View style={styles.pStatBadge}>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>ASSIST</Text>
                  <Text style={[styles.pStatVal, { color: t.colors.textPrimary }]}>{p.assistencias ?? 0}</Text>
                </View>
                <View style={styles.pStatBadge}>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>NOTA</Text>
                  <Text style={[styles.pStatVal, { color: t.colors.lime }]}>{p.rating?.toFixed(1) ?? 'N/A'}</Text>
                </View>
                {p.mvp && (
                  <View style={[styles.mvpBadge, { backgroundColor: t.colors.lime, borderRadius: t.radius.sm }]}>
                    <Text style={[styles.mvpText, { color: t.colors.textOnLime }]}>MVP</Text>
                  </View>
                )}
              </View>

              <Pressable
                onPress={() => setSumulaDe(p)}
                style={({ pressed }) => [
                  styles.btnSumulaPassada,
                  {
                    backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent',
                    borderColor: t.colors.greenBorder,
                    borderRadius: t.radius.sm,
                  },
                ]}
              >
                <Ionicons name="document-text-outline" size={14} color={t.colors.textSecondary} />
                <Text style={{ color: t.colors.textSecondary, fontSize: 12, fontWeight: '700' }}>
                  Visualizar Súmula do Jogo
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button (FAB) de Criação / Busca */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Novo Jogo"
        onPress={() => setIsCreateOpen(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
          },
        ]}
      >
        <Ionicons name="add" size={28} color={t.colors.textOnLime} />
      </Pressable>

      {/* Súmula Modal */}
      <SumulaDigitalModal
        visivel={sumulaDe !== null}
        partida={sumulaDe}
        linhas={sumulaDe ? SUMULAS[sumulaDe.id] ?? [] : []}
        onClose={() => setSumulaDe(null)}
      />

      {/* Lista de Jogadores Confirmados (Problema D) */}
      <JogadoresModal
        visivel={jogadoresDe !== null}
        titulo={jogadoresDe?.titulo ?? 'Partida'}
        jogadores={jogadoresDe ? buildRoster(jogadoresDe, user?.name) : []}
        onClose={() => setJogadoresDe(null)}
      />

      {/* Gestão do Time — Hoster (Problema C) */}
      <GestaoTimeModal
        visivel={gestaoDe !== null}
        partida={gestaoDe}
        jogadores={gestaoDe ? buildRoster(gestaoDe, user?.name) : []}
        onToggleLista={() => {
          if (gestaoDe) {
            toggleListaPartida(gestaoDe.id);
            setGestaoDe({ ...gestaoDe, listaFechada: !gestaoDe.listaFechada });
          }
        }}
        onClose={() => setGestaoDe(null)}
      />

      {/* Modal de Criação de Jogo */}
      <Modal visible={isCreateOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBody, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.lg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: t.colors.textPrimary }]}>Organizar Jogo</Text>
              <Pressable onPress={() => setIsCreateOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={t.colors.textPrimary} />
              </Pressable>
            </View>

            <View style={{ gap: 12, marginTop: 16 }}>
              <View>
                <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>NOME DO JOGO</Text>
                <TextInput
                  placeholder="Ex: Racha dos Amigos"
                  placeholderTextColor={t.colors.textSecondary}
                  value={matchTitle}
                  onChangeText={setMatchTitle}
                  style={[styles.modalInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>LOCAL / ARENA</Text>
                <TextInput
                  placeholder="Ex: Society do Zé"
                  placeholderTextColor={t.colors.textSecondary}
                  value={matchLocal}
                  onChangeText={setMatchLocal}
                  style={[styles.modalInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>DATA E HORA</Text>
                <TextInput
                  placeholder="Ex: Quinta · 21:00"
                  placeholderTextColor={t.colors.textSecondary}
                  value={matchQuando}
                  onChangeText={setMatchQuando}
                  style={[styles.modalInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}
                />
              </View>

              <View>
                <Text style={[styles.inputLabel, { color: t.colors.textSecondary }]}>TOTAL DE VAGAS</Text>
                <TextInput
                  placeholder="Ex: 14"
                  placeholderTextColor={t.colors.textSecondary}
                  value={matchVagas}
                  onChangeText={setMatchVagas}
                  keyboardType="numeric"
                  style={[styles.modalInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}
                />
              </View>

              <Pressable
                onPress={handleCreateMatch}
                style={({ pressed }) => [
                  styles.btnSalvar,
                  { backgroundColor: pressed ? t.colors.limePressed : t.colors.lime, borderRadius: t.radius.md },
                ]}
              >
                <Text style={[styles.btnSalvarText, { color: t.colors.textOnLime }]}>CRIAR PARTIDA</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  content: { padding: 16 },
  sectionTitle: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  bannerText: { fontFamily: 'Manrope', fontWeight: '700', flex: 1 },
  emptyText: { fontFamily: 'Manrope', textAlign: 'center', marginTop: 16, fontWeight: '500' },

  // PRÓXIMO JOGO
  proximoCard: {
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
  },
  proximoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgeProximo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  badgeTextProximo: {
    fontSize: 10,
    fontWeight: '800',
  },
  vagasProximo: {
    fontSize: 12,
    fontWeight: '600',
  },
  tituloProximo: {
    fontWeight: '800',
    marginVertical: 10,
  },
  proximoActions: {
    borderTopWidth: 1,
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    gap: 12,
  },
  proximoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    height: 38,
  },
  proximoBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // RESUMO TÉCNICO
  resumoCard: {
    borderWidth: 1,
  },
  resumoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  resumoAproveitamento: {
    fontSize: 14,
    fontWeight: '700',
  },
  resumoPct: {
    fontSize: 20,
    fontWeight: '800',
  },
  progressBarBg: {
    height: 10,
    width: '100%',
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 14,
  },
  statCol: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // DESTINO
  mapCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTitle: {
    fontWeight: '800',
  },

  // ANTERIORES
  passadaCard: {
    borderWidth: 1,
    marginBottom: 12,
  },
  passadaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passadaPlacar: {
    fontWeight: '800',
    fontSize: 16,
  },
  passadaTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  passadaStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  pStatBadge: {
    alignItems: 'center',
    backgroundColor: '#0B1F17',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  pStatVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  mvpBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  mvpText: {
    fontSize: 10,
    fontWeight: '800',
  },
  btnSumulaPassada: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 34,
    marginTop: 12,
    gap: 6,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  modalInput: {
    height: 46,
    borderWidth: 1,
    paddingHorizontal: 12,
    backgroundColor: '#131313',
  },
  btnSalvar: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  btnSalvarText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 0.5,
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
});
