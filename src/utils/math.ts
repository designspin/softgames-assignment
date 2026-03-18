export const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const lerpColor = (colorA: number, colorB: number, t: number) => {
    const r = lerp((colorA >> 16) & 0xFF, (colorB >> 16) & 0xFF, t);
    const g = lerp((colorA >> 8) & 0xFF, (colorB >> 8) & 0xFF, t);
    const b = lerp(colorA & 0xFF, colorB & 0xFF, t);
    return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b);
}