import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import CandidateList from "@/components/candidates/CandidateList.vue";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";

// 1. Mock de useQuasar ANTES de importar el componente
const mockDialogFn = vi.fn();
const mockQuasarInstance = {
  dialog: mockDialogFn,
  notify: vi.fn(),
  platform: { is: { ios: false, mobile: false, desktop: true } },
  screen: { width: 1024, height: 768 },
};

// Mock del módulo quasar
vi.mock("quasar", async (importOriginal) => {
  const actual = await importOriginal<typeof import("quasar")>();
  return {
    ...actual,
    useQuasar: () => mockQuasarInstance,
  };
});

describe("CandidateList.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        analysis: {
          candidateList: "Candidates",
          clear: "Clear",
          clearAll: "Clear All",
          noCandidates: "No candidates",
          noMatches: "No matches",
          bySystemStatus: "By system",
          byAnalysisStatus: "By analysis",
          confirmClearAll: "Are you sure you want to clear all candidates?",
        },
        status: {
          pending: "Pending",
          found: "Found",
          not_found: "Not found",
          error: "Error",
          unreviewed: "Unreviewed",
          approved: "Approved",
          excluded: "Excluded",
        },
      },
    },
  });

  let candidatesStore: ReturnType<typeof useCandidatesStore>;
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    pinia = createPinia();
    setActivePinia(pinia);
    candidatesStore = useCandidatesStore();
    candidatesStore.clearAllCandidates();

    // Resetear el mock antes de cada test
    mockDialogFn.mockClear();
    mockQuasarInstance.notify = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const mountWrapper = (props = {}) => {
    return mount(CandidateList, {
      props: {
        selectedId: null,
        ...props,
      },
      global: {
        plugins: [i18n, pinia],
        stubs: {
          QBtnDropdown: { template: "<div><slot /></div>" },
          QList: { template: "<div><slot /></div>" },
          QItem: {
            template: "<div @click=\"$emit('click')\"><slot /></div>",
          },
          QItemSection: { template: "<div><slot /></div>" },
          QItemLabel: { template: "<div><slot /></div>" },
          QSeparator: true,
          QIcon: true,
          QBtnGroup: { template: "<div><slot /></div>" },
          QBtn: defineComponent({
            name: "QBtn",
            template: "<button @click=\"$emit('click')\"><slot /></button>",
          }),
          QTooltip: true,
          QVirtualScroll: {
            template:
              '<div><div v-for="item in items"><slot :item="item" /></div></div>',
            props: ["items"],
          },
          CandidateItem: defineComponent({
            name: "CandidateItem",
            props: ["candidate", "selected"],
            template: `<div>{{ candidate?.id }}</div>`,
          }),
        },
      },
    });
  };

  describe("Clear All functionality", () => {
    it("shows confirmation dialog when confirmClearAll is called", async () => {
      candidatesStore.addCandidate(
        candidatesStore.createCandidateNode("1", "A", "manual"),
      );

      const wrapper = mountWrapper();
      await flushPromises();

      // Configurar mock para el diálogo
      const mockDialogReturn = {
        onOk: vi.fn(() => mockDialogReturn),
        onCancel: vi.fn(() => mockDialogReturn),
        onDismiss: vi.fn(() => mockDialogReturn),
      };
      mockDialogFn.mockReturnValue(mockDialogReturn);

      // Llamar al método
      wrapper.vm.confirmClearAll();
      await nextTick();

      // Verificar que se llamó al diálogo
      expect(mockDialogFn).toHaveBeenCalledTimes(1);
      expect(mockDialogFn).toHaveBeenCalledWith({
        title: "Clear All",
        message: "Are you sure you want to clear all candidates?",
        cancel: true,
        persistent: true,
      });
    });

    it("clears all candidates when dialog is accepted", async () => {
      candidatesStore.addCandidates([
        candidatesStore.createCandidateNode("1", "A", "manual"),
        candidatesStore.createCandidateNode("2", "B", "manual"),
      ]);

      const wrapper = mountWrapper();
      await flushPromises();

      // Configurar mock con callback controlable
      let capturedOkCallback: (() => void) | null = null;
      const mockDialogReturn = {
        onOk: vi.fn((callback) => {
          capturedOkCallback = callback;
          return mockDialogReturn;
        }),
        onCancel: vi.fn(() => mockDialogReturn),
        onDismiss: vi.fn(() => mockDialogReturn),
      };
      mockDialogFn.mockReturnValue(mockDialogReturn);

      const clearSpy = vi.spyOn(candidatesStore, "clearAllCandidates");

      // Llamar al método
      wrapper.vm.confirmClearAll();
      await nextTick();

      // Verificar diálogo llamado
      expect(mockDialogFn).toHaveBeenCalledTimes(1);

      // Ejecutar callback de OK
      expect(capturedOkCallback).not.toBeNull();
      if (capturedOkCallback) {
        capturedOkCallback();
        await nextTick();
      }

      // Verificar que se limpiaron los candidatos
      expect(clearSpy).toHaveBeenCalledTimes(1);
      expect(candidatesStore.candidates.length).toBe(0);
    });

    it("does NOT clear candidates when dialog is cancelled", async () => {
      candidatesStore.addCandidate(
        candidatesStore.createCandidateNode("1", "A", "manual"),
      );

      const initialCount = candidatesStore.candidates.length;
      const wrapper = mountWrapper();
      await flushPromises();

      // Mock que no ejecuta onOk
      const mockDialogReturn = {
        onOk: vi.fn(() => mockDialogReturn),
        onCancel: vi.fn(() => mockDialogReturn),
        onDismiss: vi.fn(() => mockDialogReturn),
      };
      mockDialogFn.mockReturnValue(mockDialogReturn);

      const clearSpy = vi.spyOn(candidatesStore, "clearAllCandidates");

      // Llamar al método
      wrapper.vm.confirmClearAll();
      await nextTick();

      // Verificar diálogo llamado
      expect(mockDialogFn).toHaveBeenCalledTimes(1);

      // NO ejecutar callback (simular cancelar)
      // El mock no guarda ni ejecuta el callback

      await nextTick();

      // Verificar que NO se limpió
      expect(clearSpy).not.toHaveBeenCalled();
      expect(candidatesStore.candidates.length).toBe(initialCount);
    });
  });
});
