import { API_ENDPOINTS, ERROR_CODES, type ErrorCode } from '../../constants';

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';
const TIMEOUT_MS = 30_000;
const LOGIN_PATH = '/auth/login'; // frontend route, not an API endpoint
const NO_REFRESH: string[] = [API_ENDPOINTS.AUTH.LOGIN, API_ENDPOINTS.AUTH.REFRESH_TOKEN];

// One in-flight refresh shared by every request that hit 401 at the same time.
let refreshing: Promise<boolean> | null = null;

function refreshToken(): Promise<boolean> {
  refreshing ??= send(API_ENDPOINTS.AUTH.REFRESH_TOKEN, { method: 'POST' })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${BASE_URL}${path}`, {
      ...init,
      credentials: 'include', // httpOnly cookies carry auth; nothing to attach
      signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'TimeoutError') {
      throw new ApiError(0, ERROR_CODES.TIMEOUT, 'Request timed out');
    }
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiError(0, ERROR_CODES.NETWORK_ERROR, 'Network error');
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  const body: unknown = await res.json().catch(() => null);
  const err =
    body && typeof body === 'object' && 'error' in body
      ? (body as { error: { code?: ErrorCode; message?: string; details?: unknown } }).error
      : undefined;
  return new ApiError(
    res.status,
    err?.code ?? (res.status >= 500 ? ERROR_CODES.INTERNAL_ERROR : ERROR_CODES.BAD_REQUEST),
    err?.message ?? res.statusText,
    err?.details,
  );
}

function redirectToLogin() {
  const { pathname, search } = window.location;
  if (pathname.startsWith(LOGIN_PATH)) return;
  window.location.assign(`${LOGIN_PATH}?redirect=${encodeURIComponent(pathname + search)}`);
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const req = { ...init, headers };

  let res = await send(path, req);

  if (res.status === 401 && !NO_REFRESH.includes(path)) {
    if (!(await refreshToken())) {
      redirectToLogin();
      throw await toApiError(res);
    }
    res = await send(path, req);
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return ((await res.json()) as { data: T }).data;
}

const json = (body: unknown) => (body === undefined ? undefined : JSON.stringify(body));

export const http = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'POST', body: json(body) }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PUT', body: json(body) }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: 'PATCH', body: json(body) }),
  delete: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};
