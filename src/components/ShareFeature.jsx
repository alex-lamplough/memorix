import React, { useState } from 'react';
import {
  Button,
  Tooltip,
  IconButton,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';

// Icons
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';

/**
 * ShareFeature component - A concise way to share content
 * @param {Object} props
 * @param {string} props.itemId - ID of the item being shared
 * @param {string} props.itemType - Type of item being shared ('flashcards' or 'quiz')
 * @param {string} props.itemTitle - Title of the item being shared
 */
const ShareFeature = ({ itemId, itemType, itemTitle }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const shareUrl = `${window.location.origin}/share/${itemType}/${itemId}`;

  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setSnackbarMessage('Link copied to clipboard!');
        setSnackbarOpen(true);
      })
      .catch(() => {
        setSnackbarMessage('Failed to copy link');
        setSnackbarOpen(true);
      });
  };

  // Handle social media sharing
  const handleSocialShare = (platform) => {
    let shareLink = '';
    const text = `Check out this ${itemType}: ${itemTitle}`;
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex">
        <TextField
          fullWidth
          variant="outlined"
          value={shareUrl}
          size="small"
          className="bg-opacity-5 bg-white text-white border-opacity-20 border-white"
          inputProps={{
            readOnly: true,
            className: "text-white"
          }}
        />
        <Tooltip title="Copy link">
          <IconButton 
            onClick={handleCopyLink} 
            className="ml-2 text-[#00ff94] hover:bg-[#00ff94] hover:bg-opacity-10"
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </div>
      
      <div className="flex justify-center space-x-4">
        <IconButton 
          onClick={() => handleSocialShare('facebook')} 
          className="text-[#1877F2] bg-[#1877F2] bg-opacity-10 hover:bg-opacity-20"
        >
          <FacebookIcon />
        </IconButton>
        <IconButton 
          onClick={() => handleSocialShare('twitter')} 
          className="text-[#1DA1F2] bg-[#1DA1F2] bg-opacity-10 hover:bg-opacity-20"
        >
          <TwitterIcon />
        </IconButton>
        <IconButton 
          onClick={() => handleSocialShare('linkedin')} 
          className="text-[#0A66C2] bg-[#0A66C2] bg-opacity-10 hover:bg-opacity-20"
        >
          <LinkedInIcon />
        </IconButton>
        <IconButton 
          onClick={() => handleSocialShare('whatsapp')} 
          className="text-[#25D366] bg-[#25D366] bg-opacity-10 hover:bg-opacity-20"
        >
          <WhatsAppIcon />
        </IconButton>
      </div>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          className="bg-[#18092a] text-white border border-[#00ff94]"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ShareFeature; 