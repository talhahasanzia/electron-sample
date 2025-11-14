import React, { useState } from 'react'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'

type Props = {
  createdBy: string
  onSignOut: () => void
}

export default function CreationForm({ createdBy, onSignOut }: Props) {
  const [createdFor, setCreatedFor] = useState('')
  const [creationReason, setCreationReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!createdFor.trim()) {
      setError('"Created For" is required.')
      return
    }
    if (creationReason.trim().length < 10) {
      setError('Please provide a longer creation reason (at least 10 characters).')
      return
    }

    // For now, just mark as submitted. Replace with IPC or API call.
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: 560, p: 3, boxShadow: 2, borderRadius: 2 }}>
          <Typography variant="h5" gutterBottom>
            Submission complete
          </Typography>
          <Typography>Created by: {createdBy}</Typography>
          <Typography>Created for: {createdFor}</Typography>
          <Typography>Reason: {creationReason}</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button onClick={() => { setSubmitted(false); setCreatedFor(''); setCreationReason('') }}>
              Create another
            </Button>
            <Button onClick={onSignOut} variant="outlined">
              Sign Out
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: 560, p: 3, boxShadow: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5">New Creation</Typography>
          <Typography variant="body2">Signed in as <strong>{createdBy}</strong></Typography>
        </Box>

        <TextField label="Created By" value={createdBy} disabled fullWidth margin="normal" />

        <TextField
          label="Created For"
          value={createdFor}
          onChange={(e) => setCreatedFor(e.target.value)}
          required
          fullWidth
          margin="normal"
        />

        <TextField
          label="Creation Reason"
          value={creationReason}
          onChange={(e) => setCreationReason(e.target.value)}
          required
          fullWidth
          margin="normal"
          multiline
          minRows={4}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button type="submit" variant="contained">
            Submit
          </Button>
          <Button type="button" onClick={onSignOut} variant="outlined">
            Sign Out
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
