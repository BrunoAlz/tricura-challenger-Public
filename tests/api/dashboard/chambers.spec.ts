import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

interface Chamber {
  id?: string;
  chamber_id?: string;
  hazard_class?: string;
}

function asChamberList(body: unknown): Chamber[] {
  if (Array.isArray(body)) return body as Chamber[];
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { chambers?: Chamber[] }).chambers)
  ) {
    return (body as { chambers: Chamber[] }).chambers;
  }
  throw new Error('Chambers API: response is neither array nor { chambers: [...] }');
}

function chamberId(c: Chamber): string {
  const id = c.id ?? c.chamber_id;
  if (!id) throw new Error('Chamber missing id/chamber_id');
  return id;
}

test.describe('@smoke @dashboard API admin chambers', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: 'playwright/.auth/test_subject.json' });

    test('GET /api/admin/chambers returns 200 + non-empty list', async ({ chambersApi }) => {
      const response = await chambersApi.list();
      expect(response.status()).toBe(200);
      const chambers = asChamberList(await response.json());
      expect(chambers.length).toBeGreaterThan(0);
    });

    test('GET /api/admin/chambers/{id} returns 200 for a known chamber', async ({
      chambersApi,
    }) => {
      const listResp = await chambersApi.list();
      const chambers = asChamberList(await listResp.json());
      const first = chambers[0];
      expect(first).toBeDefined();
      const detailResp = await chambersApi.get(chamberId(first!));
      expect(detailResp.status()).toBe(200);
    });

    test('GET /api/admin/chambers/{id} returns 4xx for unknown chamber', async ({
      chambersApi,
    }) => {
      const response = await chambersApi.get('C-DOES-NOT-EXIST');
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });

    test(`@bug-032 retired chamber ${env.T_CHAMBER_LITERAL_01} still appears in the list`, async ({ chambersApi }) => {
      const response = await chambersApi.list();
      const chambers = asChamberList(await response.json());
      const legacy = chambers.find((c) => chamberId(c) === env.T_CHAMBER_LITERAL_01);
      expect(legacy).toBeDefined();
    });

    test('@side-observation all chambers share the same hazard_class', async ({ chambersApi }) => {
      const response = await chambersApi.list();
      const chambers = asChamberList(await response.json());
      const hazardClasses = new Set(
        chambers.map((c) => c.hazard_class).filter((h): h is string => h !== undefined),
      );
      expect(hazardClasses.size).toBeLessThanOrEqual(1);
    });
  });

  test.describe('unauthenticated', () => {
    test('GET /api/admin/chambers returns 4xx when NOT logged in', async ({ chambersApi }) => {
      const response = await chambersApi.list();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });
});
