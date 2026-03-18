export interface System {
    update(deltaMs: number): void;
    resize(width: number, height: number): void;
    destroy(): void;
}