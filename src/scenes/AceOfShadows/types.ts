import type { Point, Sprite, Texture, RenderTexture } from "pixi.js";

export type Stack = {
    cards: Sprite[];
    position: Point;
}

export type CardTween = {
    sprite: Sprite;
    start: Point;
    end: Point;
    startRotation: number;
    endRotation: number;
    elapsed: number;
    duration: number;
    arrivalTexture: Texture;
    flipped: boolean;
    onComplete: () => void;
}

export type CardTextures = {
    back: RenderTexture;
    fronts: RenderTexture[];
}

export type CardState = 'fan_out' | 'dealing' | 'returning';