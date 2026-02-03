# Definición del Proyecto

## SPA de Identificación de Personas mediante Codificación Simbólica

## Arquitectura propuesta (Clean Architecture)

- domain/: Entidades, interfaces (puertos) y casos de uso (usecases). Ej: `domain/repositories`, `domain/usecases`.
- infrastructure/: Implementaciones concretas de infra (HTTP clients, repositorios). Ej: `infrastructure/repositories/ApiCandidateRepository`.
- presentation/: Stores, componentes, composables y wiring de la aplicación. Los stores delegan en usecases.
- shared/: Tipos y utilidades puras (`utils`, `types`).

> Los cambios recientes extraen la lógica de negocio del store a `domain/usecases` y mueven la comunicación HTTP a `infrastructure`.

## 0. Codigo base

Logica de implementacion:
(function(global) {
const SYMBOLS = ["☀", "☁", "☂", "☄", "★", "☇", "☈", "☊", "☏", "☑", "☒", "☗", "☘", "☢", "☽", "☿", "♀",
"♁", "♂", "♃", "♄", "♅", "♆", "♇", "♔", "♕", "♖", "♗", "♘", "₠", "₣", "₤", "€", "₭", "₿", "🜀",
"🜁", "🜂", "🜇", "🜊", "🜋", "🜔", "🜘", "🜤", "🜲", "🜳", "🜴", "🜶", "🜹", "🜼", "🜾", "🞁",
"🞆", "🞊", "🞋", "🞐", "🞔", "🞕", "🞖", "🞚", "🞛", "🞜", "🞝", "🞮", "⌓", "⌗", "⌘", "⌨", "⌫",
"⌺", "⍉", "⍍", "✂", "✈", "✉", "✎", "✔", "✪", "❡", "∂", "∃", "∑", "√", "∥", "∬", "≪", "≫"
];
const DEFAULT*BASE = SYMBOLS.length;
function ensureElement(target) {
if (typeof target === 'string') {
const id = target.startsWith('#') ? target.slice(1) : target;
const el = document.getElementById(id);
if (!el) throw new Error(`No se encontró elemento con id="${id}"`);
return el;
}
if (target instanceof Element) return target;
throw new Error('target debe ser id (string) o Element');
}
function num(v, f = 0) {
const n = Number(v);
return isFinite(n) ? n : f;
}
function fx(v) {
return (isFinite(v) ? (+v).toFixed(2) : '0');
}
function parsePx(v, f) {
if (!v) return f;
if (typeof v === 'number') return v;
const m = String(v).match(/^([0-9.]+)px$/);
if (m) return parseFloat(m[1]);
const n = parseFloat(v);
return isFinite(n) ? n : f;
}
function ensurePaddingForSides(el, sides, css) {
const computed = getComputedStyle(el);
const baseTextSize = (css && css.textSize) ? css.textSize : '13px';
let textPx = 13;
try {
const tmp = document.createElement('span');
tmp.style.visibility = 'hidden';
tmp.style.position = 'absolute';
tmp.style.fontSize = baseTextSize;
tmp.textContent = 'X';
document.body.appendChild(tmp);
textPx = parseFloat(getComputedStyle(tmp).fontSize) || 13;
document.body.removeChild(tmp);
} catch (e) {
textPx = 13;
}
const borderWidth = (css && css.borderWidth) ? Number(css.borderWidth) : 6;
// Ajuste: aumentar margen si el texto es grande -> usar texto como referencia
const needed = Math.ceil(borderWidth * 0.8 + textPx * 0.5 + 4);
const pTop = parseFloat(el.dataset.\_sb_padding_top || computed.paddingTop) || 0;
const pRight = parseFloat(el.dataset.\_sb_padding_right || computed.paddingRight) || 0;
const pBottom = parseFloat(el.dataset.\_sb_padding_bottom || computed.paddingBottom) || 0;
const pLeft = parseFloat(el.dataset.\_sb_padding_left || computed.paddingLeft) || 0;
if (!Array.isArray(sides)) sides = ['top', 'right', 'bottom', 'left'];
else {
sides = sides.map(s => String(s).toLowerCase()).filter(Boolean);
if (sides.length === 1 && sides[0] === 'full') sides = ['top', 'right', 'bottom', 'left'];
}
if (!el.dataset.\_sb_padding_applied) {
el.style.paddingTop = (sides.includes('top') ? (pTop + needed) : pTop) + 'px';
el.style.paddingRight = (sides.includes('right') ? (pRight + needed) : pRight) + 'px';
el.style.paddingBottom = (sides.includes('bottom') ? (pBottom + needed) : pBottom) + 'px';
el.style.paddingLeft = (sides.includes('left') ? (pLeft + needed) : pLeft) + 'px';
el.dataset.\_sb_padding_applied = '1';
}
}
function createOverlay(el, css) {
const computed = getComputedStyle(el);
if (computed.position === 'static') {
el.style.position = 'relative';
el.dataset.\_sb_setPosition = '1';
}
el.dataset.\_sb_padding_top = computed.paddingTop;
el.dataset.\_sb_padding_right = computed.paddingRight;
el.dataset.\_sb_padding_bottom = computed.paddingBottom;
el.dataset.\_sb_padding_left = computed.paddingLeft;
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('aria-hidden', 'true');
svg.style.position = 'absolute';
svg.style.inset = '0';
svg.style.width = '100%';
svg.style.height = '100%';
svg.style.pointerEvents = 'none';
svg.style.overflow = 'visible';
svg.style.zIndex = '999';
svg.dataset.\_createdBy = 'symbolic-border';
// centerPath fuera de defs (mejor fiabilidad)
const centerPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
centerPath.setAttribute('fill', 'none');
centerPath.setAttribute('stroke', 'transparent');
centerPath.setAttribute('id', '\_sb_center*' + Math.random().toString(36).slice(2));
svg.appendChild(centerPath);
// bandPath (filled ring)
const bandPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
bandPath.setAttribute('fill-rule', 'evenodd');
bandPath.setAttribute('stroke', 'none');
bandPath.style.pointerEvents = 'none';
svg.appendChild(bandPath);
// separator text (empty initially)
const sepText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
sepText.style.fontFamily =
'"Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace';
sepText.style.fontVariantEmoji = 'text';
sepText.style.fontWeight = '700';
if (css && css.textSize) sepText.style.fontSize = css.textSize;
if (css && css.textColor) sepText.style.fill = css.textColor;
const sepTextPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
sepTextPath.setAttribute('href', '#' + centerPath.id);
try {
sepTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + centerPath.id);
} catch (e) {}
sepText.appendChild(sepTextPath);
svg.appendChild(sepText);
// glyph text
const symText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
symText.style.fontFamily =
'"Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace';
symText.style.fontVariantEmoji = 'text';
if (css && css.textSize) symText.style.fontSize = css.textSize;
if (css && css.textColor) symText.style.fill = css.textColor;
symText.setAttribute('dominant-baseline', 'middle');
const symTextPath = document.createElementNS('http://www.w3.org/2000/svg', 'textPath');
symTextPath.setAttribute('href', '#' + centerPath.id);
try {
symTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + centerPath.id);
} catch (e) {}
symText.appendChild(symTextPath);
svg.appendChild(symText);
el.appendChild(svg);
Array.from(el.children).forEach(ch => {
if (ch === svg) return;
if (!(ch instanceof Element)) return;
const cc = getComputedStyle(ch);
if (cc.position === 'static') ch.style.position = 'relative';
ch.style.zIndex = '0';
});
return {
svg,
centerPath,
bandPath,
sepTextPath,
symTextPath
};
}
function buildSidePath(x, y, w, h, r, sides) {
x = num(x, 0);
y = num(y, 0);
w = num(w, 0);
h = num(h, 0);
r = num(r, 0);
if (w <= 0 || h <= 0) return '';
if (!Array.isArray(sides)) sides = ['top', 'right', 'bottom', 'left'];
else {
sides = sides.map(s => String(s).toLowerCase()).filter(Boolean);
if (sides.length === 1 && sides[0] === 'full') sides = ['top', 'right', 'bottom', 'left'];
}
const left = x,
top = y,
right = x + w,
bottom = y + h;
const rx = Math.min(r, w / 2, h / 2);
const include = {
top: sides.includes('top'),
right: sides.includes('right'),
bottom: sides.includes('bottom'),
left: sides.includes('left')
};
const order = ['top', 'right', 'bottom', 'left'];
let startSide = order.find(s => include[s]);
if (!startSide) return '';
let cx = left + rx,
cy = top;
if (startSide === 'top') {
cx = left + rx;
cy = top;
} else if (startSide === 'right') {
cx = right;
cy = top + rx;
} else if (startSide === 'bottom') {
cx = right - rx;
cy = bottom;
} else {
cx = left;
cy = bottom - rx;
}
const cmd = [];
cmd.push(`M ${fx(cx)} ${fx(cy)}`);
function appendSide(side) {
if (side === 'top' && include.top) {
cmd.push(`H ${fx(right - rx)}`);
if (include.right) cmd.push(`A ${fx(rx)} ${fx(rx)} 0 0 1 ${fx(right)} ${fx(top + rx)}`);
else cmd.push(`L ${fx(right)} ${fx(top)}`);
}
if (side === 'right' && include.right) {
cmd.push(`V ${fx(bottom - rx)}`);
if (include.bottom) cmd.push(`A ${fx(rx)} ${fx(rx)} 0 0 1 ${fx(right - rx)} ${fx(bottom)}`);
else cmd.push(`L ${fx(right)} ${fx(bottom)}`);
}
if (side === 'bottom' && include.bottom) {
cmd.push(`H ${fx(left + rx)}`);
if (include.left) cmd.push(`A ${fx(rx)} ${fx(rx)} 0 0 1 ${fx(left)} ${fx(bottom - rx)}`);
else cmd.push(`L ${fx(left)} ${fx(bottom)}`);
}
if (side === 'left' && include.left) {
cmd.push(`V ${fx(top + rx)}`);
if (include.top) cmd.push(`A ${fx(rx)} ${fx(rx)} 0 0 1 ${fx(left + rx)} ${fx(top)}`);
else cmd.push(`L ${fx(left)} ${fx(top)}`);
}
}
const idx = order.indexOf(startSide);
for (let i = 0; i < 4; i++) appendSide(order[(idx + i) % 4]);
if (include.top && include.right && include.bottom && include.left) cmd.push('Z');
return cmd.join(' ');
}
function createRepeatedText(svg, textPathEl, unitText, repeatGapFactor = 1.05) {
let sampleLen = 40;
try {
const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
tmp.style.visibility = 'hidden';
tmp.style.fontSize = textPathEl.parentElement.style.fontSize || getComputedStyle(textPathEl
.parentElement).fontSize;
tmp.textContent = unitText + ' ';
svg.appendChild(tmp);
sampleLen = tmp.getComputedTextLength ? tmp.getComputedTextLength() : sampleLen;
svg.removeChild(tmp);
} catch (e) {}
let pathLen = 300;
try {
const pathEl = textPathEl.ownerSVGElement.querySelector('path[id^="_sb_center_"]');
pathLen = pathEl && pathEl.getTotalLength ? pathEl.getTotalLength() : pathLen;
} catch (e) {}
if (!isFinite(sampleLen) || sampleLen <= 0) sampleLen = 40;
if (!isFinite(pathLen) || pathLen <= 0) pathLen = 300;
let repeats = Math.ceil(pathLen / sampleLen _ repeatGapFactor);
if (!isFinite(repeats) || repeats <= 0) repeats = 3;
const MAX = 400;
if (repeats > MAX) repeats = MAX;
textPathEl.textContent = Array(repeats).fill(unitText).join('');
return {
repeats,
sampleLen,
pathLen
};
}
function intToDigits(n, base) {
n = Math.floor(Number(n) || 0);
if (n < 0) n = 0;
if (base <= 1) return [0];
if (n === 0) return [0];
const ds = [];
while (n > 0) {
ds.push(n % base);
n = Math.floor(n / base);
}
return ds.reverse();
}
function digitsToSymbols(arr, sy) {
return arr.map(d => sy[d] || '?').join('');
}
function intToSymbolSeq(n, sy) {
const b = (sy && sy.length) ? sy.length : DEFAULT_BASE;
return digitsToSymbols(intToDigits(n, b), sy);
}
function symbolsToInt(str, inv) {
const glyphs = Array.from(str.replace(/\s+/g, ''));
const base = Object.keys(inv).length || DEFAULT_BASE;
let v = 0;
for (let i = 0; i < glyphs.length; i++) {
const g = glyphs[i];
const idx = inv[g];
if (idx === undefined) return {
ok: false,
partialIndex: i,
value: v
};
v = v _ base + idx;
}
return {
ok: true,
value: v,
digits: glyphs.length
};
}
function applySymbolicBorder(target, options = {}) {
const el = ensureElement(target);
const number = options.number || 0;
let sides = Array.isArray(options.sides) ? options.sides.map(s => String(s).toLowerCase()) : [
'full'];
if (sides.length === 1 && sides[0] === 'full') sides = ['top', 'right', 'bottom', 'left'];
const separator = options.separator || '●';
const sepPos = options.sepPos || 'inline';
const css = options.css || {};
const repeatGapFactor = options.repeatGapFactor || 1.05;
const radius = (css.radius !== undefined) ? Number(css.radius) : 10;
let borderWidth = (css.borderWidth !== undefined) ? Number(css.borderWidth) : 6;
const textSize = css.textSize || '13px';
const textColor = css.textColor || '#0b1220';
let symbolsArray = Array.isArray(options.symbols) && options.symbols.length ? options.symbols :
SYMBOLS.slice();
let base = symbolsArray.length || DEFAULT_BASE;
let symbolsInv = Object.fromEntries(symbolsArray.map((s, i) => [s, i]));
const created = createOverlay(el, {
textSize,
textColor,
borderWidth,
radius
});
const {
svg,
centerPath,
bandPath,
sepTextPath,
symTextPath
} = created;
function render() {
ensurePaddingForSides(el, sides, {
textSize,
borderWidth
});
// --- compute glyph size so it's always at least proportional to border and explicit textSize ---
const explicitSize = parsePx(css.textSize || textSize, 13) || 13;
const glyphPx = Math.max(parsePx(symTextPath.parentElement.style.fontSize || explicitSize,
explicitSize), Math.round(borderWidth _ 0.9));
// apply computed glyph size to text elements so text measurement matches
symTextPath.parentElement.style.fontSize = `${glyphPx}px`;
sepTextPath.parentElement.style.fontSize = `${glyphPx}px`;
symTextPath.parentElement.setAttribute('dominant-baseline', 'middle');
// ensure text anchors center horizontally on textPath
symTextPath.parentElement.setAttribute('text-anchor', 'middle');
// padGlyph: half the glyph height (no extra +1) — used to keep glyph inside border
const padGlyph = Math.max(0, Math.ceil(glyphPx / 2));
const outerW = Math.max(0, el.clientWidth),
outerH = Math.max(0, el.clientHeight);
const innerInset = Math.max(1, Math.round(borderWidth)) + padGlyph;
const innerW = Math.max(0, el.clientWidth - innerInset _ 2),
innerH = Math.max(0, el.clientHeight - innerInset _ 2);
const outerD = buildSidePath(0, 0, outerW, outerH, radius, sides);
const innerD = buildSidePath(innerInset, innerInset, innerW, innerH, Math.max(0, radius -
innerInset), sides);
const borderColor = css.borderColor || '#000';
const glyphColor = css.glyphColor || css.textColor || '#fff';
const allSides = (['top', 'right', 'bottom', 'left'].every(s => sides.includes(s)));
if (allSides) {
if (!outerD || !innerD) {
bandPath.setAttribute('d',
`M ${fx(0)} ${fx(0)} H ${fx(outerW)} V ${fx(outerH)} H ${fx(0)} Z`);
} else bandPath.setAttribute('d', outerD + ' ' + innerD);
bandPath.setAttribute('fill', borderColor);
bandPath.setAttribute('fill-rule', 'evenodd');
} else {
bandPath.setAttribute('d', '');
const centerInset = Math.ceil(borderWidth / 2) + padGlyph;
// compute center path box — make sure the path runs along the centerline of the visual border
let cx = centerInset;
let cy = 0;
let cw = Math.max(0, el.clientWidth - centerInset _ 2);
let ch = el.clientHeight;
if (sides.includes('top') || sides.includes('bottom')) {
// for horizontal edges keep vertical inset
cy = centerInset;
ch = Math.max(0, el.clientHeight - centerInset _ 2);
}
const centerD = buildSidePath(cx, cy, cw, ch, Math.max(0, radius - centerInset), sides);
if (centerD) {
centerPath.setAttribute('d', centerD);
} else {
// fallback simple straight edge placed at center of stroke
const midX = fx(Math.round(borderWidth / 2));
const midXRight = fx(outerW - Math.round(borderWidth / 2));
const midY = fx(Math.round(borderWidth / 2));
const midYBottom = fx(outerH - Math.round(borderWidth / 2));
if (sides.includes('left')) centerPath.setAttribute('d',
`M ${fx(0 + Math.round(borderWidth/2))} ${fx(0)} V ${fx(outerH)}`);
else if (sides.includes('right')) centerPath.setAttribute('d',
`M ${midXRight} ${fx(0)} V ${fx(outerH)}`);
else if (sides.includes('top')) centerPath.setAttribute('d',
`M ${fx(0)} ${midY} H ${fx(outerW)}`);
else if (sides.includes('bottom')) centerPath.setAttribute('d',
`M ${fx(0)} ${midYBottom} H ${fx(outerW)}`);
}
centerPath.setAttribute('fill', 'none');
centerPath.setAttribute('stroke', borderColor);
centerPath.setAttribute('stroke-width', String(borderWidth));
centerPath.setAttribute('stroke-linejoin', 'miter');
centerPath.setAttribute('stroke-linecap', 'butt');
}
// --- IMPORTANT: compute & set centerPath midline for text BEFORE building text ---
const centerInset_for_text = Math.ceil(borderWidth / 2) + padGlyph;
const tcx = centerInset_for_text,
tcy = centerInset_for_text,
tcw = Math.max(0, el.clientWidth - centerInset_for_text _ 2),
tch = Math.max(0, el.clientHeight - centerInset_for_text \* 2);
const centerD_for_text = buildSidePath(tcx, tcy, tcw, Math.max(0, radius -
centerInset_for_text), sides);
if (centerD_for_text && centerD_for_text.length) centerPath.setAttribute('d', centerD_for_text);
svg.setAttribute('viewBox', `0 0 ${el.clientWidth} ${el.clientHeight}`);
// text style and hrefs (ensure both href & xlink:href)
sepTextPath.parentElement.style.fill = glyphColor;
symTextPath.parentElement.style.fill = glyphColor;
// ensure textPath points to centerPath (both attributes)
try {
symTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + centerPath.id);
} catch (e) {}
symTextPath.setAttribute('href', '#' + centerPath.id);
try {
sepTextPath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + centerPath.id);
} catch (e) {}
sepTextPath.setAttribute('href', '#' + centerPath.id);
// now build the repeated text (AFTER centerPath.d is set)
const symbolSeq = intToSymbolSeq(number, symbolsArray);
const unitText = (sepPos === 'inline') ? (separator + symbolSeq) : symbolSeq;
if (sepPos === 'start') {
sepTextPath.setAttribute('startOffset', '0%');
sepTextPath.textContent = separator;
// keep small offset so separator doesn't overlap
symTextPath.setAttribute('startOffset', '0%');
symTextPath.parentElement.setAttribute('text-anchor', 'start');
} else {
sepTextPath.textContent = '';
// center repeated symbols along the path
symTextPath.setAttribute('startOffset', '50%');
symTextPath.parentElement.setAttribute('text-anchor', 'middle');
}
// create repeated glyphs now that centerPath exists
const info = createRepeatedText(svg, symTextPath, unitText, repeatGapFactor);
// metadata for decode
const digitsLen = intToDigits(number, base).length;
symTextPath.dataset.digits = String(digitsLen);
symTextPath.dataset.base = String(base);
symTextPath.dataset.\_symbols = JSON.stringify(symbolsArray);
symTextPath.dataset.\_separator = separator;
symTextPath.dataset.\_number = String(number);
symTextPath.dataset.\_sides = JSON.stringify(sides);
return {
base,
digitsLen,
symbolSeq,
info,
padGlyph,
glyphPx
};
}
const res = render();
let ro;
if (typeof ResizeObserver !== 'undefined') {
ro = new ResizeObserver(() => requestAnimationFrame(render));
ro.observe(el);
}
const onWinResize = () => requestAnimationFrame(render);
window.addEventListener('resize', onWinResize);

        return {
            update(newOptions = {}) {
                if (newOptions.number !== undefined) options.number = newOptions.number;
                if (newOptions.sides !== undefined) options.sides = newOptions.sides;
                if (newOptions.separator !== undefined) options.separator = newOptions.separator;
                if (newOptions.sepPos !== undefined) options.sepPos = newOptions.sepPos;
                if (newOptions.symbols !== undefined) {
                    options.symbols = newOptions.symbols;
                    symbolsArray = Array.isArray(options.symbols) && options.symbols.length ? options
                        .symbols : SYMBOLS.slice();
                    base = symbolsArray.length || DEFAULT_BASE;
                    symbolsInv = Object.fromEntries(symbolsArray.map((s, i) => [s, i]));
                }
                if (newOptions.css !== undefined) {
                    options.css = Object.assign(options.css || {}, newOptions.css);
                    try {
                        if (options.css.borderColor) bandPath.setAttribute('fill', options.css.borderColor);
                        if (options.css.borderWidth !== undefined) borderWidth = Number(options.css
                            .borderWidth);
                        if (options.css.glyphColor) {
                            symTextPath.parentElement.style.fill = options.css.glyphColor;
                            sepTextPath.parentElement.style.fill = options.css.glyphColor;
                        }
                        if (options.css.textSize) {
                            symTextPath.parentElement.style.fontSize = options.css.textSize;
                            sepTextPath.parentElement.style.fontSize = options.css.textSize;
                        }
                    } catch (e) {}
                }
                return render();
            },
            decode() {
                try {
                    const symJson = symTextPath.dataset._symbols || '[]';
                    const symbolsArr = JSON.parse(symJson);
                    const inv = Object.fromEntries((symbolsArr || []).map((s, i) => [s, i]));
                    const hexLen = parseInt(symTextPath.dataset.digits || '0', 10) || 0;
                    if (hexLen <= 0) return null;
                    const content = symTextPath.textContent || '';
                    const cleaned = content.replace(new RegExp((symTextPath.dataset._separator || '●'),
                        'g'), '').replace(/\s+/g, '');
                    const glyphsArr = Array.from(cleaned).slice(0, hexLen);
                    const sample = glyphsArr.join('');
                    const res = symbolsToInt(sample, inv);
                    if (!res.ok) return {
                        ok: false,
                        partialIndex: res.partialIndex,
                        valueSoFar: res.value
                    };
                    return {
                        ok: true,
                        base: parseInt(symTextPath.dataset.base || String(symbolsArr.length), 10),
                        digits: res.digits,
                        int: res.value,
                        sample
                    };
                } catch (e) {
                    return {
                        ok: false,
                        error: e.message
                    };
                }
            },
            remove() {
                if (ro) ro.disconnect();
                window.removeEventListener('resize', onWinResize);
                if (svg && svg.parentElement) svg.parentElement.removeChild(svg);
                // restore padding
                if (el.dataset._sb_padding_top !== undefined) el.style.paddingTop = el.dataset
                    ._sb_padding_top;
                if (el.dataset._sb_padding_right !== undefined) el.style.paddingRight = el.dataset
                    ._sb_padding_right;
                if (el.dataset._sb_padding_bottom !== undefined) el.style.paddingBottom = el.dataset
                    ._sb_padding_bottom;
                if (el.dataset._sb_padding_left !== undefined) el.style.paddingLeft = el.dataset
                    ._sb_padding_left;
                delete el.dataset._sb_padding_applied;
                if (el.dataset._sb_setPosition) delete el.dataset._sb_setPosition;
            },
            _internal: {
                svg,
                bandPath,
                centerPath,
                sepTextPath,
                symTextPath
            }
        };
    }
    global.applySymbolicBorder = applySymbolicBorder;

})(window);
Uso del proceso para aplicar bordes simbólicos a los elementos con la clase 'marcaalternativa':
(function(global) {
const contenedores = document.querySelectorAll('.marcaalternativa');
// Recorre cada contenedor
contenedores.forEach(contenedor => {
// Obtiene el ID del contenedor
const idContenedor = contenedor.id;
// Ejecuta la función applySymbolicBorder con el ID del contenedor
applySymbolicBorder(idContenedor, {
number: window.idPersona,
sides: ['left'],
css: {
borderColor: '#000',
glyphColor: '#fff',
borderWidth: 26,
textSize: '24px',
radius: 6
}
});
});
})(window);

