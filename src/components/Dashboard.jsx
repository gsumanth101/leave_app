import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ExitToApp as LogoutIcon,
  AddCircle as AddIcon,
  History as HistoryIcon,
  CheckCircle as ApproveIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  BarChart as StatsIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import ApplyLeave from './ApplyLeave';
import LeaveHistory from './LeaveHistory';
import ApproveLeave from './ApproveLeave';
import AEApproval from './AEApproval';
import EmployeeManagement from './EmployeeManagement';
import Statistics from './Statistics';
import LeaveCalendar from './LeaveCalendar';
import Profile from './Profile';

const drawerWidth = 260;

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('dashboard');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      employee: 'Employee',
      HR: 'Human Resources',
      GM: 'General Manager',
      AE: 'Admin Executive'
    };
    return roleMap[role] || role;
  };

  const getRoleColor = (role) => {
    const colorMap = {
      employee: 'primary',
      HR: 'secondary',
      GM: 'success',
      AE: 'warning'
    };
    return colorMap[role] || 'default';
  };

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
      { id: 'calendar', label: 'Leave Calendar', icon: <CalendarIcon /> },
      { id: 'profile', label: 'My Profile', icon: <PersonIcon /> }
    ];

    if (userRole === 'employee') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { id: 'apply', label: 'Apply Leave', icon: <AddIcon /> },
        { id: 'history', label: 'My Leaves', icon: <HistoryIcon /> },
        ...commonItems.slice(1) // Calendar and Profile
      ];
    }

    if (userRole === 'HR') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { id: 'approve', label: 'HR Approval (Level 1)', icon: <ApproveIcon /> },
        { id: 'all-leaves', label: 'All Leaves', icon: <AssignmentIcon /> },
        ...commonItems.slice(1) // Calendar and Profile
      ];
    }

    if (userRole === 'GM' || userRole === 'AE') {
      return [
        ...commonItems.slice(0, 1), // Dashboard
        { id: 'employees', label: 'Manage Employees', icon: <PeopleIcon /> },
        { id: 'approve', label: 'Approval (Level 2)', icon: <ApproveIcon /> },
        { id: 'all-leaves', label: 'All Leaves', icon: <AssignmentIcon /> },
        ...commonItems.slice(1) // Calendar and Profile
      ];
    }

    return commonItems;
  };

  const handleMenuClick = (itemId) => {
    setSelectedView(itemId);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'dashboard':
        return <Statistics />;
      case 'apply':
        return <ApplyLeave />;
      case 'history':
      case 'team-leaves':
      case 'all-leaves':
        return <LeaveHistory />;
      case 'approve':
        // HR uses ApproveLeave (Level 1), GM/AE use AEApproval (Level 2)
        return userRole === 'HR' ? <ApproveLeave /> : <AEApproval />;
      case 'employees':
        return <EmployeeManagement />;
      case 'calendar':
        return <LeaveCalendar />;
      case 'profile':
        return <Profile />;
      default:
        return <Statistics />;
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 50,
              height: 50,
              bgcolor: 'rgba(255,255,255,0.3)',
              fontWeight: 'bold'
            }}
          >
            {currentUser?.email?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {currentUser?.email?.split('@')[0]}
            </Typography>
            <Chip
              label={getRoleDisplay(userRole)}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold'
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {getMenuItems().map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={selectedView === item.id}
              onClick={() => handleMenuClick(item.id)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Logout Button */}
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            Leave Management System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f7fa',
          mt: 8
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default Dashboard;
