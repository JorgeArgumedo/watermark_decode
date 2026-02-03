import en from '@/i18n/en';
import es from '@/i18n/es';
import pt from '@/i18n/pt';
import { test, expect } from 'vitest';

const locales = { en, es, pt } as const;

test('all locales include actions.refresh key', () => {
  for (const [code, locale] of Object.entries(locales)) {
    const actions = (locale as any).actions;
    expect(actions, `Locale ${code} has no actions object`).toBeTruthy();
    expect(actions.refresh, `Locale ${code} is missing actions.refresh`).toBeTruthy();
  }
});
