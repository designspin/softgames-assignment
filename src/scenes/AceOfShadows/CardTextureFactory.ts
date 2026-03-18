import { Container, RenderTexture, type Renderer, Graphics, Text } from "pixi.js";
import { CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS } from "./constants";
import type { CardTextures } from "./types";




export function createCardTextures(renderer: Renderer): CardTextures {

    const back = createBack(renderer);
    const fronts = Array.from({ length: 144 }, (_, i) =>
        createFront(renderer, String(i + 1))
    );

    return { back, fronts };
}

function createBack(renderer: Renderer): RenderTexture {
    const container = new Container();

    const bg = new Graphics()
        .roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
        .fill(0xf5f0e8);
    
    const border = new Graphics()
        .roundRect(4,4, CARD_WIDTH - 8, CARD_HEIGHT - 8, CARD_RADIUS - 2)
        .stroke({ color: 0xc41e3a, width: 2});

    const pattern = new Graphics();
    for(let row = 0; row < 8; row++) {
        const cols = row % 2 === 0 ? 6 : 5;
        for(let col = 0; col < cols; col++) {
            const x = 8 + col * 12 + (row % 2 === 0 ? 0 : 6);
            const y = 8 + row * 12;
            pattern.rect(x, y, 4, 4).fill(0xd4192e);
        }
    }


    container.addChild(bg, pattern, border);

    const texture = RenderTexture.create({ width: CARD_WIDTH, height: CARD_HEIGHT });
    renderer.render({ container, target: texture });
    container.destroy({ children: true });
    return texture;
}

function createFront(renderer: Renderer, value: string): RenderTexture {
    const container = new Container();

    const bg = new Graphics()
        .roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS)
        .fill(0xfaf8f0);

    const border = new Graphics()
        .roundRect(4,4, CARD_WIDTH - 8, CARD_HEIGHT - 8, CARD_RADIUS - 2)
        .stroke({ color: 0xe0d8c0, width: 2});

    const topLabel = new Text({ text: value, style: { fontSize: 12, fill: 0x1a1a2e, fontWeight: '700' } });
    topLabel.x = 6;
    topLabel.y = 5;

    const bottomLabel = new Text({ text: value, style: { fontSize: 12, fill: 0x1a1a2e, fontWeight: '700' } });
    bottomLabel.anchor.set(0, 0);
    bottomLabel.rotation = Math.PI;
    bottomLabel.x = CARD_WIDTH - 6;
    bottomLabel.y = CARD_HEIGHT - 5;

    const spot = new Graphics()
    const spotSize = Math.min(CARD_WIDTH, CARD_HEIGHT) * 0.25;
    spot.circle(CARD_WIDTH * 0.5, CARD_HEIGHT * 0.5, spotSize).fill(0xc41e3a);

    container.addChild(bg, spot, topLabel, bottomLabel, border);

    const texture = RenderTexture.create({ width: CARD_WIDTH, height: CARD_HEIGHT });
    renderer.render({ container, target: texture });
    container.destroy({ children: true });
    return texture;
}

