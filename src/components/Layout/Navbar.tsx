import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Container,
  Tooltip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AccountCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface NavbarProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDarkMode }) => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  return (
    <StyledAppBar position="sticky">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            AI Sentinel
          </Typography>

          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 500,
              color: 'text.secondary',
            }}
          >
            MultiversX
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              <IconButton 
                onClick={toggleTheme} 
                color="inherit"
                sx={{ ml: 1 }}
              >
                {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <IconButton
                color="inherit"
                onClick={handleOpenNotifications}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationsAnchor}
              open={Boolean(notificationsAnchor)}
              onClose={handleCloseNotifications}
              sx={{ mt: '45px' }}
            >
              <MenuItem onClick={handleCloseNotifications}>
                <Typography>New high-risk alert detected</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotifications}>
                <Typography>Transaction pattern anomaly found</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotifications}>
                <Typography>Contract updated - new version available</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseNotifications}>
                <Typography sx={{ fontWeight: 'bold' }}>View All Notifications</Typography>
              </MenuItem>
            </Menu>

            <Tooltip title="Account settings">
              <IconButton 
                onClick={handleOpenUserMenu} 
                sx={{ ml: 1 }}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorElUser}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
              sx={{ mt: '45px' }}
            >
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography>Profile</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography>Settings</Typography>
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu}>
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;