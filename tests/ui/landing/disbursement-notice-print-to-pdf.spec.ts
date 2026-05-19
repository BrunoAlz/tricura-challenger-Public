import { test, expect } from '@playwright/test';
import { env } from '@config/env';

test.describe('@landing @bug-063 disbursement notice loses content on print-to-PDF rendering (deferred)', () => {
  test.fixme(
    'the disbursement notice currently renders complete on screen but a headless print-to-PDF strips the closing paragraph, the cryptic margin annotation, the inclusion instruction, and truncates the CASE TOKEN / NOTICE ID / FILED AT fields — requires reaching the notice URL through an admin route which currently 404s',
    async ({ page }) => {
      await page.goto('/');
      const pdf = await page.pdf();
      const pdfText = pdf.toString('latin1');
      expect(pdfText).toContain(`${env.T_QUOTE_LITERAL_10}.`);
      expect(pdfText).toContain(env.T_QUOTE_LITERAL_09);
      expect(pdfText).toContain(env.T_QUOTE_LITERAL_11);
    },
  );
});
