import { test, expect, vi } from "vitest";
import { restoreConsole } from "../../vitest-setup";

test("console methods are stubbed by test setup", () => {
  expect(typeof console.error).toBe("function");
  expect((console.error as any).mock).toBeDefined();
  expect((console.warn as any).mock).toBeDefined();
  expect((console.log as any).mock).toBeDefined();
  expect((console.info as any).mock).toBeDefined();

  // Ensure they behave like mock functions
  (console.error as any)("test1");
  (console.warn as any)("test2");
  expect((console.error as any).mock.calls.length).toBe(1);
  expect((console.warn as any).mock.calls.length).toBe(1);
});

test("restoreConsole restores original console object", () => {
  // Ensure restore works and then re-stub console for subsequent tests
  restoreConsole();
  try {
    expect((console.error as any).mock).toBeUndefined();
  } finally {
    // Re-stub to avoid affecting other tests
    console.error = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
    console.info = vi.fn();
  }
});