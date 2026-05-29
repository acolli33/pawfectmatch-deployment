import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ShelterMainMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [shelterName, setShelterName] = useState('Shelter Dashboard');

  useEffect(() => {
    const loadShelter = async () => {
      if (!user?.email || user.role !== 'shelter') return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/shelters/me`, {
          headers: {
            'Content-Type': 'application/json',
            'x-demo-email': user.email,
            'x-demo-role': user.role,
            'x-demo-token': localStorage.getItem('pm_token'),
          },
        });

        const result = await response.json();

        if (response.ok && result.ok && result.data?.organization_name) {
          setShelterName(result.data.organization_name);
        }
      } catch (error) {
        console.error('Failed to load shelter info:', error);
      }
    };

    loadShelter();
  }, [user]);

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>PawfectMatch</h1>
          <p>{shelterName}</p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Manage listings, talk with adopters, and help pets find their forever homes
          </p>
        </div>

        {/* Demo Badge */}
        {/* <div
          style={{
            background: '#fff9e6',
            border: '1px solid #ffe066',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
            Demo - Test account mode
          </p>
        </div> */}

        {/* Main Action Cards */}
        <div style={{ marginBottom: '30px' }}>
          <div className="card" onClick={() => navigate('/shelter-listings')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Manage Pet Listings</h3>
            <p>Create, edit, and remove pet profiles.</p>
            <button>Manage Pets</button>
          </div>

          <div className="card" onClick={() => navigate('/contact')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Messages</h3>
            <p>View and respond to messages from potential adopters.</p>
            <button>Open Messages</button>
          </div>
        </div>

        {/* Back to Login */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ marginRight: '12px' }}
          >
            Log Out
          </button>

          <a href="/" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>
            Back to Login Selection
          </a>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '30px' }}>
          CS Capstone Project - Animal Adoption Matchmaker
        </p>
      </div>
    </div>
  );
}