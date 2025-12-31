import * as THREE from 'three';

export function applyInteraction(stateObj, handPos, modelMgr, cameraControls, multiHandData) {
    const activeModel = modelMgr.getTarget();

    if (stateObj.currentMode === 'TWO_HANDED') {
        const { zoomDelta } = stateObj.getDelta(handPos, multiHandData);

        const zoomRate = 2.0;
        if (Math.abs(zoomDelta) > 0.001) {
            const movement = new THREE.Vector3(0, 0, -zoomDelta * zoomRate);
            movement.applyQuaternion(cameraControls.object.quaternion);
            cameraControls.object.position.add(movement);
        }

        cameraControls.update();

    } else if (stateObj.currentMode === 'CAMERA_VERTICAL') {
        const { deltaY } = stateObj.getDelta(handPos);

        const elevationRate = 4.0;

        if (Math.abs(deltaY) > 0.001) {
            cameraControls.object.position.y += deltaY * elevationRate;
            cameraControls.target.y += deltaY * elevationRate;
        }

        cameraControls.update();

    } else if (stateObj.currentMode !== 'IDLE' && activeModel) {
        const { deltaX, deltaY } = stateObj.getDelta(handPos);

        if (stateObj.currentMode === 'ROTATING') {
            const rotationRate = 1.2;

            if (deltaX !== 0) {
                activeModel.rotation.y += deltaX * rotationRate;
            }

            if (deltaY !== 0) {
                activeModel.rotation.x += deltaY * rotationRate;

                const clampAngle = 1.4;
                activeModel.rotation.x = Math.max(-clampAngle, Math.min(clampAngle, activeModel.rotation.x));
            }

            activeModel.rotation.z = 0;

        } else if (stateObj.currentMode === 'PANNING') {
            activeModel.position.x -= deltaX * 3.5;
            activeModel.position.y += deltaY * 3.5;
        } else if (stateObj.currentMode === 'SCALING') {
            const scaleMultiplier = 1 + (deltaY * 0.8);
            modelMgr.scale(Math.max(0.1, scaleMultiplier));
        }
    }
}
