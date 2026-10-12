import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { registerCustomer } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [touchedConfirm, setTouchedConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'confirmPassword') {
      setTouchedConfirm(true);
    }

    if (error) setError('');
  };

  const isPasswordMatch = formData.confirmPassword === '' || formData.password === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedFullName = formData.fullName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPhone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // Edge Case 1: Missing mandatory fields
    if (!trimmedFullName || !trimmedEmail || !password || !confirmPassword || !trimmedPhone) {
      setError('All fields are mandatory');
      return;
    }

    // Edge Case 2: Invalid Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Edge Case 3: Phone number length/digits check
    if (trimmedPhone.length < 7) {
      setError('Please enter a valid phone number');
      return;
    }

    // Edge Case 4: Minimum 6 characters password
    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    // Edge Case 5: Password confirmation match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await registerCustomer({
        fullName: trimmedFullName,
        email: trimmedEmail,
        password,
        confirmPassword,
        phone: trimmedPhone
      });

      if (response.success) {
        navigate('/login', {
          state: { message: 'Account created successfully! Please log in.' }
        });
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Email might already be registered.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join ShopKart to start shopping today</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="fullName"
                type="text"
                name="fullName"
                className="form-input"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                name="email"
                className="form-input"
                placeholder="john@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                id="phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="9876543210"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type="password"
                name="password"
                className="form-input"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <ShieldCheck className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className={`form-input ${touchedConfirm && !isPasswordMatch ? 'border-error' : ''}`}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                style={{
                  borderColor: touchedConfirm && !isPasswordMatch ? '#ef4444' : undefined
                }}
              />
            </div>
            {touchedConfirm && formData.confirmPassword !== '' && (
              <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: isPasswordMatch ? '#10b981' : '#ef4444' }}>
                {isPasswordMatch ? (
                  <>
                    <CheckCircle2 size={14} /> Passwords match
                  </>
                ) : (
                  <>
                    <AlertCircle size={14} /> Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}
            disabled={loading || (touchedConfirm && !isPasswordMatch)}
          >
            {loading ? (
              <span className="loading-spinner" />
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: '600' }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
