import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

import { db } from '../db/db';
import { type User, type NewUser } from '../db/schema';
import { seedDatabase } from '../db/seed';
import * as authApi from '../api/auth';
import { findUserByCpf, createUser, updateUser, type CreateUserInput, type UpdateUserInput } from '../api/users';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (cpf: string) => Promise<void>;
  signUp: (input: CreateUserInput) => Promise<void>;
  updateProfile: (changes: UpdateUserInput) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Normaliza um registro do repositório (seed/SQLite) para o tipo `User`. */
function toUser(record: NewUser | User): User {
  const anyRec = record as Partial<User>;
  return {
    cpf: record.cpf,
    name: record.name,
    passwordHash: record.passwordHash,
    role: record.role ?? 'jogador',
    phone: record.phone ?? null,
    createdAt: anyRec.createdAt instanceof Date ? anyRec.createdAt : new Date(),
    updatedAt: anyRec.updatedAt instanceof Date ? anyRec.updatedAt : new Date(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        // Nativo: garante que os 35 usuários do seed existam no SQLite.
        if (Platform.OS !== 'web') {
          await seedDatabase(db as any);
        }

        const session = await authApi.getSession();
        const sessionCpf = await authApi.getSessionCpf();

        if (session && sessionCpf) {
          // Resolve a sessão persistida via repositório (seed + contas criadas).
          const matched = await findUserByCpf(sessionCpf);
          if (matched) {
            setUser(toUser(matched));
          } else {
            // Sessão órfã: limpa a sessão local.
            await authApi.logout();
          }
        }
      } catch {
        // Tratamento silencioso e PII-safe (CH-08/CH-15): nunca logar dados sensíveis
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();
  }, []);

  const signIn = async (cpf: string) => {
    setIsLoading(true);
    try {
      await authApi.login(cpf);
      const matched = await findUserByCpf(cpf);
      if (matched) {
        setUser(toUser(matched));
      } else {
        throw new Error('Erro ao carregar dados do usuário.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (input: CreateUserInput) => {
    setIsLoading(true);
    try {
      // Cria a conta (valida CPF/nome/senha, impede duplicidade — CH-09) e já
      // autentica a sessão recém-criada.
      const created = await createUser(input);
      await authApi.login(created.cpf);
      setUser(toUser(created));
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (changes: UpdateUserInput) => {
    if (!user) return;
    await updateUser(user.cpf, changes);
    const refreshed = await findUserByCpf(user.cpf);
    if (refreshed) {
      setUser(toUser(refreshed));
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
