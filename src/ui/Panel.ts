import { Container, Graphics } from "pixi.js";

export interface PanelOptions {
    width: number;
    height: number;
    radius?: number;
    background?: number;
    padding?: number;
}

export class Panel extends Container {

    private readonly _bg: Graphics;
    readonly content: Container;
    private readonly _padding: number;
    private readonly _radius: number;
    private readonly _background: number;
    private _width: number;
    private _height: number;

    constructor(opts: PanelOptions) {
        super();

        
        this._width = opts.width;
        this._height = opts.height;
        this._radius = opts.radius ?? 16;
        this._background = opts.background ?? 0xffffff;
        this._padding = opts.padding ?? 16;

        this._bg = new Graphics()        
        this.content = new Container();
        
        this.addChild(this._bg, this.content);

        this.redraw();
    }

    setSize(width: number, height: number): void {
        this._width = width;
        this._height = height;
        this.redraw();
    }

    get innerWidth(): number {
        return this._width - this._padding * 2;
    }

    get innerHeight(): number {
        return this._height - this._padding * 2;
    }

    private redraw(): void {
        this._bg.clear()
            .roundRect(0, 0, this._width, this._height, this._radius)
            .fill(this._background);

        this.content.x = this._padding;
        this.content.y = this._padding;
    }
}