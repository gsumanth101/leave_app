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
  const { currentUser, userRole, userName, logout } = useAuth();
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#ffffffff' }}>

      <Box
        sx={{
          p: 3,
          background: '#ffffffff',
          color: 'white',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: '#fff',
              color: '#000000ff',
              fontWeight: 700,
              fontSize: '1.125rem',
              border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            {(userName || currentUser?.email)?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body1" fontWeight="700" sx={{ mb: 0.25, fontSize: '0.9375rem' }}>
              {userName || currentUser?.email?.split('@')[0]}
            </Typography>
            <Chip
              label={getRoleDisplay(userRole)}
              size="small"
              color={getRoleColor(userRole)}
              sx={{
                fontWeight: 600,
                fontSize: '0.6875rem',
                height: 22,
                borderRadius: 1.5,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2, px: 1.5 }}>
        {getMenuItems().map((item) => (
          <ListItem key={item.id} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              selected={selectedView === item.id}
              onClick={() => handleMenuClick(item.id)}
              sx={{
                borderRadius: 2,
                py: 1.5,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.04)',
                  transform: 'translateX(4px)',
                },
                '&.Mui-selected': {
                  bgcolor: '#000',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': {
                    bgcolor: '#1a1a1a',
                    transform: 'translateX(4px)',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white'
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: 600
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

      {/* Logout Button */}
      <List sx={{ px: 1.5, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1.2,
              color: '#d32f2f',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(211, 47, 47, 0.08)',
                transform: 'translateX(4px)',
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: '#d32f2f' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: '#fff',
          color: '#000',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { md: 'none' },
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            fontWeight="700"
            sx={{
              letterSpacing: '-0.5px',
              color: '#000',
              fontSize: '1rem'
            }}
          >
            Staff Management
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Chip
            label={getRoleDisplay(userRole)}
            size="small"
            sx={{
              bgcolor: '#000',
              color: '#fff',
              fontWeight: 600,
              display: { xs: 'none', sm: 'flex' },
              height: 28,
              fontSize: '0.75rem',
              px: 1
            }}
          />
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
          p: { xs: 2, sm: 3, md: 4 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: '#f5f5f5',
          mt: { xs: 7, sm: 8 },
          transition: 'all 0.3s ease'
        }}
      >
        <Box sx={{
          maxWidth: '1400px',
          margin: '0 auto',
        }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
