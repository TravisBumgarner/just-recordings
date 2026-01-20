import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import {
  app,
  BrowserWindow,
  desktopCapturer,
  Menu,
  nativeImage,
  session,
  shell,
  Tray,
} from 'electron'

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null

// Create a simple tray icon (16x16 template image for macOS)
function createTrayIcon(): Tray {
  // Create a simple circle icon as a template image
  // For macOS, template images should be black with transparency
  const iconSize = 16
  const icon = nativeImage.createFromDataURL(
    `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAAdgAAAHYBTnsmCAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAABwSURBVDiN7dKxDYAwDEXRf2EBRmAJRmEJRmEJRmABRqAkBYWFlBQR4qpOnOLpO3YCf9YKrMB2KJgA3TFyAM5hoAJuSWxAXwtsQFcL7EB7G7iA5jJwA/UmcAPlaeAByk3gBYpN4AXSU8D/8K8AvAFHGRNv6O9PbQAAAABJRU5ErkJggg==`,
  )
  icon.setTemplateImage(true)

  const newTray = new Tray(icon.resize({ width: iconSize, height: iconSize }))
  newTray.setToolTip('Just Recordings')

  return newTray
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
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
    },
  })

  // Hide window instead of closing (app stays running)
  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow?.hide()
    }
  })

  // Hide window when it loses focus (optional menu bar app behavior)
  mainWindow.on('blur', () => {
    // Only auto-hide if not in dev mode (for easier debugging)
    if (!is.dev) {
      mainWindow?.hide()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.just-recordings.desktop')

  // Hide from Dock on macOS
  if (process.platform === 'darwin') {
    app.dock.hide()
  }

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
