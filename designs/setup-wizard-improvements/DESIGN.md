# Setup Wizard Improvements

## Problem Statement

The current desktop setup wizard has several UX issues:

1. **Missing microphone permission** - The wizard only guides users through screen recording permission. Users are surprised by the microphone permission dialog when they first try to record with audio.

2. **No verification before completing** - Users click through the wizard without knowing if their permissions actually work. They discover issues only when trying to record.

3. **Window disappears during setup** - The desktop window auto-hides when it loses focus. When users click "Open System Preferences", the window vanishes, leaving them confused about how to continue.

## Goals

1. Keep the desktop window visible throughout the entire setup process
2. Add microphone permission to the setup flow
3. Allow users to test each permission and see success/failure feedback before completing setup

## Non-Goals

- Camera/webcam permission (not required for core recording functionality)
- Windows/Linux support (can be added later)
- Automated permission granting (not possible due to OS security)

## Design

### Window Behavior

The desktop window currently hides on blur (losing focus). During setup:
- Disable the auto-hide behavior while `isSetupComplete` is false
- Window should stay visible when System Preferences opens
- Re-enable auto-hide after setup completes

### Updated Wizard Flow

**Step 1: Welcome**
- Same as current

**Step 2: Screen Recording Permission**
- "Open System Preferences" button (existing)
- NEW: "Test Screen Recording" button
  - Attempts to call `getDisplayMedia()` briefly
  - Shows checkmark on success, error message on failure
  - User can proceed once test passes

**Step 3: Microphone Permission** (NEW)
- Explain why microphone access is needed (for recording audio)
- "Open System Preferences" button for microphone panel
- "Test Microphone" button
  - Attempts to call `getUserMedia({ audio: true })`
  - Shows checkmark on success, error message on failure
  - Can be skipped (microphone is optional)

**Step 4: Complete**
- Show summary of permission status
- "Get Started" button

### Permission Testing

Each "Test" button should:
1. Request the permission via the appropriate API
2. Immediately release any streams obtained
3. Update UI to show:
   - Success: Green checkmark, "Permission granted"
   - Denied: Red X, "Permission denied - please grant access in System Preferences"
   - Error: Warning icon, error message

### IPC Changes

Add new handler for opening microphone System Preferences:
- `openSystemPreferences('microphone')` -> opens `Privacy_Microphone` panel

## Technical Approach

### Milestone 1: Desktop Window Behavior
Keep window visible during setup by passing setup state to main process.

### Milestone 2: Permission Testing UI
Add test buttons and feedback UI to the wizard.

### Milestone 3: Microphone Permission Step
Add the new step to the wizard flow.

## Testing Strategy

- Unit tests for permission testing logic
- Integration tests for wizard flow with mocked permissions
- Manual testing on macOS for actual permission dialogs
