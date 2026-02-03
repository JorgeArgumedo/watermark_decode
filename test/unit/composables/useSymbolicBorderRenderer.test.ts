import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSymbolicBorderRenderer } from "@/composables/useSymbolicBorderRenderer";

describe("useSymbolicBorderRenderer", () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement("div");
    // Mock getComputedStyle
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (_element: Element) => {
        return {
          paddingTop: "0px",
          paddingRight: "0px",
          paddingBottom: "0px",
          paddingLeft: "0px",
          fontSize: "16px",
          position: "static",
        } as CSSStyleDeclaration;
      },
    );
    document.body.appendChild(element);
  });

  it("adds padding to element", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    // Calling renderBorder will trigger ensurePadding implicitly
    renderBorder(element, {
      sides: ["top", "left"],
      customStyles: { borderWidth: 10, textSize: "20px" },
    });

    expect(element.style.paddingTop).not.toBe("");
    expect(element.style.paddingLeft).not.toBe("");
    expect(element.dataset._sb_padding_applied).toBe("1");
  });

  it("creates an SVG overlay", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    renderBorder(element, { number: "123" });

    const svg = element.querySelector('svg[data-created-by="symbolic-border"]');
    expect(svg).toBeTruthy();
    expect(svg?.querySelector("textPath")).toBeTruthy();
  });

  it("updates existing SVG if called again", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    renderBorder(element, { number: "123" });
    const firstSvg = element.querySelector("svg");

    renderBorder(element, { number: "456" });
    const secondSvg = element.querySelector("svg");

    expect(firstSvg).toBe(secondSvg); // Should reuse
  });
});
