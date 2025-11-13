import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  EmailOutlined as EmailIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetError('');
      setResetSuccess('');
      setResetLoading(true);
      await resetPassword(resetEmail);
      setResetSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => {
        setResetDialogOpen(false);
        setResetEmail('');
        setResetSuccess('');
      }, 3000);
    } catch (error) {
      setResetError('Failed to send reset email: ' + error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
    setResetEmail(email); // Pre-fill with login email if available
    setResetError('');
    setResetSuccess('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 0.8 },
        }
      }}
    >
      <Container maxWidth="sm">
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4
              }}
            >
              <Avatar 
                sx={{ 
                  m: 1, 
                  mb: 1.5,
                  width: 48,
                  height: 48,
                  bgcolor: '#000',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 24 }} />
              </Avatar>
              <Typography 
                component="h1" 
                variant="h5" 
                fontWeight="700"
                sx={{ 
                  color: '#000',
                  letterSpacing: '-0.5px',
                  mb: 0.5
                }}
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 400, fontSize: '0.8125rem' }}>
                Sign in to continue to your dashboard
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  border: '1px solid rgba(211, 47, 47, 0.2)',
                  '& .MuiAlert-icon': { color: '#000' }
                }}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                        borderWidth: 2,
                      }
                    }
                  }
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlinedIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: '#666' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#fff',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#000',
                        borderWidth: 2,
                      }
                    }
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 2.5,
                  mb: 1,
                  py: 1.4,
                  borderRadius: 2,
                  backgroundColor: '#000',
                  color: '#fff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: '#1a1a1a',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Sign In'}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 2, mb: 2 }}>
                <Button
                  size="small"
                  onClick={handleOpenResetDialog}
                  sx={{ 
                    color: '#666', 
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      color: '#000',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Forgot Password?
                </Button>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    to="/signup" 
                    style={{ 
                      color: '#000', 
                      textDecoration: 'none', 
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" fontWeight="700" sx={{ color: '#000' }}>
            Reset Password
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
            Enter your email address and we'll send you a link to reset your password.
          </Typography>
          
          {resetError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                border: '1px solid rgba(211, 47, 47, 0.2)',
              }}
            >
              {resetError}
            </Alert>
          )}
          
          {resetSuccess && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 2, 
                borderRadius: 2,
                border: '1px solid rgba(46, 125, 50, 0.2)',
              }}
            >
              {resetSuccess}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            id="reset-email"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            disabled={resetLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#fafafa',
                '&.Mui-focused': {
                  backgroundColor: '#fff',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#000',
                    borderWidth: 2,
                  }
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setResetDialogOpen(false);
              setResetEmail('');
              setResetError('');
              setResetSuccess('');
            }}
            disabled={resetLoading}
            sx={{
              color: '#666',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#f5f5f5',
                color: '#000',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResetPassword}
            variant="contained"
            disabled={resetLoading}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                backgroundColor: '#1a1a1a',
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
              }
            }}
          >
            {resetLoading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
