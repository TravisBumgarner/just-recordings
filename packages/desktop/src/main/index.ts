import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
  app,
  BrowserWindow,
  desktopCapturer,
  ipcMain,
  Menu,
  nativeImage,
  session,
  shell,
  Tray,
} from 'electron'
import {
  getFloatingWindowHash,
  getFloatingWindowOptions,
  getFloatingWindowUrl,
} from './floatingWindow'
import {
  FLOATING_WINDOW_CHANNELS,
  type FloatingControlAction,
  type RecordingState,
} from './floatingWindowIpc'
import { getSystemPreferencesUrl } from './systemPreferences'

let mainWindow: BrowserWindow | null = null
let floatingControlsWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isSetupMode = false

// In production, extraResource files are in the Resources folder, not inside ASAR
const getResourcePath = (filename: string) => {
  if (is.dev) {
    return join(__dirname, '../../resources', filename)
  }
  // In production, process.resourcesPath points to the Resources folder
  return join(process.resourcesPath, 'resources', filename)
}

const ICON_PATH = getResourcePath('statusbaricon.png')
const ICON_RECORDING_PATH = getResourcePath('statusbaricon-recording.png')

// Create tray icon from file
function createTrayIcon(): Tray {
  const icon = nativeImage.createFromPath(ICON_PATH)
  icon.setTemplateImage(true)

  const newTray = new Tray(icon.resize({ width: 16, height: 16 }))
  newTray.setToolTip('Just Recordings')

  return newTray
}

// Update tray icon based on recording state
function updateTrayIcon(isRecording: boolean): void {
  if (!tray) return

  const iconPath = isRecording ? ICON_RECORDING_PATH : ICON_PATH
  const icon = nativeImage.createFromPath(iconPath)
  icon.setTemplateImage(true)
  tray.setImage(icon.resize({ width: 16, height: 16 }))
  tray.setToolTip(isRecording ? 'Just Recordings - Recording...' : 'Just Recordings')
}

// Position window near the tray icon
function positionWindowNearTray(): void {
  if (!mainWindow || !tray) return

  const trayBounds = tray.getBounds()
  const windowBounds = mainWindow.getBounds()

  // Position window centered horizontally below the tray icon
  const x = Math.round(trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2)
  // Position window just below the menu bar (with small gap)
  const y = Math.round(trayBounds.y + trayBounds.height + 4)

  mainWindow.setPosition(x, y, false)
}

