import { useNavigate } from 'react-router-dom';

export default function ShelterMainMenu() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>PawfectMatch</h1>
          <p>Shelter Dashboard</p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Manage listings, talk with adopters, and help pets find their forever homes
          </p>
        </div>

        {/* Demo Badge */}
        <div
          style={{
            background: '#fff9e6',
            border: '1px solid #ffe066',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '30px',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, fontSize: '14px' }}>
            Demo Mode - All data stored locally in your browser
          </p>
        </div>

        {/* Main Action Cards */}
        <div style={{ marginBottom: '30px' }}>
          <div className="card" onClick={() => navigate('/animal/new')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Manage Animal Listings</h3>
            <p>Create and update animal profiles.</p>
            <button>Manage Animals</button>
          </div>

          <div className="card" onClick={() => navigate('/shelter-contact')} style={{ marginBottom: '20px', width: '100%' }}>
            <h3>Messages</h3>
            <p>View and respond to messages from potential adopters.</p>
            <button>Open Messages</button>
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
          CS Capstone Project - Animal Adoption Matchmaker
        </p>
      </div>
    </div>
  );
}