import { describe, it, expect, beforeEach, vi } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import CandidateDetail from "@/components/candidates/CandidateDetail.vue";
import { useCandidatesStore } from "@/stores/candidates";
import type { Candidate } from "@/types/candidate";

// Mock the renderer composable and expose the mock to assertions
const mockRenderBorder = vi.fn();
vi.mock("@/composables/useSymbolicBorderRenderer", () => ({
  useSymbolicBorderRenderer: () => ({ renderBorder: mockRenderBorder }),
}));

describe("CandidateDetail.vue", () => {
  let pinia: ReturnType<typeof createPinia>;
  let store: ReturnType<typeof useCandidatesStore>;

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
          metadata: "Metadata",
          origin: "Origin",
          created: "Created",
          validated: "Validated",
          lastSync: "Last sync",
          personData: "Person Data",
          name: "Name",
          username: "Username",
          email: "Email",
          registration: "Registration",
          state: "State",
          noPersonData: "No person data",
          photos: "Photos",
          noPhotos: "No photos",
          groups: "Groups",
          idUniversidad: "University ID",
          idDepartamento: "Department ID",
          idPeriodo: "Period ID",
          groupId: "Group ID",
        },
        common: { id: "ID" },
        actions: { approve: "Approve", exclude: "Exclude" },
        status: { pending: "Pending", found: "Found", unreviewed: "Unreviewed" },
      },
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    pinia = createPinia();
    setActivePinia(pinia);
    store = useCandidatesStore();
    store.clearAllCandidates();
  });

  const mockCandidate: Candidate = {
    id: "1",
    idPersona: "12345678",
    sequence: "ABC",
    systemStatus: "found",
    analysisStatus: "unreviewed",
    source: "manual",
    createdAt: new Date("2020-01-01T00:00:00Z"),
    nombre: "John Doe",
    usuario: "jdoe",
    email: "jdoe@example.com",
    matricula: "2020A",
    estado: "Active",
    fotos: ["/img/1.jpg", "/img/2.jpg"],
    grupos: [
      {
        grupo: "Group A",
        periodo: "2020",
        universidad: "Uni",
        idgrupo: "g1",
        iduniversidad: "u1",
        iddepartamento: "d1",
        idPeriodo: "p1",
      },
    ],
  } as unknown as Candidate;

  const mountWrapper = (props = {}) => {
    return mount(CandidateDetail, {
      props: {
        candidate: mockCandidate,
        ...props,
      },
      global: {
        plugins: [i18n, pinia],
        stubs: {
          "q-card": { template: "<div class=\"q-card\"><slot /></div>" },
          "q-card-section": { template: "<div><slot /></div>" },
          "q-list": { template: "<div><slot /></div>" },
          "q-item": { template: "<div><slot /></div>" },
          "q-item-section": { template: "<div><slot /></div>" },
          "q-item-label": { template: "<div><slot /></div>" },
          "q-chip": { template: "<div class=\"q-chip-stub\"><slot /></div>" },
          "q-btn": defineComponent({ name: "QBtn", template: "<button class=\"q-btn-stub\" @click=\"$emit('click')\"></button>" }),
          "q-separator": true,
          "q-img": { template: '<img :src="src" />', props: ["src"] },
          HorizontalSymbols: { template: '<div class="horizontal-symbols-stub">{{ sequence }}</div>', props: ["sequence"] },
        },
      },
    });
  };

  it("renders main sections and person data", async () => {
    const wrapper = mountWrapper();

    expect(wrapper.text()).toContain("Candidate Details");
    expect(wrapper.find(".top-summary").exists()).toBe(true);
    expect(wrapper.find(".horizontal-symbols-stub").text()).toBe("ABC");
    // show status chips
    expect(wrapper.findAll(".q-chip-stub").length).toBeGreaterThanOrEqual(2);
    // person data should be present
    expect(wrapper.text()).toContain("John Doe");
    expect(wrapper.text()).toContain("jdoe@example.com");
  });

  it("renders photos and groups with ids and chips", () => {
    const wrapper = mountWrapper();

    // photos
    expect(wrapper.findAll("img").length).toBe(2);

    // groups
    expect(wrapper.text()).toContain("Group A");
    // we use i18n now so expect translated label
    expect(wrapper.text()).toContain("Group ID: g1");
    expect(wrapper.text()).toContain("University ID: u1");
    expect(wrapper.text()).toContain("Department ID: d1");
    expect(wrapper.text()).toContain("Period ID: p1");
  });

  it("shows sticky actions and they are reachable", () => {
    const wrapper = mountWrapper();

    expect(wrapper.find(".detail-actions-sticky").exists()).toBe(true);
    expect(wrapper.findAll(".q-btn-stub").length).toBeGreaterThanOrEqual(2);
  });

  it("approve/exclude buttons call store updateCandidateStatus", async () => {
    const wrapper = mountWrapper();
    const spy = vi.spyOn(store, "updateCandidateStatus");

    // initial status is unreviewed => both buttons enabled
    await wrapper.find(".q-btn-stub").trigger("click");

    // clicking first button should call updateCandidateStatus
    expect(spy).toHaveBeenCalled();
  });

  it("calls renderBorder on mount and when idPersona changes", async () => {
    const wrapper = mountWrapper();

    // Wait for the setTimeout drawBorder
    await new Promise((r) => setTimeout(r, 60));

    expect(mockRenderBorder).toHaveBeenCalled();

    // change prop and ensure it triggers an additional render
    const before = mockRenderBorder.mock.calls.length;
    await wrapper.setProps({ candidate: { ...mockCandidate, idPersona: "999" } });
    await new Promise((r) => setTimeout(r, 60));

    expect(mockRenderBorder.mock.calls.length).toBeGreaterThan(before);
  });
});
