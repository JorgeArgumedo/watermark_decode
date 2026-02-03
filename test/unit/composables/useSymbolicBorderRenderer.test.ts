import { describe, it, expect, beforeEach, vi } from "vitest";
import { useSymbolicBorderRenderer } from "@presentation/composables/useSymbolicBorderRenderer";
import { encodeIdToSymbolicSequence } from "@domain/utils/encoding";

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

  it("doesn't set position when element already positioned", () => {
    // Override getComputedStyle to emulate already positioned element
    vi.spyOn(window, "getComputedStyle").mockImplementation(
      (_element: Element) => {
        return {
          paddingTop: "0px",
          paddingRight: "0px",
          paddingBottom: "0px",
          paddingLeft: "0px",
          fontSize: "16px",
          position: "relative",
        } as CSSStyleDeclaration;
      },
    );

    const { renderBorder } = useSymbolicBorderRenderer();
    renderBorder(element, {});

    expect(element.dataset._sb_setPosition).toBeUndefined();
  });

  it("uses band fallback when sizes are zero", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    // clientWidth/Height default to 0 in JSDOM for unattached elements; ensure zero
    Object.defineProperty(element, "clientWidth", { value: 0, configurable: true });
    Object.defineProperty(element, "clientHeight", { value: 0, configurable: true });

    renderBorder(element, { number: "9" });

    const paths = element.querySelectorAll("svg path");
    // band path is the second path
    const bandPath = paths[1] as SVGPathElement;
    expect(bandPath).toBeTruthy();
    const d = bandPath.getAttribute("d") || "";
    expect(d.includes("H") || d.includes("V") || d.includes("Z")).toBeTruthy();
    expect(bandPath.getAttribute("fill")).toBe("#000");
  });

  it("sets separator when sepPos is start", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    renderBorder(element, { number: "1", sepPos: "start", separator: ":" });

    const sepTextPath = element.querySelectorAll("svg textPath")[0] as SVGTextPathElement;
    expect(sepTextPath.textContent).toBe(":");
  });

  it("update and destroy work correctly and respect repeats cap", () => {
    const { renderBorder } = useSymbolicBorderRenderer();

    Object.defineProperty(element, "clientWidth", { value: 200, configurable: true });
    Object.defineProperty(element, "clientHeight", { value: 100, configurable: true });

    const r = renderBorder(element, { number: "42", symbols: ["A"], repeatGapFactor: 1e6, separator: "" });

    const textPaths = element.querySelectorAll("svg textPath");
    const symTextPath = textPaths[1] as SVGTextPathElement;
    expect(symTextPath.textContent).toBeTruthy();
    // Should be capped (check number of sequence repetitions)
    const seq = encodeIdToSymbolicSequence("42", ["A"]);
    const occurrences = (symTextPath.textContent || "").split(seq).length - 1;
    expect(occurrences).toBeLessThanOrEqual(400);

    // Call update and expect it not to throw and keep svg
    expect(() => r.update()).not.toThrow();

    // Destroy should remove the svg
    r.destroy();
    expect(element.querySelector("svg")).toBeNull();
  });
});
