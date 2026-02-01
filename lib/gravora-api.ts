// Gravora Backend API Client
// Base URL: https://gravora.kz/api/v1

const API_BASE = 'https://gravora.kz/api/v1';

// Types based on Swagger schema
export interface TokenPairResponse {
  token_type: string;
  access_token: string;
  refresh_token: string;
  access_expires_in: number;
  refresh_expires_in: number;
}

export interface UserOut {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyCreateResponse {
  status: string;
  company_id: string;
}

export interface CompanyContextResponse {
  status: string;
  company_id: string;
  context_id: string;
}

export interface SnapshotBuildResponse {
  status: string;
  company_id: string;
  snapshot_id: string;
}

export interface AIOrchestrateResponse {
  status: string;
  company_id: string;
  snapshot_id: string;
  orchestrate_id: string;
}

export interface DataGap {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  area: string;
  impact: string;
  fix_steps?: string[];
}

export interface DataAnomaly {
  kind: string;
  details: Record<string, unknown>;
}

export interface DataAuditorResult {
  data_quality_score: number;
  gate_status: 'A' | 'B' | 'C' | 'CRITICAL';
  gaps: DataGap[];
  anomalies: DataAnomaly[];
}

export interface AIInsightsResponse {
  status: string;
  company_id: string;
  reason?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface OrchestrateResponse {
  chat_id: string;
  intent: string;
  message: string;
  data_auditor?: DataAuditorResult | null;
}

// Error handling
export class GravoraAPIError extends Error {
  status: number;
  code?: string;
  
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'GravoraAPIError';
    this.status = status;
    this.code = code;
  }
}

// Token management
const TOKEN_KEY = 'gravora_access_token';
const REFRESH_TOKEN_KEY = 'gravora_refresh_token';
const USER_KEY = 'gravora_user';
const COMPANY_KEY = 'gravora_company_id';

export const tokenStorage = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setAccessToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },
  getRefreshToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    }
  },
  getUser: (): UserOut | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(USER_KEY);
    return data ? JSON.parse(data) : null;
  },
  setUser: (user: UserOut) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  },
  getCompanyId: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(COMPANY_KEY);
  },
  setCompanyId: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COMPANY_KEY, id);
    }
  },
  clear: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(COMPANY_KEY);
    }
  }
};

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  requireAuth = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (requireAuth) {
    const token = tokenStorage.getAccessToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = 'Произошла ошибка';
    let errorCode: string | undefined;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
      errorCode = errorData.code;
    } catch {
      // Ignore JSON parse errors
    }

    // Handle specific error codes
    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the request
        return apiRequest<T>(endpoint, options, requireAuth);
      }
      errorMessage = 'Неверный email или пароль';
    } else if (response.status === 403) {
      errorMessage = 'Доступ запрещён';
    } else if (response.status === 404) {
      errorMessage = 'Данные не найдены';
    } else if (response.status >= 500) {
      errorMessage = 'Ошибка сервера. Попробуйте позже.';
    }

    throw new GravoraAPIError(errorMessage, response.status, errorCode);
  }

  return response.json();
}

// Refresh token function
async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data: TokenPairResponse = await response.json();
      tokenStorage.setAccessToken(data.access_token);
      tokenStorage.setRefreshToken(data.refresh_token);
      return true;
    }
  } catch {
    // Refresh failed
  }

  tokenStorage.clear();
  return false;
}

// ============ AUTH API ============
export const authAPI = {
  /**
   * Login (auto-creates user/company if not exists - Stage 0)
   */
  login: async (email: string, password: string): Promise<TokenPairResponse> => {
    const data = await apiRequest<TokenPairResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
    
    tokenStorage.setAccessToken(data.access_token);
    tokenStorage.setRefreshToken(data.refresh_token);
    
    // Fetch user info after login
    const user = await authAPI.me();
    tokenStorage.setUser(user);
    
    return data;
  },

  /**
   * Get current user info
   */
  me: async (): Promise<UserOut> => {
    return apiRequest<UserOut>('/auth/me');
  },

  /**
   * Logout - clear tokens
   */
  logout: () => {
    tokenStorage.clear();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// ============ COMPANY API ============
export const companyAPI = {
  /**
   * Create a new company
   */
  create: async (name?: string): Promise<CompanyCreateResponse> => {
    const data = await apiRequest<CompanyCreateResponse>('/company/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    
    tokenStorage.setCompanyId(data.company_id);
    return data;
  },

  /**
   * Update company context
   */
  updateContext: async (
    companyId: string,
    context: Record<string, unknown>
  ): Promise<CompanyContextResponse> => {
    return apiRequest<CompanyContextResponse>(
      `/company/${companyId}/context`,
      {
        method: 'POST',
        body: JSON.stringify(context),
      }
    );
  },
};

// ============ SNAPSHOT API ============
export const snapshotAPI = {
  /**
   * Build snapshot for company
   */
  build: async (companyId: string): Promise<SnapshotBuildResponse> => {
    return apiRequest<SnapshotBuildResponse>('/snapshot/build', {
      method: 'POST',
      body: JSON.stringify({ company_id: companyId }),
    });
  },
};

// ============ AI API ============
export const aiAPI = {
  /**
   * Run AI orchestration
   */
  orchestrate: async (
    companyId: string,
    snapshotId?: string,
    message?: string
  ): Promise<AIOrchestrateResponse> => {
    return apiRequest<AIOrchestrateResponse>('/ai/orchestrate', {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyId,
        snapshot_id: snapshotId,
        message,
      }),
    });
  },

  /**
   * Get insights for company
   */
  getInsights: async (companyId: string): Promise<AIInsightsResponse> => {
    return apiRequest<AIInsightsResponse>(`/ai/insights/${companyId}`);
  },
};

// ============ ORCHESTRATE API ============
export const orchestrateAPI = {
  /**
   * Send message to orchestrator
   */
  send: async (message: string, chatId?: string): Promise<OrchestrateResponse> => {
    return apiRequest<OrchestrateResponse>('/orchestrate', {
      method: 'POST',
      body: JSON.stringify({
        message,
        chat_id: chatId,
      }),
    });
  },
};

export default {
  auth: authAPI,
  company: companyAPI,
  snapshot: snapshotAPI,
  ai: aiAPI,
  orchestrate: orchestrateAPI,
  tokenStorage,
};
