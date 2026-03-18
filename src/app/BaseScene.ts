import { Container } from "pixi.js";
import type { Scene } from "./Scene";
import type { System } from "./System";
import { SceneManager } from "./SceneManager";

/**
 * Abstract base class for all scenes.
 * Manages a list of {@link System} instances and delegates `update`, `resize`,
 * and `destroy` to each one. Concrete scenes override `enter` and `exit` to
 * run their own animations, and push systems into `this.systems` during `enter`.
 */
export abstract class BaseScene implements Scene {
    public readonly root = new Container();
    protected _width: number = 0;
    protected _height: number = 0;
    protected readonly _sceneManager: SceneManager;
    /** Active systems owned by this scene. Push into this array during `enter`. */
    protected systems: System[] = [];

    /** @param sceneManager - The application's SceneManager, passed down for back-navigation. */
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