## 1. Propósito del sistema

Este proyecto consiste en el desarrollo de una **Single Page Application (SPA)** cuyo objetivo es **asistir en la identificación de personas** a partir de una **marca de agua simbólica** presente en imágenes capturadas en entornos productivos.
La marca de agua codifica un identificador único de persona (`idPersona`) utilizando una **secuencia de glifos/símbolos**, que se renderiza visualmente como un **borde simbólico** en elementos gráficos.
La SPA no reemplaza el proceso productivo existente, sino que actúa como una **herramienta de apoyo para análisis, verificación y depuración**, especialmente en escenarios donde:

- La imagen es borrosa
- Algunos símbolos no son claramente distinguibles
- Existen múltiples interpretaciones posibles de una misma secuencia

## 2. Contexto productivo existente (referencia obligatoria)

En producción ya existe un proceso estable que:

- Toma un `idPersona` (BIGINT UNSIGNED de MySQL)
- Lo codifica en base _N_ (donde _N_ es el número total de símbolos disponibles)
- Genera una secuencia simbólica
- Renderiza dicha secuencia como un **borde izquierdo** alrededor de un elemento HTML
  Este borde simbólico:
- Es la **fuente primaria de verdad visual**
- No puede modificarse ni reinterpretarse
- Define el estándar gráfico y simbólico que la SPA debe respetar
  La SPA **replica exactamente esta representación** para garantizar coherencia visual entre análisis y entorno productivo.

