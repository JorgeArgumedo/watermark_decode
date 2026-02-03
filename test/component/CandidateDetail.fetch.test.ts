import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";

// Mock repo class to return details
const mockFetchDetails = vi.fn();
vi.mock("@/infrastructure/repositories/ApiCandidateRepository", () => ({
  ApiCandidateRepository: class {
    fetchDetails = mockFetchDetails;
  },
}));

import CandidateDetail from "@/components/candidates/CandidateDetail.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      analysis: {
        candidateDetails: "Candidate Details",
        inputSequence: "Sequence",
        systemStatus: "System Status",
        analysisStatus: "Analysis Status",
        name: "Name",
        email: "Email",
        university: "University",
      },
      common: { id: "ID" },
      status: { pending: "Pending", found: "Found", unreviewed: "Unreviewed", approved: "Approved", excluded: "Excluded" },
      actions: { approve: "Approve", exclude: "Exclude", refresh: "Refresh" },
    },
  },
});

// Stubs
const QCard = { template: "<div class=\"q-card\"><slot /></div>" };
const QCardSection = { template: "<div><slot /></div>" };
const QList = { template: "<div><slot /></div>" };
const QItem = { template: "<div><slot /></div>" };
const QItemSection = { template: "<div><slot /></div>" };
const QItemLabel = { template: "<div><slot /></div>" };
const QIcon = { template: "<span />" };
const QChip = { props: ["dense", "color", "textColor", "icon"], template: '<div class="qchip" :data-color="color" :data-icon="icon"><slot /></div>' };
const QBtn = { props: ["color", "label", "icon", "disable"], template: '<button @click="$emit(\'click\')">{{ label }}</button>' };
const HorizontalSymbols = { props: ["sequence", "size"], template: '<div class="horiz" :data-seq="sequence" />' };

describe("CandidateDetail fetch", () => {
  let pinia: ReturnType<typeof createPinia>;

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
  });

  it("fetches details on mount and updates candidate", async () => {
    const store = useCandidatesStore();
    const candidate = store.createCandidateNode("1", "ABC", "manual");
    store.addCandidate(candidate);

    mockFetchDetails.mockResolvedValue({
      results: [{ idPersona: "1", exists: true, nombre: "Alice", email: "a@e.com", universidad: "U1" }],
      summary: { totalQueried: 1, totalFound: 1, totalNotFound: 0 },
    });

    const wrapper = mount(CandidateDetail, {
      props: { candidate },
      global: { plugins: [i18n, pinia], stubs: { QCard, QCardSection, QList, QItem, QItemSection, QItemLabel, QIcon, QChip, QBtn, HorizontalSymbols } },
    });

    await flushPromises();
    // Candidate should have been updated via the composable
    expect(store.findCandidateById("1")?.nombre).toBe("Alice");
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("a@e.com");
    expect(wrapper.text()).toContain("U1");
  });
});