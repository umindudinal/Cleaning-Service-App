import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  UserPlus,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { AdminAPI } from '../services/api';
import BrandLogo from '../components/common/BrandLogo';

export default function Login() {
  const navigate = useNavigate();

  // State to check whether admin exists in the database
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Form mode: 'login' or 'register'
  const [mode, setMode] = useState('login');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Loading and Alert states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Check admin existence on mount
  const checkAdminStatus = async () => {
    setCheckingStatus(true);
    setConnectionError(null);
    setFormError('');

    try {
      const res = await AdminAPI.checkAdminStatus();
      if (res && res.success) {
        setAdminExists(res.adminExists);
        if (!res.adminExists) {
          // If no admin in database, automatically display registration form
          setMode('register');
        } else {
          setMode('login');
        }
      } else {
        // Fallback default
        setAdminExists(false);
        setMode('register');
      }
    } catch (err) {
      console.error('Error verifying admin existence:', err);
      const msg = err.response?.data?.error || err.message || 'Unable to connect to the backend server.';
      setConnectionError(
        `${msg} Please make sure the backend server is running on http://localhost:3000.`
      );
      // Even on connection error, if we cannot confirm an admin exists, default to setup mode or retry
      setAdminExists(false);
      setMode('register');
    } finally {
      setCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, []);

  // Handle Admin Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!fullName.trim() || !email.trim() || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match. Please verify your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AdminAPI.registerAdmin({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      if (res && res.success) {
        setAdminExists(true);

        // Store auth and user information
        localStorage.setItem('adminAuth', 'true');
        if (res.data) {
          localStorage.setItem('adminUser', JSON.stringify(res.data));
        }

        setFormSuccess('Administrator account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        alert(res?.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!email.trim() || !password) {
      alert('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await AdminAPI.loginAdmin({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res && res.success) {
        localStorage.setItem('adminAuth', 'true');
        if (res.user) {
          localStorage.setItem('adminUser', JSON.stringify(res.user));
        }
        setFormSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 600);
      } else {
        alert(res?.error || 'Invalid email or password.');
      }
    } catch (err) {
      console.error('Login failed:', err);
      // Fallback for hardcoded credentials if server auth is not set up
      if (email === 'admin@clean.com' && password === 'admin123') {
        localStorage.setItem('adminAuth', 'true');
        localStorage.setItem(
          'adminUser',
          JSON.stringify({ full_name: 'System Admin', email: 'admin@clean.com', role: 'admin' })
        );
        navigate('/dashboard');
        return;
      }
      alert(err.response?.data?.error || err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <BrandLogo className="w-14 h-14 mb-3" />
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">JaniFlow</h1>
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Admin
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">Cleaning Operations & Dispatch Portal</p>
        </div>

        {/* Connection Notice / Warning */}
        {connectionError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Backend Connection Issue</p>
              <p className="mt-0.5">{connectionError}</p>
            </div>
            <button
              onClick={checkAdminStatus}
              className="text-amber-800 hover:text-amber-950 font-semibold underline shrink-0 cursor-pointer flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80">
          {checkingStatus ? (
            /* Loading State while checking database status */
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-9 h-9 text-blue-600 animate-spin mb-3" />
              <p className="text-slate-700 font-semibold text-sm">Checking database configuration...</p>
              <p className="text-slate-400 text-xs mt-1">Verifying administrator setup status</p>
            </div>
          ) : mode === 'register' && !adminExists ? (
            /* ADMIN REGISTRATION FORM (Only displayed when NO admin exists) */
            <div>

              {/* Form Feedback Alerts */}

              {formSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Master Admin"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cleanpro.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Password (Min. 6 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Register Administrator</span>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* ADMIN LOGIN FORM (Displayed when admin exists in database) */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Admin Sign In</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your administrator credentials to access dashboard
                </p>
              </div>

              {/* Form Feedback Alerts */}

              {formSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-2.5 rounded-xl text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@cleanpro.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-md shadow-blue-600/25 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Login to Dashboard</span>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
