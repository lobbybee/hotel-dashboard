import { defineStore } from 'pinia';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'hotel_admin' | 'manager' | 'receptionist';
  phone_number: string;
  hotel_id: string;
  first_name?: string;
  last_name?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    hotelId: (state) => state.user?.hotel_id || null,
    userRole: (state) => state.user?.user_type || null,
    userInitials: (state) => {
      if (state.user?.first_name && state.user?.last_name) {
        return state.user.first_name.charAt(0) + state.user.last_name.charAt(0);
      }
      if (state.user?.username) {
        return state.user.username.charAt(0).toUpperCase();
      }
      return 'U';
    },
  },
  actions: {
    setUser(newUser: User | null) {
      this.user = newUser;
      if (process.client) {
        if (newUser) {
          localStorage.setItem('auth_user', JSON.stringify(newUser));
        } else {
          localStorage.removeItem('auth_user');
        }
      }
    },
    initializeAuth() {
      if (process.client) {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            this.setUser(user);
          } catch (e) {
            console.error("Failed to parse user from localStorage", e);
            this.setUser(null);
          }
        }
      }
    },
  },
});
