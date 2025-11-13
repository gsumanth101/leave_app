import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Grid,
  Divider,
  MenuItem,
  InputAdornment,
  IconButton,
  Tooltip,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon
} from '@mui/icons-material';

const ApproveLeave = () => {
  const { currentUser, userRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState('');
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLeaves, setFilteredLeaves] = useState([]);

  useEffect(() => {
    // HR sees ALL leave requests for first level approval
    const q = query(
      collection(db, 'leaveRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        let leaveData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // HR sees all leaves for first level approval
        // No filtering needed for HR - they approve everything first

        setLeaves(leaveData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load leave requests: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // Apply filters
  useEffect(() => {
    let filtered = leaves;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(leave => {
        if (filterStatus === 'pending') {
          // Show leaves pending HR approval (no hrApproval or hrApproval is pending)
          return !leave.hrApproval || leave.hrApproval?.status === 'pending' || leave.status === 'pending';
        }
        if (filterStatus === 'approved') {
          return leave.hrApproval?.status === 'approved';
        }
        if (filterStatus === 'rejected') {
          return leave.hrApproval?.status === 'rejected';
        }
        return leave.status === filterStatus;
      });
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(leave => leave.type === filterType);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(leave => 
        leave.userName?.toLowerCase().includes(query) ||
        leave.userEmail?.toLowerCase().includes(query) ||
        leave.reason?.toLowerCase().includes(query) ||
        leave.leaveType?.toLowerCase().includes(query)
      );
    }

    setFilteredLeaves(filtered);
  }, [leaves, filterStatus, filterType, searchQuery]);

  const handleViewDetails = (leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
  };

  const handleOpenActionDialog = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setRemarks('');
    setDialogOpen(true);
  };

  const handleAction = async () => {
    if (!selectedLeave) return;
    
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const leaveRef = doc(db, 'leaveRequests', selectedLeave.id);
      
      let updateData = {
        updatedAt: serverTimestamp()
      };

      // HR does first level approval
      updateData.hrApproval = {
        status: actionType,
        approvedBy: currentUser.email,
        approvedByName: currentUser.displayName || currentUser.email,
        remarks: remarks,
        timestamp: serverTimestamp()
      };

      // If HR rejects, overall status is rejected
      if (actionType === 'rejected') {
        updateData.status = 'rejected';
      } else {
        // If HR approves, status becomes 'hr_approved' waiting for GM/AE
        updateData.status = 'hr_approved';
      }

      await updateDoc(leaveRef, updateData);
      
      setSuccess(`Leave request ${actionType === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setDialogOpen(false);
      setSelectedLeave(null);
      setRemarks('');
      setRemarks('');
    } catch (err) {
      setError('Failed to update leave request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = (leave) => {
    if (userRole === 'HR') {
      return leave.hrApproval === 'pending';
    } else if (userRole === 'GM') {
      return leave.gmApproval === 'pending';
    }
    return false;
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      approved: { color: 'success', icon: <CheckCircleIcon />, label: 'Approved' },
      rejected: { color: 'error', icon: <CancelIcon />, label: 'Rejected' },
      pending: { color: 'warning', icon: <PendingIcon />, label: 'Pending' }
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

  // Expandable Row Component
  const Row = ({ row }) => {
    const [open, setOpen] = useState(false);
    // Show approve/reject buttons if HR hasn't approved/rejected yet
    const canApprove = !row.hrApproval || (row.hrApproval?.status !== 'approved' && row.hrApproval?.status !== 'rejected');

    return (
      <>
        <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:hover': { backgroundColor: '#f5f5f5' } }}>
          <TableCell>
            <IconButton size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>
            <Typography variant="body2" fontWeight="500">
              {row.userName || 'N/A'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.userEmail}
            </Typography>
          </TableCell>
          <TableCell>
            <Chip
              label={row.type}
              size="small"
              color={row.type === 'leave' ? 'primary' : 'secondary'}
            />
          </TableCell>
          <TableCell sx={{ textTransform: 'capitalize' }}>
            {row.leaveType}
          </TableCell>
          <TableCell>
            <Typography variant="body2">{row.startDate}</Typography>
            <Typography variant="caption" color="text.secondary">to {row.endDate}</Typography>
            {row.duration && (
              <Chip label={`${row.duration} days`} size="small" sx={{ ml: 1 }} />
            )}
          </TableCell>
          <TableCell>
            {getStatusChip(row.hrApproval?.status || 'pending')}
          </TableCell>
          <TableCell>
            {canApprove ? (
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => handleOpenActionDialog(row, 'approved')}
                >
                  Approve
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleOpenActionDialog(row, 'rejected')}
                >
                  Reject
                </Button>
              </Stack>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {row.hrApproval?.status === 'approved' ? 'Approved' : 'Rejected'}
              </Typography>
            )}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2, bgcolor: '#f9f9f9', p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                  Leave Request Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Employee Information
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2"><strong>Name:</strong> {row.userName || 'N/A'}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Email:</strong> {row.userEmail}</Typography>
                        {row.phone && (
                          <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Phone:</strong> {row.phone}</Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Leave Details
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2"><strong>Type:</strong> {row.type}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Leave Type:</strong> {row.leaveType}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Duration:</strong> {row.duration || 'N/A'} days</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Date:</strong> {row.startDate} to {row.endDate}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Reason for Leave
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {row.reason}
                      </Typography>
                    </Paper>
                  </Grid>
                  {row.hrApproval?.remarks && (
                    <Grid item xs={12}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'white' }}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          HR Remarks
                        </Typography>
                        <Divider sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {row.hrApproval.remarks}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          By: {row.hrApproval.approvedByName || row.hrApproval.approvedBy}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };



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
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Leave Approval - {userRole}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Review and approve leave requests from your team
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* Alerts */}
          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          {/* Filters */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search employee, reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status Filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterIcon />
                    </InputAdornment>
                  ),
                }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                label="Type Filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="leave">Leave</MenuItem>
                <MenuItem value="permission">Permission</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={`Total: ${filteredLeaves.length}`} 
                  color="primary" 
                  variant="outlined"
                />
                <Chip 
                  label={`Pending: ${filteredLeaves.filter(l => l.status === 'pending').length}`} 
                  color="warning"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>

          {/* Expandable Table */}
          {leaves.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No leave requests found.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell width={50} />
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Leave Type</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLeaves.map((row) => (
                    <Row key={row.id} row={row} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog (Approve/Reject) */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {actionType === 'approved' ? (
              <CheckCircleIcon color="success" />
            ) : (
              <CancelIcon color="error" />
            )}
            <Typography variant="h6">
              {actionType === 'approved' ? 'Approve' : 'Reject'} Leave Request
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks (Optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={`Add your ${actionType === 'approved' ? 'approval' : 'rejection'} remarks here...`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color={actionType === 'approved' ? 'success' : 'error'}
            onClick={handleAction}
            disabled={actionLoading}
          >
            {actionLoading ? <CircularProgress size={24} /> : `Confirm ${actionType === 'approved' ? 'Approval' : 'Rejection'}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ViewIcon color="primary" />
            <Typography variant="h6">Leave Request Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Employee Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLeave.userName || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLeave.userEmail}</Typography>
                </Grid>

                <Grid item xs={12} mt={2}>
                  <Typography variant="subtitle2" color="text.secondary">Leave Information</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Chip 
                    label={selectedLeave.type} 
                    size="small" 
                    color={selectedLeave.type === 'leave' ? 'primary' : 'secondary'}
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Leave Type</Typography>
                  <Typography variant="body1" fontWeight="500" sx={{ textTransform: 'capitalize' }}>
                    {selectedLeave.leaveType}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Start Date</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLeave.startDate}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">End Date</Typography>
                  <Typography variant="body1" fontWeight="500">{selectedLeave.endDate}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Reason</Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 0.5, bgcolor: '#f9f9f9' }}>
                    <Typography variant="body1">{selectedLeave.reason}</Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} mt={2}>
                  <Typography variant="subtitle2" color="text.secondary">Approval Status</Typography>
                  <Divider sx={{ my: 1 }} />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">HR Status</Typography>
                  {getStatusChip(selectedLeave.hrApproval?.status || 'pending')}
                  {selectedLeave.hrApproval?.remarks && (
                    <Typography variant="caption" display="block" mt={0.5}>
                      {selectedLeave.hrApproval.remarks}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">GM Status</Typography>
                  {getStatusChip(selectedLeave.gmApproval?.status || 'pending')}
                  {selectedLeave.gmApproval?.remarks && (
                    <Typography variant="caption" display="block" mt={0.5}>
                      {selectedLeave.gmApproval.remarks}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">AE Status</Typography>
                  {getStatusChip(selectedLeave.aeApproval?.status || 'pending')}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApproveLeave;
