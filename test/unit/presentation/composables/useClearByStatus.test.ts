import { describe, it, expect, vi, beforeEach } from "vitest";

const fakeConfirm = vi.fn();
const fakeRemoveAllBySystem = vi.fn();
const fakeRemoveAllByAnalysis = vi.fn();

vi.mock("@presentation/composables/useConfirmDialog", () => ({
  useConfirmDialog: () => ({ confirm: fakeConfirm }),
}));
vi.mock("@/stores/candidates", () => ({
  useCandidatesStore: () => ({
    removeAllCandidatesBySystemStatus: fakeRemoveAllBySystem,
    removeAllCandidatesByAnalysisStatus: fakeRemoveAllByAnalysis,
  }),
}));

import { useClearByStatus } from "@presentation/composables/useClearByStatus";

describe("useClearByStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls confirm and then clears by system status", async () => {
    fakeConfirm.mockResolvedValue(undefined);

    const { clearBySystemStatus } = useClearByStatus();
    await clearBySystemStatus("found");

    expect(fakeConfirm).toHaveBeenCalled();
    expect(fakeRemoveAllBySystem).toHaveBeenCalledWith("found");
  });

  it("calls confirm and then clears by analysis status", async () => {
    fakeConfirm.mockResolvedValue(undefined);

    const { clearByAnalysisStatus } = useClearByStatus();
    await clearByAnalysisStatus("approved");

    expect(fakeConfirm).toHaveBeenCalled();
    expect(fakeRemoveAllByAnalysis).toHaveBeenCalledWith("approved");
  });
});