const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return response.json();
  },

  register: async (userData: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  getProfile: async () => {
    return apiRequest('/auth/profile');
  },

  getUsers: async () => {
    return apiRequest('/users');
  },
};

// Elections API
export const electionsAPI = {
  getAll: async () => {
    return apiRequest('/elections');
  },

  getById: async (id: string) => {
    return apiRequest(`/elections/${id}`);
  },

  create: async (electionData: {
    title: string;
    contestType: string;
    categories: Array<{
      id: string;
      name: string;
      candidates: Array<{ name: string; description: string }>;
      numWinners: number;
    }>;
    allowedVoters?: string[];
    endDate?: string;
    isPrivate?: boolean;
  }) => {
    return apiRequest('/elections', {
      method: 'POST',
      body: JSON.stringify(electionData),
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiRequest(`/elections/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/elections/${id}`, {
      method: 'DELETE',
    });
  },
};

// Voting API
export const votingAPI = {
  submitVote: async (electionId: string, voteData: {
    voterId?: string;
    voterName?: string;
    votes: Array<{
      categoryId: string;
      preferences?: string[];
      selected?: string[];
    }>;
  }) => {
    return apiRequest(`/elections/${electionId}/vote`, {
      method: 'POST',
      body: JSON.stringify(voteData),
    });
  },

  getVotes: async (electionId: string) => {
    return apiRequest(`/elections/${electionId}/votes`);
  },

  getResults: async (electionId: string) => {
    return apiRequest(`/elections/${electionId}/results`);
  },
};

// Utility functions
export const apiUtils = {
  handleError: (error: any) => {
    console.error('API Error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred',
    };
  },

  validateResponse: (response: any) => {
    if (!response || !response.success) {
      throw new Error(response?.message || 'Invalid response');
    }
    return response;
  },
};

export default {
  auth: authAPI,
  elections: electionsAPI,
  voting: votingAPI,
  utils: apiUtils,
}; 