// Toggle window visibility
function toggleWindow(): void {
  if (!mainWindow) return

  if (mainWindow.isVisible()) {
    mainWindow.hide()
  } else {
    positionWindowNearTray()
    mainWindow.show()
    mainWindow.focus()
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500,
    minWidth: 300,
    minHeight: 400,
    show: false,
    frame: false, // Frameless window (no titlebar)
    resizable: true,
    skipTaskbar: true, // Hide from taskbar/Dock
    alwaysOnTop: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      sandbox: false,
    },
  })

  // Hide window instead of closing (app stays running)
  // mainWindow.on('close', (event) => {
  //   if (!app.isQuitting) {
  //     event.preventDefault()
  //     mainWindow?.hide()
  //   }
  // })

  // Hide window when it loses focus (menu bar app behavior)
  // Skip hiding if setup mode is enabled (during setup wizard)
  mainWindow.on('blur', () => {
    if (!isSetupMode) {
      mainWindow?.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev) {
    // Dev mode: Load web app's Vite dev server
    mainWindow.loadURL('http://localhost:5173')
  } else {
    // Prod mode: Load bundled web app (copied from web package during build)
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Create floating controls window for recording controls overlay
function createFloatingControlsWindow(): void {
  const preloadPath = join(__dirname, 'preload.js')
  const options = getFloatingWindowOptions(preloadPath)

  floatingControlsWindow = new BrowserWindow(options)

  // Load the floating controls route
  if (is.dev) {
    const url = getFloatingWindowUrl(true)
    floatingControlsWindow.loadURL(url)
  } else {
    // Production: load the index.html with hash routing
    const hash = getFloatingWindowHash()
    floatingControlsWindow.loadFile(join(__dirname, '../renderer/index.html'), {
      hash,
    })
  }

  // Clean up reference when window is closed
  floatingControlsWindow.on('closed', () => {
    floatingControlsWindow = null
  })
}

// Show the floating controls window (creates it if needed)
// Exported for use by IPC handlers (will be wired up in Task 2)
export function showFloatingControls(): void {
  if (!floatingControlsWindow) {
    createFloatingControlsWindow()
  }
  floatingControlsWindow?.show()
}

// Hide the floating controls window
// Exported for use by IPC handlers (will be wired up in Task 2)
export function hideFloatingControls(): void {
  floatingControlsWindow?.hide()
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.just-recordings.desktop')

  // Hide from Dock on macOS
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

  // Handle recording state changes from renderer
  ipcMain.on('recording-state-changed', (_event, isRecording: boolean) => {
    updateTrayIcon(isRecording)
  })

  // Handle setup mode changes from renderer
  // When setup mode is enabled, the window won't auto-hide on blur
  ipcMain.on('set-setup-mode', (_event, enabled: boolean) => {
    isSetupMode = enabled
  })

  // Handle external URL opening
  ipcMain.on('open-external', (_event, url: string) => {
    shell.openExternal(url).catch((err) => {
      console.error('Failed to open external URL:', err)
    })
  })

  // Handle opening system preferences to privacy panels
  ipcMain.on(
    'open-system-preferences',
    (_event, panel: 'screenRecording' | 'microphone' | 'camera') => {
      const url = getSystemPreferencesUrl(panel)
      if (url) {
        shell.openExternal(url).catch((err) => {
          console.error('Failed to open System Preferences:', err)
        })
      }
    },
  )

  // Floating window IPC handlers
  // Show floating controls window
  ipcMain.on(FLOATING_WINDOW_CHANNELS.SHOW, () => {
    showFloatingControls()
  })

  // Hide floating controls window
  ipcMain.on(FLOATING_WINDOW_CHANNELS.HIDE, () => {
    hideFloatingControls()
  })

  // Update recording state in floating window
  ipcMain.on(
    FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE,
    (_event, state: RecordingState) => {
      if (floatingControlsWindow) {
        floatingControlsWindow.webContents.send(
          FLOATING_WINDOW_CHANNELS.UPDATE_RECORDING_STATE,
          state,
        )
      }
    },
  )

  // Forward control actions from floating window to main window
  ipcMain.on(
    FLOATING_WINDOW_CHANNELS.CONTROL_ACTION,
    (_event, action: FloatingControlAction) => {
      if (mainWindow) {
        mainWindow.webContents.send(FLOATING_WINDOW_CHANNELS.CONTROL_ACTION, action)
      }
    },
  )

  // Set up display media request handler for screen capture
  session.defaultSession.setDisplayMediaRequestHandler(async (_request, callback) => {
    const sources = await desktopCapturer.getSources({ types: ['screen', 'window'] })
    // For now, automatically select the first screen source
    // In a production app, you'd show a picker UI
    const screenSource = sources.find((source) => source.id.startsWith('screen:')) || sources[0]
    if (screenSource) {
      callback({ video: screenSource })
    } else {
      callback({})
    }
  })

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Create tray icon
  tray = createTrayIcon()

  // Set up tray click handler
  tray.on('click', () => {
    toggleWindow()
  })

  // Set up right-click context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => toggleWindow(),
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        ;(app as { isQuitting?: boolean }).isQuitting = true
        app.quit()
      },
    },
  ])
  tray.on('right-click', () => {
    tray?.popUpContextMenu(contextMenu)
  })

  createWindow()

  app.on('activate', () => {
    if (mainWindow) {
      mainWindow.show()
    } else {
      createWindow()
    }
  })
})

// Keep app running when all windows are closed (menu bar app behavior)
app.on('window-all-closed', () => {
  // Don't quit on macOS - app stays in menu bar
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle before-quit to allow actual quitting
app.on('before-quit', () => {
  ;(app as { isQuitting?: boolean }).isQuitting = true
})
