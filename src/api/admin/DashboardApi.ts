import { APIRequestContext } from '@playwright/test';

export class DashboardApi {
  constructor(private request: APIRequestContext) {}

  async get() {
    return this.request.get('/api/admin/dashboard');
  }
}
