import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { updateStatus } from '../ui/overlay.js';

export const MODELS = [
    { name: 'Default Model', file: 'model.glb' },
    { name: 'Human Skeleton', file: 'free_pack_-_human_skeleton.glb' },
    { name: 'Jet Engine', file: 'jet_engine.glb' },
    { name: 'Rocket Ship', file: 'gorilla_tag_rocket_ship.glb' }
];

export class ModelManager {
    constructor(sceneRef) {
        this.sceneRef = sceneRef;
        this.activeModel = null;
        this.baseScale = 1;
    }

    reset() {
        if (this.activeModel) {
            this.activeModel.rotation.set(0, 0, 0);
            this.activeModel.position.set(0, 0, 0);
            this.activeModel.scale.setScalar(this.baseScale);
        }
    }

    scale(multiplier) {
        if (this.activeModel) {
            this.activeModel.scale.multiplyScalar(multiplier);
        }
    }

    getTarget() {
        return this.activeModel;
    }

    getAvailableModels() {
        return MODELS;
    }

    load(modelFile) {
        if (this.activeModel) {
            this.sceneRef.remove(this.activeModel);

            this.activeModel.traverse((node) => {
                if (node.isMesh) {
                    node.geometry.dispose();
                    if (node.material) {
                        const materials = Array.isArray(node.material) ? node.material : [node.material];
                        materials.forEach(mat => mat.dispose());
                    }
                }
            });
            this.activeModel = null;
        }

        const gltfLoader = new GLTFLoader();
        updateStatus(`Loading ${modelFile}...`);

        gltfLoader.load(`models/${modelFile}`, (gltfData) => {
            const loadedScene = gltfData.scene;

            loadedScene.updateMatrixWorld(true);
            const boundingBox = new THREE.Box3().setFromObject(loadedScene);
            const boxCenter = boundingBox.getCenter(new THREE.Vector3());
            const boxDimensions = boundingBox.getSize(new THREE.Vector3());

            loadedScene.position.set(
                -boxCenter.x,
                -boundingBox.min.y,
                -boxCenter.z
            );

            this.activeModel = new THREE.Group();
            this.activeModel.add(loadedScene);

            const largestDimension = Math.max(boxDimensions.x, boxDimensions.y, boxDimensions.z);
            if (largestDimension > 0) {
                this.baseScale = 2 / largestDimension;
                this.activeModel.scale.setScalar(this.baseScale);
            }

            this.sceneRef.add(this.activeModel);
            console.log(`Loaded ${modelFile}`);
            updateStatus("Ready");
        },
            (progressEvent) => {
                const percentComplete = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                updateStatus(`Loading: ${percentComplete}%`);
            },
            (errorEvent) => {
                console.error("Load error", errorEvent);
                updateStatus(`Error: ${errorEvent.message || 'Failed'}`);
            });
    }
}
