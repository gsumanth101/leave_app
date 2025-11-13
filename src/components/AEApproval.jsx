import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  HourglassEmpty as PendingIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';

const AEApproval = () => {
  const { currentUser, userRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // GM/AE can only approve leaves that have been approved by HR (second level)
    // Fetch all leaves and filter client-side to avoid needing composite index
    const q = query(
      collection(db, 'leaveRequests'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const leaveData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(leave => leave.status === 'hr_approved'); // Filter for HR approved leaves
        
        setLeaves(leaveData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load leave requests: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAction = async (leaveId, action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const leaveRef = doc(db, 'leaveRequests', leaveId);
      
      let updateData = {
        gmaeApproval: {
          status: action,
          approvedBy: currentUser?.email || 'GM/AE',
          approvedByRole: userRole,
          remarks: remarks,
          timestamp: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      };

      // Second level approval - final decision
      if (action === 'approved') {
        updateData.status = 'approved';
      } else if (action === 'rejected') {
        updateData.status = 'rejected';
      }

      await updateDoc(leaveRef, updateData);
      
      setSuccess(`Leave request ${action === 'approved' ? 'approved' : 'rejected'} successfully!`);
      setDialogOpen(false);
      setSelectedLeave(null);
      setRemarks('');
    } catch (err) {
      setError('Failed to update leave request: ' + err.message);
    } finally {
      setActionLoading(false);
    }
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card elevation={3}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold" color="primary">
            Final Approval (AE)
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            These leave requests have been approved by HR or GM and require your final approval.
          </Alert>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {leaves.length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No leave requests pending your approval.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell><strong>Leave Type</strong></TableCell>
                    <TableCell><strong>Duration</strong></TableCell>
                    <TableCell><strong>Reason</strong></TableCell>
                    <TableCell><strong>HR Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow 
                      key={leave.id} 
                      hover
                      sx={{
                        bgcolor: !leave.gmaeApproval || leave.gmaeApproval?.status === 'pending' ? '#fff9e6' : 'transparent'
                      }}
                    >
                      <TableCell>{leave.userEmail}</TableCell>
                      <TableCell>
                        <Chip 
                          label={leave.type} 
                          size="small"
                          color={leave.type === 'leave' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>
                        {leave.leaveType}
                      </TableCell>
                      <TableCell>
                        {leave.startDate} to {leave.endDate}
                      </TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        {getStatusChip(leave.hrApproval?.status || 'approved')}
                        {leave.hrApproval?.approvedByName && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            By: {leave.hrApproval.approvedByName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ViewIcon />}
                            onClick={() => {
                              setSelectedLeave(leave);
                              setDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                          {(!leave.gmaeApproval || leave.gmaeApproval?.status === 'pending') && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  handleAction(leave.id, 'approved');
                                }}
                                disabled={actionLoading}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                color="error"
                                onClick={() => {
                                  setSelectedLeave(leave);
                                  handleAction(leave.id, 'rejected');
                                }}
                                disabled={actionLoading}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ pt: 2 }}>
              <Typography><strong>Employee:</strong> {selectedLeave.userEmail}</Typography>
              <Typography><strong>Type:</strong> {selectedLeave.type}</Typography>
              <Typography><strong>Leave Type:</strong> {selectedLeave.leaveType}</Typography>
              <Typography><strong>Start Date:</strong> {selectedLeave.startDate}</Typography>
              <Typography><strong>End Date:</strong> {selectedLeave.endDate}</Typography>
              <Typography><strong>Reason:</strong> {selectedLeave.reason}</Typography>
              {selectedLeave.description && (
                <Typography><strong>Description:</strong> {selectedLeave.description}</Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">Approval Status</Typography>
                <Typography>
                  <strong>HR:</strong> {selectedLeave.hrApproval?.status || 'N/A'} 
                  {selectedLeave.hrApproval?.approvedByName && ` (By: ${selectedLeave.hrApproval.approvedByName})`}
                </Typography>
                <Typography>
                  <strong>GM/AE:</strong> {selectedLeave.gmaeApproval?.status || 'Pending'} 
                  {selectedLeave.gmaeApproval?.approvedBy && ` (By: ${selectedLeave.gmaeApproval.approvedBy})`}
                </Typography>
                {selectedLeave.gmaeApproval?.remarks && (
                  <Typography><strong>Remarks:</strong> {selectedLeave.gmaeApproval.remarks}</Typography>
                )}
              </Box>
              
              {(!selectedLeave.gmaeApproval || selectedLeave.gmaeApproval?.status === 'pending') && (
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  sx={{ mt: 3 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setRemarks('');
          }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AEApproval;
