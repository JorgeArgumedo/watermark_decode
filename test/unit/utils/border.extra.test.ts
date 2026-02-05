import { describe, it, expect } from 'vitest';
import { parsePixels, formatCoordinate, buildSidePath } from '@/utils/border';

describe('border utility - parsePixels and formatCoordinate', () => {
  it('parsePixels extracts numeric value from px string', () => {
    expect(parsePixels('16px', 13)).toBe(16);
    expect(parsePixels('0px', 13)).toBe(0);
    expect(parsePixels('100px', 13)).toBe(100);
  });

  it('parsePixels returns fallback for invalid input', () => {
    expect(parsePixels('invalid', 13)).toBe(13);
    expect(parsePixels('', 13)).toBe(13);
    expect(parsePixels(null as any, 13)).toBe(13);
  });

  it('formatCoordinate returns string representation', () => {
    expect(formatCoordinate(10)).toBe('10.00');
    expect(formatCoordinate(10.5)).toBe('10.50');
  });

  it('buildSidePath builds path for partial sides', () => {
    const pathStr = buildSidePath(0, 0, 100, 100, 10, ['left', 'top']);
    expect(pathStr).toBeTruthy();
    expect(typeof pathStr).toBe('string');
    expect(pathStr.length).toBeGreaterThan(0);
  });
});