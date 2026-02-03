import { test, expect } from "vitest";
import en from "@/i18n/en";
import es from "@/i18n/es";
import pt from "@/i18n/pt";

function collectKeys(obj: any, prefix = ""): Set<string> {
  const keys = new Set<string>();
  if (obj && typeof obj === "object") {
    for (const k of Object.keys(obj)) {
      const full = prefix ? `${prefix}.${k}` : k;
      keys.add(full);
      // Only recurse into plain objects (not arrays or null)
      const val = obj[k];
      if (val && typeof val === "object" && !Array.isArray(val)) {
        const child = collectKeys(val, full);
        for (const c of child) keys.add(c);
      }
    }
  }
  return keys;
}

const locales = { es, pt } as const;
const baseKeys = collectKeys(en);

for (const [code, locale] of Object.entries(locales)) {
  test(`locale ${code} contains all keys from en`, () => {
    const localKeys = collectKeys(locale as any);
    const missing: string[] = [];
    for (const k of baseKeys) {
      if (!localKeys.has(k)) missing.push(k);
    }
    if (missing.length > 0) {
      // Provide a helpful message listing first 20 missing keys
      const examples = missing.slice(0, 20).join(", ");
      const msg = `Locale ${code} is missing ${missing.length} keys from en. Examples: ${examples}`;
      // Fail the test with the message
      expect(missing.length, msg).toBe(0);
    } else {
      expect(missing.length).toBe(0);
    }
  });
}
