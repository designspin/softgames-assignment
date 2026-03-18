import { Container, Texture, Sprite } from "pixi.js";
import type { System } from "../../app/System";
import { MAX_PARTICLES, START_COLOR, ENDCOLOR } from "./constants";
import type { Particle } from "./types";
import { lerp, lerpColor } from "../../utils/math";

export class ParticlesSystem implements System {
    private readonly _stage: Container;
    private readonly _particles: Particle[] = [];
    private _originX: number = 0;
    private _originY: number = 0;

    constructor(stage: Container, texture: Texture) { 
        this._stage = stage;

        for(let i = 0; i < MAX_PARTICLES; i++) {
            const sprite = new Sprite(texture);
            sprite.anchor.set(0.5);
            sprite.blendMode = 'add';
            this._stage.addChild(sprite);

            const particle: Particle = {
                sprite,
                vx: 0,
                vy: 0,
                life: -i * (1000 / MAX_PARTICLES),
                maxLife: 1,
                startScale: 0,
                endScale: 0
            };
            this._particles.push(particle);
        }
    }

    update(_deltaMs: number): void {
        for(const p of this._particles) {
            p.life -= _deltaMs;
            if(p.life <= 0) {
                this.resetParticle(p);
                continue;
            }
            const t = 1 - p.life / p.maxLife;
            p.sprite.alpha = Math.sin(t * Math.PI);
            p.sprite.x += p.vx;
            p.sprite.y += p.vy;
            p.sprite.scale.set(lerp(p.startScale, p.endScale, t));
            p.sprite.tint = lerpColor(START_COLOR, ENDCOLOR, t);
        }
    }

    resize(width: number, height: number): void {
        this._originX = width * 0.5;
        this._originY = height * 0.5;
    }

    destroy(): void {
        for(const p of this._particles) {
            p.sprite.destroy();
        }
        this._particles.length = 0;
    }

    private resetParticle(p: Particle): void {
        p.sprite.x = this._originX + (Math.random() - 0.5) * 20;
        p.sprite.y = this._originY;
        p.vx = (Math.random() - 0.5) * 1.5;
        p.vy = -(Math.random() * 2 + 1);
        p.maxLife = 400 + Math.random() * 100;
        p.life = p.maxLife;
        p.startScale = 0.6 + Math.random() * 0.6;
        p.endScale = 0.1 + Math.random() * 0.2;
        p.sprite.alpha = 0;
    } 
}