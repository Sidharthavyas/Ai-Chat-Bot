import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  email: string;
  password: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: null | Omit<User, 'password'>;
  users: User[];
  register: (username: string, email: string, password: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      users: [],
      register: (username, email, password) => {
        const users = get().users;
        if (users.some((user) => user.email === email)) {
          return false;
        }
        set((state) => ({
          users: [...state.users, { username, email, password }],
        }));
        return true;
      },
      login: (email, password) => {
        const user = get().users.find(
          (u) => u.email === email && u.password === password
        );
        if (user) {
          set({
            isAuthenticated: true,
            user: { username: user.username, email: user.email },
          });
          return true;
        }
        return false;
      },
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

interface ChatState {
  messages: Array<{
    id: string;
    content: string;
    type: 'text' | 'image';
    role: 'user' | 'assistant';
    timestamp: Date;
  }>;
  addMessage: (message: Omit<ChatState['messages'][0], 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
        },
      ],
    })),
  clearMessages: () => set({ messages: [] }),
}));