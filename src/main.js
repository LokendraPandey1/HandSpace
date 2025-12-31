import * as THREE from 'three';
import { initScene } from './scene/scene.js';
import { initCamera } from './scene/camera.js';
import { initLights } from './scene/lighting.js';
import { initPlane } from './scene/plane.js';
import { ModelManager, MODELS } from './models/modelLoader.js';
import { initHandTracker } from './hand/handTracker.js';
import { detectGesture } from './hand/gestures.js';
import { HandVisualizer } from './hand/landmarks.js';
import { InteractionState } from './interaction/stateMachine.js';
import { applyInteraction } from './interaction/mapper.js';
import { updateStatus } from './ui/overlay.js';
import { initControls } from './ui/controls.js';

const videoElem = document.getElementsByClassName('input_video')[0];
const canvasElem = document.getElementsByClassName('output_canvas')[0];

let sceneObj, rendererObj, cameraObj, orbitControls;
let modelMgr, handViz, stateTracker;

function init() {
    ({ scene: sceneObj, renderer: rendererObj } = initScene(canvasElem));
    ({ camera: cameraObj, controls: orbitControls } = initCamera(rendererObj));

    sceneObj.add(cameraObj);

    initLights(sceneObj);
    initPlane(sceneObj);

    modelMgr = new ModelManager(sceneObj);
    handViz = new HandVisualizer(cameraObj);
    stateTracker = new InteractionState();

    initControls(modelMgr, orbitControls);

    modelMgr.load(MODELS[0].file);

    initHandTracker(videoElem, processHandData);

    renderLoop();
}

function processHandData(detectionResults) {
    handViz.hide();

    if (detectionResults.multiHandLandmarks && detectionResults.multiHandLandmarks.length > 0) {
        const primaryHand = detectionResults.multiHandLandmarks[0];

        const recognizedGesture = detectGesture(primaryHand);

        const wristMarker = primaryHand[0];
        const handPos = new THREE.Vector3(wristMarker.x, wristMarker.y, 0);

        const { changed, mode } = stateTracker.update(detectionResults.multiHandLandmarks, recognizedGesture, handPos, modelMgr);
        if (changed) {
            updateStatus(`State: ${mode}`);
        }

        applyInteraction(stateTracker, handPos, modelMgr, orbitControls, detectionResults.multiHandLandmarks);

        handViz.update(detectionResults.multiHandLandmarks, mode);
    }
}

function renderLoop() {
    requestAnimationFrame(renderLoop);
    orbitControls.update();
    rendererObj.render(sceneObj, cameraObj);
}

window.onload = init;
