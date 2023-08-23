export class Utils {

  // TODO, take from iro.js?
  static hsv2rgb(h_: number, s_: number, v_: number): number[] {
    const clampround = (num, a, b) => Math.round(Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b)));
    const h = h_ / 60;
    const s = s_ / 100;
    const v = v_ / 100;
    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const r = [v, q, p, p, t, v][mod];
    const g = [t, v, v, q, p, p][mod];
    const b = [p, p, t, v, v, q][mod];
    return [
      clampround(r * 255, 0, 255),
      clampround(g * 255, 0, 255),
      clampround(b * 255, 0, 255)
    ];
  }
}