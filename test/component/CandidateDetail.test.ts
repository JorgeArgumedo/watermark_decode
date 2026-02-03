import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";

// Mock the renderer to capture calls
const renderBorderMock = vi.fn();
vi.mock("@presentation/composables/useSymbolicBorderRenderer", () => ({
  useSymbolicBorderRenderer: () => ({ renderBorder: renderBorderMock }),
}));

import CandidateDetail from "@/components/candidates/CandidateDetail.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      analysis: { candidateDetails: "Candidate Details", inputSequence: "Sequence", systemStatus: "System Status", analysisStatus: "Analysis Status" },
      common: { id: "ID" },
      status: { pending: "Pending", found: "Found", unreviewed: "Unreviewed", approved: "Approved", excluded: "Excluded" },
      actions: { approve: "Approve", exclude: "Exclude" },
    },
  },
});

// Stubs for Quasar primitives and HorizontalSymbols
const QCard = { template: "<div class=\"q-card\"><slot /></div>" };
const QCardSection = { template: "<div><slot /></div>" };
const QList = { template: "<div><slot /></div>" };
const QItem = { template: "<div><slot /></div>" };
const QItemSection = { template: "<div><slot /></div>" };
const QItemLabel = { template: "<div><slot /></div>" };
const QIcon = { template: "<span />" };
const QChip = {
  props: ["dense", "color", "textColor", "icon"],
  template: '<div class="qchip" :data-color="color" :data-icon="icon"><slot /></div>',
};
const QBtn = {
  props: ["color", "label", "icon", "disable"],
  template: "<button :disabled=\"disable\" @click=\"$emit('click')\">{{ label }}</button>",
};
const HorizontalSymbols = {
  props: ["sequence", "size"],
  template: '<div class="horiz" :data-seq="sequence" />',
};

describe("CandidateDetail.vue", () => {
  let pinia: ReturnType<typeof createPinia>;
  let store: ReturnType<typeof useCandidatesStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    pinia = createPinia();
    setActivePinia(pinia);
    store = useCandidatesStore();
    store.clearAllCandidates();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it("renders candidate details and sequence", async () => {
    const candidate = store.createCandidateNode("id-1", "ABC", "manual");
    candidate.idPersona = "123";
    candidate.sequence = "ABC";
    candidate.systemStatus = "found";
    candidate.analysisStatus = "unreviewed";

    const wrapper = mount(CandidateDetail, {
      props: { candidate },
      global: {
        plugins: [i18n, pinia],
        stubs: {
          QCard,
          QCardSection,
          QList,
          QItem,
          QItemSection,
          QItemLabel,
          QIcon,
          QChip,
          QBtn,
          HorizontalSymbols,
        },
      },
    });

    // Check ID appears
    expect(wrapper.text()).toContain("123");

    // Check HorizontalSymbols received the sequence
    const sym = wrapper.find(".horiz");
    expect(sym.exists()).toBe(true);
    expect(sym.attributes("data-seq")).toBe("ABC");

    // Check status chip text exists (uses i18n)
    expect(wrapper.html()).toContain("Found");
  });

  it("calls renderBorder on mount and when id changes", async () => {
    const candidate = store.createCandidateNode("id-2", "XYZ", "manual");
    candidate.idPersona = "999";
    candidate.sequence = "XYZ";

    const wrapper = mount(CandidateDetail, {
      props: { candidate },
      global: {
        plugins: [i18n, pinia],
        stubs: { QCard, QCardSection, QList, QItem, QItemSection, QItemLabel, QIcon, QChip, QBtn, HorizontalSymbols },
      },
    });

    // Fast-forward timers to trigger setTimeout
    vi.advanceTimersByTime(60);
    await flushPromises();

    expect(renderBorderMock).toHaveBeenCalled();

    // Change idPersona to trigger watch (use new object to ensure prop update)
    await wrapper.setProps({ candidate: { ...candidate, idPersona: "1000" } });

    vi.advanceTimersByTime(60);
    await flushPromises();

    expect(renderBorderMock).toHaveBeenCalledTimes(2);
  });

  it("does not call renderBorder when q-card element is not present", async () => {
    const candidate = store.createCandidateNode("id-4", "NOP", "manual");
    candidate.idPersona = "432";

    // Stub QCard without the expected 'q-card' class
    const QCardNoClass = { template: "<div class='no-card'><slot /></div>" };

    const wrapper = mount(CandidateDetail, {
      props: { candidate },
      global: {
        plugins: [i18n, pinia],
        stubs: { QCard: QCardNoClass, QCardSection, QList, QItem, QItemSection, QItemLabel, QIcon, QChip, QBtn, HorizontalSymbols },
      },
    });

    vi.advanceTimersByTime(60);
    await flushPromises();

    expect(renderBorderMock).not.toHaveBeenCalled();
  });

  it("updates candidate status when approve/exclude buttons clicked", async () => {
    const candidate = store.createCandidateNode("id-3", "QWE", "manual");
    candidate.idPersona = "555";
    candidate.analysisStatus = "unreviewed";

    const wrapper = mount(CandidateDetail, {
      props: { candidate },
      global: {
        plugins: [i18n, pinia],
        stubs: { QCard, QCardSection, QList, QItem, QItemSection, QItemLabel, QIcon, QChip, QBtn: { template: '<button @click="$emit(\'click\')">btn</button>' }, HorizontalSymbols },
      },
    });

    const updateSpy = vi.spyOn(store, "updateCandidateStatus");

    const buttons = wrapper.findAll("button");
    // First button is Approve
    await buttons[0].trigger("click");

    expect(updateSpy).toHaveBeenCalledWith(candidate.id, { analysisStatus: "approved" });

    // Second button is Exclude
    await buttons[1].trigger("click");
    expect(updateSpy).toHaveBeenCalledWith(candidate.id, { analysisStatus: "excluded" });
  });
});
