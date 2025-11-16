import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // You can expose other APTs you need here.
  // ...
})

// Expose typed API for form submissions
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

contextBridge.exposeInMainWorld('electronAPI', {
  saveSubmission: (submission: FormSubmission) => ipcRenderer.invoke('save-submission', submission),
  getSubmissions: () => ipcRenderer.invoke('get-submissions'),
  clearSubmissions: () => ipcRenderer.invoke('clear-submissions'),
  printToPDF: () => ipcRenderer.invoke('print-to-pdf'),
})
