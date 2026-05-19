import { test, expect, request } from '@playwright/test';
import { env } from '@config/env';

const ISSUE_TOKEN_PATH = '/api/admin/issue-token';

interface OpenApiOperation {
  security?: unknown[];
}

interface OpenApiDoc {
  paths?: Record<string, Record<string, OpenApiOperation>>;
}

function declaresSecurity(operation: OpenApiOperation): boolean {
  return Array.isArray(operation.security) && operation.security.length > 0;
}

test.describe('@auth @bug-014 issue-token OpenAPI declares no security requirement', () => {
  test(`OpenAPI operation POST ${ISSUE_TOKEN_PATH} currently has no security block`, async () => {
    const ctx = await request.newContext({
      baseURL: env.IRIS_BASE_URL,
      extraHTTPHeaders: { 'X-Case-Token': env.IRIS_CASE_TOKEN },
    });
    try {
      const response = await ctx.get(env.T_PATH_LITERAL_03);
      expect(response.status()).toBe(200);
      const schema = (await response.json()) as OpenApiDoc;
      const operation = schema.paths?.[ISSUE_TOKEN_PATH]?.post;
      expect(
        operation,
        `BUG-014 precondition: ${ISSUE_TOKEN_PATH} POST should be present in OpenAPI`,
      ).toBeDefined();
      expect(
        declaresSecurity(operation!),
        `BUG-014: operation security block is currently absent or empty (got ${JSON.stringify(operation!.security)})`,
      ).toBe(false);
    } finally {
      await ctx.dispose();
    }
  });
});
