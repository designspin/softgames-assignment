export type AnimationHandle = {
    promise: Promise<boolean>;
    stop: () => void;
}

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
