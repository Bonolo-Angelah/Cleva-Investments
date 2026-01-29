import { create } from 'zustand';
import { authAPI } from '../services/api';
import socketService from '../services/socket';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { user, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Connect socket
    socketService.connect(token);

    set({ user, token, isAuthenticated: true });
    return user;
  },

  register: async (userData) => {
    const response = await authAPI.register(userData);
    const { user, token } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Connect socket
    socketService.connect(token);

    set({ user, token, isAuthenticated: true });
    return user;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updatedUser = { ...useAuthStore.getState().user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  }
}));

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  recommendations: [],
  marketData: [],

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  setMessages: (messages) => {
    set({ messages });
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },

  setRecommendations: (recommendations) => {
    set({ recommendations });
  },

  setMarketData: (marketData) => {
    set({ marketData });
  },

  clearChat: () => {
    set({ messages: [], recommendations: [], marketData: [] });
  }
}));

export const useGoalsStore = create((set) => ({
  goals: [],
  currentGoal: null,

  setGoals: (goals) => {
    set({ goals });
  },

  addGoal: (goal) => {
    set((state) => ({
      goals: [...state.goals, goal]
    }));
  },

  updateGoal: (id, updates) => {
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, ...updates } : goal
      )
    }));
  },

  deleteGoal: (id) => {
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== id)
    }));
  },

  setCurrentGoal: (goal) => {
    set({ currentGoal: goal });
  }
}));
