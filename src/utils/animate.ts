/**
 * Handle returned by {@link animate}, allowing the caller to await completion
 * or cancel the animation early.
 */
export type AnimationHandle = {
    /**
     * Resolves `true` when the animation completes naturally,
     * or `false` if it was stopped early via `stop()`.
     */
    promise: Promise<boolean>;
    /** Cancel the animation. The promise resolves `false` on the next frame. */
    stop: () => void;
}

/**
 * Drive a callback from `t = 0` to `t = 1` over `duration` milliseconds using
 * `requestAnimationFrame`.
 *
 * @param draw - Called each frame with the current normalised progress `t ∈ [0, 1]`
 *   after the easing function has been applied.
 * @param duration - Total animation duration in milliseconds. Defaults to `1000`.
 * @param easing - Optional easing function `f(t) → t'`. Defaults to linear.
 * @returns An {@link AnimationHandle} with a promise and a `stop` cancellation function.
 *
 * @example
 * ```ts
 * await animate(t => { sprite.alpha = t; }, 500).promise;
 * ```
 */
export function animate(
    draw: (t: number) => void,
    duration: number = 1000,
    easing: (t: number) => number = t => t
): AnimationHandle {
    const startTime = performance.now();
    let stopped = false;
    
    const stop = () => {
        stopped = true;
    };

    const promise = new Promise<boolean>((resolve) => {
        function frame(time: number) {
            if(stopped) return resolve(false);

            let t = (time - startTime) / duration;
            if(t > 1) t = 1;

            draw(easing(t));

            if(t < 1) {
                requestAnimationFrame(frame);
            } else {
                resolve(true);
            }
        }

        requestAnimationFrame(frame);
    });

    return { promise, stop };
}
