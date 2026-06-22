import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme';
import { maskCpf } from '../db/seed';
import { type NewUser, type UserRole } from '../db/schema';
import { getAllUsers, SIGNUP_ROLES } from '../api/users';

/** Aplica máscara visual de CPF (000.000.000-00) a partir do texto digitado. */
function formatCpfInput(text: string): string {
  const clean = (text ?? '').replace(/\D/g, '');
  if (clean.length > 9) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`;
  }
  if (clean.length > 6) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}`;
  }
  if (clean.length > 3) {
    return `${clean.slice(0, 3)}.${clean.slice(3, 6)}`;
  }
  return clean;
}

const ROLE_LABEL: Record<UserRole, string> = {
  'jogador': 'Jogador',
  'jogador-hoster': 'Jogador Hoster',
  'dono-campo': 'Dono de Campo',
  'visitante': 'Visitante',
};

export function LoginScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signUp } = useAuth();

  const [cpfInput, setCpfInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Lista de usuários conhecidos (seed + contas criadas). Recarrega ao abrir o
  // seletor para refletir cadastros recentes.
  const [allUsers, setAllUsers] = useState<NewUser[]>([]);
  useEffect(() => {
    let active = true;
    getAllUsers()
      .then((u) => {
        if (active) setAllUsers(u);
      })
      .catch(() => {
        /* PII-safe: nunca logar */
      });
    return () => {
      active = false;
    };
  }, [isSelectOpen]);

  // Estado do cadastro de nova conta.
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [suName, setSuName] = useState('');
  const [suCpf, setSuCpf] = useState('');
  const [suPhone, setSuPhone] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suRole, setSuRole] = useState<UserRole>('jogador');
  const [suError, setSuError] = useState<string | null>(null);
  const [suSubmitting, setSuSubmitting] = useState(false);

  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCpfChange = (text: string) => {
    setCpfInput(formatCpfInput(text));
    setErrorMsg(null);
  };

  const handleSignup = async () => {
    setSuError(null);
    setSuSubmitting(true);
    try {
      await signUp({
        name: suName,
        cpf: suCpf,
        password: suPassword,
        role: suRole,
        phone: suPhone || null,
      });
      // Sucesso: o AuthContext já autenticou e o app navega para as abas.
      setIsSignupOpen(false);
      setSuName('');
      setSuCpf('');
      setSuPhone('');
      setSuPassword('');
      setSuRole('jogador');
    } catch (error: any) {
      setSuError(error?.message ?? 'Não foi possível criar a conta.');
    } finally {
      setSuSubmitting(false);
    }
  };

  const handleLogin = async (cpf: string) => {
    setErrorMsg(null);
    try {
      await signIn(cpf);
    } catch (error: any) {
      setErrorMsg(error.message || 'Erro ao realizar login.');
    }
  };

  const handleUserSelect = (user: NewUser) => {
    setIsSelectOpen(false);
    // Auto preenche o CPF e já efetua o login direto
    handleCpfChange(user.cpf);
    handleLogin(user.cpf);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'dono-campo':
        return 'Dono de Campo';
      case 'jogador-hoster':
        return 'Jogador Hoster';
      case 'jogador':
        return 'Jogador';
      case 'visitante':
        return 'Visitante';
      default:
        return 'Jogador';
    }
  };

  const getRoleIcon = (role: string): keyof typeof Ionicons.glyphMap => {
    switch (role) {
      case 'dono-campo':
        return 'business-outline';
      case 'jogador-hoster':
        return 'megaphone-outline';
      case 'jogador':
        return 'football-outline';
      default:
        return 'person-outline';
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: t.colors.greenBackground,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 20,
        },
      ]}
    >
      {/* Cabeçalho Visual */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: t.colors.greenSurfaceAlt, borderRadius: t.radius.lg }]}>
          <Ionicons name="football" size={48} color={t.colors.lime} />
        </View>
        <Text style={[styles.title, { color: t.colors.textPrimary, fontSize: t.typography.size.xxl, fontWeight: t.typography.weight.bold }]}>
          Dono da Pelada
        </Text>
        <Text style={[styles.subtitle, { color: t.colors.textSecondary, fontSize: t.typography.size.md }]}>
          A várzea gamificada e organizada.
        </Text>
      </View>

      {/* Formulário Principal */}
      <View style={[styles.form, { marginTop: t.spacing.xl }]}>
        <Text style={[styles.label, { color: t.colors.textSecondary, fontSize: t.typography.size.sm }]}>
          LOGIN POR CPF
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: t.colors.greenSurface,
              borderColor: errorMsg ? t.colors.danger : t.colors.greenBorder,
              borderRadius: t.radius.md,
            },
          ]}
        >
          <Ionicons name="card-outline" size={20} color={t.colors.textSecondary} style={styles.inputIcon} />
          <TextInput
            placeholder="000.000.000-00"
            placeholderTextColor={t.colors.textSecondary}
            keyboardType="numeric"
            maxLength={14}
            value={cpfInput}
            onChangeText={handleCpfChange}
            style={[styles.input, { color: t.colors.textPrimary, fontSize: t.typography.size.md }]}
          />
        </View>

        {errorMsg && (
          <Text style={[styles.error, { color: t.colors.danger, fontSize: t.typography.size.xs }]}>
            {errorMsg}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Entrar"
          onPress={() => handleLogin(cpfInput)}
          style={({ pressed }) => [
            styles.submitButton,
            {
              backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
              borderRadius: t.radius.md,
              marginTop: t.spacing.md,
            },
          ]}
        >
          <Text style={[styles.submitText, { color: t.colors.textOnLime, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold }]}>
            Entrar
          </Text>
        </Pressable>

        {/* Divisor Visual */}
        <View style={[styles.divider, { marginVertical: t.spacing.lg }]}>
          <View style={[styles.dividerLine, { backgroundColor: t.colors.greenBorder }]} />
          <Text style={[styles.dividerText, { color: t.colors.textSecondary, fontSize: t.typography.size.xs }]}>
            OU
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: t.colors.greenBorder }]} />
        </View>

        {/* Botão de Alternância de Usuário (Quick Switcher) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Selecionar usuário de teste"
          onPress={() => setIsSelectOpen(true)}
          style={({ pressed }) => [
            styles.switcherButton,
            {
              backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenSurface,
              borderColor: t.colors.greenBorder,
              borderRadius: t.radius.md,
            },
          ]}
        >
          <Ionicons name="people-outline" size={20} color={t.colors.lime} />
          <Text style={[styles.switcherText, { color: t.colors.textPrimary, fontSize: t.typography.size.sm }]}>
            Alternar usuário de teste (seed)
          </Text>
          <Ionicons name="chevron-forward" size={16} color={t.colors.textSecondary} />
        </Pressable>

        {/* Criar nova conta (persistida no banco local) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Criar nova conta"
          onPress={() => {
            setSuError(null);
            setIsSignupOpen(true);
          }}
          style={({ pressed }) => [
            styles.switcherButton,
            {
              backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent',
              borderColor: t.colors.lime,
              borderRadius: t.radius.md,
              marginTop: t.spacing.sm,
            },
          ]}
        >
          <Ionicons name="person-add-outline" size={20} color={t.colors.lime} />
          <Text style={[styles.switcherText, { color: t.colors.lime, fontSize: t.typography.size.sm, fontWeight: t.typography.weight.bold }]}>
            Criar nova conta
          </Text>
          <Ionicons name="chevron-forward" size={16} color={t.colors.lime} />
        </Pressable>
      </View>

      {/* Modal / Bottom Sheet do Seletor de Usuários */}
      <Modal visible={isSelectOpen} animationType="slide" transparent={false} onRequestClose={() => setIsSelectOpen(false)}>
        <View style={[styles.modalContainer, { backgroundColor: t.colors.greenBackground, paddingTop: insets.top }]}>
          {/* Cabeçalho do Modal */}
          <View style={[styles.modalHeader, { borderBottomColor: t.colors.greenBorder, padding: t.spacing.md }]}>
            <View>
              <Text style={[styles.modalTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.bold }]}>
                Usuários de Teste (Seed)
              </Text>
              <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm }}>
                Selecione um perfil para entrar instantaneamente
              </Text>
            </View>
            <Pressable
              onPress={() => setIsSelectOpen(false)}
              style={({ pressed }) => [
                styles.modalCloseButton,
                { backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent', borderRadius: t.radius.pill },
              ]}
            >
              <Ionicons name="close" size={24} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          {/* Filtro de Pesquisa */}
          <View style={[styles.searchBar, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md, margin: t.spacing.md }]}>
            <Ionicons name="search-outline" size={18} color={t.colors.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              placeholder="Pesquise por nome ou papel..."
              placeholderTextColor={t.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{ color: t.colors.textPrimary, fontSize: t.typography.size.sm, flex: 1 }}
            />
            {searchQuery !== '' && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={t.colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Lista de Usuários */}
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.cpf}
            contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 20 }}
            renderItem={({ item }) => {
              const roleIcon = getRoleIcon(item.role ?? 'jogador');
              return (
                <Pressable
                  onPress={() => handleUserSelect(item)}
                  style={({ pressed }) => [
                    styles.userCard,
                    {
                      backgroundColor: pressed ? t.colors.greenSurfaceAlt : t.colors.greenSurface,
                      borderColor: t.colors.greenBorder,
                      borderRadius: t.radius.md,
                      padding: t.spacing.md,
                      marginBottom: t.spacing.sm,
                    },
                  ]}
                >
                  <View style={styles.userCardInfo}>
                    <View style={[styles.avatar, { backgroundColor: t.colors.greenBackground, borderRadius: t.radius.pill }]}>
                      <Ionicons name={roleIcon} size={20} color={t.colors.lime} />
                    </View>
                    <View>
                      <Text style={[styles.userName, { color: t.colors.textPrimary, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold }]}>
                        {item.name}
                      </Text>
                      <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.xs }}>
                        CPF: {maskCpf(item.cpf)}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.roleBadge, { backgroundColor: t.colors.greenSurfaceAlt, borderRadius: t.radius.pill }]}>
                    <Text style={[styles.roleText, { color: t.colors.lime, fontSize: t.typography.size.xs }]}>
                      {getRoleLabel(item.role ?? 'jogador')}
                    </Text>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>

      {/* Modal de Criação de Conta (persistida no banco local) */}
      <Modal visible={isSignupOpen} animationType="slide" transparent={false} onRequestClose={() => setIsSignupOpen(false)}>
        <View style={[styles.modalContainer, { backgroundColor: t.colors.greenBackground, paddingTop: insets.top }]}>
          {/* Cabeçalho FIXO com X sempre visível (CH-03) */}
          <View style={[styles.modalHeader, { borderBottomColor: t.colors.greenBorder, padding: t.spacing.md }]}>
            <View>
              <Text style={[styles.modalTitle, { color: t.colors.textPrimary, fontSize: t.typography.size.lg, fontWeight: t.typography.weight.bold }]}>
                Criar nova conta
              </Text>
              <Text style={{ color: t.colors.textSecondary, fontSize: t.typography.size.sm }}>
                Seus dados ficam no banco local do dispositivo.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar"
              onPress={() => setIsSignupOpen(false)}
              style={({ pressed }) => [
                styles.modalCloseButton,
                { backgroundColor: pressed ? t.colors.greenSurfaceAlt : 'transparent', borderRadius: t.radius.pill },
              ]}
            >
              <Ionicons name="close" size={24} color={t.colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: t.spacing.md, paddingBottom: insets.bottom + 24, gap: 14 }}>
            {/* Nome */}
            <View>
              <Text style={[styles.suLabel, { color: t.colors.textSecondary }]}>NOME DE EXIBIÇÃO</Text>
              <View style={[styles.suInputBox, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                <Ionicons name="person-outline" size={18} color={t.colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Ex: João da Várzea"
                  placeholderTextColor={t.colors.textSecondary}
                  value={suName}
                  onChangeText={setSuName}
                  style={{ flex: 1, color: t.colors.textPrimary, fontSize: t.typography.size.md, height: '100%' }}
                />
              </View>
            </View>

            {/* CPF */}
            <View>
              <Text style={[styles.suLabel, { color: t.colors.textSecondary }]}>CPF (IDENTIDADE)</Text>
              <View style={[styles.suInputBox, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                <Ionicons name="card-outline" size={18} color={t.colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="000.000.000-00"
                  placeholderTextColor={t.colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={14}
                  value={suCpf}
                  onChangeText={(text) => {
                    setSuCpf(formatCpfInput(text));
                    setSuError(null);
                  }}
                  style={{ flex: 1, color: t.colors.textPrimary, fontSize: t.typography.size.md, height: '100%' }}
                />
              </View>
            </View>

            {/* Telefone (opcional) */}
            <View>
              <Text style={[styles.suLabel, { color: t.colors.textSecondary }]}>TELEFONE (OPCIONAL)</Text>
              <View style={[styles.suInputBox, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                <Ionicons name="call-outline" size={18} color={t.colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="(11) 90000-0000"
                  placeholderTextColor={t.colors.textSecondary}
                  keyboardType="phone-pad"
                  value={suPhone}
                  onChangeText={setSuPhone}
                  style={{ flex: 1, color: t.colors.textPrimary, fontSize: t.typography.size.md, height: '100%' }}
                />
              </View>
            </View>

            {/* Senha */}
            <View>
              <Text style={[styles.suLabel, { color: t.colors.textSecondary }]}>SENHA</Text>
              <View style={[styles.suInputBox, { backgroundColor: t.colors.greenSurface, borderColor: t.colors.greenBorder, borderRadius: t.radius.md }]}>
                <Ionicons name="lock-closed-outline" size={18} color={t.colors.textSecondary} style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor={t.colors.textSecondary}
                  secureTextEntry
                  value={suPassword}
                  onChangeText={(text) => {
                    setSuPassword(text);
                    setSuError(null);
                  }}
                  style={{ flex: 1, color: t.colors.textPrimary, fontSize: t.typography.size.md, height: '100%' }}
                />
              </View>
            </View>

            {/* Papel */}
            <View>
              <Text style={[styles.suLabel, { color: t.colors.textSecondary }]}>EU SOU</Text>
              <View style={styles.suRolesRow}>
                {SIGNUP_ROLES.map((role) => {
                  const active = suRole === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => setSuRole(role)}
                      style={[
                        styles.suRoleChip,
                        {
                          backgroundColor: active ? t.colors.lime : t.colors.greenSurface,
                          borderColor: active ? t.colors.lime : t.colors.greenBorder,
                          borderRadius: t.radius.sm,
                        },
                      ]}
                    >
                      <Text style={{ color: active ? t.colors.textOnLime : t.colors.textPrimary, fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                        {ROLE_LABEL[role]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {suError && (
              <Text style={[styles.error, { color: t.colors.danger, fontSize: t.typography.size.sm }]}>
                {suError}
              </Text>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirmar criação de conta"
              disabled={suSubmitting}
              onPress={handleSignup}
              style={({ pressed }) => [
                styles.submitButton,
                {
                  backgroundColor: pressed ? t.colors.limePressed : t.colors.lime,
                  borderRadius: t.radius.md,
                  marginTop: t.spacing.sm,
                  opacity: suSubmitting ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.submitText, { color: t.colors.textOnLime, fontSize: t.typography.size.md, fontWeight: t.typography.weight.bold }]}>
                {suSubmitting ? 'Criando…' : 'Criar conta e entrar'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  header: { alignItems: 'center' },
  logoContainer: { padding: 16, marginBottom: 16 },
  title: { letterSpacing: 0.5 },
  subtitle: { marginTop: 4, textAlign: 'center' },
  form: { width: '100%' },
  label: { fontWeight: '700', marginBottom: 8, letterSpacing: 0.5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: '100%', fontWeight: '500' },
  error: { marginTop: 6, fontWeight: '600' },
  submitButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { letterSpacing: 0.5 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontWeight: '700' },
  switcherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 52,
    paddingHorizontal: 16,
    gap: 12,
  },
  switcherText: { flex: 1, fontWeight: '600' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  modalTitle: { letterSpacing: 0.3 },
  modalCloseButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 46,
    paddingHorizontal: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  suLabel: { fontWeight: '700', marginBottom: 6, letterSpacing: 0.5, fontSize: 11 },
  suInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    paddingHorizontal: 14,
  },
  suRolesRow: { flexDirection: 'row', gap: 8 },
  suRoleChip: {
    flex: 1,
    borderWidth: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  userCardInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  userName: { letterSpacing: 0.2 },
  roleBadge: { paddingVertical: 4, paddingHorizontal: 10 },
  roleText: { fontWeight: '700' },
});
