import React, { useState, useMemo } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import { REASON_CONFIGS, ReasonConfig, FieldConfig } from '../reasonFields'

type Props = {
  createdBy: string
  onSignOut: () => void
  onFormCreated: () => void
  onCancel: () => void
}

// Simple UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export default function CreationForm({ createdBy, onFormCreated, onCancel }: Props) {
  const [createdFor, setCreatedFor] = useState('')
  const [creationReason, setCreationReason] = useState('')
  const [reasonType, setReasonType] = useState<string | undefined>(undefined)
  const [amount, setAmount] = useState<number | ''>('')
  const [extraFields, setExtraFields] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Generate new serial number each time component mounts (for each new form)
  const serialNumber = useMemo(() => {
    const uuid = generateUUID()
    const timestamp = Date.now()
    return `${uuid}-${timestamp}`
  }, [])

  const activeReason: ReasonConfig | undefined = reasonType
    ? REASON_CONFIGS.find((r) => r.key === reasonType)
    : undefined

  const handleExtraChange = (name: string, value: any) => {
    setExtraFields((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!createdFor.trim()) {
      setError('"Created For" is required.')
      return
    }
    if (!reasonType) {
      setError('Please select a reason type.')
      return
    }

    // Save to electron-store via IPC
    setSubmitting(true)
    try {
      const submission = {
        serialNumber,
        createdBy,
        createdFor: createdFor.trim(),
        reasonType,
        amount: typeof amount === 'number' ? amount : undefined,
        creationReason: creationReason.trim(),
        extraFields,
        timestamp: Date.now()
      }

      const result = await window.electronAPI.saveSubmission(submission)

      if (result.success) {
        // Navigate back to list after successful creation
        onFormCreated()
      } else {
        setError(`Failed to save submission: ${result.error || 'Unknown error'}`)
      }
    } catch (err) {
      setError(`Error saving submission: ${err}`)
      console.error('Error saving submission:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: 560, p: 3, boxShadow: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">New Creation</Typography>
          <Typography variant="body2">Signed in as <strong>{createdBy}</strong></Typography>
        </Box>

        <TextField label="Created By" value={createdBy} disabled fullWidth margin="normal" />

        <TextField label="Serial Number" value={serialNumber} disabled fullWidth margin="normal" />

        <TextField
          label="Reason Type"
          select
          value={reasonType || ''}
          onChange={(e) => setReasonType(e.target.value || undefined)}
          required
          fullWidth
          margin="normal"
          disabled={submitting}
        >
          <MenuItem value="">Select reason</MenuItem>
          {REASON_CONFIGS.map((r) => (
            <MenuItem key={r.key} value={r.key}>
              {r.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Created For"
          value={createdFor}
          onChange={(e) => setCreatedFor(e.target.value)}
          required
          fullWidth
          margin="normal"
          disabled={submitting}
        />

        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
          required
          fullWidth
          margin="normal"
          type="number"
          disabled={submitting}
        />

        {activeReason && activeReason.fields.map((field: FieldConfig) => {
          const key = field.name
          if (field.type === 'date') {
            return (
              <TextField
                key={key}
                label={field.label}
                type="date"
                value={extraFields[key] || ''}
                onChange={(e) => handleExtraChange(key, e.target.value)}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
            )
          }

          return (
            <TextField
              key={key}
              label={field.label}
              value={extraFields[key] || ''}
              onChange={(e) => handleExtraChange(key, e.target.value)}
              fullWidth
              margin="normal"
              placeholder={field.placeholder}
              disabled={submitting}
            />
          )
        })}

        <TextField
          label="Creation Reason (notes)"
          value={creationReason}
          onChange={(e) => setCreationReason(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          minRows={3}
          disabled={submitting}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button type="button" onClick={onCancel} variant="outlined" disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Saving...' : 'Submit'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
