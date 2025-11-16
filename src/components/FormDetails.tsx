import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Divider from '@mui/material/Divider'
import PrintIcon from '@mui/icons-material/Print'
import { REASON_CONFIGS } from '../reasonFields'

type Props = {
  submission: FormSubmission | null
  open: boolean
  onClose: () => void
}

export default function FormDetails({ submission, open, onClose }: Props) {
  if (!submission) return null

  const reasonConfig = submission.reasonType
    ? REASON_CONFIGS.find((r) => r.key === submission.reasonType)
    : undefined


  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const handlePrint = async () => {
    try {
      const result = await window.electronAPI.printToPDF()
      if (!result.success) {
        console.error('Failed to generate PDF:', result.error)
        alert('Failed to generate PDF: ' + (result.error || 'Unknown error'))
      }
      // PDF is automatically opened by the main process
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF: ' + error)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5">Entrifi</Typography>
            <Typography variant="body2" color="text.secondary">
              {reasonConfig?.label || submission.reasonType || 'Unknown Type'}
            </Typography>
          </Box>
          <IconButton
            onClick={handlePrint}
            color="primary"
            aria-label="print"
            sx={{ mt: -1 }}
          >
            <PrintIcon sx={{ fontSize: 32 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Basic Fields */}
          <TextField
            label="Serial Number"
            value={submission.serialNumber}
            disabled
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#424242',
                color: '#424242',
              }
            }}
          />

          <TextField
            label="Created By"
            value={submission.createdBy}
            disabled
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#424242',
                color: '#424242',
              }
            }}
          />

          <TextField
            label="Created For"
            value={submission.createdFor}
            disabled
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#424242',
                color: '#424242',
              }
            }}
          />

          <TextField
            label="Reason Type"
            value={reasonConfig?.label || submission.reasonType || '—'}
            disabled
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#424242',
                color: '#424242',
              }
            }}
          />

          {submission.amount !== undefined && (
            <TextField
              label="Amount"
              value={submission.amount}
              disabled
              fullWidth
              slotProps={{ htmlInput: { readOnly: true } }}
              sx={{
                '& .MuiInputBase-input.Mui-disabled': {
                  WebkitTextFillColor: '#424242',
                  color: '#424242',
                }
              }}
            />
          )}

          <TextField
            label="Date Created"
            value={formatDate(submission.timestamp)}
            disabled
            fullWidth
            slotProps={{ htmlInput: { readOnly: true } }}
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                WebkitTextFillColor: '#424242',
                color: '#424242',
              }
            }}
          />

          {/* Dynamic Extra Fields */}
          {reasonConfig && submission.extraFields && (
            <>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Additional Fields
                </Typography>
              </Divider>

              {reasonConfig.fields.map((fieldConfig) => {
                const value = submission.extraFields?.[fieldConfig.name]
                if (value === undefined || value === '') return null

                return (
                  <TextField
                    key={fieldConfig.name}
                    label={fieldConfig.label}
                    value={value}
                    disabled
                    fullWidth
                    slotProps={{
                      htmlInput: { readOnly: true },
                      inputLabel: fieldConfig.type === 'date' ? { shrink: true } : undefined
                    }}
                    type={fieldConfig.type === 'date' ? 'date' : 'text'}
                    sx={{
                      '& .MuiInputBase-input.Mui-disabled': {
                        WebkitTextFillColor: '#424242',
                        color: '#424242',
                      }
                    }}
                  />
                )
              })}
            </>
          )}

          {/* Notes */}
          {submission.creationReason && (
            <>
              <Divider sx={{ my: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Notes
                </Typography>
              </Divider>

              <TextField
                label="Creation Reason / Notes"
                value={submission.creationReason}
                disabled
                fullWidth
                multiline
                minRows={3}
                slotProps={{ htmlInput: { readOnly: true } }}
                sx={{
                  '& .MuiInputBase-input.Mui-disabled': {
                    WebkitTextFillColor: '#424242',
                    color: '#424242',
                  }
                }}
              />
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

