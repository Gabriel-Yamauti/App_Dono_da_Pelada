export const DATABASE_NAME = 'dono_da_pelada.db';

// Mock seguro para Web (evita ReferenceError: SharedArrayBuffer no Expo Web)
// As operações da Web serão resolvidas em memória/AsyncStorage via AuthContext.
export const db: any = {
  select: () => ({
    from: () => ({
      where: () => ({
        limit: () => Promise.resolve([]),
      }),
    }),
  }),
  insert: () => ({
    values: () => ({
      onConflictDoUpdate: () => Promise.resolve(),
    }),
  }),
};
