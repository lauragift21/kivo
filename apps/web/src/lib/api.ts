import type {
  Client,
  CreateClient,
  UpdateClient,
  Invoice,
  CreateInvoice,
  UpdateInvoice,
  Settings,
  UpdateSettings,
  DashboardData,
  User,
  PublicInvoiceData,
  PaginatedResponse,
} from '@kivo/shared';

const API_BASE = '/api';

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  // Check if response is JSON
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new ApiError(
      'INVALID_RESPONSE',
      `Server returned non-JSON response: ${text.substring(0, 100)}`,
      response.status
    );
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(
      'PARSE_ERROR',
      'Failed to parse server response',
      response.status
    );
  }
  
  if (!response.ok) {
    throw new ApiError(
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.message || 'An unexpected error occurred',
      response.status,
      data.error?.details
    );
  }
  
  return data.data as T;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// Auth API
export const authApi = {
  signUp: async (email: string, name: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    return handleResponse(response);
  },

  signIn: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  verify: async (token: string): Promise<{ user: User; token: string; expires_at: string }> => {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  me: async (): Promise<{ user: User }> => {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  signOut: async (): Promise<void> => {
    await fetch(`${API_BASE}/auth/signout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('auth_token');
  },
};

// Clients API
export const clientsApi = {
  list: async (archived = false): Promise<Client[]> => {
    const response = await fetch(`${API_BASE}/clients?archived=${archived}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  get: async (id: string): Promise<Client> => {
    const response = await fetch(`${API_BASE}/clients/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: CreateClient): Promise<Client> => {
    const response = await fetch(`${API_BASE}/clients`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: UpdateClient): Promise<Client> => {
    const response = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  archive: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/clients/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  restore: async (id: string): Promise<Client> => {
    const response = await fetch(`${API_BASE}/clients/${id}/restore`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Invoices API
export const invoicesApi = {
  list: async (params?: {
    status?: string;
    client_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Invoice & { client_name?: string }>> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.client_id) searchParams.set('client_id', params.client_id);
    if (params?.date_from) searchParams.set('date_from', params.date_from);
    if (params?.date_to) searchParams.set('date_to', params.date_to);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const response = await fetch(`${API_BASE}/invoices?${searchParams}`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();
    
    if (!response.ok) {
      throw new ApiError(
        result.error?.code || 'UNKNOWN_ERROR',
        result.error?.message || 'An unexpected error occurred',
        response.status,
        result.error?.details
      );
    }
    
    return {
      data: result.data,
      pagination: result.pagination,
    };
  },

  get: async (id: string): Promise<Invoice & { client: Client; items: any[]; events: any[]; payments: any[] }> => {
    const response = await fetch(`${API_BASE}/invoices/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  create: async (data: CreateInvoice): Promise<Invoice> => {
    const response = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  update: async (id: string, data: UpdateInvoice): Promise<Invoice> => {
    const response = await fetch(`${API_BASE}/invoices/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  send: async (id: string): Promise<{ message: string; public_url: string }> => {
    const response = await fetch(`${API_BASE}/invoices/${id}/send`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  duplicate: async (id: string): Promise<Invoice> => {
    const response = await fetch(`${API_BASE}/invoices/${id}/duplicate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  generatePdf: async (id: string): Promise<{ message: string; pdf_key: string }> => {
    const response = await fetch(`${API_BASE}/invoices/${id}/pdf`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getPdfUrl: (id: string): string => {
    return `${API_BASE}/invoices/${id}/pdf`;
  },
};

// Public API (no auth required)
export const publicApi = {
  getInvoice: async (token: string): Promise<PublicInvoiceData> => {
    const response = await fetch(`${API_BASE}/public/invoice/${token}`);
    return handleResponse(response);
  },

  pay: async (token: string): Promise<{ checkout_url: string; session_id: string }> => {
    const response = await fetch(`${API_BASE}/public/invoice/${token}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return handleResponse(response);
  },
};

// Dashboard API
export const dashboardApi = {
  get: async (): Promise<DashboardData> => {
    const response = await fetch(`${API_BASE}/dashboard`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  getStats: async (): Promise<{ monthly: any[]; by_status: any[] }> => {
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Settings API
export const settingsApi = {
  get: async (): Promise<Settings> => {
    const response = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  update: async (data: UpdateSettings): Promise<Settings> => {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  uploadLogo: async (file: File): Promise<{ message: string; logo_url: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE}/settings/logo`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    return handleResponse(response);
  },

  deleteLogo: async (): Promise<void> => {
    const response = await fetch(`${API_BASE}/settings/logo`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

export { ApiError };
