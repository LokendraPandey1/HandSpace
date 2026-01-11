import * as THREE from 'three';

export const PINCH_THRESHOLD = 0.05;

export function getDistance(pt1, pt2) {
    const dx = pt1.x - pt2.x;
    const dy = pt1.y - pt2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function isPinched(handMarkers) {
    return getDistance(handMarkers[4], handMarkers[8]) < PINCH_THRESHOLD;
}

export function detectGesture(handMarkers) {
    const fingerTips = {
        thumb: handMarkers[4],
        index: handMarkers[8],
        middle: handMarkers[12],
        ring: handMarkers[16],
        pinky: handMarkers[20]
    };

    const separationThreshold = 0.08;

    const gaps = {
        toIndex: getDistance(fingerTips.thumb, fingerTips.index),
        toMiddle: getDistance(fingerTips.thumb, fingerTips.middle),
        toRing: getDistance(fingerTips.thumb, fingerTips.ring),
        toPinky: getDistance(fingerTips.thumb, fingerTips.pinky)
    };

    const isOpen = (gap) => gap > separationThreshold;
    const isClosed = (gap) => gap < PINCH_THRESHOLD;

    if (isClosed(gaps.toIndex) && isOpen(gaps.toMiddle) && isOpen(gaps.toRing) && isOpen(gaps.toPinky)) {
        return 'ROTATING';
    }

    if (isClosed(gaps.toMiddle) && isOpen(gaps.toIndex) && isOpen(gaps.toRing) && isOpen(gaps.toPinky)) {
        return 'PANNING';
    }

    if (isClosed(gaps.toRing) && isOpen(gaps.toIndex) && isOpen(gaps.toMiddle) && isOpen(gaps.toPinky)) {
        return 'CAMERA_VERTICAL';
    }

    if (isClosed(gaps.toPinky) && isOpen(gaps.toIndex) && isOpen(gaps.toMiddle) && isOpen(gaps.toRing)) {
        return 'SCALING';
    }

    return 'IDLE';
}
