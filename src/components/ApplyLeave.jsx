import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Alert,
  Grid,
  CircularProgress,
  Divider,
  Chip,
  Paper
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Send as SendIcon, CalendarMonth as CalendarIcon, AccessTime as TimeIcon } from '@mui/icons-material';
import dayjs from 'dayjs';

const ApplyLeave = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    type: 'leave',
    leaveType: 'casual',
    startDate: null,
    endDate: null,
    reason: '',
    description: ''
  });
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate duration when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = dayjs(formData.startDate);
      const end = dayjs(formData.endDate);
      const days = end.diff(start, 'day') + 1; // +1 to include both start and end dates
      setDuration(days > 0 ? days : 0);
    } else {
      setDuration(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleDateChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (dayjs(formData.startDate).isAfter(dayjs(formData.endDate))) {
      setError('End date must be after or equal to start date');
      return;
    }

    if (duration <= 0) {
      setError('Invalid duration calculated');
      return;
    }

    try {
      setLoading(true);
      
      // Check for overlapping approved leaves
      const startDateStr = dayjs(formData.startDate).format('YYYY-MM-DD');
      const endDateStr = dayjs(formData.endDate).format('YYYY-MM-DD');
      
      const leaveRequestsRef = collection(db, 'leaveRequests');
      const overlappingQuery = query(
        leaveRequestsRef,
        where('userId', '==', currentUser.uid),
        where('status', '==', 'approved')
      );
      
      const overlappingSnapshot = await getDocs(overlappingQuery);
      
      // Check if any approved leave overlaps with the requested dates
      let hasOverlap = false;
      let overlapDetails = '';
      
      overlappingSnapshot.forEach((doc) => {
        const existingLeave = doc.data();
        const existingStart = existingLeave.startDate;
        const existingEnd = existingLeave.endDate;
        
        // Check if dates overlap
        // Overlap exists if: (StartA <= EndB) and (EndA >= StartB)
        if (startDateStr <= existingEnd && endDateStr >= existingStart) {
          hasOverlap = true;
          overlapDetails = `You already have an approved leave from ${existingStart} to ${existingEnd}`;
        }
      });
      
      if (hasOverlap) {
        setError(`Cannot apply for leave: ${overlapDetails}`);
        setLoading(false);
        return;
      }
      
      // Get user's assigned manager using Firestore v9 syntax
      let assignedManagerId = null;
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          assignedManagerId = userData.assignedTo || null;
        }
      } catch (error) {
        console.log('Could not fetch user manager assignment:', error);
        // Continue without manager assignment
      }

      await addDoc(collection(db, 'leaveRequests'), {
        type: formData.type,
        leaveType: formData.leaveType,
        startDate: dayjs(formData.startDate).format('YYYY-MM-DD'),
        endDate: dayjs(formData.endDate).format('YYYY-MM-DD'),
        duration: duration,
        reason: formData.reason,
        description: formData.description,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        assignedTo: assignedManagerId,
        status: 'pending',
        hrApproval: 'pending',
        gmApproval: 'pending',
        aeApproval: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSuccess('Leave request submitted successfully!');
      setFormData({
        type: 'leave',
        leaveType: 'casual',
        startDate: null,
        endDate: null,
        reason: '',
        description: ''
      });
      setDuration(0);
    } catch (err) {
      setError('Failed to submit request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <Card elevation={3} sx={{ borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CalendarIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  Apply for Leave / Permission
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fill out the form below to submit your leave request
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {/* Duration Display */}
            {duration > 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: 'primary.50',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <TimeIcon color="primary" />
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    Duration: {duration} {duration === 1 ? 'Day' : 'Days'}
                  </Typography>
                </Box>
              </Paper>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Request Type & Leave Type */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    name="type"
                    label="Request Type"
                    value={formData.type}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <Box component="span" sx={{ mr: 1 }}>📋</Box>
                      )
                    }}
                  >
                    <MenuItem value="leave">Leave</MenuItem>
                    <MenuItem value="permission">Permission</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    name="leaveType"
                    label="Leave Category"
                    value={formData.leaveType}
                    onChange={handleChange}
                  >
                    <MenuItem value="casual">🏖️ Casual Leave</MenuItem>
                    <MenuItem value="sick">🤒 Sick Leave</MenuItem>
                    <MenuItem value="earned">✅ Earned Leave</MenuItem>
                    <MenuItem value="maternity">👶 Maternity Leave</MenuItem>
                    <MenuItem value="paternity">👨‍👶 Paternity Leave</MenuItem>
                    <MenuItem value="unpaid">💼 Unpaid Leave</MenuItem>
                  </TextField>
                </Grid>

                {/* Date Pickers */}
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={formData.startDate}
                    onChange={(value) => handleDateChange('startDate', value)}
                    minDate={dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={formData.endDate}
                    onChange={(value) => handleDateChange('endDate', value)}
                    minDate={formData.startDate || dayjs()}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />
                </Grid>

                {/* Reason */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    name="reason"
                    label="Reason for Leave"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="e.g., Family function, Medical treatment, Personal work"
                    helperText="Please provide a brief reason for your leave request"
                  />
                </Grid>

                {/* Additional Details */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                    label="Additional Details (Optional)"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Any additional information that might be relevant..."
                    helperText="Provide more context if needed"
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={loading || duration <= 0}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                    sx={{
                      py: 1.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: 4
                      },
                      transition: 'all 0.3s'
                    }}
                  >
                    {loading ? 'Submitting Request...' : 'Submit Leave Request'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
};

export default ApplyLeave;
