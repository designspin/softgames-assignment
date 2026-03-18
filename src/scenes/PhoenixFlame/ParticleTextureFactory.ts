import { Container, Graphics, type Renderer, RenderTexture } from "pixi.js";

export function createParticleTexture(renderer: Renderer): RenderTexture {
    const size = 64;
    const container = new Container();
    const gfx = new Graphics();
    gfx.rect(0, 0, size, size).fill({ color: 0xffffff, alpha: 0.1 });
    gfx.rect(8, 8, size - 16, size - 16).fill({ color: 0xffffff, alpha: 0.3 });
    gfx.rect(16, 16, size - 32, size - 32).fill({ color: 0xffffff, alpha: 0.6 });
    gfx.rect(24, 24, size - 48, size - 48).fill({ color: 0xffffff, alpha: 1 });
    container.addChild(gfx);

    const texture = RenderTexture.create({ width: size, height: size });
    renderer.render({ container, target: texture });
    container.destroy({ children: true });
    return texture;
}