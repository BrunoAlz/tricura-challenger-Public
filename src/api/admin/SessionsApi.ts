import { APIRequestContext } from '@playwright/test';

export class SessionsApi {
  constructor(private request: APIRequestContext) {}

  async list() {
    return this.request.get('/api/admin/sessions');
  }

  async get(sessionId: string) {
    return this.request.get(`/api/admin/sessions/${sessionId}`);
  }

  /** Mutating — use only with safe inputs (invalid IDs) in default tests. */
  async approve(sessionId: string, payload: Record<string, unknown> = {}) {
    return this.request.post(`/api/admin/sessions/${sessionId}/approve`, { data: payload });
  }

  /** Mutating — use only with safe inputs (invalid IDs) in default tests. */
  async cancel(sessionId: string, payload: Record<string, unknown> = {}) {
    return this.request.post(`/api/admin/sessions/${sessionId}/cancel`, { data: payload });
  }

  /** Mutating — use only with safe inputs (invalid IDs) in default tests. */
  async complete(sessionId: string, payload: Record<string, unknown> = {}) {
    return this.request.post(`/api/admin/sessions/${sessionId}/complete`, { data: payload });
  }

  /** Mutating — use only with safe inputs (invalid IDs) in default tests. */
  async reject(sessionId: string, payload: Record<string, unknown> = {}) {
    return this.request.post(`/api/admin/sessions/${sessionId}/reject`, { data: payload });
  }

  /** Mutating — use only with safe inputs (invalid IDs) in default tests. */
  async start(sessionId: string, payload: Record<string, unknown> = {}) {
    return this.request.post(`/api/admin/sessions/${sessionId}/start`, { data: payload });
  }
}
