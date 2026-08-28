// ─── Beyon Mobile API Configuration & Direct Host Gateway ───────────────────

declare const process: any;

export interface ApiConfigState {
  baseUrl: string;
  lastPingMs: number | null;
  status: 'ONLINE' | 'OFFLINE' | 'UNTESTED';
}

// Default initial direct backend URL
// In Android Emulator, 10.0.2.2 points directly to host machine's localhost:8085
export const DEFAULT_API_URL = 
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) 
    ? process.env.EXPO_PUBLIC_API_URL 
    : 'http://10.0.2.2:8085/api/v1';

let currentBaseUrl = DEFAULT_API_URL;
let authToken: string | null = null;

export const setApiBaseUrl = (url: string) => {
  let formatted = url.trim();
  if (formatted.endsWith('/')) {
    formatted = formatted.slice(0, -1);
  }
  if (!formatted.includes('/api/v1') && !formatted.endsWith('/api')) {
    formatted = `${formatted}/api/v1`;
  }
  currentBaseUrl = formatted;
};

export const getApiBaseUrl = () => currentBaseUrl;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => authToken;

export async function pingBackend(customUrl?: string): Promise<{ ok: boolean; latencyMs: number; error?: string }> {
  const targetUrl = customUrl || currentBaseUrl;
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`${targetUrl}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - start;
    if (res.ok) {
      return { ok: true, latencyMs };
    }
    return { ok: false, latencyMs, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { ok: false, latencyMs: Date.now() - start, error: err.message || 'Connection timeout' };
  }
}

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.message || errJson.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  try {
    return (await response.json()) as T;
  } catch {
    return {} as T;
  }
}
