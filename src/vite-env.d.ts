/// <reference types="vite/client" />

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

interface ElectronAPI {
  saveSubmission: (submission: FormSubmission) => Promise<{ success: boolean; error?: string }>
  getSubmissions: () => Promise<{ success: boolean; data?: FormSubmission[]; error?: string }>
  clearSubmissions: () => Promise<{ success: boolean; error?: string }>
  printToPDF: () => Promise<{ success: boolean; path?: string; error?: string }>
}

interface Window {
  electronAPI: ElectronAPI
}
