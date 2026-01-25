# Desktop Improvements Design

## Overview

This design covers four improvements:
1. **Countdown Flow Fix** - Screen selection should happen BEFORE countdown, not after
2. **Taskbar Countdown** - Show countdown in taskbar/dock instead of full-screen overlay
3. **Webcam Setup Wizard** - Add webcam permissions to the setup wizard
4. **Upload Toggle** - Add option to enable/disable automatic upload after recording

## Feature 0: Fix Recording Flow (Screen Selection Before Countdown)

### Current Behavior (Bug)
The recording flow is backwards:
1. User configures settings → countdown starts (3, 2, 1) → screen picker appears
2. This is confusing because the countdown suggests recording is about to start, but then the user is prompted to select a screen

### Desired Behavior
1. User configures settings → clicks Start → screen picker appears → countdown starts → recording begins
2. If user cancels screen picker, return to settings (no countdown)

### Technical Approach

**RecorderService Changes:**
- Add `acquireScreenStream(options)` method that calls `getDisplayMedia()` and returns the stream
- Modify `startScreenRecording()` to accept an optional pre-acquired stream
- If stream is provided, use it; otherwise call `getDisplayMedia()` (backward compatibility)

**useRecordingFlow Changes:**
- In `startWithSettings()`:
  1. Call new method to acquire screen stream
  2. If user cancels (stream acquisition fails), stay in settings
  3. If successful, store stream reference, then transition to countdown
- In `onCountdownComplete()`:
  - Pass the pre-acquired stream to `startScreenRecording()`

**Flow State:**
- May need intermediate state like `'acquiring'` between settings and countdown
- Or handle acquisition synchronously before countdown transition

### Files to Modify
- `packages/recorder/src/RecorderService.ts` - Add stream acquisition method
- `packages/web/src/hooks/useRecordingFlow.ts` - Reorder flow

## Feature 1: Taskbar Countdown

### Current Behavior
- `CountdownOverlay.tsx` renders a full-screen overlay with a 3-second countdown
- The countdown uses large typography (variant="countdown") centered on screen
- Main window stays visible during countdown

### Desired Behavior
- During countdown, hide the main Electron window
- Show countdown progress in taskbar (Windows) / dock (macOS)
- After countdown completes, start recording (window remains hidden or minimized)

### Technical Approach

**Electron Main Process Changes:**
- Add IPC handler for countdown state (`countdown:start`, `countdown:end`)
- On `countdown:start`: Hide main window, set progress bar in taskbar
- Use `win.setProgressBar(value)` to show countdown progress (1.0 → 0.66 → 0.33 → 0.0)
- On macOS: Use `app.dock.setBadge('3')`, `app.dock.setBadge('2')`, etc.
- On `countdown:end`: Clear progress bar, keep window hidden for recording

**Renderer Process Changes:**
- `CountdownOverlay.tsx`: Send IPC messages to main process during countdown
- Add `window.electron.countdown.start()` and `window.electron.countdown.tick(secondsRemaining)`
- After countdown, the existing recording flow continues

**Preload Script:**
- Expose `countdown` API: `{ start: () => void, tick: (seconds: number) => void, end: () => void }`

### Files to Modify
- `packages/desktop/src/main/index.ts` - Add IPC handlers
- `packages/desktop/src/preload/index.ts` - Expose countdown API
- `packages/desktop/src/preload/index.d.ts` - TypeScript types
- `packages/web/src/components/CountdownOverlay.tsx` - Send IPC messages

## Feature 2: Webcam Setup Wizard

### Current Behavior
- `SetupWizard.tsx` has two permission steps: screen recording and microphone
- Each step has `testPermission`, `requestPermission`, and `openSystemPreferences` functions
- Camera permission methods already exist in `PermissionService` but aren't used in wizard

### Desired Behavior
- Add a third step to the setup wizard for webcam/camera permissions
- Follow the same pattern as existing screen and microphone steps
- User can test, grant, and configure webcam permissions

### Technical Approach

**SetupWizard Changes:**
- Add new step object for camera permissions:
  ```typescript
  {
    id: 'camera',
    label: 'Camera',
    description: 'Enable camera access for recording yourself',
    testPermission: () => window.electron.permissions.testCamera(),
    requestPermission: () => window.electron.permissions.requestCamera(),
    openSystemPreferences: () => window.electron.permissions.openCameraPreferences(),
  }
  ```
- Insert between microphone and completion steps (or after both permission steps)

**PermissionService Verification:**
- Verify `testCameraPermission()` and `requestCameraPermission()` work correctly
- Verify `openCameraSystemPreferences()` opens correct system preferences pane

### Files to Modify
- `packages/web/src/components/SetupWizard.tsx` - Add camera step
- `packages/desktop/src/preload/index.ts` - May need to expose camera permission methods
- `packages/desktop/src/preload/index.d.ts` - TypeScript types if needed

## Feature 3: Upload Toggle Setting

### Current Behavior
- After recording completes, `handleRecordingSaved` in `RecordingPanel.tsx` calls `uploadManager.enqueue()`
- Upload happens automatically with no user control
- No persistent setting exists for this behavior

### Desired Behavior
- Add a toggle setting: "Upload while recording" (or "Auto-upload after recording")
- When enabled (default): Current behavior - upload starts automatically
- When disabled: Recording is saved locally but not uploaded until manually triggered

### Technical Approach

**Settings Storage:**
- Add setting to localStorage: `uploadWhileRecording: boolean` (default: true)
- Create settings utility functions or extend existing pattern

**UI Changes:**
- Add toggle in recording settings panel (where timer overlay toggle exists)
- Label: "Auto-upload after recording" with description
- Persist to localStorage on change

**Recording Flow Changes:**
- In `handleRecordingSaved`, check setting before calling `uploadManager.enqueue()`
- If disabled, still save recording metadata but skip upload enqueue

**Manual Upload Option:**
- When auto-upload is disabled, recordings list should show "Upload" button for pending recordings
- Or provide batch upload option

### Files to Modify
- `packages/web/src/components/RecordingPanel.tsx` - Add setting toggle, conditional upload
- `packages/web/src/components/RecordingsList.tsx` - Add manual upload button (if needed)
- `packages/web/src/hooks/useSettings.ts` - Add setting (or create if doesn't exist)

## Implementation Order

1. **Webcam Setup Wizard** - Simplest change, mostly UI addition
2. **Upload Toggle** - Self-contained feature, moderate complexity
3. **Taskbar Countdown** - Most complex, involves Electron IPC changes

## Testing Considerations

- Webcam: Test permission flow on macOS and Windows
- Upload Toggle: Test with setting on/off, verify recordings still save correctly
- Taskbar Countdown: Test on macOS (dock) and Windows (taskbar), verify countdown timing
