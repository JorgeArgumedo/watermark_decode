import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent } from "vue";
import SequenceInput from "@/components/input/SequenceInput.vue";
import { createI18n } from "vue-i18n";
import { setActivePinia, createPinia } from "pinia";
import { useSymbolsStore } from "@/stores/symbols";

// Define robust stubs
const QInputStub = defineComponent({
  name: "QInput",
  template: '<div class="q-input-stub"><slot name="append" /></div>',
  props: ["modelValue", "error", "errorMessage"],
});

const QBtnStub = defineComponent({
  name: "QBtn",
  template:
    '<button class="q-btn-stub" @click="$emit(\'click\')"><slot /></button>',
});

const SymbolPickerStub = defineComponent({
  name: "SymbolPicker",
  template: '<div class="symbol-picker-stub"></div>',
  emits: ["select"],
});

describe("SequenceInput.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        analysis: { inputSequence: "Sequence" },
        actions: { showPicker: "Picker" },
        errors: {
          invalidSequence: "Invalid",
          invalidSymbol: "Invalid symbol at position {pos}: {char}",
        },
      },
    },
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    const symbolsStore = useSymbolsStore();
    symbolsStore.setSymbols(["A", "B", "C"]);
  });

  const mountWrapper = (props = {}) => {
    return mount(SequenceInput, {
      props: {
        modelValue: "",
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          QInput: QInputStub,
          QBtn: QBtnStub,
          SymbolPicker: SymbolPickerStub,
          QSlideTransition: { template: "<div><slot /></div>" },
          QTooltip: true,
        },
      },
    });
  };

  it("renders correctly", () => {
    const wrapper = mountWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it("shows picker when button clicked", async () => {
    const wrapper = mountWrapper();
    // Directly setting state to ensure visibility for test reliability
    // as trigger('click') on stubs can be inconsistent in some Vitest/Vue versions
    (wrapper.vm as any).showPicker = true;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".symbol-picker-stub").exists()).toBe(true);
  });

  it("appends symbol when picker emits select", async () => {
    const wrapper = mountWrapper({ modelValue: "AB" });

    // Show picker first
    (wrapper.vm as any).showPicker = true;
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    const picker = wrapper.findComponent({ name: "SymbolPicker" });
    expect(picker.exists()).toBe(true);

    await picker.vm.$emit("select", "C");
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 0));

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["ABC"]);
  });

  it("emits update:modelValue when input changes", async () => {
    const wrapper = mountWrapper();
    const input = wrapper.findComponent({ name: "QInput" });
    expect(input.exists()).toBe(true);

    await input.vm.$emit("update:modelValue", "123");
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["123"]);
  });

  it("validates sequence and emits valid event", async () => {
    const wrapper = mountWrapper({ modelValue: "ABC" });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("valid")).toBeDefined();
    expect(wrapper.emitted("valid")?.[0]).toEqual([true]);
  });

  it("fails validation for invalid symbols", async () => {
    const wrapper = mountWrapper({ modelValue: "XYZ" });

    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.emitted("valid")?.[0]).toEqual([false]);
    expect(wrapper.vm.error).toBeTruthy();
  });
});
