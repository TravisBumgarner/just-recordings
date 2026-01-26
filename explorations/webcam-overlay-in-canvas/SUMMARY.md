## Canvas Compositing (Screen + Webcam Overlay)

When recording **“This Tab”** or a **specific window**, the webcam PiP will **not** appear in the recording. In these cases, the only reliable solution is **manual compositing**.

### How It Works
1. Capture the screen or tab via `getDisplayMedia()`
2. Capture the webcam via `getUserMedia()`
3. Draw both video streams into a `<canvas>`
   - Screen = base layer
   - Webcam = overlay (corner, draggable, masked, etc.)
4. Record the canvas via `canvas.captureStream()`

### Why This Is Necessary
- Browser capture surfaces **exclude PiP**
- There is no API to merge PiP into tab/window capture
- Canvas is the **only supported compositor**

### Tradeoffs
**Pros**
- Works for tab, window, or screen capture
- Full control over webcam size, position, and styling
- Predictable output across all user choices

**Cons**
- Higher CPU/GPU usage
- More implementation complexity
- Manual audio mixing required

### When to Use Canvas Compositing
- You allow or prefer **tab-only recording**
- You need **consistent output**
- You want custom webcam UI (rounded mask, border, drag, resize)

### Summary

> **If the recording surface cannot “see” PiP, you must draw the webcam yourself.**

Canvas compositing is not a workaround — it is the intended solution.
