import { APIRequestContext } from '@playwright/test';

export class SystemApi {
  constructor(private request: APIRequestContext) {}

  async health() {
    return this.request.get('/api/health');
  }
}
