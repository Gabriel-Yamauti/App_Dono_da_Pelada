import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PostCard } from '../../src/components/coletivo/PostCard';
import { ComentariosModal } from '../../src/components/coletivo/ComentariosModal';
import { TorneioInfoModal } from '../../src/components/coletivo/TorneioInfoModal';
import { buildCraques, computeUserStats } from '../../src/components/coletivo/ranking';
import { useTheme } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useData, type Torneio } from '../../src/context/DataContext';

export default function ColetivoScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    posts,
    torneios,
    partidas,
    toggleLikePost,
    adicionarPost,
    comentarPost,
    responderComentario,
    inscreverTorneio,
    cancelarInscricao,
  } = useData();

  // Ranking de craques atrelado ao usuário da sessão (Problema G).
  const craques = buildCraques(user?.name || 'Você', computeUserStats(partidas));
  const mvp = craques[0];

  const [selectedTab, setSelectedTab] = useState<'comunidade' | 'torneios' | 'rankings'>('comunidade');
  const [newPostText, setNewPostText] = useState('');
  const [vouJogar, setVouJogar] = useState(false);

  // Modais (por id → sempre refletem o estado mais recente do contexto).
  const [comentarioPostId, setComentarioPostId] = useState<string | null>(null);
  const [torneioInfoId, setTorneioInfoId] = useState<string | null>(null);
  const postComentario = comentarioPostId ? posts.find((p) => p.id === comentarioPostId) ?? null : null;
  const torneioInfo = torneioInfoId ? torneios.find((tr) => tr.id === torneioInfoId) ?? null : null;
  const autorNome = user?.name || 'Você';
  const torneiosInscritos = torneios.filter((tor) => tor.inscrito);

  const handleCancelarInscricao = (tor: Torneio) => {
    Alert.alert(
      'Cancelar inscrição',
      `Deseja cancelar a inscrição em "${tor.nome}"?`,
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Cancelar inscrição',
          style: 'destructive',
          onPress: () => {
            cancelarInscricao(tor.id);
            setTorneioInfoId(null);
          },
        },
      ],
    );
  };

  const handleCreatePost = async () => {
    if (!newPostText.trim()) {
      Alert.alert('Erro', 'O texto da postagem não pode estar vazio.');
      return;
    }
    try {
      await adicionarPost(user?.name || 'Jogador Anônimo', newPostText.trim());
      setNewPostText('');
      Alert.alert('Sucesso', 'Postagem publicada na comunidade!');
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao publicar.');
    }
  };

  const handleInscribeTorneio = async (id: string, nome: string) => {
    try {
      await inscreverTorneio(id);
      Alert.alert('Inscrição Realizada!', `Seu time foi inscrito com sucesso no torneio "${nome}".`);
    } catch {
      Alert.alert('Erro', 'Ocorreu um erro ao realizar a inscrição.');
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
        {/* Row 1: Logo Dono da Pelada */}
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
                '• Você tem uma nova resposta em um comentário\n• Inscrições do "Super Bowl da Leste" encerram em breve\n• Novo treino confirmado no Esporte Clube Vila Nova',
              )
            }
            style={({ pressed }) => [styles.bellIcon, { backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent' }]}
          >
            <Ionicons name="notifications-outline" size={22} color={t.colors.textPrimary} />
            <View style={[styles.bellDot, { backgroundColor: t.colors.danger }]} />
          </Pressable>
        </View>

        {/* Row 2: Sub-tabs Segmented Selector */}
        <View style={[styles.tabsContainer, { borderTopColor: t.colors.greenBorder }]}>
          <Pressable
            onPress={() => setSelectedTab('comunidade')}
            style={[
              styles.tabBtn,
              selectedTab === 'comunidade' && { borderBottomColor: '#95d4b9', borderBottomWidth: 3 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'comunidade' ? '#95d4b9' : 'rgba(229,226,225,0.6)' },
              ]}
            >
              Comunidade
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedTab('torneios')}
            style={[
              styles.tabBtn,
              selectedTab === 'torneios' && { borderBottomColor: '#95d4b9', borderBottomWidth: 3 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'torneios' ? '#95d4b9' : 'rgba(229,226,225,0.6)' },
              ]}
            >
              Torneios
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setSelectedTab('rankings')}
            style={[
              styles.tabBtn,
              selectedTab === 'rankings' && { borderBottomColor: '#95d4b9', borderBottomWidth: 3 },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'rankings' ? '#95d4b9' : 'rgba(229,226,225,0.6)' },
              ]}
            >
              Rankings
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 96 }]}
      >
        {/* --- TAB COMUNIDADE --- */}
        {selectedTab === 'comunidade' && (
          <View>
            {/* Page Header Fiel ao Figma */}
            <View style={styles.pageHeaderAccentRow}>
              <Text style={[styles.pageTitleAccent, { color: t.colors.textPrimary }]}>
                Minhas{'\n'}Comunidades
              </Text>
              <View style={[styles.titleAccentBar, { backgroundColor: t.colors.lime }]} />
            </View>

            {/* Card Chamada Treino (Esporte Clube Vila Nova) */}
            <View
              style={[
                styles.communityCard,
                {
                  backgroundColor: t.colors.greenSurface,
                  borderColor: t.colors.greenBorder,
                  borderRadius: t.radius.md,
                  padding: t.spacing.md,
                  marginTop: t.spacing.sm,
                },
              ]}
            >
              <View style={styles.communityCardHeader}>
                <View style={[styles.communityIcon, { backgroundColor: '#2a2a2a', borderRadius: t.radius.pill }]}>
                  <Ionicons name="shield" size={24} color="#95d4b9" />
                </View>
                <View style={styles.communityCardTitle}>
                  <Text style={[styles.communityName, { color: '#95d4b9', fontSize: 13 }]}>
                    Esporte Clube Vila Nova
                  </Text>
                  <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>
                    Postado há 2 horas
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={[styles.chamadaTitle, { color: t.colors.textPrimary }]}>
                  CHAMADA PARA O TREINO DE TERÇA!
                </Text>
                <Text style={[styles.chamadaBody, { color: t.colors.textSecondary }]}>
                  Fala, time! O treino de amanhã no Campo do Poeirão está confirmado às 20h. Uniforme preto liberado. Quem vai colar? Confirme na lista oficial.
                </Text>
              </View>

              <View style={styles.communityActions}>
                <Pressable
                  onPress={() => {
                    setVouJogar(!vouJogar);
                    Alert.alert(
                      !vouJogar ? 'Confirmado!' : 'Cancelado',
                      !vouJogar
                        ? 'Você confirmou presença no treino de terça do Vila Nova.'
                        : 'Sua presença no treino foi cancelada.'
                    );
                  }}
                  style={[
                    styles.actionBtnCta,
                    {
                      backgroundColor: vouJogar ? t.colors.lime : t.colors.greenCta,
                      borderRadius: t.radius.pill,
                    },
                  ]}
                >
                  <Text style={[styles.actionBtnCtaText, { color: vouJogar ? t.colors.textOnLime : '#76b394' }]}>
                    {vouJogar ? 'VOU JOGAR (CONFIRMADO)' : 'VOU JOGAR'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => Alert.alert('Lista de Presença', 'Jogadores confirmados para Terça 20h:\n\n1. Você\n2. Marcão da Vila\n3. Bia Ferreira\n4. Rafa Goleiro\n5. Tiago Santos\n6. André Costa')}
                  style={[
                    styles.actionBtnSec,
                    {
                      backgroundColor: '#2a2a2a',
                      borderRadius: t.radius.pill,
                    },
                  ]}
                >
                  <Text style={[styles.actionBtnSecText, { color: t.colors.textPrimary }]}>VER LISTA</Text>
                </Pressable>
              </View>
            </View>

            {/* Caixa de Nova Postagem */}
            <View
              style={[
                styles.postInputBox,
                {
                  backgroundColor: t.colors.greenSurface,
                  borderColor: t.colors.greenBorder,
                  borderRadius: t.radius.md,
                  padding: t.spacing.md,
                  marginTop: t.spacing.lg,
                },
              ]}
            >
              <Text style={[styles.postInputTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.xs }]}>
                NOVA PUBLICAÇÃO
              </Text>
              <TextInput
                placeholder="O que está rolando na várzea?"
                placeholderTextColor={t.colors.textSecondary}
                value={newPostText}
                onChangeText={setNewPostText}
                multiline
                numberOfLines={3}
                style={[
                  styles.postInput,
                  {
                    color: t.colors.textPrimary,
                    borderColor: t.colors.greenBorder,
                    borderRadius: t.radius.sm,
                    backgroundColor: t.colors.greenBackground,
                  },
                ]}
              />
              <Pressable
                onPress={handleCreatePost}
                style={({ pressed }) => [
                  styles.postBtn,
                  {
                    backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
                    borderRadius: t.radius.sm,
                  },
                ]}
              >
                <Text style={[styles.postBtnText, { color: t.colors.textOnLime }]}>PUBLICAR</Text>
              </Pressable>
            </View>

            {/* Feed da Comunidade */}
            <View style={{ marginTop: t.spacing.lg }}>
              <Text style={[styles.feedTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
                FEED DA COMUNIDADE
              </Text>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLikePress={toggleLikePost}
                  onCommentPress={(id) => setComentarioPostId(id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* --- TAB TORNEIOS --- */}
        {selectedTab === 'torneios' && (
          <View>
            {/* Seção 1: Inscritos */}
            <View>
                <View style={styles.pageHeader}>
                  <Text style={[styles.pageTitle, { color: t.colors.textPrimary }]}>Inscritos</Text>
                  <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>
                    {torneiosInscritos.length} {torneiosInscritos.length === 1 ? 'TORNEIO ATIVO' : 'TORNEIOS ATIVOS'}
                  </Text>
                </View>

                {torneiosInscritos.length === 0 && (
                  <Text style={[styles.emptyText, { color: t.colors.textSecondary }]}>
                    Você não está inscrito em nenhum torneio.
                  </Text>
                )}

                {torneiosInscritos.map((torneio) => (
                  <View
                    key={torneio.id}
                    style={[
                      styles.torneioCard,
                      {
                        backgroundColor: t.colors.greenSurface,
                        borderColor: t.colors.greenBorder,
                        borderRadius: t.radius.md,
                        padding: t.spacing.md,
                        marginBottom: t.spacing.md,
                      },
                    ]}
                  >
                    <View style={styles.torneioHeader}>
                      <Text style={[styles.torneioNome, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}>
                        {torneio.nome}
                      </Text>
                      <View style={[styles.torneioBadge, { backgroundColor: t.colors.greenCta, borderColor: '#95d4b9', borderRadius: t.radius.sm }]}>
                        <Text style={{ color: '#95d4b9', fontSize: 10, fontWeight: '800' }}>
                          MATA-MATA
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={{ color: t.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                      {torneio.id === 't1' ? 'Arena Corinthians, São Paulo' : 'Campo do Sete de Setembro'}
                    </Text>

                    <View style={styles.torneioInfoRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>Próximo Jogo</Text>
                        <Text style={[styles.torneioInfoText, { color: t.colors.textPrimary }]}>
                          {torneio.id === 't1' ? '24 JUN | 20:30' : '12 JUL | 09:00'}
                        </Text>
                      </View>
                      <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>
                          {torneio.id === 't1' ? 'Adversário' : 'Status'}
                        </Text>
                        <Text style={[styles.torneioInfoText, { color: t.colors.lime }]}>
                          {torneio.id === 't1' ? 'Vs Red Bull Bragantino' : 'Oitavas de Final'}
                        </Text>
                      </View>
                    </View>

                    {/* Ações do torneio inscrito (Problema F) */}
                    <View style={styles.torneioActionsRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Mais informações de ${torneio.nome}`}
                        onPress={() => setTorneioInfoId(torneio.id)}
                        style={({ pressed }) => [
                          styles.torneioActionBtn,
                          { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderColor: t.colors.greenBorder },
                        ]}
                      >
                        <Ionicons name="information-circle-outline" size={15} color={t.colors.lime} />
                        <Text style={{ color: t.colors.textPrimary, fontSize: 11, fontWeight: '800' }}>MAIS INFO</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Cancelar inscrição em ${torneio.nome}`}
                        onPress={() => handleCancelarInscricao(torneio)}
                        style={({ pressed }) => [
                          styles.torneioActionBtn,
                          { backgroundColor: pressed ? 'rgba(255,92,92,0.15)' : t.colors.greenBackground, borderColor: t.colors.danger },
                        ]}
                      >
                        <Ionicons name="close-circle-outline" size={15} color={t.colors.danger} />
                        <Text style={{ color: t.colors.danger, fontSize: 11, fontWeight: '800' }}>CANCELAR</Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

            {/* Seção 2: Inscrições Abertas */}
            <View style={{ marginTop: t.spacing.lg }}>
                <View style={styles.pageHeader}>
                  <Text style={[styles.pageTitle, { color: t.colors.textPrimary }]}>Inscrições Abertas</Text>
                  <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>8 DISPONÍVEIS</Text>
                </View>

                {/* Filter Chips */}
                <View style={styles.filterChipsRow}>
                  {['Distância', 'Horário', 'Dias'].map((chip) => (
                    <View
                      key={chip}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: t.colors.greenSurface,
                          borderColor: t.colors.greenBorder,
                          borderRadius: t.radius.pill,
                        },
                      ]}
                    >
                      <Text style={{ color: t.colors.textSecondary, fontWeight: '700', fontSize: 12 }}>
                        {chip}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Lista Torneios Abertos */}
                {torneios.filter((tor) => !tor.inscrito).map((torneio) => (
                  <View
                    key={torneio.id}
                    style={[
                      styles.torneioCard,
                      {
                        backgroundColor: t.colors.greenSurface,
                        borderColor: t.colors.greenBorder,
                        borderRadius: t.radius.md,
                        padding: t.spacing.md,
                        marginTop: t.spacing.md,
                      },
                    ]}
                  >
                    <View style={styles.torneioHeader}>
                      <Text style={[styles.torneioNome, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}>
                        {torneio.nome}
                      </Text>
                      <View style={[styles.torneioBadge, { backgroundColor: '#2a2a2a', borderColor: t.colors.greenBorder, borderRadius: t.radius.sm }]}>
                        <Text style={{ color: t.colors.lime, fontSize: 10, fontWeight: '800' }}>
                          SEMI-PRO
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={{ color: t.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                      {torneio.local}
                    </Text>

                    <View style={[styles.torneioInfoRow, { borderBottomColor: t.colors.greenBorder, borderBottomWidth: 1, paddingBottom: 12 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>Taxa de Inscrição</Text>
                        <Text style={[styles.torneioInfoText, { color: t.colors.lime }]}>R$ 450,00</Text>
                      </View>
                    </View>

                    <View style={styles.torneioDatesRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 9 }}>Fim Inscrições</Text>
                        <Text style={{ color: t.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>30 de Abril</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 9 }}>Início Jogos</Text>
                        <Text style={{ color: t.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>21 de Maio</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: t.colors.textSecondary, fontSize: 9 }}>Final</Text>
                        <Text style={{ color: t.colors.textPrimary, fontSize: 12, fontWeight: '700' }}>10 de Julho</Text>
                      </View>
                    </View>

                    <View style={styles.torneioActionsRow}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Mais informações de ${torneio.nome}`}
                        onPress={() => setTorneioInfoId(torneio.id)}
                        style={({ pressed }) => [
                          styles.torneioActionBtn,
                          { backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenBackground, borderColor: t.colors.greenBorder },
                        ]}
                      >
                        <Ionicons name="information-circle-outline" size={15} color={t.colors.lime} />
                        <Text style={{ color: t.colors.textPrimary, fontSize: 11, fontWeight: '800' }}>MAIS INFO</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Inscrever em ${torneio.nome}`}
                        onPress={() => handleInscribeTorneio(torneio.id, torneio.nome)}
                        style={({ pressed }) => [
                          styles.inscribeBtn,
                          { flex: 1, backgroundColor: pressed ? t.colors.limePressed : t.colors.lime, borderRadius: t.radius.sm },
                        ]}
                      >
                        <Text style={[styles.inscribeBtnText, { color: t.colors.textOnLime }]}>
                          INSCREVER
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
          </View>
        )}

        {/* --- TAB RANKINGS --- */}
        {selectedTab === 'rankings' && (
          <View>
            {/* Page Title */}
            <View style={styles.pageHeader}>
              <Text style={[styles.pageTitle, { color: t.colors.textPrimary }]}>Craque São Carlos, Sp</Text>
              <Text style={[styles.pageSubtitle, { color: t.colors.textSecondary }]}>RANKING Março 26</Text>
            </View>

            {/* Destaques Lado a Lado (MVP & Líder) */}
            <View style={styles.highlightsContainer}>
              {/* Card MVP (líder do ranking, atrelado à sessão) */}
              <View style={[styles.highlightCard, { backgroundColor: t.colors.greenSurface, borderColor: mvp.voce ? t.colors.lime : t.colors.greenBorder }]}>
                <Text style={{ color: t.colors.textSecondary, fontSize: 10, fontWeight: '700' }}>
                  MVP ATUAL{mvp.voce ? ' • VOCÊ' : ''}
                </Text>
                <Text style={[styles.highlightRating, { color: t.colors.lime }]}>{mvp.rating} RATING</Text>
                <Text style={[styles.highlightName, { color: t.colors.textPrimary }]} numberOfLines={1}>{mvp.nome}</Text>
                <Text style={{ color: t.colors.textSecondary, fontSize: 10 }}>{mvp.time} • {mvp.gols} Gols / {mvp.assist} Assist.</Text>
              </View>

              {/* Card Líder */}
              <View style={[styles.highlightCard, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder }]}>
                <Text style={{ color: t.colors.textSecondary, fontSize: 10, fontWeight: '700' }}>LÍDER POR PONTOS</Text>
                <Text style={[styles.highlightRating, { color: '#95d4b9' }]}>28 PTS • INVICTO</Text>
                <Text style={[styles.highlightName, { color: t.colors.textPrimary }]}>CAVAIÚS UNITED</Text>
                <Pressable
                  onPress={() => Alert.alert('Plantel · Cavaiús United', 'Bruno "Muro" Silva (C) · Zagueiro\nRafael Gomes · Volante\nDiego Maradona Jr · Meia\nThiago Costa · Atacante\nLucas Andrade · Lateral\n\n28 pts · 9V 1E 0D · Invicto')}
                  style={({ pressed }) => [styles.btnVerPlantel, { backgroundColor: pressed ? '#2a2a2a' : '#1e1d1d' }]}
                >
                  <Text style={{ color: t.colors.textPrimary, fontSize: 9, fontWeight: '800' }}>VER PLANTEL</Text>
                </Pressable>
              </View>
            </View>

            {/* Ranking Craques */}
            <View style={{ marginTop: t.spacing.lg }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={{ color: t.colors.textPrimary, fontSize: 14, fontWeight: '800' }}>TOP 10 CRAQUES</Text>
                <Text style={{ color: t.colors.textSecondary, fontSize: 11 }}>Filtrar por: Rating</Text>
              </View>
              
              <View style={[styles.rankingTable, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                {craques.map((item, idx) => (
                  <View
                    key={item.pos}
                    style={[
                      styles.tableRow,
                      {
                        borderBottomColor: t.colors.greenBorder,
                        borderBottomWidth: idx === craques.length - 1 ? 0 : 1,
                        backgroundColor: item.voce ? t.colors.greenSurfaceAlt : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.colPos, { color: item.voce ? t.colors.lime : t.colors.textSecondary }]}>{item.pos}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: item.voce ? t.colors.lime : t.colors.textPrimary, fontSize: 12, fontWeight: '800' }} numberOfLines={1}>
                        {item.nome}{item.voce ? ' (VOCÊ)' : ''}
                      </Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: 9 }}>{item.time}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: t.colors.lime, fontSize: 13, fontWeight: '800' }}>{item.rating}</Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: 8 }}>RATING</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => Alert.alert('Craques', 'Top 10 Craques completo carregado.')}
                style={[styles.btnMore, { backgroundColor: '#2a2a2a', borderRadius: t.radius.sm }]}
              >
                <Text style={{ color: t.colors.textPrimary, fontSize: 11, fontWeight: '800' }}>MOSTRAR TOP 10 COMPLETO</Text>
              </Pressable>
            </View>

            {/* Ranking Elencos */}
            <View style={{ marginTop: t.spacing.lg }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={{ color: t.colors.textPrimary, fontSize: 14, fontWeight: '800' }}>TOP ELENCOS</Text>
                <Text style={{ color: t.colors.textSecondary, fontSize: 11 }}>Filtrar por: Pontos</Text>
              </View>
              
              <View style={[styles.rankingTable, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                {[
                  { pos: '01', nome: 'CAVAIÚS UNITED', detalhe: '10J • 9V • 1E • 0D', pontos: '28' },
                  { pos: '02', nome: 'GOLEADORES F.C.', detalhe: '10J • 8V • 1E • 1D', pontos: '25' },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.tableRow, { borderBottomColor: t.colors.greenBorder, borderBottomWidth: idx === 1 ? 0 : 1 }]}>
                    <Text style={[styles.colPos, { color: t.colors.textSecondary }]}>{item.pos}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: t.colors.textPrimary, fontSize: 12, fontWeight: '800' }}>{item.nome}</Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: 9 }}>{item.detalhe}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: t.colors.lime, fontSize: 13, fontWeight: '800' }}>{item.pontos}</Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: 8 }}>PONTOS</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Pressable
                onPress={() => Alert.alert('Elencos', 'Tabela completa de elencos carregada.')}
                style={[styles.btnMore, { backgroundColor: '#2a2a2a', borderRadius: t.radius.sm }]}
              >
                <Text style={{ color: t.colors.textPrimary, fontSize: 11, fontWeight: '800' }}>MOSTRAR TABELA COMPLETA</Text>
              </Pressable>
            </View>

            {/* Caixa Promocional "QUER CHEGAR NO TOPO?" */}
            <View style={[styles.promoBox, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
              <Text style={[styles.promoTitle, { color: t.colors.textPrimary }]}>QUER CHEGAR NO TOPO?</Text>
              <Text style={[styles.promoDesc, { color: t.colors.textSecondary }]}>
                Organize suas partidas, submeta seus resultados e suba nos rankings da maior comunidade de várzea do país.
              </Text>
              <View style={styles.promoActions}>
                <Pressable
                  onPress={() => Alert.alert('Como Funciona', 'Tutorial do ranking e súmulas.')}
                  style={styles.promoBtnLeft}
                >
                  <Text style={{ color: t.colors.textPrimary, fontSize: 11, fontWeight: '800' }}>COMO FUNCIONA</Text>
                </Pressable>
                <Pressable
                  onPress={() => Alert.alert('Criar Time', 'Formulário de criação de equipe.')}
                  style={[styles.promoBtnRight, { backgroundColor: t.colors.lime }]}
                >
                  <Ionicons name="add" size={14} color="#131313" />
                  <Text style={{ color: '#131313', fontSize: 11, fontWeight: '800' }}>CRIAR MEU TIME</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Comentários com respostas (Problema E) */}
      <ComentariosModal
        visivel={postComentario !== null}
        post={postComentario}
        onComentar={(texto) => {
          if (comentarioPostId) comentarPost(comentarioPostId, texto, autorNome);
        }}
        onResponder={(comentarioId, texto) => {
          if (comentarioPostId) responderComentario(comentarioPostId, comentarioId, texto, autorNome);
        }}
        onClose={() => setComentarioPostId(null)}
      />

      {/* Detalhes do torneio + inscrever/cancelar (Problema F) */}
      <TorneioInfoModal
        visivel={torneioInfo !== null}
        torneio={torneioInfo}
        onInscrever={() => {
          if (torneioInfo) {
            handleInscribeTorneio(torneioInfo.id, torneioInfo.nome);
            setTorneioInfoId(null);
          }
        }}
        onCancelar={() => {
          if (torneioInfo) handleCancelarInscricao(torneioInfo);
        }}
        onClose={() => setTorneioInfoId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
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
  tabsContainer: {
    flexDirection: 'row',
  },
  tabBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'Lexend',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 24,
    fontWeight: '500',
  },

  // COMUNIDADE CARD
  communityCard: {
    borderWidth: 1,
  },
  communityCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  communityIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityCardTitle: {
    flex: 1,
  },
  communityName: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
  },
  communityActions: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  actionBtnCta: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 38,
  },
  actionBtnCtaText: {
    fontFamily: 'Space Grotesk',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  actionBtnSec: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 38,
  },
  actionBtnSecText: {
    fontFamily: 'Space Grotesk',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  chamadaTitle: {
    fontFamily: 'Space Grotesk',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: 6,
  },
  chamadaBody: {
    fontFamily: 'Manrope',
    fontSize: 13,
    lineHeight: 18,
  },

  // POST BOX
  postInputBox: {
    borderWidth: 1,
  },
  postInputTitle: {
    fontFamily: 'Lexend',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  postInput: {
    borderWidth: 1,
    padding: 12,
    height: 70,
    textAlignVertical: 'top',
  },
  postBtn: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  postBtnText: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  feedTitle: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  // TORNEIOS
  filterChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  torneioCard: {
    borderWidth: 1,
  },
  torneioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  torneioNome: {
    fontFamily: 'Space Grotesk',
    fontWeight: '800',
    flex: 1,
  },
  torneioBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
  },
  torneioInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  torneioInfoText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  torneioDatesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  inscribeBtn: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inscribeBtnText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  torneioActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  torneioActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 6,
  },

  // RANKINGS MVP/HIGHLIGHTS
  highlightsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  highlightCard: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  highlightRating: {
    fontSize: 13,
    fontWeight: '800',
    marginVertical: 4,
  },
  highlightName: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  btnVerPlantel: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
  },
  btnMore: {
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  promoBox: {
    padding: 16,
    borderWidth: 1,
    marginTop: 24,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  promoBtnLeft: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 4,
    backgroundColor: '#1c1b1b',
  },
  promoBtnRight: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 4,
  },

  // RANKING TABLE
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  rankingTable: {
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  colPos: {
    width: 28,
    fontWeight: '800',
    fontSize: 13,
  },

  // PAGE HEADERS
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
  pageHeaderAccentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 20,
    marginTop: 10,
  },
  pageTitleAccent: {
    fontFamily: 'Space Grotesk',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  titleAccentBar: {
    width: 40,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
});

