import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  fullScreen?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'; // New property
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message,
  fullScreen = false,
  color = 'primary', // New property
}) => {
  const spinnerSize = {
    small: 24,
    medium: 40,
    large: 60
  }[size];

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <CircularProgress
        size={spinnerSize}
        thickness={4}
        sx={{
          color: theme => theme.palette[color].main // Use the new color property
        }}
      />
      {message && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            textAlign: 'center',
            color: 'text.secondary'
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default LoadingSpinner;