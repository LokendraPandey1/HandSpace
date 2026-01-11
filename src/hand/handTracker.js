export function initHandTracker(videoElem, resultHandler) {
    const handDetector = new Hands({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });

    handDetector.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    handDetector.onResults(resultHandler);

    const cam = new Camera(videoElem, {
        onFrame: async () => await handDetector.send({ image: videoElem }),
        width: 640,
        height: 480
    });

    cam.start();
}
