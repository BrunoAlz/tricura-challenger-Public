import { test, expect } from '@fixtures/auth.fixture';


interface Subject {
  id?: string;
  subject_id?: string;
  current_wing?: string;
  wing?: string;
}

function asSubjectList(body: unknown): Subject[] {
  if (Array.isArray(body)) return body as Subject[];
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as { subjects?: Subject[] }).subjects)
  ) {
    return (body as { subjects: Subject[] }).subjects;
  }
  throw new Error('Subjects API: response is neither array nor { subjects: [...] }');
}

function subjectId(s: Subject): string {
  const id = s.id ?? s.subject_id;
  if (!id) throw new Error('Subject missing id/subject_id');
  return id;
}

test.describe('@smoke @dashboard API admin subjects', () => {
  test.describe('authenticated', () => {
    test.use({ storageState: 'playwright/.auth/test_subject.json' });

    test('GET /api/admin/subjects returns 200 + non-empty list', async ({ subjectsApi }) => {
      const response = await subjectsApi.list({ q: 's' });
      expect(response.status()).toBe(200);
      const subjects = asSubjectList(await response.json());
      expect(subjects.length).toBeGreaterThan(0);
    });

    test('GET /api/admin/subjects/{id} returns 200 for a known subject', async ({
      subjectsApi,
    }) => {
      const listResp = await subjectsApi.list({ q: 's' });
      const subjects = asSubjectList(await listResp.json());
      const first = subjects[0];
      expect(first).toBeDefined();
      const detailResp = await subjectsApi.get(subjectId(first!));
      expect(detailResp.status()).toBe(200);
    });

    test('GET /api/admin/subjects/{id} returns 4xx for unknown subject', async ({
      subjectsApi,
    }) => {
      const response = await subjectsApi.get('S-DOES-NOT-EXIST');
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });

    test('POST /api/admin/subjects/{id}/reassign returns 4xx for unknown subject', async ({
      subjectsApi,
    }) => {
      const response = await subjectsApi.reassign('S-DOES-NOT-EXIST', {
        new_wing: 'A',
        reason: 'smoke test — should never apply',
      });
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });

    test('@bug-017 wing Γ (gamma) subject is present in the list', async ({ subjectsApi }) => {
      const response = await subjectsApi.list({ q: 's' });
      const subjects = asSubjectList(await response.json());
      const gammaSubjects = subjects.filter((s) => s.current_wing === 'Γ' || s.wing === 'Γ');
      expect(gammaSubjects.length).toBeGreaterThan(0);
    });
  });

  test.describe('unauthenticated', () => {
    test('GET /api/admin/subjects returns 4xx when NOT logged in', async ({ subjectsApi }) => {
      const response = await subjectsApi.list();
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
    });
  });
});
