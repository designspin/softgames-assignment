/** Lifecycle hooks for a single named state. */
type StateConfig = {
    /** Invoked immediately after this state becomes active. */
    onEnter?: () => void;
    /** Invoked immediately before this state is left. */
    onExit?: () => void;
    /**
     * Called every frame while this state is active.
     * @param deltaMs - Elapsed time since the last frame in milliseconds.
     */
    update?: (deltaMs: number) => void;
};

/**
 * Lightweight generic state machine.
 *
 * @typeParam T - Union of string literal state names, e.g. `'idle' | 'running'`.
 *
 * @example
 * ```ts
 * type MyState = 'idle' | 'running';
 * const sm = new StateMachine<MyState>('idle');
 * sm.on('idle',    { onEnter: () => console.log('idle') })
 *   .on('running', { update: dt => move(dt) });
 * sm.switchTo('running');
 * sm.update(16);
 * ```
 */
export class StateMachine<T extends string> {
    private _state: T;
    private _handlers: Partial<Record<T, StateConfig>> = {};

    /**
     * @param initialState - The state the machine starts in.
     *   Note: `onEnter` is **not** called for the initial state.
     *   Call `switchTo(initialState)` explicitly if you need that behaviour.
     */
    constructor(initialState: T) {
        this._state = initialState;
    }

    /** The currently active state. */
    get state(): T {
        return this._state;
    }

    /**
     * Register lifecycle hooks for a state.
     * Returns `this` to allow chaining.
     *
     * @param state - The state name to configure.
     * @param config - Hooks to run on enter, on exit, and each frame.
     */
    on(state: T, config: StateConfig): this {
        this._handlers[state] = config;
        return this;
    }

    /**
     * Transition to a new state.
     * Calls `onExit` on the current state, then `onEnter` on the new state.
     *
     * @param newState - The state to transition to.
     */
    switchTo(newState: T): void {
        this._handlers[this._state]?.onExit?.();
        this._state = newState;
        this._handlers[this._state]?.onEnter?.();
    }

    /**
     * Forward a frame tick to the active state's `update` hook.
     * @param deltaMs - Elapsed time since the last frame in milliseconds.
     */
    update(deltaMs: number): void {
        this._handlers[this._state]?.update?.(deltaMs);
    }
}