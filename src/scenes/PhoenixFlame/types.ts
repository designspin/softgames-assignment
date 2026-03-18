import type { Sprite } from "pixi.js";

export type Particle = {
    sprite: Sprite;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    startScale: number;
    endScale: number;
}