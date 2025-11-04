import { useNavigate } from 'react-router-dom';

export default function MainMenu() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>PawfectMatch</h1>
          <p>Dating App for Animal Adoption</p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Find your perfect companion or help animals find their forever homes
          </p>
        </div>

        {/* Demo Badge */}
        <div style={{ 
          background: '#fff9e6', 
          border: '1px solid #ffe066', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Demo Mode - All data stored locally in your browser
          </p>
        </div>

        {/* Main Action Cards */}
        <div style={{ marginBottom: '30px' }}>
          <div className="card" onClick={() => navigate('/preferences')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Find Your Match</h3>
            <p>Set your preferences and start browsing adorable pets</p>
            <button>Get Started</button>
          </div>

          <div className="card" onClick={() => navigate('/animal/new')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Shelter Admin</h3>
            <p>Add new animals to your shelter's adoption listings</p>
            <button>Add Animal</button>
          </div>

          <div className="card" onClick={() => navigate('/contact')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Messages</h3>
            <p>Chat with shelters about available animals</p>
            <button>Open Messages</button>
          </div>
        </div>

        {/* Feature Preview */}
        <div style={{ 
          background: 'white', 
          padding: '30px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          marginBottom: '30px'
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '20px', marginTop: 0 }}>
            How PawfectMatch Works
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Step 1</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#666' }}>Set Your Preferences</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Step 2</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#666' }}>Swipe & Match</p>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>Step 3</p>
              <p style={{ fontSize: '14px', margin: 0, color: '#666' }}>Adopt & Love</p>
            </div>
          </div>
        </div>

        {/* Back to Login */}
        <div style={{ textAlign: 'center' }}>
          <a href="/" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>
            Back to Login Selection
          </a>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '30px' }}>
          CS Capstone Project - Animal Adoption Innovation
        </p>
      </div>
    </div>
  );
}
