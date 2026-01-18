# Recordings Viewer Design

## Overview

Add a recordings viewing page to the web app that allows users to browse all their saved recordings in a grid layout and watch individual recordings with a video player.

## User Stories

1. As a user, I want to see all my recordings in a grid so I can browse what I've recorded
2. As a user, I want to click on a recording to watch it
3. As a user, I want to see details about each recording (name, duration, date, size)
4. As a user, I want to delete recordings I no longer need

## Technical Architecture

### Routes

- `/recordings` - List all recordings in a grid
- `/recordings/:id` - View and play a single recording

### Components

#### RecordingsList Page
- Fetches all recordings using `RecorderService.getAllRecordings()`
- Displays recordings in a responsive Material UI Grid
- Each card shows:
  - Recording name
  - Duration (formatted as mm:ss)
  - Creation date
  - File size (formatted)
- Handles loading and empty states

#### RecordingViewer Page
- Fetches single recording using `RecorderService.getRecording(id)`
- Creates object URL from blob for video playback
- Displays video player with native controls
- Shows recording metadata
- Provides delete functionality with confirmation dialog
- Cleans up object URL on unmount

### Data Flow

```
RecorderService (IndexedDB via Dexie)
    ↓
RecordingsList / RecordingViewer Pages
    ↓
Material UI Components
```

## Dependencies

- RecorderService from @just-recordings/recorder package
- Material UI for grid layout and cards
- React Router for navigation

## Out of Scope

- Editing recording names
- Sharing recordings
- Cloud storage/sync
- Desktop app implementation (web only for this milestone)