## 3. Representaciones visuales soportadas

El sistema maneja **dos representaciones complementarias y no excluyentes**:

### 3.1 Representación productiva (borde izquierdo)

- Replica fiel del renderizado real en producción
- Usada como referencia visual de validación
- Permite comparar directamente con imágenes capturadas

### 3.2 Representación horizontal auxiliar

- Muestra la secuencia de símbolos de forma lineal
- **No existe en producción**
- Su único propósito es facilitar la lectura humana y el análisis manual
  Ambas representaciones están sincronizadas y corresponden siempre al mismo `idPersona`.

## 4. Identificador de persona (`idPersona`)

- Tipo lógico: **entero sin signo**
- Origen: base de datos MySQL (BIGINT UNSIGNED)
- En la SPA se maneja como **string** para evitar problemas de precisión
- Es **único** y representa a una sola persona
  Toda operación del sistema converge finalmente en la obtención o validación de un `idPersona`.

## 5. Sistema de símbolos

- Existe **un único conjunto de símbolos** global
- No hay múltiples esquemas de codificación
- La longitud de la secuencia depende únicamente del valor del `idPersona`
- Cambios futuros al set de símbolos pueden ocurrir, pero **no dentro de la misma sesión de la SPA**
  La SPA asume un único set activo durante toda su ejecución.

