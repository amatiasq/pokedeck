import { session } from './auth';

export const API_URL = '/api';

export function callApi<T, U>(method: string, path: string, data: T) {
  const response = fetch(`${API_URL}${path}`, {
    method,
    headers: {
      Authorization: session()?.token,
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify(data) : undefined,
  });

  return Object.assign(response, {
    json: () => response.then((res) => res.json() as Promise<U>),
  });
}

type Json = Record<string, unknown>;

export const api = {
  get: <T>(path: string) => callApi<null, T>('GET', path, null),
  post: <T>(path: string, data: Json) => callApi<Json, T>('POST', path, data),
  put: <T>(path: string, data: Json) => callApi<Json, T>('PUT', path, data),
  patch: <T>(path: string, data: Json) => callApi<Json, T>('PATCH', path, data),
  delete: <T>(path: string) => callApi<null, T>('DELETE', path, null),
};
