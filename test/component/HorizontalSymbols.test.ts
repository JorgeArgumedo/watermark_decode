import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import HorizontalSymbols from "@/components/symbolic/HorizontalSymbols.vue";
import { createI18n } from "vue-i18n";

describe("HorizontalSymbols.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: { analysis: { inputSequence: "Sequence" } },
    },
  });

  it("renders sequence correctly", () => {
    const wrapper = mount(HorizontalSymbols, {
      props: { sequence: "ABC" },
      global: {
        plugins: [i18n],
        stubs: {
          "q-tooltip": true, // Stub Quasar components
        },
      },
    });

    expect(wrapper.text()).toContain("A");
    expect(wrapper.text()).toContain("B");
    expect(wrapper.text()).toContain("C");
  });

  it("highlights wildcards", () => {
    const wrapper = mount(HorizontalSymbols, {
      props: { sequence: "A?C" },
      global: { plugins: [i18n], stubs: { "q-tooltip": true } },
    });

    const symbols = wrapper.findAll(".symbol-char");
    expect(symbols[1].classes()).toContain("text-warning");
    expect(symbols[0].classes()).toContain("text-primary");
  });
});
