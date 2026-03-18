/**
 * Isolated unit of logic that lives inside a {@link Scene}.
 * A scene owns an array of systems and delegates its own `update`, `resize`,
 * and `destroy` calls down to each one.
 */
export interface System {
    /**
     * Called every frame by the owning scene.
     * @param deltaMs - Elapsed time since the last frame in milliseconds.
     */
    update(deltaMs: number): void;

    /**
     * Called whenever the renderer dimensions change.
     * @param width - New renderer width in pixels.
     * @param height - New renderer height in pixels.
     */
    resize(width: number, height: number): void;

    /** Release all resources held by this system. */
    destroy(): void;
}