import { describe, it, expect, vi } from "vitest";

const mockDialog = vi.fn();
vi.mock("quasar", () => ({ useQuasar: () => ({ dialog: mockDialog }) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (s: string) => s }) }));

import { useConfirmDialog } from "@presentation/composables/useConfirmDialog";

describe("useConfirmDialog", () => {
  it("calls $q.dialog and resolves on OK", async () => {
    let okCb: (() => void) | undefined = undefined;
    const mockDialogReturn = {
      onOk(cb: () => void) { okCb = cb; return this; },
      onCancel() { return this; },
      onDismiss() { return this; },
    };
    mockDialog.mockReturnValueOnce(mockDialogReturn as any);

    const { confirm } = useConfirmDialog();
    const p = confirm({ message: "Are you sure?" });

    if (!okCb) throw new Error("onOk callback was not registered");
    okCb();

    await expect(p).resolves.toBeUndefined();
  });
});