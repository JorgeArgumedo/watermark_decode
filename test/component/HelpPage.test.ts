import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import HelpPage from "@/pages/HelpPage.vue";
import { createI18n } from "vue-i18n";

describe("HelpPage.vue", () => {
  const i18n = createI18n({
    legacy: false,
    locale: "en",
    messages: {
      en: {
        help: {
          title: "Help",
          overview: "Overview",
          overviewDetail: "Detail",
          symbolSet: "Symbols",
          symbolSetDetail: "Count: {count}",
        },
      },
    },
  });

  const mountWrapper = (options = {}) =>
    mount(HelpPage, {
      global: {
        plugins: [i18n],
        stubs: {
          "q-page": { template: "<div><slot /></div>" },
          "q-btn": {
            template:
              '<button class="back-btn-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          "q-card": { template: "<div><slot /></div>" },
          "q-card-section": { template: "<div><slot /></div>" },
        },
        ...options,
      },
    });

  it("renders correctly", () => {
    const wrapper = mountWrapper();
    expect(wrapper.text()).toContain("Help");
    expect(wrapper.text()).toContain("Overview");
  });

  it("calls router back when back button clicked", async () => {
    const spy = vi.fn();
    const wrapper = mountWrapper({
      mocks: {
        $router: { back: spy },
      },
    });

    await wrapper.find("button").trigger("click");
    expect(spy).toHaveBeenCalled();
  });
});
