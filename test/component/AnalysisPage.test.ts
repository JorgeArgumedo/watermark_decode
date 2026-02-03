import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import AnalysisPage from "@/pages/AnalysisPage.vue";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useCandidatesStore } from "@/stores/candidates";

// Define robust stubs
const InputTabsStub = defineComponent({
  name: "InputTabs",
  template: '<div class="input-tabs-stub"></div>',
  emits: ["submit-id", "submit-sequence"],
});

const CandidateListStub = defineComponent({
  name: "CandidateList",
  template: '<div class="candidate-list-stub"></div>',
  props: ["selectedId"],
  emits: ["select"],
});

const CandidateDetailStub = defineComponent({
  name: "CandidateDetail",
  template: '<div class="candidate-detail-stub"></div>',
  props: ["candidate"],
});

describe("AnalysisPage.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        analysis: {
          addCandidate: "Add",
          generatingCandidates: "Generating...",
          candidatesGenerated: "Done",
          addedCount: "{count} added",
        },
        common: { back: "Back", pleaseWait: "Wait" },
      },
    },
  });

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountWrapper = () => {
    return mount(AnalysisPage, {
      global: {
        plugins: [i18n],
        stubs: {
          QPage: { template: "<div><slot /></div>" },
          QCard: { template: "<div><slot /></div>" },
          QCardSection: { template: "<div><slot /></div>" },
          QCardActions: { template: "<div><slot /></div>" },
          QBtn: {
            template: "<button @click=\"$emit('click')\"><slot /></button>",
          },
          QToolbar: { template: "<div><slot /></div>" },
          QToolbarTitle: { template: "<div><slot /></div>" },
          QSpace: { template: "<div></div>" },
          QIcon: { template: "<i></i>" },
          InputTabs: InputTabsStub,
          CandidateList: CandidateListStub,
          CandidateDetail: CandidateDetailStub,
        },
      },
    });
  };

  it("renders correctly", () => {
    const wrapper = mountWrapper();
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find(".input-tabs-stub").exists()).toBe(true);
  });

  it("shows candidate detail when select event emitted from list", async () => {
    const wrapper = mountWrapper();
    const candidateList = wrapper.findComponent({ name: "CandidateList" });

    const mockCandidate = { id: "1", idPersona: "P1", sequence: "A" };
    await candidateList.vm.$emit("select", mockCandidate);
    await wrapper.vm.$nextTick();

    const detail = wrapper.findComponent({ name: "CandidateDetail" });
    expect(detail.exists()).toBe(true);
    expect(detail.props("candidate")).toEqual(mockCandidate);
  });

  it("handles ID submission and adds candidate to store", async () => {
    const wrapper = mountWrapper();
    const store = useCandidatesStore();
    const inputTabs = wrapper.findComponent({ name: "InputTabs" });

    await inputTabs.vm.$emit("submit-id", "12345678");
    await wrapper.vm.$nextTick();

    expect(store.totalCount).toBe(1);
    expect(store.candidates[0].idPersona).toBe("12345678");
  });

  it("goes back to input view when back button is clicked in detail", async () => {
    const wrapper = mountWrapper();

    // Select candidate to show detail
    const listStub = wrapper.findComponent({ name: "CandidateList" });
    await listStub.vm.$emit("select", { id: "1" });
    await wrapper.vm.$nextTick();

    // Clicking back button (it's a QBtn, so using class or finding it)
    const backBtn = wrapper.find("button");
    await backBtn.trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".input-tabs-stub").exists()).toBe(true);
  });
});
