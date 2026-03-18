import type { Container, Renderer } from "pixi.js";
import type { Scene } from "./Scene";
import { animate } from "../utils/animate";
import { lerpColor } from "../utils/math";

export class SceneManager {
    private _width: number = 0;
    private _height: number = 0;
    private _current?: Scene;
    private _stage: Container;
    private _isSwitchingScene = false;

    public readonly renderer: Renderer;
    
    constructor(stage: Container, renderer: Renderer) {
        this._stage = stage;
        this.renderer = renderer;
    }

    async change(scene: Scene): Promise<void> {
        if(this._isSwitchingScene) return;
        this._isSwitchingScene = true;

        try {
            if(this._current) {
                const fromColor = this.renderer.background.color.toNumber();
                const toColor = scene.backgroundColor ?? 0xFFFFFF;
                
                await Promise.all([
                    this._current.exit(),
                    animate(t => {
                        this.renderer.background.color = lerpColor(fromColor, toColor, t);
                    }, 500).promise
                ]);
                
                this._stage.removeChild(this._current.root);
                this._current.destroy();
            } else {
                this.renderer.background.color = scene.backgroundColor ?? 0xFFFFFF;
            }

            this._current = scene;
            
            this._stage.addChild(this._current.root);
            this._current.resize(this._width, this._height);
            await this._current.enter();
        } finally {
            this._isSwitchingScene = false;
        }
    }

    update(deltaMs: number): void {
        this._current?.update(deltaMs);
    }

    resize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this._current?.resize(width, height);
    }
}