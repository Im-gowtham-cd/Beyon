// ─── Beyon Mobile API Configuration & Ngrok Gateway ───────────────────────────

declare const process: any;

export interface ApiConfigState {
  baseUrl: string;
  isNgrok: boolean;
  lastPingMs: number | null;
  status: 'ONLINE' | 'OFFLINE' | 'UNTESTED';
}

// Default initial ngrok or backend URL
// Can be customized via process.env.EXPO_PUBLIC_API_URL or modified in app settings
export const DEFAULT_API_URL = 
  (typeof process !== 'undefined' && process?.env?.EXPO_PUBLIC_API_URL) 
    ? process.env.EXPO_PUBLIC_API_URL 
    : 'https://beyon.ngrok-free.app/api/v1';

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
        'ngrok-skip-browser-warning': 'true',
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
    'ngrok-skip-browser-warning': 'true', // Skip ngrok browser interstitial warning
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
