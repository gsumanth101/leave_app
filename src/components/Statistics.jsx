import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Avatar,
  Stack,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Statistics = () => {
  const { currentUser, userRole } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    myTeamSize: 0
  });
  const [leaveTypeStats, setLeaveTypeStats] = useState([]);
  const [monthlyLeaveStats, setMonthlyLeaveStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get total employees
        const usersQuery = query(collection(db, 'users'));
        const leavesQuery = query(collection(db, 'leaveRequests'));
        
        const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
          const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          let myTeam = 0;
          if (userRole !== 'employee') {
            myTeam = users.filter(user => user.assignedTo === currentUser?.uid).length;
          }
          
          setStats(prev => ({ 
            ...prev, 
            totalEmployees: users.length,
            myTeamSize: myTeam
          }));
        });

        const unsubLeaves = onSnapshot(leavesQuery, (snapshot) => {
          const leaves = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          let pending = 0;
          let approved = 0;
          let rejected = 0;
          let relevantLeaves = [];

          if (userRole === 'employee') {
            // Employee sees only their leaves
            relevantLeaves = leaves.filter(leave => leave.userId === currentUser?.uid);
          } else if (userRole === 'AE') {
            // AE sees all leaves
            relevantLeaves = leaves;
          } else {
            // HR/GM see leaves from their assigned employees
            const usersSnapshot = snapshot.docs;
            const assignedUserIds = usersSnapshot
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(user => user.assignedTo === currentUser?.uid)
              .map(user => user.uid);
            
            relevantLeaves = leaves.filter(leave => 
              assignedUserIds.includes(leave.userId)
            );
          }

          pending = relevantLeaves.filter(l => l.status === 'pending').length;
          approved = relevantLeaves.filter(l => l.status === 'approved').length;
          rejected = relevantLeaves.filter(l => l.status === 'rejected').length;

          // Calculate leave type statistics
          const typeStats = {};
          relevantLeaves.forEach(leave => {
            const type = leave.leaveType || 'casual';
            typeStats[type] = (typeStats[type] || 0) + 1;
          });
          const leaveTypes = Object.keys(typeStats).map(key => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            value: typeStats[key]
          }));
          setLeaveTypeStats(leaveTypes);

          // Calculate monthly statistics (last 6 months)
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentDate = new Date();
          const monthlyStats = {};
          
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
            monthlyStats[monthKey] = { month: monthKey, approved: 0, rejected: 0, pending: 0 };
          }

          relevantLeaves.forEach(leave => {
            if (leave.createdAt) {
              const leaveDate = leave.createdAt.toDate ? leave.createdAt.toDate() : new Date(leave.createdAt);
              const monthKey = `${monthNames[leaveDate.getMonth()]} ${leaveDate.getFullYear()}`;
              if (monthlyStats[monthKey]) {
                if (leave.status === 'approved') monthlyStats[monthKey].approved++;
                else if (leave.status === 'rejected') monthlyStats[monthKey].rejected++;
                else monthlyStats[monthKey].pending++;
              }
            }
          });

          setMonthlyLeaveStats(Object.values(monthlyStats));

          setStats(prev => ({
            ...prev,
            pendingLeaves: pending,
            approvedLeaves: approved,
            rejectedLeaves: rejected
          }));
          
          setLoading(false);
        });

        return () => {
          unsubUsers();
          unsubLeaves();
        };
      } catch (error) {
        console.error('Error loading stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, [currentUser, userRole]);

  const StatCard = ({ title, value, icon, color, gradient }) => (
    <Card 
      elevation={0}
      sx={{
        background: '#fff',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 2.5,
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          borderColor: '#000',
        }
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#666', 
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.6875rem'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              fontWeight="700"
              sx={{
                color: '#000',
                letterSpacing: '-1px'
              }}
            >
              {value}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: '#000',
              width: 44,
              height: 44,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  const COLORS = ['#000', '#333', '#666', '#999', '#ccc'];

  const statusData = [
    { name: 'Pending', value: stats.pendingLeaves, color: '#666' },
    { name: 'Approved', value: stats.approvedLeaves, color: '#000' },
    { name: 'Rejected', value: stats.rejectedLeaves, color: '#333' }
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h5" 
          fontWeight="700"
          sx={{ 
            color: '#000',
            letterSpacing: '-0.5px',
            mb: 0.5
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
          Real-time insights and statistics
        </Typography>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} mb={4}>
        {(userRole === 'AE' || userRole === 'HR' || userRole === 'GM') && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Employees"
              value={stats.totalEmployees}
              icon={<PeopleIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
        )}

        {(userRole !== 'employee') && (
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="My Team"
              value={stats.myTeamSize}
              icon={<TrendingUpIcon sx={{ fontSize: 22 }} />}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<PendingIcon sx={{ fontSize: 22 }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Leaves"
            value={stats.approvedLeaves}
            icon={<ApprovedIcon sx={{ fontSize: 22 }} />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejected Leaves"
            value={stats.rejectedLeaves}
            icon={<RejectedIcon sx={{ fontSize: 22 }} />}
          />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Leave Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={0}
            sx={{
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Typography 
                variant="h6" 
                fontWeight="700"
                sx={{ 
                  color: '#000',
                  mb: 0.5,
                  fontSize: '0.9375rem'
                }}
              >
                Leave Status Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
                Current leave request breakdown
              </Typography>
              <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,0,0,0.08)' }} />
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Leave Types Pie Chart */}
        {leaveTypeStats.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card 
              elevation={0}
              sx={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="700"
                  sx={{ 
                    color: '#000',
                    mb: 0.5,
                    fontSize: '0.9375rem'
                  }}
                >
                  Leave Types Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
                  Breakdown by leave category
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,0,0,0.08)' }} />
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveTypeStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {leaveTypeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Monthly Leave Trends Bar Chart */}
        {monthlyLeaveStats.length > 0 && (
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="700"
                  sx={{ 
                    color: '#000',
                    mb: 0.5,
                    fontSize: '0.9375rem'
                  }}
                >
                  Monthly Leave Trends
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.8125rem' }}>
                  Last 6 months overview
                </Typography>
                <Divider sx={{ mb: 2.5, borderColor: 'rgba(0,0,0,0.08)' }} />
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={monthlyLeaveStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
                    <XAxis dataKey="month" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="approved" fill="#000" name="Approved" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="pending" fill="#666" name="Pending" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="rejected" fill="#333" name="Rejected" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Statistics;
