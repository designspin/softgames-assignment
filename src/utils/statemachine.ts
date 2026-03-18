type StateConfig = {
    onEnter?: () => void;
    onExit?: () => void;
    update?: (deltaMs: number) => void;
};

export class StateMachine<T extends string> {
    private _state: T;
    private _handlers: Partial<Record<T, StateConfig>> = {};

    constructor(initialState: T) {
        this._state = initialState;
    }

    get state(): T {
        return this._state;
    }

    on(state: T, config: StateConfig): this {
        this._handlers[state] = config;
        return this;
    }

    switchTo(newState: T): void {
        this._handlers[this._state]?.onExit?.();
        this._state = newState;
        this._handlers[this._state]?.onEnter?.();
    }

    update(deltaMs: number): void {
        this._handlers[this._state]?.update?.(deltaMs);
    }
}