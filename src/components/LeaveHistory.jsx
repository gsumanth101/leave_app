import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  MenuItem
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const LeaveHistory = () => {
  const { currentUser, userRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (!currentUser) return;

    let q;
    if (userRole === 'employee') {
      q = query(
        collection(db, 'leaveRequests'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
    } else {
      // HR/GM/AE see all leaves (can be filtered by assigned employees in ApproveLeave)
      q = query(
        collection(db, 'leaveRequests'),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const leaveData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLeaves(leaveData);
        setFilteredLeaves(leaveData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load leave history: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // Filter leaves when filter changes
  useEffect(() => {
    let filtered = [...leaves];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(leave => leave.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(leave => leave.type === filterType);
    }

    setFilteredLeaves(filtered);
  }, [filterStatus, filterType, leaves]);

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      rejected: { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
      pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' },
      hr_approved: { color: 'info', icon: <PendingIcon />, label: 'HR Approved - Awaiting GM/AE' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
      />
    );
  };

  const getApprovalDetails = (leave) => {
    const approvals = [];
    
    // HR Approval (Level 1)
    if (leave.hrApproval?.status) {
      const status = leave.hrApproval.status === 'approved' ? '✓' : '✗';
      const statusText = leave.hrApproval.status.charAt(0).toUpperCase() + leave.hrApproval.status.slice(1);
      approvals.push(`HR: ${status} ${statusText}`);
    } else {
      approvals.push('HR: Pending');
    }

    // GM/AE Approval (Level 2)
    if (leave.gmaeApproval?.status) {
      const status = leave.gmaeApproval.status === 'approved' ? '✓' : '✗';
      const statusText = leave.gmaeApproval.status.charAt(0).toUpperCase() + leave.gmaeApproval.status.slice(1);
      const role = leave.gmaeApproval.approvedByRole || 'GM/AE';
      approvals.push(`${role}: ${status} ${statusText}`);
    } else if (leave.status === 'hr_approved') {
      approvals.push('GM/AE: Pending');
    }
    
    return approvals.join(' | ');
  };

  const columns = [
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={params.value === 'leave' ? 'primary' : 'secondary'}
          sx={{ textTransform: 'capitalize' }}
        />
      )
    },
    {
      field: 'leaveType',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => (
        <Typography sx={{ textTransform: 'capitalize' }}>
          {params.value}
        </Typography>
      )
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      width: 120
    },
    {
      field: 'endDate',
      headerName: 'End Date',
      width: 120
    },
    {
      field: 'duration',
      headerName: 'Duration',
      width: 100,
      renderCell: (params) => (
        <Typography fontWeight="bold">
          {params.value || 0} {params.value === 1 ? 'day' : 'days'}
        </Typography>
      )
    },
    {
      field: 'reason',
      headerName: 'Reason',
      width: 200,
      flex: 1
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => getStatusChip(params.value)
    },
    {
      field: 'approvals',
      headerName: 'Approval Details',
      width: 250,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {getApprovalDetails(params.row)}
        </Typography>
      )
    }
  ];

  // Add employee email column for non-employees
  if (userRole !== 'employee') {
    columns.splice(1, 0, {
      field: 'userEmail',
      headerName: 'Employee',
      width: 200,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      )
    });
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <HistoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {userRole === 'employee' ? 'My Leave History' : 'All Leave Requests'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and track all leave requests with detailed status
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {/* Filters */}
          <Box display="flex" gap={2} mb={3} flexWrap="wrap">
            <TextField
              select
              size="small"
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending HR Approval</MenuItem>
              <MenuItem value="hr_approved">HR Approved - Awaiting GM/AE</MenuItem>
              <MenuItem value="approved">Fully Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="leave">Leave</MenuItem>
              <MenuItem value="permission">Permission</MenuItem>
            </TextField>
          </Box>

          {leaves.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No leave requests found. {userRole === 'employee' && 'Apply for your first leave!'}
            </Alert>
          ) : (
            <Box sx={{ height: 600, width: '100%' }}>
              <DataGrid
                rows={filteredLeaves}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[5, 10, 25, 50]}
                checkboxSelection={false}
                disableSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #f0f0f0',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f5f7fa',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  },
                  '& .MuiDataGrid-row:hover': {
                    backgroundColor: '#f8f9fa',
                  }
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeaveHistory;
