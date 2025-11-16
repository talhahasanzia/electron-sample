import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import AddIcon from '@mui/icons-material/Add'
import { REASON_CONFIGS } from '../reasonFields'
import FormDetails from './FormDetails'

type Props = {
  createdBy: string
  onSignOut: () => void
  onCreateNew: () => void
}

export default function FormsList({ createdBy, onSignOut, onCreateNew }: Props) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electronAPI.getSubmissions()
      if (result.success && result.data) {
        // Sort by timestamp descending (newest first)
        const sorted = [...result.data].sort((a, b) => b.timestamp - a.timestamp)
        setSubmissions(sorted)
      } else {
        setError(result.error || 'Failed to load submissions')
      }
    } catch (err) {
      setError(`Error loading submissions: ${err}`)
      console.error('Error loading submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const reasonLabel = (key?: string) => {
    if (!key) return '—'
    const found = REASON_CONFIGS.find((r) => r.key === key)
    return found ? found.label : key
  }

  const handleRowClick = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setDetailsOpen(false)
    setSelectedSubmission(null)
  }

  return (
    <Box sx={{ minHeight: '70vh', p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Form Submissions</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Typography variant="body2">
            Signed in as <strong>{createdBy}</strong>
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            Create New Form
          </Button>
          <Button variant="outlined" onClick={onSignOut}>
            Sign Out
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress />
        </Box>
      ) : submissions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No forms created yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Click "Create New Form" to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateNew}
          >
            Create Your First Form
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Reason Type</strong></TableCell>
                <TableCell><strong>Created By</strong></TableCell>
                <TableCell><strong>Created For</strong></TableCell>
                <TableCell><strong>Date</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow
                  key={submission.serialNumber}
                  onClick={() => handleRowClick(submission)}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    }
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {reasonLabel(submission.reasonType)}
                    </Typography>
                  </TableCell>
                  <TableCell>{submission.createdBy}</TableCell>
                  <TableCell>{submission.createdFor}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>
                      {formatDate(submission.timestamp)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total: {submissions.length} form{submissions.length !== 1 ? 's' : ''}
        </Typography>
        <Button size="small" onClick={loadSubmissions}>
          Refresh
        </Button>
      </Box>

      <FormDetails
        submission={selectedSubmission}
        open={detailsOpen}
        onClose={handleCloseDetails}
      />
    </Box>
  )
}
