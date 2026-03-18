import type { Container, Renderer } from "pixi.js";
import type { Scene } from "./Scene";
import { animate } from "../utils/animate";
import { lerpColor } from "../utils/math";

/**
 * Manages the active {@link Scene} and handles transitions between scenes.
 *
 * Transition sequence when replacing scene A with scene B:
 * 1. `A.exit()` and a background-colour lerp run concurrently.
 * 2. A's root is removed from the stage and `A.destroy()` is called.
 * 3. B's root is added to the stage, `B.resize()` is called, then `B.enter()`.
 *
 * Calls to `change()` that arrive while a transition is in progress are ignored.
 */
export class SceneManager {
    private _width: number = 0;
    private _height: number = 0;
    private _current?: Scene;
    private _stage: Container;
    private _isSwitchingScene = false;

    /** The PixiJS renderer — exposed so scenes can create textures at runtime. */
    public readonly renderer: Renderer;

    /**
     * @param stage - The root PixiJS container. Scene roots are added/removed here.
     * @param renderer - The PixiJS renderer, used for background colour transitions.
     */
    constructor(stage: Container, renderer: Renderer) {
        this._stage = stage;
        this.renderer = renderer;
    }

    /**
     * Transition to a new scene.
     * If a transition is already in progress this call is a no-op.
     *
     * @param scene - The scene to transition to.
     */
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

    /**
     * Forward a frame tick to the active scene.
     * @param deltaMs - Elapsed time since the last frame in milliseconds.
     */
    update(deltaMs: number): void {
        this._current?.update(deltaMs);
    }

    /**
     * Notify the active scene of a renderer resize.
     * The dimensions are also stored so they can be passed to the next scene on entry.
     * @param width - New renderer width in pixels.
     * @param height - New renderer height in pixels.
     */
    resize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this._current?.resize(width, height);
    }
}