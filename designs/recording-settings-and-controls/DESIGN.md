# Recording Settings and Controls Design

## Overview

Enhance the recording experience with pre-recording settings (audio/video source selection), a countdown timer, and floating recording controls. This feature spans both web and desktop apps with maximum code reuse.

## Current State

- `RecorderService.startScreenRecording()` only captures screen video via `getDisplayMedia()`
- No audio capture (computer audio or microphone)
- No webcam capture
- Simple inline start/stop buttons on Home pages
- No countdown before recording
- No dedicated recording controls UI during recording

## Requirements

### Pre-Recording Settings
Before recording starts, user can configure:
- **Include computer audio** (system/tab audio) - checkbox, default: off
- **Include microphone** - checkbox, default: off
- **Include webcam** - checkbox, default: off

### Countdown
- 3-second countdown displayed after settings confirmed
- Visual countdown overlay: "3... 2... 1..."
- Recording starts automatically after countdown

### Recording Controls (During Recording)
A popup/modal accessible during recording with:
- **Stop** - End recording and save
- **Pause/Resume** - Toggle pause state
- **Restart** - Discard current and start fresh (with countdown)
- **Cancel** - Discard recording without saving
- Recording timer display (elapsed time)
- Recording state indicator (recording/paused)

## Architecture

### Component Structure

```
packages/web/src/
├── components/
│   └── recording/                    # NEW - Shared recording components
│       ├── RecordingSettingsModal.tsx
│       ├── CountdownOverlay.tsx
│       ├── RecordingControlsModal.tsx
│       ├── RecordingTimer.tsx
│       └── useRecordingFlow.ts       # Hook managing the full flow
```

### RecorderService Changes

Extend `RecordingOptions` in `packages/recorder/src/types.ts`:

```typescript
interface RecordingOptions {
  mimeType?: string;
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
  // NEW
  includeSystemAudio?: boolean;
  includeMicrophone?: boolean;
  includeWebcam?: boolean;
}
```

Extend `RecorderService` to handle multiple media streams:

```typescript
interface RecorderService {
  // Existing
  startScreenRecording(options?: RecordingOptions): Promise<void>;
  stopRecording(): Promise<Recording>;
  pauseRecording(): void;
  resumeRecording(): void;

  // NEW
  cancelRecording(): void;  // Discard without saving
  getElapsedTime(): number; // Returns elapsed ms
}
```

### Media Stream Composition

When starting a recording with mixed sources:

1. **Screen capture**: `navigator.mediaDevices.getDisplayMedia({ video: true, audio: includeSystemAudio })`
2. **Microphone**: `navigator.mediaDevices.getUserMedia({ audio: true })` (if enabled)
3. **Webcam**: `navigator.mediaDevices.getUserMedia({ video: true })` (if enabled)

Combine audio tracks using `AudioContext` and `MediaStreamAudioDestinationNode`:
- Mix system audio + microphone into single audio track
- Attach to screen video track for final MediaRecorder stream

For webcam, the video will be composited or shown as picture-in-picture overlay (future enhancement). Initially, webcam will be a separate stream stored alongside.

### Component Specifications

#### RecordingSettingsModal

```typescript
interface RecordingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (settings: RecordingSettings) => void;
}

interface RecordingSettings {
  includeSystemAudio: boolean;
  includeMicrophone: boolean;
  includeWebcam: boolean;
}
```

Features:
- Three checkboxes with labels
- "Start Recording" button
- "Cancel" button
- Device permission status indicators (optional future enhancement)

#### CountdownOverlay

```typescript
interface CountdownOverlayProps {
  seconds: number;  // Starting value (3)
  onComplete: () => void;
}
```

Features:
- Full-screen or modal overlay
- Large centered number display
- Animated countdown (3 → 2 → 1 → start)
- Semi-transparent background

#### RecordingControlsModal

```typescript
interface RecordingControlsModalProps {
  isOpen: boolean;
  recorderService: RecorderService;
  onStop: (recording: Recording) => void;
  onCancel: () => void;
  onRestart: () => void;
}
```

Features:
- Recording timer (MM:SS format)
- State indicator (Recording / Paused)
- Control buttons: Stop, Pause/Resume, Restart, Cancel
- Confirmation dialog for Cancel/Restart (discards data)

#### useRecordingFlow Hook

Orchestrates the entire recording flow:

```typescript
interface UseRecordingFlowReturn {
  // State
  flowState: 'idle' | 'settings' | 'countdown' | 'recording' | 'saving';
  recordingState: RecorderState;
  elapsedTime: number;

  // Actions
  openSettings: () => void;
  startWithSettings: (settings: RecordingSettings) => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<Recording>;
  cancel: () => void;
  restart: () => void;
}
```

### Flow Diagram

```
User clicks "Start Recording"
         ↓
    [Settings Modal]
    - Configure audio/video sources
    - Click "Start"
         ↓
    [Countdown Overlay]
    - 3... 2... 1...
         ↓
    [Recording Active]
    - Controls modal available
    - Timer running
         ↓
    User action:
    ├── Stop → Save recording → Upload queue
    ├── Pause → Recording paused → Resume continues
    ├── Restart → Discard → Countdown → Recording
    └── Cancel → Discard → Idle
```

### Desktop Integration

The recording components are shared between web and desktop since:
- Both run in browser/Electron renderer (same APIs)
- Desktop `Home.Desktop.tsx` imports same components as `Home.Web.tsx`
- Tray icon updates via existing `setRecordingState()` IPC

Desktop-specific considerations:
- Smaller modal sizing for menu bar app dimensions
- Recording controls may need to be more compact

### Browser Compatibility

**getDisplayMedia with audio:**
- Chrome/Edge: Supported (tab audio only, not system audio)
- Firefox: Supported (with limitations)
- Safari: Limited support

**getUserMedia:**
- Fully supported in all modern browsers

Show appropriate warnings when features aren't available.

## Testing Strategy

### Unit Tests
- `RecorderService` with mocked MediaRecorder/getUserMedia
- `useRecordingFlow` hook with mocked RecorderService
- Component rendering tests for modals

### Integration Tests (Manual)
- Full recording flow on Chrome, Firefox, Safari
- Desktop app recording flow
- Permission denial handling

## Implementation Order

1. **RecorderService enhancements** - Add cancelRecording, elapsed time, multi-source support
2. **Recording types** - Extend RecordingOptions
3. **Shared components** - Settings modal, countdown, controls modal
4. **useRecordingFlow hook** - Orchestration logic
5. **Integration** - Wire into Home.Web.tsx and Home.Desktop.tsx
6. **Polish** - Styling, animations, edge cases

## Dependencies

No new dependencies required. Uses existing:
- Web APIs: MediaRecorder, getUserMedia, getDisplayMedia, AudioContext
- React for components
- Existing modal system in `sharedComponents/Modal`

## Out of Scope

- Webcam overlay/picture-in-picture composition (video mixing)
- Recording quality presets UI
- Device selection dropdowns (use defaults)
- Persisting settings between sessions
