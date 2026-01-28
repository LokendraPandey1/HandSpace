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
import { GeminiService } from './ai/geminiService.js';
import { castRay } from './interaction/raycaster.js';

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

    // --- AI INTEGRATION (Dept 4) ---
    const geminiSvc = new GeminiService();
    let isAiMode = false;
    const btnAi = document.getElementById('btn-ask-gemini');
    const cardAi = document.getElementById('gemini-card');
    const textAi = document.getElementById('gemini-response-text');
    const loaderAi = document.getElementById('ai-spinner');
    const btnClose = document.getElementById('btn-close-card');

    // UI Toggle
    btnAi.onclick = () => {
        isAiMode = !isAiMode;
        if (isAiMode) {
            stateTracker.currentMode = 'GEMINI_MODE'; // Optional: if you update state machine
            cardAi.classList.remove('hidden');
            btnAi.style.background = 'rgba(0, 242, 254, 0.4)';
            textAi.innerText = "Tap any part of the model to learn about it!";
        } else {
            cardAi.classList.add('hidden');
            btnAi.style.background = '';
        }
    };

    btnClose.onclick = () => {
        isAiMode = false;
        cardAi.classList.add('hidden');
        btnAi.style.background = '';
    };

    // Interaction Listener
    window.addEventListener('pointerdown', async (event) => {
        if (!isAiMode) return;
        if (event.target.closest('#ui-container')) return; // Ignore UI clicks

        const hitMesh = castRay(event, cameraObj, sceneObj);

        if (hitMesh) {
            console.log("AI Clicked:", hitMesh.name);
            // Show Loading
            loaderAi.classList.remove('hidden');
            textAi.innerText = `Analyzing ${hitMesh.name}...`;

            // Call AI
            const activeModel = MODELS[0].file.replace('.glb', '').replace('.gltf', '');
            const explanation = await geminiSvc.explainMesh(hitMesh.name, activeModel);

            // Helper: Simple Markdown Formatter
            const formatResponse = (text) => {
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Bold
                    .replace(/\n/g, '<br>');                // Newlines
            };

            // Show Result
            loaderAi.classList.add('hidden');
            textAi.innerHTML = formatResponse(explanation);
        }
    });

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
