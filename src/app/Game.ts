import { Application, Text } from "pixi.js";
import { SceneManager } from "./SceneManager";
import { designConfig } from "./designConfig";
import { MenuScene } from "../scenes/MenuScene";
import { Button } from "../ui/Button";

export class Game {
    private readonly _app: Application;
    private readonly _sceneManager: SceneManager;
    private _fullscreenButton: Button | null = null;
    private _fpsCounter: Text;
    private _fpsUpdateTimer = 0;

    private constructor(app: Application, sceneManager: SceneManager) {
        this._app = app;
        this._sceneManager = sceneManager;

        this._fpsCounter = new Text({
            text: "FPS: 0",
            style: {
                fontSize: 16,
                fill: 0x444444
            }
        });

        this._fpsCounter.position.set(10, 10);
        this._fpsCounter.zIndex = 9999;
        app.stage.addChild(this._fpsCounter);

        if (document.fullscreenEnabled) {
            this._fullscreenButton = new Button('⛶', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen?.();
                } else {
                    document.exitFullscreen?.();
                }
            }, { background: 0x444444 });
            this._fullscreenButton.setSize(48, 48);
            app.stage.addChild(this._fullscreenButton);

            document.addEventListener('fullscreenchange', () => {
                this._fullscreenButton!.label = document.fullscreenElement ? '✕' : '⛶';
                this.resize();
            });
        }

        app.ticker.add((ticker) => {
            sceneManager.update(ticker.deltaMS);
            this._fpsUpdateTimer += ticker.deltaMS;
            if(this._fpsUpdateTimer < 500) return;
            this._fpsUpdateTimer = 0;
            this._fpsCounter.text = `FPS: ${ticker.FPS.toFixed(0)}`;
        });
    }

    static async create(): Promise<Game> {
        const app = new Application();

        await app.init({
            resolution: Math.max(window.devicePixelRatio, 2),
            backgroundColor: 0xffffff,
        });

        

        document.body.appendChild(app.canvas);

        const sceneManager = new SceneManager(app.stage, app.renderer);

        const game = new Game(app, sceneManager);
        
        window.addEventListener("resize", () => game.resize());

        sceneManager.change(new MenuScene(sceneManager));
        game.resize();

        return game;
    }

    private resize(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const minWidth = designConfig.content.width;
        const minHeight = designConfig.content.height;
    
        const scaleX = windowWidth < minWidth ? minWidth / windowWidth : 1;
        const scaleY = windowHeight < minHeight ? minHeight / windowHeight : 1;
        const scale = scaleX > scaleY ? scaleX : scaleY;
        const width = windowWidth * scale;
        const height = windowHeight * scale;
    
        this._app.renderer.canvas.style.width = `${windowWidth}px`;
        this._app.renderer.canvas.style.height = `${windowHeight}px`;
        window.scrollTo(0,0);

        if (this._fullscreenButton) {
            this._fullscreenButton.x = width - 40;
            this._fullscreenButton.y = 40;
        }

    
        this._app.renderer.resize(width, height);
        this._sceneManager.resize(width, height);
    }
}