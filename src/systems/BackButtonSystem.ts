import type { System } from "../app/System";
import type { SceneManager } from "../app/SceneManager";
import type { Container } from "pixi.js";
import { Button } from "../ui/Button";
import { MenuScene } from "../scenes/MenuScene";

export class BackButtonSystem implements System {
    private readonly _button: Button;

    constructor(stage: Container, sceneManager: SceneManager) {
        this._button = new Button("← Menu", () => {
            sceneManager.change(new MenuScene(sceneManager));
        }, { background: 0x444444 });
        this._button.setSize(120, 48);
        stage.addChild(this._button);
    }

    update(_deltaMs: number): void {}

    resize(width: number, _height: number): void {
        const offset = document.fullscreenEnabled ? 140 : 80;
        this._button.x = width - offset;
        this._button.y = 40;
    }

    destroy(): void {
        this._button.destroy();
    }
}
