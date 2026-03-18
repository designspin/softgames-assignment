import { Container, Text, Graphics } from "pixi.js";
import { animate, type AnimationHandle } from "../utils/animate";

export interface ButtonOptions {
    width: number;
    height: number;
    radius: number;
    text: number;
    background: number;
}

export class Button extends Container {
    private readonly _bg: Graphics;
    private readonly _label: Text;

    private _width: number;
    private _height: number;
    private _radius: number;
    private _text: number;
    private _background: number;
    private _animHandle: AnimationHandle | null = null;

    constructor(text: string, onClick: () => void, opts?: Partial<ButtonOptions>) {
        super();

        this._width = opts?.width ?? 200;
        this._height = opts?.height ?? 64;
        this._radius = opts?.radius ?? 12;
        this._text = opts?.text ?? 0xffffff;
        this._background = opts?.background ?? 0x38117E;


        this._bg = new Graphics();

        this._label = new Text({
            text,
            style: {
                fontSize: 24,
                fill: this._text,
                fontWeight: "600",
            }
        });

        this.addChild(this._bg, this._label);

        this.eventMode = "static";
        this.cursor = "pointer";

        this.on("pointertap", onClick);

        this.on("pointerover", () => { 
            this._animHandle?.stop();
            this._animHandle = animate(t => {
                const scale = 1 + 0.05 * t;
                this.scale.set(scale);
            }, 200);
        });

        this.on("pointerout", () => {
            this._animHandle?.stop();
            this._animHandle = animate(t => {
                const scale = 1.05 - 0.05 * t;
                this.scale.set(scale);
            }, 200);
        });
        
        this.redraw();
    }

    set label(value: string) {
        this._label.text = value;
    }

    setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this.redraw();
    }

    private redraw(): void {
        this._bg.clear()
            .roundRect(0, 0, this._width, this._height, this._radius)
            .fill(this._background);

        this.pivot.set(this._width * 0.5, this._height * 0.5);

        this._label.anchor.set(0.5);
        this._label.x = this._width * 0.5;
        this._label.y = this._height * 0.5;
    }
}