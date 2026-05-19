import { test, expect } from '@fixtures/auth.fixture';
import { env } from '@config/env';

test.use({ storageState: 'playwright/.auth/director.json' });

interface AuditEntry {
  id: string;
  actor?: string;
}

async function fetchActorCount(
  apiClient: import('@playwright/test').APIRequestContext,
  actor: string,
): Promise<number> {
  const r = await apiClient.get(`/api/admin/audit?actor=${encodeURIComponent(actor)}&limit=500`);
  expect(r.status(), `actor=${actor} should respond 200`).toBe(200);
  const body = (await r.json()) as AuditEntry[];
  return body.length;
}

test.describe('@security @bug-119 /api/admin/audit?actor= LIKE wildcard escape', () => {
  test('SQL LIKE metacharacters (`%`, `_`) currently pass through unescaped', async ({
    apiClient,
  }) => {
    // BUG-119 latch: the `actor=` filter uses LIKE '%' || $1 || '%' (or
    // similar substring match) and does NOT escape wildcard metacharacters
    // submitted by the user. Empirically:
    //   actor=<full surname>     → N entries (legitimate substring match)
    //   actor=<prefix substring> → N entries (SAME — prefix substring still hits)
    //   actor=<prefix>%          → N entries (SAME — `%` adds nothing because it's
    //                              already a wildcard server-side, but importantly
    //                              it is NOT rejected as invalid input)
    //   actor=%                  → ALL entries (FULL audit log — `%` matches anything)
    //   actor=_                  → ALL entries (`_` matches any single char + the
    //                              outer wildcards make it `%_%` = "≥1 char")
    //   actor=XYZ                → 0 entries (sanity baseline)
    //
    // When the filter is fixed (parameter escaping or strict equality) the
    // wildcard inputs return 0 (literal mismatch) and only literal-substring
    // queries still match. Any of the four positive assertions below flips.
    const total = await fetchActorCount(apiClient, '');
    expect(total, 'baseline: unfiltered audit list returns the full set').toBeGreaterThan(0);

    const allViaPercent = await fetchActorCount(apiClient, '%');
    const allViaUnderscore = await fetchActorCount(apiClient, '_');
    expect(
      allViaPercent,
      'BUG-119: `%` currently behaves as SQL wildcard, returning every audit entry',
    ).toBeGreaterThanOrEqual(total);
    expect(
      allViaUnderscore,
      'BUG-119: `_` currently behaves as SQL single-char wildcard, returning every audit entry',
    ).toBeGreaterThanOrEqual(total);

    const fullSurname = env.T_NAME_LITERAL_02;
    const prefix = fullSurname.slice(0, 3);
    const vogel = await fetchActorCount(apiClient, fullSurname);
    const vog = await fetchActorCount(apiClient, prefix);
    const vogWildcard = await fetchActorCount(apiClient, `${prefix}%`);
    expect(
      vog,
      'BUG-119: a prefix substring currently matches the same set as the full surname (LIKE-based filter)',
    ).toBe(vogel);
    expect(
      vogWildcard,
      'BUG-119: appending an explicit `%` is silently accepted (input not escaped)',
    ).toBe(vogel);

    const nonsense = await fetchActorCount(apiClient, 'no-such-actor-XYZ');
    expect(nonsense, 'sanity: a non-matching string returns 0 entries').toBe(0);
  });
});
