import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Initialize electron-store for persistent data
interface FormSubmission {
  serialNumber: string
  createdBy: string
  createdFor: string
  reasonType?: string
  amount?: number
  creationReason?: string
  extraFields?: Record<string, any>
  timestamp: number
}

interface StoreSchema {
  submissions: FormSubmission[]
}

const store = new Store<StoreSchema>({
  defaults: {
    submissions: []
  }
})

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// Set a friendly application name (used on macOS menus / app switcher)
app.name = 'Entrifi'

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

// Request single instance lock - prevents multiple app instances
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit()
} else {
  // This is the primary instance
  app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
    // Someone tried to run a second instance, focus our window instead
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
}


function createWindow() {
  // Prevent creating multiple windows - only allow one window at a time
  if (win && !win.isDestroyed()) {
    win.focus()
    return
  }

  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    maximizable: true,
    minimizable: true,
    autoHideMenuBar: true,
    fullscreenable: true,
    // use a visible app title
    title: 'Entrifi',
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      devTools: false, // Disable dev tools
    },
  })

 

  // Maximize window on start
  win.maximize()

  // Clean up window reference when closed
  win.on('closed', () => {
    win = null
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())

    // Ensure the native window title is empty (renderer may set document.title)
    try {
      // set the native title to the app name
      win?.setTitle('Entrifi')
      // Also set the HTML document title in the renderer to the app name
      win?.webContents.executeJavaScript("document.title = 'Entrifi'", true).catch(() => {})
    } catch (e) {
      // ignore failures setting title
    }
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers for form data persistence
ipcMain.handle('save-submission', async (_event, submission: FormSubmission) => {
  try {
    const submissions = store.get('submissions', [])
    submissions.push(submission)
    store.set('submissions', submissions)
    return { success: true }
  } catch (error) {
    console.error('Error saving submission:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('get-submissions', async () => {
  try {
    const submissions = store.get('submissions', [])
    return { success: true, data: submissions }
  } catch (error) {
    console.error('Error getting submissions:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('clear-submissions', async () => {
  try {
    store.set('submissions', [])
    return { success: true }
  } catch (error) {
    console.error('Error clearing submissions:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('print-to-pdf', async (_event) => {
  try {
    if (!win) {
      return { success: false, error: 'Window not found' }
    }

    // Generate PDF from current window
    const pdfData = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 0.5,
        bottom: 0.5,
        left: 0.5,
        right: 0.5
      }
    })

    // Create a temporary file path
    const os = await import('os')
    const fs = await import('fs/promises')
    const timestamp = Date.now()
    const pdfPath = path.join(os.tmpdir(), `form-${timestamp}.pdf`)

    // Write PDF to file
    await fs.writeFile(pdfPath, pdfData)

    // Open the PDF with default system viewer
    await shell.openPath(pdfPath)

    return { success: true, path: pdfPath }
  } catch (error) {
    console.error('Error generating PDF:', error)
    return { success: false, error: String(error) }
  }
})

app.whenReady().then(() => {
  const isMac = process.platform === 'darwin'

  const menuTemplate: any[] = [
    // macOS application menu
    ...(isMac
      ? [
          {
            label: app.name || 'Entrifi',
            submenu: [
              { role: 'about', label: `About ${app.name || 'Entrifi'}` },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit', label: `Quit ${app.name || 'Entrifi'}` },
            ],
          },
        ]
      : []),

    {
      label: 'File',
      submenu: [
        {
          label: 'Contact us',
          click: async () => {
            await shell.openExternal('https://github.com/talhahasanzia');
          }
        },
        {
          label: 'Quit',
          click: () => {
            app.quit();
          }
        }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(menuTemplate as any);
  Menu.setApplicationMenu(menu);
  createWindow()
})
