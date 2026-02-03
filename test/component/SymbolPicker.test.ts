import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SymbolPicker from "@/components/common/SymbolPicker.vue";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useSymbolsStore } from "@/stores/symbols";

describe("SymbolPicker.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: { help: { symbolSet: "Symbols" } },
    },
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    const symbolsStore = useSymbolsStore();
    symbolsStore.setSymbols(["A", "B", "C"]);
  });

  it("renders symbols from store plus wildcard", () => {
    const wrapper = mount(SymbolPicker, {
      global: {
        plugins: [i18n],
        stubs: {
          "q-btn": { template: '<button class="q-btn-stub"><slot /></button>' },
        },
      },
    });

    const buttons = wrapper.findAll(".q-btn-stub");
    // 3 symbols + 1 wildcard (?)
    expect(buttons.length).toBe(4);
    expect(wrapper.text()).toContain("A");
    expect(wrapper.text()).toContain("B");
    expect(wrapper.text()).toContain("C");
    expect(wrapper.text()).toContain("?");
  });

  it("emits select when a symbol button is clicked", async () => {
    const wrapper = mount(SymbolPicker, {
      global: {
        plugins: [i18n],
        stubs: {
          "q-btn": {
            template:
              '<button class="q-btn-stub" @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

    const firstBtn = wrapper.findAll(".q-btn-stub")[0];
    await firstBtn.trigger("click");

    expect(wrapper.emitted("select")?.[0]).toEqual(["A"]);
  });
});
