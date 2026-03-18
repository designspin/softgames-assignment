import { Container, Text, Sprite, Assets, Texture } from "pixi.js";
import { BaseScene } from "../app/BaseScene";
import { SceneManager } from "../app/SceneManager";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { designConfig } from "../app/designConfig";
import { animate } from "../utils/animate";
import { AceOfShadowsScene } from "./AceOfShadows";
import { MagicWordsScene } from "./MagicWords";
import { PhoenixFlameScene } from "./PhoenixFlame";
import logoUrl from "../assets/softgames_logo.png";

export class MenuScene extends BaseScene {
    private _title!: Sprite;
    private _logoNaturalWidth: number = 0;
    private _subtitle!: Text;

    private _panel!: Panel;
    private _buttonsRoot!: Container;

    private _aceButton!: Button;
    private _magicButton!: Button;
    private _flameButton!: Button;

    constructor(sceneManager: SceneManager) {
        super(sceneManager);
        this.root.alpha = 0;
    }

    async enter(): Promise<void> {
        const logoTexture = await Assets.load(logoUrl);
        this.build(logoTexture);
        this.resize(this._width, this._height);
        await animate(t => {
            this.root.alpha = t;
        }, 500).promise;
    }

    update(_deltaMs: number): void {}

    resize(width: number, height: number): void {
        super.resize(width, height);
        if(!this._panel) return;
        const { button, panel } = designConfig.ui;
        const buttonCount = 3;

        const panelWidth = Math.min(420, width - 40);

        const panelHeight = buttonCount * button.height
            + (buttonCount - 1) * button.spacing
            + panel.padding * 2;

        const totalHeight = this._title. height + 12
            + this._subtitle.height + 40
            + panelHeight;
        
        const startY = (height - totalHeight) * 0.5;

        this._title.anchor.set(0.5, 0);
        this._title.x = width * 0.5;
        this._title.y = startY;
        this._title.scale.set(panelWidth / this._logoNaturalWidth);

        this._subtitle.anchor.set(0.5, 0);
        this._subtitle.x = width * 0.5;
        this._subtitle.y = this._title.y + this._subtitle.height + 65;

        this._panel.setSize(panelWidth, panelHeight);
        this._panel.x = (width - panelWidth) * 0.5;
        this._panel.y = this._subtitle.y + this._subtitle.height + 40;

        const buttons = [this._aceButton, this._magicButton, this._flameButton];
        const buttonWidth = this._panel.innerWidth;
        const buttonHeight = 64;
        const spacing = 18;

        buttons.forEach((button, index) => {
            button.setSize(buttonWidth, buttonHeight);
            button.x = buttonWidth * 0.5;
            button.y = index * (buttonHeight + spacing) + buttonHeight * 0.5;
        });

        this._buttonsRoot.x = 0;
        this._buttonsRoot.y = 0;
    }

    async exit(): Promise<void> {
        await animate(t => {
            this.root.alpha = 1 - t;
        }, 500).promise;
    }

    destroy(): void {
        super.destroy();
    }

    private build(logoTexture: Texture): void {
        this._title = new Sprite(logoTexture);
        this._logoNaturalWidth = this._title.texture.width;

        this._subtitle = new Text({
            text: "Demo by Jason Foster",
            style: {
                fontSize: 20,
                fill: 0x666666,
            },
        });

        this._panel = new Panel({
            width: 420,
            height: 320,
            radius: 18,
            background: 0xFECDA5,
            padding: 24,
        });

        this._buttonsRoot = new Container();

        this._aceButton = new Button("Ace of Shadows", () => {
            this._sceneManager.change(new AceOfShadowsScene(this._sceneManager));
        });

        this._magicButton = new Button("Magic Words", () => {
            this._sceneManager.change(new MagicWordsScene(this._sceneManager));
        });

        this._flameButton = new Button("Phoenix Flame", () => {
            this._sceneManager.change(new PhoenixFlameScene(this._sceneManager));
        });

        this._buttonsRoot.addChild(
            this._aceButton,
            this._magicButton,
            this._flameButton
        );

        this._panel.content.addChild(this._buttonsRoot);

        this.root.addChild(
            this._title,
            this._subtitle,
            this._panel
        );
    }
}
