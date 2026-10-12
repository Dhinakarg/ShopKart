import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Hash, ShieldCheck, ShoppingCart, Heart, Package } from 'lucide-react';
import { getProfile } from '../services/api';

const Home = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        setUser(null);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchUserProfile();
    }
  }, [user, navigate, setUser]);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ width: '2.5rem', height: '2.5rem' }} />
          <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)' }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="page-container" style={{ alignItems: 'flex-start' }}>
      <div className="dashboard-container">
        {/* Protected Home Hero Header */}
        <div className="dashboard-hero">
          <div className="user-badge">
            <ShieldCheck size={14} />
            <span>Customer Profile</span>
          </div>

          <h1 className="welcome-title">
            Welcome back, {user.fullName}!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px' }}>
            Manage your account details and view your profile information below.
          </p>

          {/* Vertical Customer Profile Details List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginTop: '1.5rem' }}>
            <div className="profile-card">
              <div className="profile-card-icon">
                <User size={20} />
              </div>
              <div>
                <div className="profile-card-label">Customer Name</div>
                <div className="profile-card-value">{user.fullName}</div>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-icon">
                <Mail size={20} />
              </div>
              <div>
                <div className="profile-card-label">Email Address</div>
                <div className="profile-card-value">{user.email}</div>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-icon">
                <Phone size={20} />
              </div>
              <div>
                <div className="profile-card-label">Phone Number</div>
                <div className="profile-card-value">{user.phone}</div>
              </div>
            </div>

            <div className="profile-card">
              <div className="profile-card-icon">
                <Hash size={20} />
              </div>
              <div>
                <div className="profile-card-label">Customer ID</div>
                <div className="profile-card-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{user._id}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