## 6. Codificación y decodificación

### 6.1 Codificación

- Convierte `idPersona` → secuencia simbólica
- Usa conversión numérica a base _N_
- Cada dígito se mapea a un símbolo

### 6.2 Decodificación

- Convierte secuencia simbólica → `idPersona`
- Es estricta: cualquier símbolo inválido invalida el proceso
  Ambos procesos son determinísticos y reversibles.

## 7. Uso de comodines para análisis

Para facilitar la identificación en escenarios ambiguos, el sistema permite el uso de **comodines**:

- Comodín permitido: `?`
- Máximo: **2 comodines por secuencia**
- Cada `?` se expande a **todos los símbolos disponibles**, sin filtro
- El comodín **no altera la longitud** de la secuencia
- Los comodines **no se almacenan**; solo generan candidatos
  Esto permite generar automáticamente todas las combinaciones posibles cuando uno o dos símbolos no son legibles.

## 8. Concepto de candidato

Un **candidato** representa una posible interpretación válida de una secuencia simbólica.
Cada candidato siempre contiene:

- Un `idPersona` concreto
- Una secuencia simbólica **sin comodines**
  Los candidatos pueden originarse de dos fuentes:
- **Manual**: ingreso directo de `idPersona`
- **Expandida**: generación automática a partir de comodines

