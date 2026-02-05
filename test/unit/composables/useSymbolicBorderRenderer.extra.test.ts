import { describe, it, expect, beforeEach } from 'vitest';
import { useSymbolicBorderRenderer } from '@/composables/useSymbolicBorderRenderer';

describe('useSymbolicBorderRenderer - edge cases', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  it('works without ResizeObserver available', () => {
    const originalRO = (globalThis as any).ResizeObserver;
    try {
      delete (globalThis as any).ResizeObserver;
      const { renderBorder } = useSymbolicBorderRenderer();
      const r = renderBorder(element, { number: '42' });

      const svg = element.querySelector('svg[data-created-by="symbolic-border"]');
      expect(svg).toBeTruthy();
      // When RO is not available, there should be no _sb_ro property
      expect((svg as any)._sb_ro).toBeUndefined();

      r.destroy();
    } finally {
      (globalThis as any).ResizeObserver = originalRO;
    }
  });

  it('does not attach duplicate window handlers when called twice', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');

    const { renderBorder } = useSymbolicBorderRenderer();
    const r1 = renderBorder(element, { number: '1' });
    const r2 = renderBorder(element, { number: '2' });

    // Should have attached handlers only once for resize and orientationchange
    const resizeCalls = addSpy.mock.calls.filter((c) => c[0] === 'resize');
    const orientationCalls = addSpy.mock.calls.filter((c) => c[0] === 'orientationchange');

    expect(resizeCalls.length).toBeGreaterThanOrEqual(1);
    expect(orientationCalls.length).toBeGreaterThanOrEqual(1);

    // Clean up
    r1.destroy();
    r2.destroy();
    addSpy.mockRestore();
  });
});