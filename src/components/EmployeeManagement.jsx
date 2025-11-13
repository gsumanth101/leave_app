import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../Config';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const EmployeeManagement = () => {
  const { currentUser } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee',
    department: '',
    assignedTo: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEmployees(userData);
        setLoading(false);
      },
      (err) => {
        setError('Failed to load employees: ' + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAdd = () => {
    setEditMode(false);
    setSelectedEmployee(null);
    setFormData({
      email: '',
      password: '',
      fullName: '',
      role: 'employee',
      department: '',
      assignedTo: ''
    });
    setDialogOpen(true);
  };

  const handleEdit = (employee) => {
    setEditMode(true);
    setSelectedEmployee(employee);
    setFormData({
      email: employee.email,
      password: '',
      fullName: employee.fullName || '',
      role: employee.role,
      department: employee.department || '',
      assignedTo: employee.assignedTo || ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    try {
      if (editMode) {
        // Update existing user
        const userRef = doc(db, 'users', selectedEmployee.id);
        await updateDoc(userRef, {
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          assignedTo: formData.assignedTo,
          updatedAt: new Date().toISOString()
        });
        setSuccess('Employee updated successfully!');
      } else {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          email: formData.email,
          fullName: formData.fullName,
          role: formData.role,
          department: formData.department,
          assignedTo: formData.assignedTo,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        setSuccess('Employee added successfully!');
      }
      
      setDialogOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save employee: ' + err.message);
    }
  };

  const handleDelete = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      await deleteDoc(doc(db, 'users', employeeId));
      setSuccess('Employee deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete employee: ' + err.message);
    }
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      employee: { color: 'primary', label: 'Employee' },
      HR: { color: 'secondary', label: 'HR' },
      GM: { color: 'success', label: 'GM' },
      AE: { color: 'warning', label: 'AE' }
    };
    const config = roleConfig[role] || roleConfig.employee;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getManagerName = (managerId) => {
    if (!managerId) return 'Not Assigned';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? `${manager.fullName} (${manager.role})` : 'Not Found';
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
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Employee Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleAdd}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                }
              }}
            >
              Add Employee
            </Button>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <TableContainer component={Paper} sx={{ mt: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Department</strong></TableCell>
                  <TableCell><strong>Assigned To</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>{employee.fullName || 'N/A'}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{getRoleChip(employee.role)}</TableCell>
                    <TableCell>{employee.department || 'N/A'}</TableCell>
                    <TableCell>{getManagerName(employee.assignedTo)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEdit(employee)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(employee.id)}
                          disabled={employee.id === currentUser?.uid}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={editMode}
                required
              />
            </Grid>
            {!editMode && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="GM">GM</MenuItem>
                <MenuItem value="AE">AE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Assign To (Manager)"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {employees
                  .filter(emp => ['HR', 'GM', 'AE'].includes(emp.role))
                  .map(manager => (
                    <MenuItem key={manager.id} value={manager.id}>
                      {manager.fullName} ({manager.role})
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            startIcon={<SaveIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            {editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagement;
