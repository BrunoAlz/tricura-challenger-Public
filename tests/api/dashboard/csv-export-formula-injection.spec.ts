import { test, expect } from '@fixtures/auth.fixture';

test.use({ storageState: 'playwright/.auth/director.json' });

test.describe('@dashboard @bug-027 CSV export should escape formula-trigger characters', () => {
  test.fixme(
    'CSV export should currently sanitize cells starting with =, +, -, @ — confirmation requires destructive subject mutation that was deferred per audit',
    async ({ apiClient }) => {
      const response = await apiClient.get('/api/admin/reports/export');
      expect(response.status()).toBe(200);
      const csv = await response.text();
      const cells = csv
        .split('\n')
        .slice(1)
        .flatMap((row) => row.split(','));
      const dangerous = cells.filter((c) => /^[=+\-@]/.test(c.trim()));
      expect(
        dangerous,
        'BUG-027 contract: no CSV cell should currently begin with a formula trigger without escaping',
      ).toEqual([]);
    },
  );
});
