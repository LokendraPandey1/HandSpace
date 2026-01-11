# HandSpace Gesture Controls

## Overview
HandSpace uses hand tracking to manipulate 3D models and control the camera. Use different finger pinch gestures to activate various controls.

---

## Single-Hand Gestures

### 🔄 Rotate Model (Index Finger Pinch)
**How to use:**
- Pinch your **thumb** and **index finger** together
- Keep other fingers extended
- Move your hand left/right to rotate the model horizontally
- Move your hand up/down to rotate the model vertically

**What it does:**
- Orbits the model around its center
- Vertical rotation is clamped to prevent flipping

---

### 🖐️ Pan Model (Middle Finger Pinch)
**How to use:**
- Pinch your **thumb** and **middle finger** together
- Keep other fingers extended
- Move your hand in any direction

**What it does:**
- Moves the model left, right, up, or down
- Follows your hand movement directly

---

### 📏 Scale Model (Pinky Finger Pinch)
**How to use:**
- Pinch your **thumb** and **pinky finger** together
- Keep other fingers extended
- Move your hand up to enlarge the model
- Move your hand down to shrink the model

**What it does:**
- Increases or decreases model size
- Maintains proportions

---

### ⬆️ Move Camera Vertically (Ring Finger Pinch)
**How to use:**
- Pinch your **thumb** and **ring finger** together
- Keep other fingers extended
- Move your hand up to raise the camera
- Move your hand down to lower the camera

**What it does:**
- Adjusts camera height
- Both camera and target move together to maintain view angle

---

## Two-Hand Gestures

### 🔍 Zoom Camera (Two-Hand Pinch)
**How to use:**
- Pinch **thumb** and **index finger** on **both hands**
- Move hands apart to zoom in (move camera closer)
- Move hands together to zoom out (move camera farther)

**What it does:**
- Moves the camera forward or backward along its view direction
- Provides smooth zoom control

---

## Tips

- **Keep unused fingers extended** - This helps the system distinguish between different gestures
- **Smooth movements** - The system includes smoothing to reduce jitter, so move deliberately
- **One gesture at a time** - Release one gesture before starting another for best results
- **Lighting matters** - Ensure good lighting for accurate hand tracking

---

## Gesture Priority

If multiple gestures are detected simultaneously, the system follows this priority:
1. Two-hand pinch (zoom)
2. Single-hand gestures (rotate, pan, scale, camera vertical)
3. Idle (no gesture)
