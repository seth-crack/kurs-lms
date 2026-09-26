import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { updateUser, findUserById } from '../lib/users';

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      theme: 'light',
      session: null,
      loading: true,
      initialized: false,

      init: async () => {
        if (get().initialized) return;

        const { data } = await supabase.auth.getSession();

        if (data.session) {
          const profile = await findUserById(data.session.user.id);
          set({
            user: profile,
            session: data.session,
            loading: false,
            initialized: true,
          });
        } else {
          set({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }

        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session) {
            const profile = await findUserById(session.user.id);
            set({ user: profile, session });
          } else {
            set({ user: null, session: null });
          }
        });
      },

      signIn: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            return { ok: false, error: 'Неверный email или пароль' };
          }
          if (error.message.includes('Email not confirmed')) {
            return {
              ok: false,
              error:
                'Email не подтверждён. Проверьте почту и перейдите по ссылке.',
            };
          }
          return { ok: false, error: error.message };
        }

        const profile = await findUserById(data.user.id);
        set({ user: profile, session: data.session });
        return { ok: true, user: profile };
      },

      signUp: async ({ name, email, password, role, teacherId }) => {
        if (!name.trim()) return { ok: false, error: 'Укажите имя' };
        if (!email.trim()) return { ok: false, error: 'Укажите email' };
        if (!password || password.length < 6) {
          return { ok: false, error: 'Пароль не короче 6 символов' };
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              name: name.trim(),
              role,
              teacher_id: teacherId || null,
            },
          },
        });

        if (error) {
          if (error.message.includes('already registered')) {
            return {
              ok: false,
              error: 'Пользователь с таким email уже зарегистрирован',
            };
          }
          return { ok: false, error: error.message };
        }

        if (!data.session) {
          return {
            ok: true,
            needsConfirmation: true,
            email: email.trim().toLowerCase(),
          };
        }

        const profile = await findUserById(data.user.id);
        set({ user: profile, session: data.session });
        return { ok: true, user: profile };
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },

      setUser: async (patch) => {
        const current = get().user;
        if (!current) return;
        await updateUser(current.id, patch);
        const updated = await findUserById(current.id);
        set({ user: updated });
      },

      sendResetEmail: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim().toLowerCase(),
          {
            redirectTo: window.location.origin + '/reset-password',
          }
        );

        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      updatePassword: async (newPassword) => {
        if (!newPassword || newPassword.length < 6) {
          return { ok: false, error: 'Пароль не короче 6 символов' };
        }

        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'kurs-auth',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);