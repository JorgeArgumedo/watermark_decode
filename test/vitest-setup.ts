import { config } from "@vue/test-utils";
import { Quasar, Notify, Dialog, Platform } from "quasar";
import { vi } from "vitest";

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
global.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(cb, 0);
};
global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Configure Quasar globally for all component tests
config.global.plugins = [
  [
    Quasar,
    {
      plugins: {
        Notify,
        Dialog,
        Platform,
      },
    },
  ],
];

// Silence console output during tests to avoid noisy CI logs. Individual tests can
// spy on console methods if they need to assert on logs.
const originalConsole = { ...global.console };
(global as any).console = {
  ...originalConsole,
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  debug: vi.fn(),
};

// Helper to mock fully chainable dialog behavior
export const mockDialog = (_opts: any) => {
  const result: any = {
    onOk: (cb: any) => {
      if (typeof cb === "function") cb();
      return result;
    },
    onCancel: (_cb: any) => {
      return result;
    },
    onDismiss: (_cb: any) => {
      return result;
    },
  };
  return result;
};

// We provide a baseline mock that components can overwrite if needed
config.global.mocks = {
  $q: {
    platform: {
      is: {
        ios: false,
        mobile: false,
        desktop: true,
      },
    },
    notify: vi.fn().mockImplementation(() => () => {}),
    // Mock MUY simple que no hace nada por defecto
    dialog: vi.fn(),
    screen: {
      width: 1024,
      height: 768,
    },
  },
};

// Mock para i18n si es necesario
config.global.mocks.$t = (key: string) => {
  // Mensajes básicos para tests
  const messages: Record<string, string> = {
    // Errors
    "errors.invalidSymbol": "Invalid symbol",
    "errors.emptySequence": "Sequence cannot be empty",
    "errors.tooManyWildcards": "Too many wildcards",
    "errors.emptyId": "ID cannot be empty",
    "errors.numericIdOnly": "ID must contain only numbers",
    "errors.negativeId": "ID cannot be negative",
    "errors.idTooLarge": "ID is too large",
    "errors.idTooShort": "ID must be at least 8 digits",
    "errors.invalidNumberFormat": "Invalid number format",
    "errors.invalidId": "Invalid ID",

    // Analysis
    "analysis.inputId": "ID",
    "analysis.candidateList": "Candidates",
    "analysis.clear": "Clear",
    "analysis.clearAll": "Clear All",
    "analysis.noCandidates": "No candidates",
    "analysis.noMatches": "No matches",
    "analysis.bySystemStatus": "By system",
    "analysis.byAnalysisStatus": "By analysis",
    "analysis.confirmClearAll": "Are you sure?",

    // Status
    "status.pending": "Pending",
    "status.found": "Found",
    "status.not_found": "Not found",
    "status.error": "Error",
    "status.unreviewed": "Unreviewed",
    "status.approved": "Approved",
    "status.excluded": "Excluded",
  };

  return messages[key] || key;
};
