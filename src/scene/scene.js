import * as THREE from 'three';

export function initScene(canvasElem) {
    const sceneObj = new THREE.Scene();
    sceneObj.background = new THREE.Color(0x6b6b6b);

    const webglRenderer = new THREE.WebGLRenderer({ canvas: canvasElem, antialias: true });
    webglRenderer.setSize(window.innerWidth, window.innerHeight);
    webglRenderer.shadowMap.enabled = true;
    webglRenderer.shadowMap.type = THREE.PCFSoftShadowMap;

    window.addEventListener('resize', () => {
        webglRenderer.setSize(window.innerWidth, window.innerHeight);
    });

    return { scene: sceneObj, renderer: webglRenderer };
}
