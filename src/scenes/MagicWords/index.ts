import { Text } from "pixi.js";
import { BaseScene } from "../../app/BaseScene";
import { fetchMagicWordsData, loadDialogueAssets } from "./api";
import { DialogueSystem } from "./DialogueSystem";
import { BackButtonSystem } from "../../systems/BackButtonSystem";
import { animate } from "../../utils/animate";

export class MagicWordsScene extends BaseScene {

    async enter(): Promise<void> {
        this.root.alpha = 0;
        const loadingText = this.showLoading();
        await animate(t => {
                this.root.alpha = t;
            }, 500).promise;
        try {
            const data = await fetchMagicWordsData();
            const textures = await loadDialogueAssets(data);
            const system = new DialogueSystem(this.root, data, textures);
            system.resize(this._width, this._height);
            this.systems.push(system);
        } catch (error) {
            this.showError(error instanceof Error ? error.message : "An unknown error occurred while fetching magic words data.");
        } finally {
            loadingText.destroy();
            const backButtonSystem = new BackButtonSystem(this.root, this._sceneManager);
            backButtonSystem.resize(this._width, this._height);
            this.systems.push(backButtonSystem);
        }
    }

    update(_deltaMs: number): void {
        super.update(_deltaMs);
    }

    resize(_width: number, _height: number): void {
        super.resize(_width, _height);
    }

    async exit(): Promise<void> {
        await animate(t => {
            this.root.alpha = 1 - t;
        }, 500).promise;
    }

    destroy(): void {
        super.destroy();
    }

    private showError(message: string): void {
        const errorText = new Text({
            text: message,
            style: {
                fill: "red",
                fontSize: 24,
                fontWeight: "bold",
                align: "center",
            },
        });
        errorText.anchor.set(0.5);
        errorText.position.set(this._width / 2, this._height / 2);
        this.root.addChild(errorText);
    }

    private showLoading(): Text {
        const loadingText = new Text({
            text: "Loading...",
            style: {
                fill: 0x999999,
                fontSize: 24,
            },
        });
        loadingText.anchor.set(0.5);
        loadingText.position.set(this._width / 2, this._height / 2);
        this.root.addChild(loadingText);
        return loadingText;
    }
}