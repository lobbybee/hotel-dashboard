import { defineStore } from 'pinia';

interface User {
  id: number;
  username: string;
  email: string;
  user_type: 'hotel_admin' | 'manager' | 'receptionist' | 'department_staff';
  phone_number: string;
  hotel_id: string;
  hotel_name?: string;
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
          // Save hotel name separately for easy access
          if (newUser.hotel_name) {
            localStorage.setItem('hotel_name', newUser.hotel_name);
          }
        } else {
          localStorage.removeItem('auth_user');
          localStorage.removeItem('hotel_name');
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
    getHotelName(): string | null {
      if (process.client) {
        // First try to get from current user
        if (this.user?.hotel_name) {
          return this.user.hotel_name;
        }
        // Fallback to localStorage
        return localStorage.getItem('hotel_name');
      }
      return null;
    },
  },
});
