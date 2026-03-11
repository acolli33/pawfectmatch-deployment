import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAvailabilityBadgeStyle(status) {
  switch (status) {
    case 'available':
      return {
        backgroundColor: '#dbeadf',
        color: '#355e3b',
        border: '1px solid #bdd3c2',
      };
    case 'pending':
      return {
        backgroundColor: '#f3ead7',
        color: '#7a6230',
        border: '1px solid #e2d2ae',
      };
    case 'adopted':
      return {
        backgroundColor: '#eadfd7',
        color: '#8a5a3b',
        border: '1px solid #d9c3b3',
      };
    default:
      return {
        backgroundColor: '#ece8e1',
        color: '#5f5a52',
        border: '1px solid #d8d2c8',
      };
  }
}

export default function ShelterListingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [shelterName, setShelterName] = useState('Your Listings');
  const [pageError, setPageError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPageData = async () => {
      if (!user?.email || user.role !== 'shelter') return;

      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
        };

        const [animalsResponse, shelterResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/animals/mine`, { headers }),
          fetch(`${API_BASE_URL}/api/shelters/me`, { headers }),
        ]);

        const animalsResult = await animalsResponse.json();
        const shelterResult = await shelterResponse.json();

        if (!animalsResponse.ok || !animalsResult.ok) {
          setPageError(animalsResult.error || 'Failed to load listings');
          return;
        }

        if (shelterResponse.ok && shelterResult.ok && shelterResult.data?.organization_name) {
          setShelterName(shelterResult.data.organization_name);
        }

        setAnimals(animalsResult.data || []);
      } catch (error) {
        console.error('Failed to load listings:', error);
        setPageError('Unable to connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPageData();
  }, [user]);

  const handleDelete = async (animalId) => {
    if (!window.confirm('Delete this listing?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/animals/${animalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to delete listing');
        return;
      }

      setAnimals((prev) => prev.filter((animal) => animal.id !== animalId));
    } catch (error) {
      console.error('Failed to delete listing:', error);
      setPageError('Unable to connect to the server. Please try again.');
    }
  };

  return (
    <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>PawfectMatch</h1>
          <p>{shelterName}</p>
          <p style={{ color: '#666', marginTop: '10px' }}>
            Manage your shelter&apos;s animal listings
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button onClick={() => navigate('/animal/new')} style={{ marginRight: '12px' }}>
            Create New Listing
          </button>
          <button onClick={() => navigate('/shelter-menu')} style={{ marginRight: '12px' }}>
            Back to Dashboard
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Log Out
          </button>
        </div>

        {pageError && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid #dc2626',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '14px',
            }}
          >
            {pageError}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading listings...</p>
        ) : animals.length === 0 ? (
          <div
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              textAlign: 'center',
            }}
          >
            <h3 style={{ marginTop: 0 }}>No listings yet</h3>
            <p style={{ color: '#666' }}>Create your first animal listing to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '20px' }}>
            {animals.map((animal) => (
              <div
                key={animal.id}
                style={{
                  background: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  display: 'grid',
                  gridTemplateColumns: '240px 1fr',
                }}
              >
                <div style={{ background: '#f5f5f5', minHeight: '220px' }}>
                  {animal.primary_photo_url ? (
                    <img
                      src={animal.primary_photo_url}
                      alt={animal.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                      }}
                    >
                      No Photo
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                    <div>
                      <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{animal.name}</h3>

                      <div style={{ marginBottom: '12px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            borderRadius: '999px',
                            fontSize: '13px',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            ...getAvailabilityBadgeStyle(animal.availability),
                          }}
                        >
                          {animal.availability}
                        </span>
                      </div>

                      <p style={{ margin: '4px 0' }}><strong>Type:</strong> {animal.type}</p>
                      <p style={{ margin: '4px 0' }}><strong>Breed:</strong> {animal.breed || 'N/A'}</p>
                      <p style={{ margin: '4px 0' }}><strong>Sex:</strong> {animal.sex}</p>
                      <p style={{ margin: '4px 0' }}><strong>Size:</strong> {animal.size || 'N/A'}</p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/animal/${animal.id}/edit`)}
                        style={{ marginRight: '8px' }}
                      >
                        Edit Listing
                      </button>
                      <button
                        onClick={() => handleDelete(animal.id)}
                        style={{
                          backgroundColor: '#b94b4b',
                          color: '#ffffff',
                        }}
                      >
                        Delete Listing
                      </button>
                    </div>
                  </div>

                  <p style={{ marginTop: '14px', color: '#555' }}>
                    {animal.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '30px' }}>
          CS Capstone Project - Animal Adoption Matchmaker
        </p>
      </div>
    </div>
  );
}