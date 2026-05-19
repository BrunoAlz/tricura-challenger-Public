import { APIRequestContext } from '@playwright/test';

export interface LoginResponse {
  role: { id: number; slug: string; name: string };
}

export class AuthApi {
  constructor(private request: APIRequestContext) {}

  async login(roleId: number, password: string) {
    return this.request.post('/api/auth/login', {
      multipart: { role_id: roleId, password },
    });
  }

  async me() {
    return this.request.get('/api/auth/me');
  }

  async logout() {
    return this.request.post('/api/auth/logout');
  }
}
