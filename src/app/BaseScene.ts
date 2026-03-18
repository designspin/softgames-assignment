import { Container } from "pixi.js";
import type { Scene } from "./Scene";
import type { System } from "./System";
import { SceneManager } from "./SceneManager";

export abstract class BaseScene implements Scene {
    public readonly root = new Container();
    protected _width: number = 0;
    protected _height: number = 0;
    protected readonly _sceneManager: SceneManager;
    protected systems: System[] = [];

    constructor(sceneManager: SceneManager) {
        this._sceneManager = sceneManager;
    }

    async enter(): Promise<void> {}
    update(deltaMs: number): void {
        for(const system of this.systems) {
            system.update(deltaMs);
        }
    }
    resize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        for(const system of this.systems) {
            system.resize(width, height);
        }
    }
    async exit(): Promise<void> {}
    destroy(): void {
        for(const system of this.systems) {
            system.destroy();
        }
        this.systems = [];
        this.root.destroy({ children: true });
    }
}