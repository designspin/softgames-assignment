import type { System } from "../../app/System";
import { Point, Sprite, type Container } from "pixi.js";
import { easeInOutQuad } from "../../utils/easing";
import { clamp, lerp } from "../../utils/math";
import { DEAL_INTERVAL, DEAL_DURATION, DEALER_RADIUS, ARC_HEIGHT, STACK_OFFSET_Y, PLAYER_COUNT, TOTAL_CARDS, FAN_OUT_DURATION } from "./constants";
import type { Stack, CardTween, CardTextures, CardState } from "./types";
import { StateMachine } from "../../utils/statemachine";

export class CardSystem implements System {
    private readonly _stage: Container;
    private _started: boolean = false;
    private _sm: StateMachine<CardState>;
    private _stacks: Stack[] = [];
    private _tweens: CardTween[] = [];
    private _dealTimer: number = 0;
    private _nextPlayer: number = 0;
    private readonly _textures: CardTextures;
    private _cardMap: Map<Sprite, number> = new Map();

    constructor(stage: Container, cardTextures: CardTextures) {
        this._textures = cardTextures
        this._stage = stage;

        for(let i = 0; i < PLAYER_COUNT + 1; i++) {
            const stack: Stack = {
                cards: [],
                position: new Point(0,0)
            };
            this._stacks.push(stack);
        }

        for(let i = 0; i < TOTAL_CARDS; i++) {
            const card = new Sprite(this._textures.back);
            card.anchor.set(0.5, 0.5);
            this._stage.addChild(card);
            this._stacks[0].cards.push(card);
            this._cardMap.set(card, i);
        }

        this._sm = this.setupStateMachine();
    }

    update(_deltaMs: number): void {
        this._sm.update(_deltaMs);
        
        for(let tween of this._tweens) {
            tween.elapsed += _deltaMs;
            const t = clamp(tween.elapsed / tween.duration, 0, 1);
            const eased = easeInOutQuad(t);
            tween.sprite.x = lerp(tween.start.x, tween.end.x, eased);
            tween.sprite.y = lerp(tween.start.y, tween.end.y, eased) - Math.sin(Math.PI * t) * ARC_HEIGHT;
            tween.sprite.rotation = lerp(tween.startRotation, tween.endRotation, eased);
            if(!tween.flipped && t > 0.5) {
                tween.sprite.texture = tween.arrivalTexture;
                tween.flipped = true;
            }
            if (t >= 1) tween.onComplete();
        }

        this._tweens = this._tweens.filter(tween => tween.elapsed < tween.duration);
    }

    resize(width: number, height: number): void {
        this._stacks[0].position.set(width * 0.5, height * 0.20);
        this._stacks[1].position.set(width * 0.2, height * 0.90);
        this._stacks[2].position.set(width * 0.5, height * 0.90);
        this._stacks[3].position.set(width * 0.8, height * 0.90);

        if(!this._started) {
            this._started = true;
            this._sm.switchTo('fan_out');
        } else {
            this.restackSprites(this._stacks[0], true);
            for(let i = 1; i < this._stacks.length; i++) {
                this.restackSprites(this._stacks[i]);
            }
        }
    }

    destroy(): void {
        this._tweens = [];
        for(let stack of this._stacks) {
            for(let card of stack.cards) {
                card.destroy();
            }
            stack.cards = [];
        }
        this._cardMap.clear();
        this._textures.back.destroy(true);
        for(let front of this._textures.fronts) {
            front.destroy(true);
        }
    }

    private restackSprites(stack: Stack, isDealer: boolean = false): void {
        for(let i = 0; i < stack.cards.length; i++) {
            const card = stack.cards[i];
            if(isDealer) {
                const cardIndex = this._cardMap.get(card) ?? i;
                const angle = Math.PI * (1 - cardIndex / (TOTAL_CARDS - 1));
                card.x = stack.position.x + DEALER_RADIUS * Math.cos(angle);
                card.y = stack.position.y + DEALER_RADIUS * Math.sin(angle);
                card.rotation = angle - Math.PI / 2;
            } else {
                card.x = stack.position.x;
                card.y = stack.position.y - i * STACK_OFFSET_Y;
                card.rotation = 0;
            }
        }
    }

