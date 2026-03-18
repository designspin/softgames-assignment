import type { Container } from "pixi.js";

/**
 * Top-level view interface. Each screen in the application implements Scene.
 * Lifecycle: `enter` → `update` (each frame) → `exit` → `destroy`.
 */
export interface Scene {
    /** The PixiJS container that holds all display objects for this scene. */
    root: Container;

    /**
     * Optional background colour (hex number, e.g. `0x35654d`).
     * `SceneManager` lerps the renderer background to this value during transitions.
     */
    readonly backgroundColor?: number;

    /**
     * Called once after the scene's root has been added to the stage.
     * Run entrance animations here; `SceneManager` awaits the returned promise.
     */
    enter(): Promise<void>;

    /**
     * Called every frame by the game loop.
     * @param deltaMs - Elapsed time since the last frame in milliseconds.
     */
    update(deltaMs: number): void;

    /**
     * Called whenever the renderer dimensions change.
     * @param width - New renderer width in pixels.
     * @param height - New renderer height in pixels.
     */
    resize(width: number, height: number): void;

    /**
     * Called when the scene is being replaced by another.
     * Run exit animations here; `SceneManager` awaits the returned promise.
     */
    exit(): Promise<void>;

    /**
     * Called after `exit()` resolves and the root has been removed from the stage.
     * Release all resources (textures, listeners, systems) here.
     */
    destroy(): void;
}