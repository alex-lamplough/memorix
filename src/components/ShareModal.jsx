import React, { useState } from 'react'
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  FormControlLabel, 
  Switch,
  IconButton,
  Snackbar,
  Alert,
  Typography,
  Divider,
  Box,
  Tooltip
} from '@mui/material'

// Icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CloseIcon from '@mui/icons-material/Close'
import LinkIcon from '@mui/icons-material/Link'
import FacebookIcon from '@mui/icons-material/Facebook'
import TwitterIcon from '@mui/icons-material/Twitter'
import EmailIcon from '@mui/icons-material/Email'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import LinkedInIcon from '@mui/icons-material/LinkedIn'

// Import the ShareFeature component
import ShareFeature from './ShareFeature'

/**
 * ShareModal component for sharing flashcards and quizzes with others
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {string} itemId - ID of the item being shared
 * @param {string} itemType - Type of item being shared ('flashcards' or 'quiz')
 * @param {string} itemTitle - Title of the item being shared
 */
const ShareModal = ({ open, onClose, itemToShare }) => {
  const [passwordProtected, setPasswordProtected] = useState(false)
  const [password, setPassword] = useState('')
  const [expiresAfter, setExpiresAfter] = useState('never')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  if (!itemToShare) return null;
  
  const shareUrl = `${window.location.origin}/share/${itemToShare.type}/${itemToShare.id}`;

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setSnackbarMessage('Link copied to clipboard!')
        setSnackbarOpen(true)
      })
      .catch(() => {
        setSnackbarMessage('Failed to copy link')
        setSnackbarOpen(true)
      })
  }

  // Handle social media sharing
  const handleSocialShare = (platform) => {
    let shareLink = ''
    const text = `Check out this ${itemToShare.type}: ${itemToShare.title}`
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
        break
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
        break
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`
        break
      default:
        return
    }
    
    window.open(shareLink, '_blank')
  }

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: '#18092a',
            color: 'white',
            borderRadius: '12px',
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center">
          <Typography variant="h6">
            Share {itemToShare.type}: {itemToShare.title}
          </Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box className="mb-6">
            <Typography variant="subtitle1" className="mb-2 font-medium">Share Link</Typography>
            <div className="flex">
              <TextField
                fullWidth
                variant="outlined"
                value={shareUrl}
                InputProps={{
                  readOnly: true,
                  sx: { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }
                }}
                size="small"
              />
              <Tooltip title="Copy link">
                <IconButton 
                  onClick={handleCopyLink} 
                  className="ml-2"
                  sx={{ 
                    color: '#00ff94',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 255, 148, 0.1)',
                    }
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Tooltip>
            </div>
          </Box>
          
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 2 }} />
          
          <Typography variant="subtitle1" className="mb-4 font-medium">Share Options</Typography>
          
          <div className="grid gap-4">
            <FormControlLabel
              control={
                <Switch 
                  checked={passwordProtected}
                  onChange={(e) => setPasswordProtected(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00ff94',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 148, 0.1)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00ff94',
                    },
                  }}
                />
              }
              label="Password Protection"
            />
            
            {passwordProtected && (
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                margin="dense"
                InputLabelProps={{
                  style: { color: 'rgba(255, 255, 255, 0.7)' },
                }}
                InputProps={{
                  sx: { 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }
                }}
              />
            )}
            
            <div>
              <Typography variant="body2" className="mb-2">Expire After</Typography>
              <div className="flex gap-2">
                {['Never', '1 Day', '7 Days', '30 Days'].map((option) => (
                  <Button
                    key={option}
                    variant={expiresAfter === option.toLowerCase() ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setExpiresAfter(option.toLowerCase())}
                    sx={{
                      color: expiresAfter === option.toLowerCase() ? 'black' : 'white',
                      backgroundColor: expiresAfter === option.toLowerCase() ? '#00ff94' : 'transparent',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        backgroundColor: expiresAfter === option.toLowerCase() ? '#00ff94' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: expiresAfter === option.toLowerCase() ? '#00ff94' : 'rgba(255, 255, 255, 0.3)',
                      },
                    }}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', my: 3 }} />
          
          <Typography variant="subtitle1" className="mb-4 font-medium">Share via</Typography>
          <div className="flex gap-4 justify-center">
            <IconButton 
              onClick={() => handleSocialShare('facebook')} 
              sx={{ color: '#1877F2', backgroundColor: 'rgba(24, 119, 242, 0.1)', '&:hover': { backgroundColor: 'rgba(24, 119, 242, 0.2)' } }}
            >
              <FacebookIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleSocialShare('twitter')} 
              sx={{ color: '#1DA1F2', backgroundColor: 'rgba(29, 161, 242, 0.1)', '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.2)' } }}
            >
              <TwitterIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleSocialShare('linkedin')} 
              sx={{ color: '#0A66C2', backgroundColor: 'rgba(10, 102, 194, 0.1)', '&:hover': { backgroundColor: 'rgba(10, 102, 194, 0.2)' } }}
            >
              <LinkedInIcon />
            </IconButton>
            <IconButton 
              onClick={() => handleSocialShare('whatsapp')} 
              sx={{ color: '#25D366', backgroundColor: 'rgba(37, 211, 102, 0.1)', '&:hover': { backgroundColor: 'rgba(37, 211, 102, 0.2)' } }}
            >
              <WhatsAppIcon />
            </IconButton>
          </div>
        </DialogContent>
        
        <DialogActions sx={{ padding: '16px 24px' }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ 
              color: 'white', 
              borderColor: 'rgba(255, 255, 255, 0.5)',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleCopyLink}
            sx={{ 
              backgroundColor: '#00ff94', 
              color: 'black',
              '&:hover': {
                backgroundColor: '#00cc78',
              }
            }}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%', backgroundColor: '#00ff94', color: 'black' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  )
}

export default ShareModal 