import { Container, Texture, Sprite, Text, Graphics } from "pixi.js";
import type { ProcessedData, ProcessedDialogueLine } from "./api";
import type { System } from "../../app/System";
import { lerp } from "../../utils/math";
import { animate } from "../../utils/animate";

const AVATAR_SIZE = 48;
const BUBBLE_PADDING = 10;
const BUBBLE_GAP = 14;
const LINE_HEIGHT = 22;
const EMOJI_SIZE = 18;
const REVEAL_INTERVAL = 1500;
const TOP_OFFSET = 100;

export class DialogueSystem implements System {
    private readonly _stage: Container;
    private readonly _textures: Map<string, Texture>;
    private _height: number = 0;
    private _width: number = 0;
    private _scroll: Container;
    private _bubbles: Container[] = [];
    private _bubbleOffsets: number[] = [];
    private _data: ProcessedData;
    private _currentLine: number = 0;
    private _lineTimer: number = 0;
    private _scrollTargetY: number = 0;
    private _resizeTimer: number = 0;
    private _pendingWidth: number = 0;

    constructor(stage: Container, data: ProcessedData, textures: Map<string, Texture>) {
        this._stage = stage;
        this._textures = textures;
        this._data = data;
        this._scroll = new Container();
        this._stage.addChild(this._scroll);
    }

    update(_deltaMs: number): void {
        this._lineTimer += _deltaMs;

        if(this._lineTimer > REVEAL_INTERVAL && this._currentLine < this._bubbles.length) {
            const bubble = this._bubbles[this._currentLine];
            animate(t => {
                bubble.alpha = t;
            }, 300).promise;
            this._scrollTargetY = Math.min(0, this._height * 0.8 - this._bubbleOffsets[this._currentLine]);
            this._currentLine++;
            this._lineTimer = 0;
        }

        this._scroll.y = lerp(this._scroll.y, this._scrollTargetY, 0.1);

        if(this._resizeTimer > 0) {
            this._resizeTimer -= _deltaMs;
            if(this._resizeTimer <= 0) {
                this._width = this._pendingWidth;    
                const revealedCount = this._currentLine;
                this._scroll.removeChildren();
                this._bubbles = [];
                this._bubbleOffsets = [];
                this._currentLine = 0;
                this.buildBubbles(this._width);
                for(let i = 0; i < revealedCount; i++) this._bubbles[i].alpha = 1;
                this._currentLine = revealedCount;
            }
        }
    }

    resize(width: number, height: number): void {
        this._height = height;
        if(this._bubbles.length === 0) {
            this._width = width;
            this.buildBubbles(width);
        } else if(width !== this._width) {
            this._pendingWidth = width;
            this._resizeTimer = 300;
        }
        if(this._currentLine > 0)
            this._scrollTargetY = Math.min(0, this._height * 0.8 - this._bubbleOffsets[this._currentLine - 1]);
    }


    destroy(): void {
        this._scroll.destroy({ children: true });
    }

    private buildBubbles(width: number): void {
        const layoutWidth = Math.min(width, 600);
        const layoutOffsetX = (width - layoutWidth) * 0.5;
        const maxContentWidth = layoutWidth * 0.55;
        let totalY = TOP_OFFSET;

        for(let line of this._data.lines) {
            const bubble = new Container();

            if(line.avatar !== null) {
                const texture = this._textures.get(line.avatar.url);
                if(texture) {
                    const avatar = new Sprite(texture);
                    avatar.width = avatar.height = AVATAR_SIZE;
                    avatar.x = line.position === 'left' ? 0 : layoutWidth - AVATAR_SIZE;
                    bubble.addChild(avatar);
                }
            }

            const nameLabel = new Text({
                text: line.name,
                style: {
                    fontSize: 11,
                    fill: 0x888888
                }
            });
            nameLabel.x = 0;
            bubble.addChild(nameLabel);

            const content = new Container()
            const contentHeight = this.buildInlineContent(content, line.tokens, maxContentWidth)
            content.y = nameLabel.height + 4 + BUBBLE_PADDING

            const bg = new Graphics()
                .roundRect(0, 0, maxContentWidth + BUBBLE_PADDING*2, contentHeight + BUBBLE_PADDING*2, 10)
                .fill(line.position === 'left' ? 0xe8e8e8 : 0x0084ff)
                bg.y = nameLabel.height + 4

            const bubbleX = line.position === 'left'
                ? AVATAR_SIZE + 6
                : layoutWidth - AVATAR_SIZE - 6 - maxContentWidth - BUBBLE_PADDING * 2
            bg.x = bubbleX
            content.x = bubbleX + BUBBLE_PADDING
            nameLabel.x = bubbleX

            bubble.addChild(bg, content, nameLabel);
            bubble.alpha = 0;
            bubble.y = totalY;

            this._scroll.addChild(bubble);
            this._bubbles.push(bubble);

            totalY += bg.y + bg.height + BUBBLE_GAP;
            this._bubbleOffsets.push(totalY);
        }
        this._scroll.x = layoutOffsetX;
    }

    private buildInlineContent(container: Container, tokens: ProcessedDialogueLine['tokens'], maxWidth: number): number {
        let cursorX = 0, cursorY = 0;

        for(let token of tokens) {
            if(token.type === 'text') {
                const words = token.content.split(' ');
                for(let word of words) {
                    const text = new Text({
                        text: word + ' ',
                        style: {
                            fontSize: 14,
                            fill: 0x1a1a1a
                        }
                    });
                    if(cursorX + text.width > maxWidth && cursorX > 0) {
                        cursorX = 0;
                        cursorY += LINE_HEIGHT;
                    }
                    text.position.set(cursorX, cursorY);
                    container.addChild(text);
                    cursorX += text.width;
                }
            }

            if(token.type === 'emoji') {
                const texture = this._textures.get(token.url);
                if(texture) {
                    if(cursorX + EMOJI_SIZE > maxWidth && cursorX > 0) {
                        cursorX = 0;
                        cursorY += LINE_HEIGHT;
                    }
                    const emoji = new Sprite(texture);
                    emoji.width = emoji.height = EMOJI_SIZE;
                    emoji.position.set(cursorX, cursorY + (LINE_HEIGHT - EMOJI_SIZE) / 2);
                    container.addChild(emoji);
                    cursorX += EMOJI_SIZE;
                }
            }
        }

        return cursorY + LINE_HEIGHT;
    }
}