## 9. Estados del sistema

El sistema maneja **dos dimensiones de estado**, claramente separadas:

### 9.1 Estado del sistema (objetivo)

Refleja el resultado de validaciones automáticas contra APIs:

- `pending`: aún no validado
- `found`: existe en el sistema
- `not_found`: no existe
- `error`: fallo técnico

### 9.2 Estado de análisis (subjetivo)

Refleja la decisión humana durante el análisis:

- `unreviewed`: sin evaluar
- `approved`: aceptado como válido
- `excluded`: descartado
  Esta separación es clave para no mezclar hechos del sistema con decisiones humanas.

## 10. Flujo general de uso

1. El operador observa una imagen con marca simbólica
2. Ingresa:
   - La secuencia simbólica observada (con o sin comodines), o
   - Un `idPersona` si lo conoce
3. El sistema genera uno o más candidatos
4. Los candidatos se agregan a una **lista acumulativa** (no se sobrescribe)
5. El sistema valida automáticamente contra una API
6. El operador analiza resultados, excluye o aprueba candidatos
7. Se reduce progresivamente el conjunto hasta identificar la persona correcta

## 11. Gestión de la lista de candidatos

- La lista puede crecer sin restricciones artificiales
- Se permiten múltiples generaciones automáticas consecutivas
- La limpieza de la lista es **manual e intencional**
- Se pueden eliminar:
  - Candidatos individuales
  - Grupos completos por estado (ej. todos los no encontrados)
    El sistema debe soportar volúmenes de **100 a 1000 candidatos** sin degradación funcional.

