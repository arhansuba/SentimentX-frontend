// src/components/Dashboard/SecurityScore.tsx
import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { GppGoodOutlined, GppMaybeOutlined, GppBadOutlined } from '@mui/icons-material';

interface SecurityScoreProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  className?: string;
}

const SecurityScore: React.FC<SecurityScoreProps> = ({
  score,
  size = 'medium',
  showLabel = true,
  className = '',
}) => {
  // Get color based on score
  const getColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // green-500
    if (score >= 60) return '#eab308'; // yellow-500
    if (score >= 40) return '#f97316'; // orange-500
    return '#ef4444'; // red-500
  };

  // Get security label based on score
  const getSecurityLabel = (score: number) => {
    if (score >= 80) return 'Safe';
    if (score >= 60) return 'Moderate Risk';
    if (score >= 40) return 'High Risk';
    return 'Critical Risk';
  };

  // Get appropriate icon based on score
  const getSecurityIcon = (score: number) => {
    if (score >= 80) return <GppGoodOutlined style={{ color: getColor(score) }} />;
    if (score >= 60) return <GppMaybeOutlined style={{ color: getColor(score) }} />;
    return <GppBadOutlined style={{ color: getColor(score) }} />;
  };

  // Size variants
  const sizeVariants = {
    small: {
      width: 60,
      height: 60,
      fontSize: '0.75rem',
      scoreSize: '1.25rem',
      thickness: 4,
    },
    medium: {
      width: 100,
      height: 100,
      fontSize: '0.875rem',
      scoreSize: '1.75rem',
      thickness: 6,
    },
    large: {
      width: 150,
      height: 150,
      fontSize: '1rem',
      scoreSize: '2.5rem',
      thickness: 8,
    },
  };

  const currentSize = sizeVariants[size];

  return (
    <Box className={`flex flex-col items-center ${className}`}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={score}
          size={currentSize.width}
          thickness={currentSize.thickness}
          sx={{
            color: getColor(score),
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h6"
            component="div"
            fontWeight="bold"
            sx={{ fontSize: currentSize.scoreSize }}
          >
            {score}
          </Typography>
          <Typography
            variant="caption"
            component="div"
            sx={{ fontSize: currentSize.fontSize, opacity: 0.7 }}
          >
            /100
          </Typography>
        </Box>
      </Box>
      
      {showLabel && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            {getSecurityIcon(score)}
            <Typography
              variant="subtitle2"
              component="div"
              fontWeight="medium"
              sx={{ ml: 0.5, color: getColor(score) }}
            >
              {getSecurityLabel(score)}
            </Typography>
          </Box>
          
          <Typography variant="caption" color="text.secondary">
            Security Score
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SecurityScore;