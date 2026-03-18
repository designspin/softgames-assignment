import { describe, it, expect, vi, beforeEach } from "vitest";
import { SceneManager } from "../SceneManager";
import type { Scene } from "../Scene";
import type { Container, Renderer } from "pixi.js";

function createMockScene(): Scene {
    return {
        root: {} as Container,
        enter: vi.fn().mockResolvedValue(undefined),
        update: vi.fn(),
        resize: vi.fn(),
        exit: vi.fn().mockResolvedValue(undefined),
        destroy: vi.fn(),
    };
}

function createMockStage() {
    return {
        addChild: vi.fn(),
        removeChild: vi.fn(),
    } as unknown as Container;
}

function createMockRenderer() {
    let _color = 0xffffff;
    const bg = {
        get color() { return { toNumber: () => _color }; },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set color(v: any) { _color = v; }
    };
    return { background: bg } as unknown as Renderer;
}


vi.mock('../../utils/animate', () => ({
    animate: vi.fn().mockReturnValue({
        promise: Promise.resolve(true),
        stop: vi.fn()
    })
}));

describe("SceneManager", () => {
    let stage: Container;
    let sceneManager: SceneManager;

    beforeEach(() => {
        stage = createMockStage();
        sceneManager = new SceneManager(stage, createMockRenderer());
    });

    it("adds the new scene root to the stage", async () => {
        const scene = createMockScene();

        await sceneManager.change(scene);

        expect(stage.addChild).toHaveBeenCalledWith(scene.root);
    });

    it("calls enter() on the new scene", async () => {
        const scene = createMockScene();

        await sceneManager.change(scene);

        expect(scene.enter).toHaveBeenCalled();
    });

    it("calls exit() on the old scene", async () => {
        const oldScene = createMockScene();
        const newScene = createMockScene();

        await sceneManager.change(oldScene);
        await sceneManager.change(newScene);

        expect(oldScene.exit).toHaveBeenCalled();
    });

    it("removes the outgoing scene root from the stage", async () => {
        const oldScene = createMockScene();
        const newScene = createMockScene();

        await sceneManager.change(oldScene);
        await sceneManager.change(newScene);

        expect(stage.removeChild).toHaveBeenCalledWith(oldScene.root);
    });

    it("calls exit() before destroy() on outgoing scene", async () => {
        const oldScene = createMockScene();
        const newScene = createMockScene();
        const order: string[] = [];

        (oldScene.exit as ReturnType<typeof vi.fn>).mockImplementation(() => {
            order.push('exit');
            return Promise.resolve();
        });
        (oldScene.destroy as ReturnType<typeof vi.fn>).mockImplementation(() => {
            order.push('destroy');
        });

        await sceneManager.change(oldScene);
        await sceneManager.change(newScene);

        expect(order).toEqual(['exit', 'destroy']);
    });

    it("isgnores change() calls whilst a transition is in progress", async () => {
        const oldScene = createMockScene();
        const newScene = createMockScene();

        const firstChangePromise = sceneManager.change(oldScene);
        await sceneManager.change(newScene);
        await firstChangePromise;

        expect(oldScene.enter).toHaveBeenCalled();
        expect(newScene.enter).not.toHaveBeenCalled();
    });
});