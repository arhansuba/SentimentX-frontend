import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Badge,
  IconButton,
  styled
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Code as CodeIcon,
  Notifications as NotificationsIcon,
  SwapHoriz as SwapHorizIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  CloudUpload as CloudUploadIcon,
  Menu as MenuIcon
} from '@mui/icons-material';
import { useTheme } from '../../context/ThemeContext';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

const Sidebar = () => {
  const location = useLocation();
  useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contractsOpen, setContractsOpen] = useState(true);

  const handleContractsClick = () => {
    setContractsOpen(!contractsOpen);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Contracts',
      icon: <CodeIcon />,
      path: '/contracts',
      submenu: [
        {
          text: 'Upload Contract',
          icon: <CloudUploadIcon />,
          path: '/upload-contract',
        },
        {
          text: 'Contract Analysis',
          icon: <SecurityIcon />,
          path: '/contracts',
        }
      ]
    },
    {
      text: 'Security Alerts',
      icon: <NotificationsIcon />,
      path: '/alerts',
      badge: 15,
    },
    {
      text: 'Transactions',
      icon: <SwapHorizIcon />,
      path: '/transactions',
    },
    {
      text: 'Settings',
      icon: <SettingsIcon />,
      path: '/settings',
    }
  ];

  const drawer = (
    <>
      <DrawerHeader>
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%',
          fontWeight: 'bold'
        }}>
          <SecurityIcon sx={{ mr: 1 }} />
          AI Sentinel
        </Box>
      </DrawerHeader>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            {item.submenu ? (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={handleContractsClick}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                    {contractsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={contractsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.submenu.map((subItem) => (
                      <ListItem key={subItem.text} disablePadding>
                        <ListItemButton
                          component={Link}
                          to={subItem.path}
                          selected={isActive(subItem.path)}
                          sx={{ pl: 4 }}
                        >
                          <ListItemIcon>
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.text} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.badge && (
                    <Badge badgeContent={item.badge} color="error" />
                  )}
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>
    </>
  );

  return (
    <>
      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1100 }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <StyledDrawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
        }}
        open
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default Sidebar;