import { APIRequestContext } from '@playwright/test';

export class ChambersApi {
  constructor(private request: APIRequestContext) {}

  async list() {
    return this.request.get('/api/admin/chambers');
  }

  async get(chamberId: string) {
    return this.request.get(`/api/admin/chambers/${chamberId}`);
  }
}
