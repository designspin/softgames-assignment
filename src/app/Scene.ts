import type { Container } from "pixi.js";

export interface Scene {
    root: Container;
    readonly backgroundColor?: number;
    enter(): Promise<void>;
    update(deltaMs: number): void;
    resize(width: number, height: number): void;
    exit(): Promise<void>;
    destroy(): void;
}