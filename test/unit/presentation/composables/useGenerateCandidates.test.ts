import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocks for quasar and i18n
const mockNotify = vi.fn(() => vi.fn());
vi.mock("quasar", () => ({ useQuasar: () => ({ notify: mockNotify }) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (s: string, p?: any) => (p && p.count ? `${s}:${p.count}` : s) }) }));

// Mock the candidates store
const fakeGenerate = vi.fn();
vi.mock("@/stores/candidates", () => ({ useCandidatesStore: () => ({ generateCandidatesFromSequence: fakeGenerate }) }));

import { useGenerateCandidates } from "@presentation/composables/useGenerateCandidates";

describe("useGenerateCandidates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows positive notification when new candidates are generated", async () => {
    fakeGenerate.mockResolvedValue(3);

    const { generate } = useGenerateCandidates();
    const count = await generate("A??");

    expect(count).toBe(3);
    expect(mockNotify).toHaveBeenCalled();
    const endNotifier = mockNotify.mock.results[0].value;
    expect(endNotifier).toHaveBeenCalled();
  });

  it("shows warning notification when no candidates generated", async () => {
    fakeGenerate.mockResolvedValue(0);

    const { generate } = useGenerateCandidates();
    const count = await generate("A??");

    expect(count).toBe(0);
    expect(mockNotify).toHaveBeenCalled();
    const endNotifier = mockNotify.mock.results[0].value;
    expect(endNotifier).toHaveBeenCalled();
  });

  it("shows error notification on exception and returns 0", async () => {
    fakeGenerate.mockRejectedValue(new Error("boom"));

    const { generate } = useGenerateCandidates();
    const count = await generate("A??");

    expect(count).toBe(0);
    expect(mockNotify).toHaveBeenCalled();
    const endNotifier = mockNotify.mock.results[0].value;
    expect(endNotifier).toHaveBeenCalled();
  });
});