import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function MainMenu() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>PawfectMatch</h1>
          <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: '5px 0' }}>Adopter Dashboard</h2>
          <p style={{ color: '#595959', marginTop: '10px' }}>
            Find your perfect companion or help pets find their forever homes
          </p>
        </header>

        <main>
          <div style={{ marginBottom: '30px' }}>
            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Find Your Match</h2>
              <p>Set your preferences and start browsing adorable pets</p>
              <button onClick={() => navigate('/preferences')}>Get Started</button>
            </div>

            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Browse Pet Listings</h2>
              <p>View matching pets, skip, match, or message shelters</p>
              <button onClick={() => navigate('/adopter-listings')}>Start Browsing</button>
            </div>

            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Matches</h2>
              <p>View pets you matched with</p>
              <button onClick={() => navigate('/matches')}>View Matches</button>
            </div>

            <div className="card" style={{ marginBottom: '20px', width: '100%' }}>
              <h2 style={{ fontSize: '18px' }}>Messages</h2>
              <p>Chat with shelters about available pets</p>
              <button onClick={() => navigate('/contact')}>Open Messages</button>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '30px'
          }}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', marginTop: 0, fontSize: '18px' }}>
              How PawfectMatch Works
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Step 1</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#595959' }}>Set Your Preferences</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Step 2</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#595959' }}>Swipe & Match</p>
              </div>
              <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h3 style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px' }}>Step 3</h3>
                <p style={{ fontSize: '14px', margin: 0, color: '#595959' }}>Adopt & Love</p>
              </div>
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