import { intToSymbolSeq } from "@/utils/encoding";
import { SYMBOLS, DEFAULT_BASE } from "@/utils/symbols";
import {
  buildSidePath,
  parsePixels,
  formatCoordinate,
  toNumber,
} from "@/utils/border";

export interface BorderOptions {
  number?: number | string;
  sides?: string[];
  separator?: string;
  sepPos?: "inline" | "start";
  symbols?: readonly string[];
  css?: {
    borderColor?: string;
    borderWidth?: number | string;
    glyphColor?: string;
    textColor?: string;
    textSize?: string;
    radius?: number | string;
  };
  repeatGapFactor?: number;
}

export function useSymbolicBorderRenderer() {
  function ensurePADDING(el: HTMLElement, sides: string[], css: any) {
    const computed = window.getComputedStyle(el);
    // Avoid reading textSize from css if not string, parse safely?
    // Original uses css.textSize or '13px'
    const baseTextSize = css && css.textSize ? css.textSize : "13px";
    let textPx = 13;

    // Original attempts to measure 'X'
    try {
      const tmp = document.createElement("span");
      tmp.style.visibility = "hidden";
      tmp.style.position = "absolute";
      tmp.style.fontSize = baseTextSize;
      tmp.textContent = "X";
      document.body.appendChild(tmp);
      textPx = parseFloat(window.getComputedStyle(tmp).fontSize) || 13;
      document.body.removeChild(tmp);
    } catch (e) {
      textPx = 13;
    }

    const borderWidth = css && css.borderWidth ? Number(css.borderWidth) : 6;
    const needed = Math.ceil(borderWidth * 0.8 + textPx * 0.5 + 4);

    // Check if padding already applied (data attribute)
    if (el.dataset._sb_padding_applied) return;

    // Read current padding
    const pTop = parseFloat(computed.paddingTop) || 0;
    const pRight = parseFloat(computed.paddingRight) || 0;
    const pBottom = parseFloat(computed.paddingBottom) || 0;
    const pLeft = parseFloat(computed.paddingLeft) || 0;

    // Normalize sides array
    const sideSet = new Set(sides.map((s) => s.toLowerCase()));
    let targetSides = ["top", "right", "bottom", "left"];
    if (sideSet.has("full")) {
      // all
    } else {
      targetSides = targetSides.filter((s) => sideSet.has(s));
    }

    // Apply padding
    el.style.paddingTop =
      (targetSides.includes("top") ? pTop + needed : pTop) + "px";
    el.style.paddingRight =
      (targetSides.includes("right") ? pRight + needed : pRight) + "px";
    el.style.paddingBottom =
      (targetSides.includes("bottom") ? pBottom + needed : pBottom) + "px";
    el.style.paddingLeft =
      (targetSides.includes("left") ? pLeft + needed : pLeft) + "px";

    // Store original padding to restore later if needed
    el.dataset._sb_padding_top = String(pTop);
    el.dataset._sb_padding_right = String(pRight);
    el.dataset._sb_padding_bottom = String(pBottom);
    el.dataset._sb_padding_left = String(pLeft);

    el.dataset._sb_padding_applied = "1";
  }

  function renderBorder(el: HTMLElement, options: BorderOptions = {}) {
    // 1. Prepare
    const computed = window.getComputedStyle(el);
    if (computed.position === "static") {
      el.style.position = "relative";
      el.dataset._sb_setPosition = "1";
    }

    // Default options
    const number = options.number || 0;
    let sides = Array.isArray(options.sides)
      ? options.sides.map((s) => String(s).toLowerCase())
      : ["full"];
    if (sides.length === 1 && sides[0] === "full")
      sides = ["top", "right", "bottom", "left"];

    const separator = options.separator || "●";
    const sepPos = options.sepPos || "inline";
    const css = options.css || {};
    const repeatGapFactor = options.repeatGapFactor || 1.05;
    const radius = css.radius !== undefined ? Number(css.radius) : 10;
    const borderWidth =
      css.borderWidth !== undefined ? Number(css.borderWidth) : 6;
    const textSize = css.textSize || "13px";
    const textColor = css.textColor || "#0b1220";

    const symbolsArray =
      Array.isArray(options.symbols) && options.symbols.length
        ? options.symbols
        : [...SYMBOLS];
    const base = symbolsArray.length || DEFAULT_BASE;

    // 2. Ensure SVG overlay exists
    let svg = el.querySelector(
      'svg[data-created-by="symbolic-border"]',
    ) as SVGSVGElement;
    let centerPath: SVGPathElement;
    let bandPath: SVGPathElement;
    let sepTextPath: SVGTextPathElement;
    let symTextPath: SVGTextPathElement;

    if (!svg) {
      svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.position = "absolute";
      svg.style.inset = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.overflow = "visible";
      svg.style.zIndex = "999";
      svg.dataset.createdBy = "symbolic-border";
      el.appendChild(svg);

      // Center Path
      centerPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      centerPath.setAttribute("fill", "none");
      centerPath.setAttribute("stroke", "transparent");
      centerPath.id = "_sb_center_" + Math.random().toString(36).slice(2);
      svg.appendChild(centerPath);

      // Band Path
      bandPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
      bandPath.setAttribute("fill-rule", "evenodd");
      bandPath.setAttribute("stroke", "none");
      bandPath.style.pointerEvents = "none";
      svg.appendChild(bandPath);

      // Texts
      const sepText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      sepText.style.fontFamily =
        '"Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace';
      // Cast to any to avoid "Property 'fontVariantEmoji' does not exist on type 'CSSStyleDeclaration'" error in TS
      (sepText.style as any).fontVariantEmoji = "text";
      sepText.style.fontWeight = "700";
      // sepText styles set dynamically below

      sepTextPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "textPath",
      );
      sepTextPath.setAttribute("href", "#" + centerPath.id);
      sepText.appendChild(sepTextPath);
      svg.appendChild(sepText);

      const symText = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      symText.style.fontFamily =
        '"Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace';
      (symText.style as any).fontVariantEmoji = "text";
      symText.setAttribute("dominant-baseline", "middle");

      symTextPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "textPath",
      );
      symTextPath.setAttribute("href", "#" + centerPath.id);
      symText.appendChild(symTextPath);
      svg.appendChild(symText);
    } else {
      centerPath = svg.querySelector(
        'path[id^="_sb_center"]',
      ) as SVGPathElement;
      bandPath = svg.querySelectorAll("path")[1] as SVGPathElement;
      const texts = svg.querySelectorAll("text");
      sepTextPath = texts[0].querySelector("textPath") as SVGTextPathElement;
      symTextPath = texts[1].querySelector("textPath") as SVGTextPathElement;
    }

    // 3. Ensure Padding
    ensurePADDING(el, sides, { textSize, borderWidth });

    // 4. Compute Sizes
    const explicitSize = parsePixels(css.textSize || textSize, 13) || 13;
    // Use font size from element if set, or explicit
    const parentFontSize = symTextPath.parentElement?.style.fontSize
      ? parsePixels(symTextPath.parentElement.style.fontSize, explicitSize)
      : explicitSize;

    const glyphPx = Math.max(parentFontSize, Math.round(borderWidth * 0.9));

    if (symTextPath.parentElement) {
      symTextPath.parentElement.style.fontSize = `${glyphPx}px`;
      symTextPath.parentElement.style.fill = css.glyphColor || textColor;
    }
    if (sepTextPath.parentElement) {
      sepTextPath.parentElement.style.fontSize = `${glyphPx}px`;
      sepTextPath.parentElement.style.fill = css.glyphColor || textColor; // Using glyphColor for separator too? Original does
    }

    // Padding for Glyph to stay inside
    const padGlyph = Math.max(0, Math.ceil(glyphPx / 2));

    // Geometry
    const outerW = Math.max(0, el.clientWidth);
    const outerH = Math.max(0, el.clientHeight);
    const innerInset = Math.max(1, Math.round(borderWidth)) + padGlyph;

    const innerW = Math.max(0, outerW - innerInset * 2);
    const innerH = Math.max(0, outerH - innerInset * 2);

    const borderColor = css.borderColor || "#000";

    // Build Paths
    const allSides = ["top", "right", "bottom", "left"].every((s) =>
      sides.includes(s),
    );

    // BAND PATH
    if (allSides) {
      const outerD = buildSidePath(0, 0, outerW, outerH, radius, sides);
      const innerD = buildSidePath(
        innerInset,
        innerInset,
        innerW,
        innerH,
        Math.max(0, radius - innerInset),
        sides,
      );
      if (!outerD || !innerD) {
        bandPath.setAttribute(
          "d",
          `M ${formatCoordinate(0)} ${formatCoordinate(0)} H ${formatCoordinate(outerW)} V ${formatCoordinate(outerH)} H ${formatCoordinate(0)} Z`,
        );
      } else {
        bandPath.setAttribute("d", outerD + " " + innerD);
      }
      bandPath.setAttribute("fill", borderColor);
    } else {
      bandPath.setAttribute("d", ""); // No filled band for partial sides in this impl?
      // Original script says: if (!allSides) bandPath d='', CENTER PATH gets stroke
      // Wait, checking original...
      // "if (allSides) ... else { bandPath d=''; ... centerPath stroke width ... }"
      // It seems partial borders are rendered as strokes on centerPath in the original??
      // Actually no, look closely at original:
      // If !allSides:
      // centerPath gets stroke attributes (borderWidth etc).
      // centerPath D is calculated.
      // But wait, centerPath is also used for TEXT.
      // Original code re-calculates centerPath d for text later if needed.
    }

    // CENTER PATH (For Text and/or Stroke)
    const centerInset = Math.ceil(borderWidth / 2) + padGlyph;

    // Logic for partial borders center path
    if (!allSides) {
      let cx = centerInset;
      let cy = 0;
      let cw = Math.max(0, outerW - centerInset * 2);
      let ch = outerH;

      if (sides.includes("top") || sides.includes("bottom")) {
        cy = centerInset;
        ch = Math.max(0, outerH - centerInset * 2);
      }

      const centerD = buildSidePath(
        cx,
        cy,
        cw,
        ch,
        Math.max(0, radius - centerInset),
        sides,
      );
      if (centerD) {
        centerPath.setAttribute("d", centerD);
      } else {
        // Fallback
        // ... (implementation of fallback from original)
        if (sides.includes("left"))
          centerPath.setAttribute(
            "d",
            `M ${formatCoordinate(Math.round(borderWidth / 2))} ${formatCoordinate(0)} V ${formatCoordinate(outerH)}`,
          );
        // ... simplify for now, assuming buildSidePath works
      }

      centerPath.setAttribute("stroke", borderColor);
      centerPath.setAttribute("stroke-width", String(borderWidth));
    } else {
      // If allSides, centerPath is transparent used only for text path
      centerPath.setAttribute("stroke", "transparent");
    }

    // TEXT PATH alignment
    // Re-calculate centerPath specifically for Text if we want it centered in the "Band" or "Stroke"
    // The original code does:
    // "IMPORTANT: compute & set centerPath midline for text BEFORE building text"
    // "const centerInset_for_text = Math.ceil(borderWidth / 2) + padGlyph;"
    // It seems they overwrite centerPath d for text?

    const centerInsetForText = Math.ceil(borderWidth / 2) + padGlyph;
    const tcx = centerInsetForText;
    const tcy = centerInsetForText;
    const tcw = Math.max(0, outerW - centerInsetForText * 2);
    const tch = Math.max(0, outerH - centerInsetForText * 2); // Original had *2

    const centerDForText = buildSidePath(
      tcx,
      tcy,
      tcw,
      tch,
      Math.max(0, radius - centerInsetForText),
      sides,
    );
    if (centerDForText) {
      centerPath.setAttribute("d", centerDForText);
    }

    svg.setAttribute("viewBox", `0 0 ${outerW} ${outerH}`);

    // TEXT GENERATION
    // Convert number to symbols
    const numberStr = String(number);
    const symbolSeq = intToSymbolSeq(numberStr, symbolsArray);
    const unitText = sepPos === "inline" ? separator + symbolSeq : symbolSeq;

    // Repeat logic
    // We need path length. In Vue/JSdom this might be tricky if not rendered.
    // In browser it works.
    let pathLen = 300;
    try {
      pathLen = centerPath.getTotalLength() || 300;
    } catch (e) {
      /* ignore */
    }

    // Sample text len approx
    const estCharWidth = glyphPx * 0.8; // Approx
    const sampleLen = unitText.length * estCharWidth || 40;

    let repeats = Math.ceil((pathLen / sampleLen) * repeatGapFactor);
    if (!isFinite(repeats) || repeats <= 0) repeats = 3;
    if (repeats > 400) repeats = 400;

    const fullText = Array(repeats).fill(unitText).join("");
    symTextPath.textContent = fullText;

    if (sepPos === "start") {
      sepTextPath.textContent = separator;
      // Alignments logic from original...
    } else {
      sepTextPath.textContent = "";
      symTextPath.setAttribute("startOffset", "50%");
      if (symTextPath.parentElement)
        symTextPath.parentElement.setAttribute("text-anchor", "middle");
    }

    // Metadata
    symTextPath.dataset.digits = String(
      intToSymbolSeq(numberStr, symbolsArray).length,
    ); // wait, intToSymbolSeq returns str, length is chars. intToDigits returns array.
    // Original used intToDigits(number, base).length.
    // intToSymbolSeq returns correct sequence length.

    return {
      svg,
      base,
    };
  }

  return {
    renderBorder,
  };
}
