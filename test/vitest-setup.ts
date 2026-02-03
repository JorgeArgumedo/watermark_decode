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

// Silence console during tests to avoid noisy output. Tests can call `restoreConsole()` when they
// need the original console behavior for assertions that depend on real logging.
const _originalConsole = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
};
console.error = vi.fn();
console.warn = vi.fn();
console.log = vi.fn();
console.info = vi.fn();

export const restoreConsole = () => {
  console.error = _originalConsole.error;
  console.warn = _originalConsole.warn;
  console.log = _originalConsole.log;
  console.info = _originalConsole.info;
};
