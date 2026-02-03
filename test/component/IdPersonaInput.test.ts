import { describe, it, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { defineComponent } from "vue";
import IdPersonaInput from "@/components/input/IdPersonaInput.vue";
import { createI18n } from "vue-i18n";

// Stub simple para QInput
const QInputStub = defineComponent({
  name: "QInput",
  template: `
    <div class="q-input-stub">
      <input 
        :value="modelValue" 
        @input="$emit('update:modelValue', $event.target.value)"
        :class="{ 'has-error': error }"
      />
      <div v-if="error" class="error-message">{{ errorMessage }}</div>
    </div>
  `,
  props: ["modelValue", "error", "errorMessage"],
});

describe("IdPersonaInput.vue", () => {
  // Mensajes completos para cubrir todas las claves usadas en el componente
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        analysis: {
          inputId: "ID",
        },
        errors: {
          numericIdOnly: "ID must contain only numbers",
          invalidId: "Invalid ID",
          idTooShort: "ID must be at least 8 digits",
          emptyId: "ID cannot be empty",
          idTooLarge: "ID is too large",
          negativeId: "ID cannot be negative",
          invalidNumberFormat: "Invalid number format",
        },
      },
    },
  });

  const mountWrapper = (props = {}) => {
    return mount(IdPersonaInput, {
      props: {
        modelValue: "",
        ...props,
      },
      global: {
        plugins: [i18n],
        stubs: {
          QInput: QInputStub,
        },
      },
    });
  };

  it("renders correctly", () => {
    const wrapper = mountWrapper();
    expect(wrapper.exists()).toBe(true);
  });

  it("emits update:modelValue when input changes", async () => {
    const wrapper = mountWrapper();
    const input = wrapper.findComponent({ name: "QInput" });
    expect(input.exists()).toBe(true);

    // Simula cambio de input
    await input.vm.$emit("update:modelValue", "12345678");
    await flushPromises();

    expect(wrapper.emitted("update:modelValue")).toBeDefined();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["12345678"]);
  });

  it("validates correct ID and emits valid event", async () => {
    const wrapper = mountWrapper();

    // Establece un ID válido (8+ dígitos)
    await wrapper.setProps({ modelValue: "12345678" });
    await flushPromises();

    // Espera un poco más para que la validación se complete
    await new Promise((r) => setTimeout(r, 50));

    // Verifica que se emitió el evento 'valid'
    expect(wrapper.emitted("valid")).toBeDefined();

    // El último evento 'valid' debería ser true
    const lastEmission = wrapper.emitted("valid")?.at(-1);
    expect(lastEmission).toEqual([true]);

    // El error debería estar vacío
    expect(wrapper.vm.error).toBe("");
  });

  it("validates non-numeric ID and shows error", async () => {
    const wrapper = mountWrapper();

    // Establece un ID con letras
    await wrapper.setProps({ modelValue: "abc123" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // Verifica que hay error
    expect(wrapper.vm.error).toBe("ID must contain only numbers");

    // Verifica que se emitió false
    const emissions = wrapper.emitted("valid");
    const lastEmission = emissions?.at(-1);
    expect(lastEmission?.[0]).toBe(false);
  });

  it("validates too large ID and shows error", async () => {
    const wrapper = mountWrapper();

    // Establece un ID mayor a 2^64 - 1
    await wrapper.setProps({ modelValue: "18446744073709551616" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // Verifica que hay error
    expect(wrapper.vm.error).toBe("ID is too large");

    // Verifica que se emitió false
    const lastEmission = wrapper.emitted("valid")?.at(-1);
    expect(lastEmission?.[0]).toBe(false);
  });

  it("resets error when changing from invalid to valid ID", async () => {
    const wrapper = mountWrapper();

    // Primero establece un valor inválido
    await wrapper.setProps({ modelValue: "abc" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // Verifica que hay error inicialmente
    expect(wrapper.vm.error).toBeTruthy();
    expect(wrapper.vm.error).not.toBe("");

    // Cambia a un valor válido
    await wrapper.setProps({ modelValue: "12345678" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // El error debería estar vacío
    expect(wrapper.vm.error).toBe("");

    // Verifica que se emitió true
    const lastEmission = wrapper.emitted("valid")?.at(-1);
    expect(lastEmission?.[0]).toBe(true);
  });

  it("clears error when input becomes empty", async () => {
    const wrapper = mountWrapper();

    // Establece un valor inválido primero
    await wrapper.setProps({ modelValue: "abc" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // Verifica que hay error
    expect(wrapper.vm.error).toBeTruthy();

    // Cambia a vacío
    await wrapper.setProps({ modelValue: "" });
    await flushPromises();
    await new Promise((r) => setTimeout(r, 50));

    // El error debería estar vacío
    expect(wrapper.vm.error).toBe("");

    // El último evento 'valid' debería ser false (porque está vacío)
    const lastEmission = wrapper.emitted("valid")?.at(-1);
    expect(lastEmission?.[0]).toBe(false);
  });
});