    private startFanOut(): void {
        const stack = this._stacks[0];
        const center = stack.position;

        stack.cards.forEach((card, i) => {
            const cardIndex = this._cardMap.get(card) ?? i;
            const angle = Math.PI * (1 - cardIndex / (TOTAL_CARDS - 1));

            this._tweens.push({
                sprite: card,
                start: new Point(center.x, center.y),
                end: new Point(
                    center.x + DEALER_RADIUS * Math.cos(angle),
                    center.y + DEALER_RADIUS * Math.sin(angle)
                ),
                startRotation: 0,
                endRotation: angle - Math.PI / 2,
                elapsed: -i * 5,
                duration: FAN_OUT_DURATION,
                arrivalTexture: this._textures.back,
                flipped: false,
                onComplete: i === stack.cards.length - 1
                    ? () => this._sm.switchTo('dealing')
                    : () => {}
            });

            card.x = center.x;
            card.y = center.y;
            card.rotation = 0;
        });
    }

    private updateDealing(deltaMs: number): void {
        this._dealTimer += deltaMs;
        if(this._dealTimer < DEAL_INTERVAL) return;
        this._dealTimer = 0;

        const source = this._stacks[0];
        if(source.cards.length === 0) {
            this._sm.switchTo('returning');
            this._nextPlayer = 0;
            return;
        }

        const targetIndex = (this._nextPlayer % PLAYER_COUNT) + 1;
        const target = this._stacks[targetIndex];
        this._nextPlayer++;

        const card = source.cards.pop()!;
        target.cards.push(card);
        this._stage.addChild(card);

        const cardIndex = this._cardMap.get(card) ?? 0;
        const dealerAngle = Math.PI * (1 - cardIndex / (TOTAL_CARDS - 1));
        const from = new Point(
            source.position.x + DEALER_RADIUS * Math.cos(dealerAngle),
            source.position.y + DEALER_RADIUS * Math.sin(dealerAngle)
        );
        const to = new Point(
            target.position.x,
            target.position.y - target.cards.length * STACK_OFFSET_Y
        );

        this._tweens.push({
            sprite: card,
            start: from,
            end: to,
            startRotation: card.rotation,
            endRotation: 0,
            elapsed: 0,
            duration: DEAL_DURATION,
            arrivalTexture: this._textures.fronts[cardIndex],
            flipped: false,
            onComplete: () => this.restackSprites(target)
        });

        this.restackSprites(source, true);
    }


    private updateReturning(deltaMs: number): void {
        this._dealTimer += deltaMs;
        if(this._dealTimer < DEAL_INTERVAL) return;
        this._dealTimer = 0;

        const sourceIndex = PLAYER_COUNT - (this._nextPlayer % PLAYER_COUNT);
        const source = this._stacks[sourceIndex];

        if(source.cards.length === 0) {
            this._nextPlayer++;
            if(this._stacks.slice(1).every(s => s.cards.length === 0)) {
                this._sm.switchTo('dealing');
            }
            return;
        }

        const target = this._stacks[0];
        this._nextPlayer++;

        const card = source.cards.pop()!;
        target.cards.push(card);
        this._stage.addChild(card);

        const cardIndex = this._cardMap.get(card) ?? 0;
        const dealerAngle = Math.PI * (1 - cardIndex / (TOTAL_CARDS - 1));
        const from = new Point(
            source.position.x,
            source.position.y - source.cards.length * STACK_OFFSET_Y
        );
        const to = new Point(
            target.position.x + DEALER_RADIUS * Math.cos(dealerAngle),
            target.position.y + DEALER_RADIUS * Math.sin(dealerAngle)
        );

        this._tweens.push({
            sprite: card,
            start: from,
            end: to,
            startRotation: card.rotation,
            endRotation: dealerAngle - Math.PI / 2,
            elapsed: 0,
            duration: DEAL_DURATION,
            arrivalTexture: this._textures.back,
            flipped: false,
            onComplete: () => {}
        });

        this.restackSprites(source);
    }


    private setupStateMachine(): StateMachine<CardState> {
        return new StateMachine<CardState>('fan_out')
            .on('fan_out', {
                onEnter: () => this.startFanOut(),
            })
            .on('dealing', {
                onEnter: () => { this._dealTimer = 0; this._nextPlayer = 0; },
                update: (deltaMs) => this.updateDealing(deltaMs),
            })
            .on('returning', {
                onEnter: () => { this._dealTimer = 0; this._nextPlayer = 0; },
                update: (deltaMs) => this.updateReturning(deltaMs),
            })
    }
}