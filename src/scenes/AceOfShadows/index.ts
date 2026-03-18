import { BaseScene } from "../../app/BaseScene";
import { BackButtonSystem } from "../../systems/BackButtonSystem";
import { animate } from "../../utils/animate";
import { CardSystem } from "./CardSystem";
import { createCardTextures } from "./CardTextureFactory";

export class AceOfShadowsScene extends BaseScene {
    readonly backgroundColor = 0x35654d;

    async enter(): Promise<void> {
        this.root.alpha = 0;
        const cardTextures = createCardTextures(this._sceneManager.renderer);
        const cardSystem = new CardSystem(this.root, cardTextures);
        const backButtonSystem = new BackButtonSystem(this.root, this._sceneManager);
        backButtonSystem.resize(this._width, this._height);
        cardSystem.resize(this._width, this._height);
        this.systems.push(cardSystem);
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