import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type A11yFixture = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<A11yFixture>({
  makeAxeBuilder: async ({ page }, use) => {
    const make = () =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']);
    await use(make);
  },
});

export { expect } from '@playwright/test';
