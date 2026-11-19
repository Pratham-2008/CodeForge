/**
 * CodeForge API Configuration & Resilient Client
 * Supports both same-origin deployments (Vercel, Node.js single-server)
 * and decoupled deployments (e.g. Vite on Vercel/Netlify + Express/Node on Render/Railway).
 */

// Configurable API base URL via environment variable: VITE_API_URL
// If not specified, defaults to '' (same-origin relative /api paths)
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

/**
 * Returns full URL for an API endpoint
 */
export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return normalizedPath;
  }
  return `${API_BASE_URL}${normalizedPath}`;
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data: T;
  error?: string;
}

/**
 * Resilient fetch wrapper for CodeForge API endpoints.
 * Handles JSON parsing safely, detects HTML fallback pages from static hosts,
 * and extracts meaningful error messages.
 */
export async function apiFetch<T = any>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = getApiUrl(endpoint);
  
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const contentType = res.headers.get('content-type') || '';
    let parsedData: any = null;

    if (contentType.includes('application/json')) {
      try {
        parsedData = await res.json();
      } catch (parseErr) {
        return {
          ok: false,
          status: res.status,
          data: null as any,
          error: 'Failed to parse JSON response from server.'
        };
      }
    } else {
      // Received non-JSON response (likely an HTML 404/500 page from static hosting)
      const text = await res.text();
      let errorMsg = `Server returned status ${res.status} (${res.statusText || 'Unknown'}).`;

      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        errorMsg = `API endpoint '${endpoint}' returned HTML instead of JSON. Ensure your backend server is running and VITE_API_URL is configured.`;
      } else if (text.trim().length > 0 && text.trim().length < 200) {
        errorMsg = text.trim();
      }

      return {
        ok: false,
        status: res.status,
        data: null as any,
        error: errorMsg
      };
    }

    if (!res.ok) {
      const errorMsg = parsedData?.error || parsedData?.message || `Request failed with status ${res.status}`;
      return {
        ok: false,
        status: res.status,
        data: parsedData,
        error: errorMsg
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsedData
    };
  } catch (netErr: any) {
    console.error(`[CodeForge API Error] Failed to call ${url}:`, netErr);
    const isNetworkError = netErr.name === 'TypeError' || netErr.message?.includes('fetch');
    const msg = isNetworkError
      ? 'Cannot connect to authentication server. Please check your network connection or verify that the backend is active.'
      : (netErr.message || 'Unknown network error occurred.');
    
    return {
      ok: false,
      status: 0,
      data: null as any,
      error: msg
    };
  }
}
