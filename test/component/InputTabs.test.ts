import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createI18n } from "vue-i18n";
import InputTabs from "@/components/input/InputTabs.vue";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  messages: {
    en: {
      analysis: { inputSequence: "Sequence", inputId: "ID", generateCandidates: "Generate Candidates", addCandidate: "Add Candidate" },
    },
  },
});

// Minimal stubs
const QTabs = { template: "<div><slot /></div>" };
const QTab = { template: "<div><slot /></div>" };
const QSeparator = { template: "<div />" };
const QTabPanels = { template: "<div><slot /></div>" };
const QTabPanel = { template: "<div><slot /></div>" };
const SequenceInput = { props: ["modelValue"], template: "<div />" };
const IdPersonaInput = { props: ["modelValue"], template: "<div />" };
const QBtn = { props: ["color", "label", "icon", "disable"], template: "<button :disabled=\"disable\">{{ label }}</button>" };

describe("InputTabs.vue", () => {
  let wrapper: any;

  beforeEach(() => {
    wrapper = mount(InputTabs, {
      global: {
        plugins: [i18n],
        stubs: { QTabs, QTab, QSeparator, QTabPanels, QTabPanel, SequenceInput, IdPersonaInput, QBtn },
      },
    });
  });

  it("shows generate candidates label when sequence contains wildcard and button emits", async () => {
    // Simulate wildcard mode and valid sequence
    wrapper.vm.sequenceValue = "A?B";
    wrapper.vm.isSequenceValid = true;

    await wrapper.vm.$nextTick();

    const btns = wrapper.findAll("button");
    const genBtn = btns.find((b) => b.text() === "Generate Candidates");
    expect(genBtn).toBeTruthy();

    await genBtn!.trigger("click");

    const emitted = wrapper.emitted()["submit-sequence"];
    expect(emitted).toBeTruthy();
    expect(emitted[0]).toEqual(["A?B"]);
    expect(wrapper.vm.sequenceValue).toBe("");
  });

  it("emits submit-id when id is valid", async () => {
    wrapper.vm.tab = "id";
    wrapper.vm.idValue = "123";
    wrapper.vm.isIdValid = true;

    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll("button");
    expect(buttons[1]).toBeTruthy();

    await buttons[1].trigger("click");

    const emitted = wrapper.emitted()["submit-id"];
    expect(emitted).toBeTruthy();
    expect(emitted[0]).toEqual(["123"]);
    expect(wrapper.vm.idValue).toBe("");
  });
});