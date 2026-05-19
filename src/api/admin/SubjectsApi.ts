import { APIRequestContext } from '@playwright/test';

export class SubjectsApi {
  constructor(private request: APIRequestContext) {}

  async list(params?: { q?: string; status?: string; limit?: number; offset?: number }) {
    const qs = new URLSearchParams();
    if (params?.q !== undefined) qs.set('q', params.q);
    if (params?.status !== undefined) qs.set('status', params.status);
    if (params?.limit !== undefined) qs.set('limit', String(params.limit));
    if (params?.offset !== undefined) qs.set('offset', String(params.offset));
    const query = qs.toString();
    return this.request.get(`/api/admin/subjects${query ? `?${query}` : ''}`);
  }

  async get(subjectId: string) {
    return this.request.get(`/api/admin/subjects/${subjectId}`);
  }

  /**
   * POST /api/admin/subjects/{subject_id}/reassign
   * Mutates state — only call with payloads that are EXPECTED to fail validation
   * in normal tests. For real reassign flows, use a sandboxed subject and clean up.
   */
  async reassign(subjectId: string, payload: Record<string, unknown>) {
    return this.request.post(`/api/admin/subjects/${subjectId}/reassign`, {
      data: payload,
    });
  }
}