## 12. Integración con APIs

Existen (o existirán) dos endpoints:

1. **Validación masiva**
   - Recibe uno o más `idPersona`
   - Devuelve si cada uno existe o no
2. **Obtención de información de persona** (posterior)
   - Datos personales
   - Grupos
   - Registro fotográfico
   - Evidencias asociadas
     La validación se ejecuta automáticamente al agregar candidatos.

## 13. Persistencia y alcance temporal

- No existe persistencia en backend
- Toda la información vive **solo mientras el navegador esté abierto**
- Al cerrar la SPA, el estado se pierde
  Esto refuerza el carácter de la herramienta como **instrumento de análisis puntual**.

## 14. Alcance explícitamente excluido

Este proyecto **no incluye**:

- Exportación de datos (podría evaluarse en el futuro)
- Edición del set de símbolos en tiempo real
- Múltiples esquemas de codificación simultáneos
- Automatización de decisiones finales

## 15. Conclusión

La SPA es una herramienta especializada, diseñada con **disciplina técnica y control de contratos**, que permite transformar una marca simbólica visual —potencialmente ambigua— en un proceso sistemático de identificación verificable.
Su valor principal reside en:

- Reducir ambigüedad
- Acelerar identificación
- Mantener coherencia con producción
- Separar hechos del sistema de decisiones humanas
  Este documento representa el **estado definitivo de definición** sobre el cual se continuará la implementación.
