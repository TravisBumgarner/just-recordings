# Screen Recording + Webcam (PiP) — Important Constraints

This project relies on browser-native screen recording and Picture-in-Picture (PiP). There are **hard platform constraints** that affect whether the webcam appears in the final recording.

## Key Facts (Non-Negotiable)

### Picture-in-Picture is Presentation-Only
- PiP is a **floating OS-level window**
- It is **not composited** into recordings by the browser
- Recording APIs do not “know” PiP exists

## When PiP *Does* Appear in the Recording

### ✅ User selects **“Entire Screen”**
- The OS compositor includes PiP windows
- Result: **single video**, webcam visible
- No canvas compositing required

This is the *only* case where PiP “just works”.

## When PiP *Does NOT* Appear

### ❌ User selects **“This Tab”**
### ❌ User selects a **specific window**
- PiP floats above the capture surface
- Recording **will not include** the webcam
- This is expected Chrome behavior

## Implications

| Goal | Required Approach |
|----|----|
| Simplest implementation | Force / instruct **Entire Screen** |
| Tab-only recording | **Canvas compositor required** |
| Reliable output regardless of user choice | **Canvas compositor required** |

There is **no API** to:
- Force PiP into tab capture
- Detect whether PiP will be included
- Inject PiP into a recording without compositing

## Recommended UX Guidance

If not using a canvas compositor:
- Explicitly instruct users to select **“Entire Screen”**
- Warn that tab/window capture will omit webcam
- Consider blocking non-screen selections in UX copy

## Summary

> **Screen recording + PiP only produces one combined video if the user records the entire screen.**

Anything else requires manual compositing via `<canvas>`.

This is a browser limitation, not a bug.
