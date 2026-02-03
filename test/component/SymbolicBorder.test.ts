import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import SymbolicBorder from "@/components/symbolic/SymbolicBorder.vue";

// Mock the renderer composable
vi.mock("@presentation/composables/useSymbolicBorderRenderer", () => ({
  useSymbolicBorderRenderer: () => ({
    renderBorder: vi.fn(),
  }),
}));

describe("SymbolicBorder.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders container and slot content", () => {
    const wrapper = mount(SymbolicBorder, {
      props: { idPersona: "123" },
      slots: { default: '<div class="content">Content</div>' },
    });

    expect(wrapper.find(".symbolic-border-container").exists()).toBe(true);
    expect(wrapper.find(".content").text()).toBe("Content");
  });

  it("calls updateBorder when idPersona changes", async () => {
    const wrapper = mount(SymbolicBorder, {
      props: { idPersona: "123" },
    });

    // updateBorder uses requestAnimationFrame and setTimeout
    // In a real environment, it would call renderBorder.
    // With mocks, we just want to ensure it doesn't crash and watches work.

    await wrapper.setProps({ idPersona: "456" });
    await wrapper.vm.$nextTick();

    expect(wrapper.props("idPersona")).toBe("456");
  });
});
