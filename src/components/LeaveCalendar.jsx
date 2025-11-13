import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Badge
} from '@mui/material';
import { LocalizationProvider, DateCalendar } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../Config';
import { useAuth } from '../contexts/AuthContext';

dayjs.extend(isBetween);

const LeaveCalendar = () => {
  const { currentUser, userRole } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [leavesOnSelectedDate, setLeavesOnSelectedDate] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    let q;
    if (userRole === 'employee') {
      // Employees see only their own approved leaves
      q = query(
        collection(db, 'leaveRequests'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'approved')
      );
    } else {
      // HR/GM/AE see all approved leaves (or their assigned employees)
      q = query(
        collection(db, 'leaveRequests'),
        where('status', '==', 'approved')
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const leaveData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaves(leaveData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching leaves:', err);
        setError('Failed to load calendar data');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, userRole]);

  // Update leaves on selected date whenever date or leaves change
  useEffect(() => {
    const leavesOnDate = leaves.filter((leave) => {
      const start = dayjs(leave.startDate, 'DD/MM/YYYY');
      const end = dayjs(leave.endDate, 'DD/MM/YYYY');
      return selectedDate.isBetween(start, end, 'day', '[]');
    });
    setLeavesOnSelectedDate(leavesOnDate);
  }, [selectedDate, leaves]);

  // Check if a date has any leaves
  const hasLeaveOnDate = (date) => {
    return leaves.some((leave) => {
      const start = dayjs(leave.startDate, 'DD/MM/YYYY');
      const end = dayjs(leave.endDate, 'DD/MM/YYYY');
      return date.isBetween(start, end, 'day', '[]');
    });
  };

  // Custom day renderer with leave indicators
  const ServerDay = (props) => {
    const { day, outsideCurrentMonth, ...other } = props;
    const hasLeave = !outsideCurrentMonth && hasLeaveOnDate(day);

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={hasLeave ? '●' : undefined}
        color="primary"
      >
        <PickersDay
          {...other}
          outsideCurrentMonth={outsideCurrentMonth}
          day={day}
          sx={{
            ...(hasLeave && {
              backgroundColor: 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.24)',
              },
            }),
          }}
        />
      </Badge>
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
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary">
                Leave Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View all approved leaves in calendar format
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box display="flex" gap={3} flexDirection={{ xs: 'column', md: 'row' }}>
            {/* Calendar */}
            <Paper elevation={2} sx={{ flex: 1, p: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar
                  value={selectedDate}
                  onChange={(newDate) => setSelectedDate(newDate)}
                  slots={{
                    day: ServerDay,
                  }}
                  sx={{
                    width: '100%',
                    '& .MuiPickersCalendarHeader-root': {
                      paddingLeft: 2,
                      paddingRight: 2,
                    },
                  }}
                />
              </LocalizationProvider>
              
              <Box mt={2} p={2} bgcolor="#f5f7fa" borderRadius={1}>
                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={1}>
                  <Box component="span" sx={{ color: 'primary.main' }}>●</Box>
                  Days with approved leaves are marked
                </Typography>
              </Box>
            </Paper>

            {/* Leave Details for Selected Date */}
            <Paper elevation={2} sx={{ flex: 1, p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <EventIcon color="primary" />
                <Typography variant="h6" fontWeight="bold">
                  {selectedDate.format('DD MMMM YYYY')}
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 2 }} />

              {leavesOnSelectedDate.length === 0 ? (
                <Alert severity="info">
                  No approved leaves on this date
                </Alert>
              ) : (
                <List>
                  {leavesOnSelectedDate.map((leave, index) => (
                    <Box key={leave.id}>
                      {index > 0 && <Divider sx={{ my: 1.5 }} />}
                      <ListItem sx={{ px: 0, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Box display="flex" alignItems="center" gap={1} mb={1} width="100%">
                          <Chip
                            label={leave.type}
                            size="small"
                            color={leave.type === 'leave' ? 'primary' : 'secondary'}
                          />
                          <Chip
                            label={leave.leaveType}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        
                        <ListItemText
                          primary={
                            <Typography variant="body1" fontWeight="500">
                              {leave.userName || leave.userEmail}
                            </Typography>
                          }
                          secondary={
                            <Box mt={0.5}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Duration:</strong> {leave.startDate} to {leave.endDate}
                                {leave.duration && ` (${leave.duration} ${leave.duration === 1 ? 'day' : 'days'})`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                <strong>Reason:</strong> {leave.reason}
                              </Typography>
                              {leave.hrApproval?.approvedBy && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 0.5 }}>
                                  ✓ Approved by HR/GM
                                </Typography>
                              )}
                              {leave.aeApproval?.approvedBy && (
                                <Typography variant="caption" color="success.main" sx={{ display: 'block' }}>
                                  ✓ Approved by AE
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              )}
            </Paper>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeaveCalendar;
