import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress, Tooltip } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  tooltip?: string; // New property
}

export const Button: React.FC<ButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  tooltip, // New property
  ...rest
}) => {
  const button = (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled || isLoading}
      startIcon={isLoading ? null : startIcon}
      endIcon={isLoading ? null : endIcon}
      sx={{
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: variant === 'contained' ? 2 : 'none',
        '&:hover': {
          boxShadow: variant === 'contained' ? 3 : 'none',
        },
        ...rest.sx
      }}
      {...rest}
    >
      {isLoading ? (
        <>
          <CircularProgress
            size={24}
            thickness={4}
            sx={{
              color: 'inherit',
              position: 'absolute',
              left: '50%',
              marginLeft: '-12px',
            }}
          />
          <span style={{ visibility: 'hidden' }}>{children}</span>
        </>
      ) : (
        children
      )}
    </MuiButton>
  );

  return tooltip ? (
    <Tooltip title={tooltip}>
      <span>{button}</span>
    </Tooltip>
  ) : (
    button
  );
};

export default Button;