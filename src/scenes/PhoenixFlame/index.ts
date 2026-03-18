import { BaseScene } from "../../app/BaseScene";
import { BackButtonSystem } from "../../systems/BackButtonSystem";
import { animate } from "../../utils/animate";
import { ParticlesSystem } from "./ParticleSystem";
import { createParticleTexture } from "./ParticleTextureFactory";

export class PhoenixFlameScene extends BaseScene {
    readonly backgroundColor = 0x000000;
    async enter(): Promise<void> {
        this.root.alpha = 0;
        const texture = createParticleTexture(this._sceneManager.renderer);
        const particleSystem = new ParticlesSystem(this.root, texture);
        const backButtonSystem = new BackButtonSystem(this.root, this._sceneManager);
        backButtonSystem.resize(this._width, this._height);
        particleSystem.resize(this._width, this._height);
        this.systems.push(particleSystem);
        this.systems.push(backButtonSystem);
        await animate(t => {
            this.root.alpha = t;
        }, 500).promise;
    }

    update(deltaMs: number): void {
        super.update(deltaMs);
    }

    resize(width: number, height: number): void {
        super.resize(width, height);
    }

    async exit(): Promise<void> {
        await animate(t => {
            this.root.alpha = 1 - t;
        }, 500).promise;
    }

    destroy(): void {
        super.destroy();
    }
}