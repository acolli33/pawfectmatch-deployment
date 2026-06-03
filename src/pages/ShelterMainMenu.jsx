import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getDemoToken() {
  return localStorage.getItem('pm_token') || sessionStorage.getItem('pm_token');
}

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
            'x-demo-token': getDemoToken(),
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

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>PawfectMatch</h1>
          <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: '5px 0' }}>{shelterName}</h2>
          <p style={{ color: '#595959', marginTop: '10px' }}>
            Manage listings, talk with adopters, and help pets find their forever homes
          </p>
        </header>

        <main>
          <div style={{ marginBottom: '30px' }}>
            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Manage Pet Listings</h2>
              <p>Create, edit, and remove pet profiles.</p>
              <button onClick={() => navigate('/shelter-listings')}>Manage Pets</button>
            </div>

            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Messages</h2>
              <p>View and respond to messages from potential adopters.</p>
              <button onClick={() => navigate('/contact')}>Open Messages</button>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => { logout(); navigate('/'); }} style={{ marginRight: '12px' }}>
              Log Out
            </button>
            <a href="/" style={{ color: '#595959', fontSize: '14px' }}>
              Back to Login Selection
            </a>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#595959', marginTop: '30px' }}>
            CS Capstone Project - Animal Adoption Matchmaker
          </p>
        </main>

      </div>
    </div>
  );
}