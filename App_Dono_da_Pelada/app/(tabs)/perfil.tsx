import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Alert, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { EstatisticaCard, type Estatistica } from '../../src/components/perfil/EstatisticaCard';
import { SeloConfianca, type NivelConfianca } from '../../src/components/perfil/SeloConfianca';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useData } from '../../src/context/DataContext';

export default function PerfilScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut, updateProfile } = useAuth();
  const { partidas, reservas } = useData();

  // Estado de edição de perfil (Problema H).
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  if (!user) {
    return null;
  }

  const openEdit = () => {
    setEditName(user.name);
    setEditPhone(user.phone ?? '');
    setEditError(null);
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    setEditError(null);
    setEditSaving(true);
    try {
      await updateProfile({ name: editName, phone: editPhone || null });
      setIsEditOpen(false);
    } catch (error: any) {
      setEditError(error?.message ?? 'Não foi possível salvar as alterações.');
    } finally {
      setEditSaving(false);
    }
  };

  // --- 1. DADOS DE CONFIANÇA MOCK/DINÂMICOS ---
  const getSeloProps = () => {
    switch (user.role) {
      case 'dono-campo':
        return { nivel: 'exemplar' as NivelConfianca, assiduidade: 100, faltas: 0 };
      case 'jogador-hoster':
        return { nivel: 'exemplar' as NivelConfianca, assiduidade: 96, faltas: 0 };
      case 'jogador':
      default:
        // O jogador comum começa com 91% e pode flutuar dependendo das reservas/no-shows
        const baseAssid = 91 + Math.min(9, reservas.length);
        return { nivel: 'confiavel' as NivelConfianca, assiduidade: baseAssid, faltas: 0 };
    }
  };

  // --- 2. CÁLCULO DE ESTATÍSTICAS DINÂMICAS DO CONTEXTO ---
  const getEstatistias = (): Estatistica[] => {
    const partidasPassadas = partidas.filter((p) => p.status === 'encerrada');
    const totalGols = partidasPassadas.reduce((sum, p) => sum + (p.gols ?? 0), 0);
    const totalAssists = partidasPassadas.reduce((sum, p) => sum + (p.assistencias ?? 0), 0);
    const totalPartidas = partidasPassadas.length;

    switch (user.role) {
      case 'dono-campo':
        return [
          {
            id: 'dc1',
            icone: 'business-outline',
            valor: '3',
            rotulo: 'Quadras ativas',
            variacao: 'Estável',
            tendencia: 'estavel',
            destaque: true,
          },
          {
            id: 'dc2',
            icone: 'calendar-outline',
            valor: String(54 + reservas.length),
            rotulo: 'Reservas recebidas',
            variacao: `+${reservas.length} novas`,
            tendencia: 'alta',
          },
          {
            id: 'dc3',
            icone: 'star-outline',
            valor: '4.8',
            rotulo: 'Avaliação média',
            variacao: '+0.1',
            tendencia: 'alta',
          },
          {
            id: 'dc4',
            icone: 'wallet-outline',
            valor: `R$ ${(54 + reservas.length) * 120}`,
            rotulo: 'Faturamento est.',
            variacao: `+${reservas.length * 12}%`,
            tendencia: 'alta',
          },
        ];

      case 'jogador-hoster':
        return [
          {
            id: 'jh1',
            icone: 'megaphone-outline',
            valor: String(12 + reservas.length),
            rotulo: 'Partidas organizadas',
            variacao: `+${reservas.length} no mês`,
            tendencia: 'alta',
            destaque: true,
          },
          {
            id: 'jh2',
            icone: 'football-outline',
            valor: String(18 + totalGols),
            rotulo: 'Gols na várzea',
            variacao: `+${totalGols} no mês`,
            tendencia: 'alta',
          },
          {
            id: 'jh3',
            icone: 'people-outline',
            valor: '42',
            rotulo: 'Jogadores reunidos',
            variacao: 'Estável',
            tendencia: 'estavel',
          },
          {
            id: 'jh4',
            icone: 'calendar-outline',
            valor: String(reservas.length),
            rotulo: 'Campos reservados',
            variacao: '+1 esta semana',
            tendencia: 'alta',
          },
        ];

      case 'jogador':
      default:
        const mvpCount = partidasPassadas.filter((p) => p.mvp).length;
        return [
          {
            id: 'j1',
            icone: 'football-outline',
            valor: String(totalGols),
            rotulo: 'Gols na várzea',
            variacao: totalGols > 0 ? `+${totalGols} gols` : 'Nenhum gol',
            tendencia: totalGols > 0 ? 'alta' : 'estavel',
            destaque: true,
          },
          {
            id: 'j2',
            icone: 'trending-up-outline',
            valor: String(totalAssists),
            rotulo: 'Assistências',
            variacao: totalAssists > 0 ? `+${totalAssists} assists` : 'Nenhuma',
            tendencia: totalAssists > 0 ? 'alta' : 'estavel',
          },
          {
            id: 'j3',
            icone: 'calendar-outline',
            valor: String(totalPartidas),
            rotulo: 'Jogos disputados',
            variacao: 'Reativo',
            tendencia: 'estavel',
          },
          {
            id: 'j4',
            icone: 'ribbon-outline',
            valor: String(mvpCount || 1),
            rotulo: 'Craque do Jogo (MVP)',
            variacao: '+1 este mês',
            tendencia: 'alta',
          },
        ];
    }
  };

  const selo = getSeloProps();
  const estatisticas = getEstatistias();

  // --- 3. CONQUISTAS DINÂMICAS ---
  const getAchievements = () => {
    const list = [
      {
        id: 'ach-1',
        title: 'Sempre no Horário',
        desc: 'Manteve assiduidade acima de 90% nas peladas.',
        icon: 'time-outline',
        color: t.colors.lime,
        unlocked: selo.assiduidade >= 90,
      },
      {
        id: 'ach-2',
        title: 'Artilheiro do Mês',
        desc: 'Fez mais de 2 gols nas súmulas oficiais.',
        icon: 'flame-outline',
        color: '#FF8C00',
        unlocked: true, // Sempre habilitado no seed inicial
      },
      {
        id: 'ach-3',
        title: 'Hoster Iniciante',
        desc: 'Reservou um campo pelo app pela primeira vez.',
        icon: 'calendar-outline',
        color: '#1E90FF',
        unlocked: reservas.length > 0,
      },
      {
        id: 'ach-4',
        title: 'Campeão Anual',
        desc: 'Participou e ganhou uma competição oficial.',
        icon: 'trophy-outline',
        color: '#FFD700',
        unlocked: user.role === 'jogador-hoster', // Hoster ganha troféus
      },
    ];
    return list.filter((a) => a.unlocked);
  };

  const achievements = getAchievements();

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
                '• Você desbloqueou uma nova conquista\n• Sua assiduidade subiu este mês\n• Complete seu perfil para ganhar destaque',
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
            Conta
          </Text>
          <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>
            Gerencie as informações e dados da sua conta.
          </Text>
        </View>

        {/* Cabeçalho de Perfil Fiel ao Figma */}
        <View style={styles.headerProfileRow}>
        {/* Avatar Preto & Branco com borda e selo verificado */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatarWrap, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.lime }]}>
            <Ionicons name="person" size={40} color={t.colors.textSecondary} />
          </View>
          <View style={[styles.verifiedBadge, { backgroundColor: t.colors.lime }]}>
            <Ionicons name="checkmark" size={12} color={t.colors.textOnLime} />
          </View>
        </View>

        <View style={styles.profileMeta}>
          <Text style={[styles.profileName, { color: t.colors.textPrimary, fontSize: t.typography.size.xl }]}>
            {user.name}
          </Text>
          <Text style={[styles.profileRole, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
            {user.role === 'dono-campo' ? 'Dono de Arena' : user.role === 'jogador-hoster' ? 'Jogador Hoster' : 'Peladeiro Raiz'}
          </Text>

          {/* Tags de Posição */}
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder }]}>
              <Text style={[styles.tagText, { color: t.colors.lime }]}>STRIKER</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder }]}>
              <Text style={[styles.tagText, { color: t.colors.textSecondary }]}>CANHOTO</Text>
            </View>
          </View>
        </View>

        {/* Botão Editar Perfil (Problema H) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={openEdit}
          style={({ pressed }) => [
            styles.editBtn,
            { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.pill },
          ]}
        >
          <Ionicons name="create-outline" size={20} color={t.colors.lime} />
        </Pressable>
      </View>

      {/* Selo de Confiança */}
      <View style={{ marginTop: t.spacing.lg }}>
        <SeloConfianca nome={user.name} nivel={selo.nivel} assiduidade={selo.assiduidade} faltas={selo.faltas} />
      </View>

      {/* Card da Conta / Configurações */}
      <View
        style={[
          styles.contaCard,
          {
            backgroundColor: t.colors.greenSurface,
            borderColor: t.colors.greenBorder,
            borderRadius: t.radius.md,
            padding: t.spacing.md,
            marginTop: t.spacing.md,
          },
        ]}
      >
        <View style={styles.contaHeader}>
          <Ionicons name="card-outline" size={18} color={t.colors.textSecondary} />
          <Text style={[styles.contaTitle, { color: t.colors.textPrimary }]}>Conta & CPF</Text>
        </View>
        <Text style={{ color: t.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
          CPF: ***.***.***-{user.cpf ? user.cpf.slice(-2) : '00'}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Editar perfil"
          onPress={openEdit}
          style={({ pressed }) => [
            styles.configBtn,
            {
              backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground,
              borderColor: t.colors.greenBorder,
              borderRadius: t.radius.sm,
            },
          ]}
        >
          <Text style={{ color: t.colors.lime, fontWeight: '700', fontSize: 12 }}>EDITAR PERFIL →</Text>
        </Pressable>
      </View>

      {/* Grade de Estatísticas */}
      <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg, marginTop: t.spacing.lg }]}>
        Estatísticas
      </Text>
      <View style={[styles.grid, { marginTop: t.spacing.sm }]}>
        {estatisticas.map((e) => (
          <View key={e.id} style={styles.gridItem}>
            <EstatisticaCard estatistica={e} />
          </View>
        ))}
      </View>

      {/* Conquistas Recentes */}
      {achievements.length > 0 && (
        <View style={{ marginTop: t.spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg }]}>
            Conquistas Recentes
          </Text>
          <View style={{ gap: 10, marginTop: t.spacing.sm }}>
            {achievements.map((ach) => (
              <View
                key={ach.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: t.colors.greenSurface,
                    borderColor: t.colors.greenBorder,
                    borderRadius: t.radius.md,
                    padding: t.spacing.md,
                  },
                ]}
              >
                <View style={[styles.achievementIcon, { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill }]}>
                  <Ionicons name={ach.icon as any} size={22} color={ach.color} />
                </View>
                <View style={styles.achievementMeta}>
                  <Text style={[styles.achievementTitle, { color: t.colors.textPrimary }]}>{ach.title}</Text>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 12 }}>{ach.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Botão Sair Grande */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Fazer logout"
        onPress={signOut}
        style={({ pressed }) => [
          styles.logoutFooterBtn,
          {
            backgroundColor: pressed ? 'rgba(255, 92, 92, 0.15)' : 'transparent',
            borderColor: t.colors.danger,
            borderRadius: t.radius.md,
            marginTop: t.spacing.xl,
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={18} color={t.colors.danger} />
        <Text style={[styles.logoutFooterText, { color: t.colors.danger, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.bold }]}>
          Sair da Conta
        </Text>
      </Pressable>
    </ScrollView>

    {/* Modal de Edição de Perfil (Problema H) */}
    <Modal visible={isEditOpen} animationType="slide" transparent onRequestClose={() => setIsEditOpen(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalBody, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.lg }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: t.colors.textPrimary }]}>Editar Perfil</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setIsEditOpen(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          <View style={{ gap: 14, marginTop: 16 }}>
            <View>
              <Text style={[styles.editLabel, { color: t.colors.textSecondary }]}>NOME DE EXIBIÇÃO</Text>
              <TextInput
                placeholder="Seu nome"
                placeholderTextColor={t.colors.textSecondary}
                value={editName}
                onChangeText={(text) => {
                  setEditName(text);
                  setEditError(null);
                }}
                style={[styles.editInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md, backgroundColor: t.colors.greenBackground }]}
              />
            </View>

            <View>
              <Text style={[styles.editLabel, { color: t.colors.textSecondary }]}>TELEFONE</Text>
              <TextInput
                placeholder="(11) 90000-0000"
                placeholderTextColor={t.colors.textSecondary}
                keyboardType="phone-pad"
                value={editPhone}
                onChangeText={setEditPhone}
                style={[styles.editInput, { color: t.colors.textPrimary, borderColor: t.colors.greenBorder, borderRadius: t.radius.md, backgroundColor: t.colors.greenBackground }]}
              />
            </View>

            <Text style={{ color: t.colors.textSecondary, fontSize: 11 }}>
              O CPF é sua identidade e não pode ser alterado.
            </Text>

            {editError && (
              <Text style={{ color: t.colors.danger, fontSize: 13, fontWeight: '600' }}>{editError}</Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Salvar perfil"
              disabled={editSaving}
              onPress={handleSaveProfile}
              style={({ pressed }) => [
                styles.editSaveBtn,
                { backgroundColor: pressed ? t.colors.limePressed : t.colors.lime, borderRadius: t.radius.md, opacity: editSaving ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.editSaveText, { color: t.colors.textOnLime }]}>
                {editSaving ? 'Salvando…' : 'Salvar alterações'}
              </Text>
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
  content: { padding: 16 },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
  },
  profileRole: {
    fontFamily: 'Manrope',
    fontWeight: '600',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 4,
  },
  tagText: {
    fontFamily: 'Lexend',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sectionTitle: { fontFamily: 'Space Grotesk', fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47.5%', flexGrow: 1, flexDirection: 'row' },
  logoutFooterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    height: 50,
    gap: 8,
  },
  logoutFooterText: { fontFamily: 'Space Grotesk', letterSpacing: 0.3 },

  // CONTA CARD
  contaCard: {
    borderWidth: 1,
  },
  contaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contaTitle: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 14,
  },
  configBtn: {
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 12,
    width: 120,
  },

  // ACHIEVEMENTS
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementMeta: {
    flex: 1,
  },
  achievementTitle: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 14,
  },

  // EDITAR PERFIL
  editBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  closeBtn: { padding: 4 },
  editLabel: {
    fontFamily: 'Lexend',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  editInput: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  editSaveBtn: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  editSaveText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
