import axios, { AxiosError, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any custom headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data; // Return only data
  },
  async (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      try {
        await apiClient.post('/api/auth/refresh');
        // Retry original request
        return apiClient(error.config!);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin';
        }
      }
    }

    // Return formatted error
    const errorMessage = error.response?.data?.error?.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// API methods
export const api = {
  // Auth
  auth: {
    verify: (data: { provider: string; oauth_id: string; email: string; name: string; avatar_url?: string }) =>
      apiClient.post('/api/auth/verify', data),
    refresh: () => apiClient.post('/api/auth/refresh'),
    logout: () => apiClient.post('/api/auth/logout'),
  },

  // Users
  users: {
    getMe: () => apiClient.get('/api/users/me'),
    updateMe: (data: Partial<{ name: string; bio: string; timezone: string; avatar_url: string }>) =>
      apiClient.patch('/api/users/me', data),
    getById: (userId: string) => apiClient.get(`/api/users/${userId}`),
    uploadAvatar: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return apiClient.post('/api/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
  },

  // Skills
  skills: {
    getAll: (params?: { category?: string; search?: string }) =>
      apiClient.get('/api/skills', { params }),
    addToProfile: (data: {
      skill_id?: number;
      custom_skill_name?: string;
      skill_type: 'TEACH' | 'LEARN';
      proficiency_level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    }) => apiClient.post('/api/users/me/skills', data),
    removeFromProfile: (userSkillId: number) =>
      apiClient.delete(`/api/users/me/skills/${userSkillId}`),
  },

  // Matches
  matches: {
    getSuggestions: (limit?: number) =>
      apiClient.get('/api/matches/suggestions', { params: { limit } }),
    search: (params: { skill: string; type?: string; page?: number; limit?: number }) =>
      apiClient.get('/api/users/search', { params }),
    create: (userId: string) => apiClient.post('/api/matches', { user_id: userId }),
    getAll: (status?: string) => apiClient.get('/api/matches', { params: { status } }),
  },

  // Sessions
  sessions: {
    create: (data: {
      title: string;
      description?: string;
      skill_id?: number;
      custom_skill_name?: string;
      session_type: 'ONE_ON_ONE' | 'GROUP';
      scheduled_start: string;
      scheduled_end: string;
      participants: Array<{ user_id: string; role: 'TEACHER' | 'LEARNER' }>;
    }) => apiClient.post('/api/sessions', data),
    getAll: (params?: { status?: string; upcoming?: boolean; past?: boolean }) =>
      apiClient.get('/api/sessions', { params }),
    getById: (sessionId: string) => apiClient.get(`/api/sessions/${sessionId}`),
    cancel: (sessionId: string) => apiClient.post(`/api/sessions/${sessionId}/cancel`),
    updateParticipant: (sessionId: string, userId: string, status: 'ACCEPTED' | 'DECLINED') =>
      apiClient.patch(`/api/sessions/${sessionId}/participants/${userId}`, { status }),
  },

  // Messages
  messages: {
    send: (recipientId: string, content: string) =>
      apiClient.post('/api/messages', { recipient_id: recipientId, content }),
    getConversation: (userId: string, page?: number, limit?: number) =>
      apiClient.get('/api/messages', { params: { conversation_with: userId, page, limit } }),
    getConversations: () => apiClient.get('/api/messages/conversations'),
    markAsRead: (messageId: number) => apiClient.post(`/api/messages/${messageId}/read`),
    getUnreadCount: () => apiClient.get('/api/messages/unread_count'),
  },

  // Reviews
  reviews: {
    create: (data: {
      session_id: string;
      reviewee_id: string;
      rating: number;
      review_text?: string;
    }) => apiClient.post('/api/reviews', data),
    getForUser: (userId: string, page?: number, limit?: number) =>
      apiClient.get('/api/reviews', { params: { user_id: userId, page, limit } }),
  },
};

export default api;
