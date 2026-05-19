import { test, expect } from '@playwright/test';
import { LegacyOperationsPage } from '@pages/legacy/LegacyOperationsPage';

test.use({ storageState: 'playwright/.auth/director.json' });

const NON_PRESERVED_LEGACY_IDS = ['S-001', 'S-007', 'S-011', 'S-013', 'S-015', 'S-016'] as const;

test.describe('@dashboard @bug-051 legacy subject UI navigation fails for every paper-register subject except the load-bearing reference one', () => {
  for (const subjectId of NON_PRESERVED_LEGACY_IDS) {
    test(`legacy subject detail for ${subjectId} currently renders the "no detail on file" fallback even though the record exists in the listing`, async ({
      page,
    }) => {
      // BUG-051 (revised LOW): the modern admin API holds data for the
      // preserved reference subject but the legacy console UI navigation
      // only renders a detail page for that one — every other subject ID
      // in the paper register resolves to the literal fallback
      // "Subject S-NNN — no detail on file. Return to subject files."
      // Latch the fallback per-subject. When legacy console navigation
      // gains parity with the modern admin (or the subjects are migrated
      // out of the paper register entirely), the fallback disappears and
      // the assertion flips.
      const legacy = new LegacyOperationsPage(page);
      await legacy.gotoSubjectDetail(subjectId);
      await expect(
        legacy.noDetailFallbackFor(subjectId),
        `BUG-051: ${subjectId} detail page currently renders the "no detail on file" fallback`,
      ).toBeVisible();
    });
  }
});
