import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CandidateItem from "@/components/candidates/CandidateItem.vue";
import { createI18n } from "vue-i18n";
import type { Candidate } from "@/types/candidate";

describe("CandidateItem.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        common: { id: "ID" },
        status: {
          pending: "Pending",
          unreviewed: "Unreviewed",
        },
        actions: { deleteTooltip: "Delete" },
      },
    },
  });

  const mockCandidate: Candidate = {
    id: "1",
    idPersona: "12345678",
    sequence: "ABC",
    systemStatus: "pending",
    analysisStatus: "unreviewed",
    source: "manual",
    createdAt: new Date(),
  };

  const mountWrapper = (props = {}) => {
    return mount(CandidateItem, {
      props: {
        candidate: mockCandidate,
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          "q-card": {
            name: "q-card",
            template:
              '<div class="q-card-stub" @click="$emit(\'click\')"><slot /></div>',
          },
          "q-card-section": { template: "<div><slot /></div>" },
          "q-avatar": { template: '<div class="q-avatar-stub"></div>' },
          "q-chip": { template: '<div class="q-chip-stub"><slot /></div>' },
          "q-btn": {
            template:
              '<button class="q-btn-stub" @click.stop="$emit(\'click\', $event)"></button>',
          },
          "q-tooltip": true,
          HorizontalSymbols: {
            template:
              '<div class="horizontal-symbols-stub">{{ sequence }}</div>',
            props: ["sequence"],
          },
        },
      },
    });
  };

  it("renders candidate information correctly", () => {
    const wrapper = mountWrapper();

    expect(wrapper.text()).toContain("ID: 12345678");
    expect(wrapper.find(".horizontal-symbols-stub").text()).toBe("ABC");
    expect(wrapper.findAll(".q-chip-stub").length).toBe(2);
  });

  it("emits select when card is clicked", async () => {
    const wrapper = mountWrapper();
    await wrapper.find(".q-card-stub").trigger("click");

    expect(wrapper.emitted("select")?.[0]).toEqual([mockCandidate]);
  });

  it("emits delete when delete button is clicked", async () => {
    const wrapper = mountWrapper();
    await wrapper.find(".q-btn-stub").trigger("click");

    expect(wrapper.emitted("delete")?.[0]).toEqual(["1"]);
  });

  it("applies selected class when prop is true", () => {
    const wrapper = mountWrapper({ selected: true });
    expect(wrapper.find(".q-card-stub").classes()).toContain("bg-blue-1");
  });
});
