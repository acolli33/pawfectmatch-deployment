import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAvailabilityBadgeStyle(status) {
  if (status === 'available') {
    return {
      color: '#355e3b',
    };
  }

  if (status === 'pending') {
    return {
      color: '#7a6230',
    };
  }

  if (status === 'adopted') {
    return {
      color: '#8a5a3b',
    };
  }

  return {
    color: '#5f5a52',
  };
}

export default function AnimalListingDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const headers = {
    'Content-Type': 'application/json',
    'x-demo-email': user?.email,
    'x-demo-role': user?.role,
    'x-demo-token': localStorage.getItem('pm_token'),
  };

  useEffect(() => {
    const loadAnimal = async () => {
      if (!id || !user?.email) return;

      try {
        setLoading(true);
        setPageError('');

        const response = await fetch(`${API_BASE_URL}/api/animals/${id}`, {
          headers,
        });

        const result = await response.json();

        if (!response.ok || !result.ok) {
          setPageError(result.error || 'Failed to load pet details');
          return;
        }

        setAnimal(result.data);
      } catch (error) {
        console.error('Failed to load animal:', error);
        setPageError('Unable to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    loadAnimal();
  }, [id, user]);

  const handleAddToMatches = async () => {
    if (!animal) return;

    try {
      setPageError('');
      setStatusMessage('');

      const response = await fetch(`${API_BASE_URL}/api/swipes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          animal_id: animal.id,
          action: 'like',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to add to matches');
        return;
      }

      setStatusMessage(`${animal.name} was added to your matches.`);
    } catch (error) {
      console.error('Failed to add match:', error);
      setPageError('Unable to add to matches.');
    }
  };

  const handleMessageShelter = async () => {
    if (!animal) return;

    try {
      setPageError('');
      setStatusMessage('');

      await fetch(`${API_BASE_URL}/api/swipes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          animal_id: animal.id,
          action: 'like',
        }),
      });

      const response = await fetch(`${API_BASE_URL}/api/messages/threads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          animal_id: animal.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to start conversation');
        return;
      }

      const threadId = result.data?.id || result.data?.thread_id;

      if (threadId) {
        navigate(`/contact?threadId=${encodeURIComponent(threadId)}`);
      } else {
        navigate('/contact');
      }
    } catch (error) {
      console.error('Failed to message shelter:', error);
      setPageError('Unable to start conversation.');
    }
  };

  const goBack = () => {
    if (user?.role === 'shelter') {
      navigate('/shelter-listings');
    } else {
      navigate('/adopter-listings');
    }
  };

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.loadingText}>Loading pet details...</p>
      </div>
    );
  }

  if (pageError && !animal) {
    return (
      <div style={styles.page}>
        <div style={styles.content}>
          <p style={styles.error}>{pageError}</p>
          <button onClick={goBack}>Back</button>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div style={styles.page}>
        <div style={styles.content}>
          <p>Animal not found.</p>
          <button onClick={goBack}>Back</button>
        </div>
      </div>
    );
  }

  const address = [
    animal.shelter_address,
    animal.shelter_city,
    animal.shelter_state,
    animal.shelter_zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  const adoptionFee =
    animal.adoption_fee !== null && animal.adoption_fee !== undefined
      ? `$${animal.adoption_fee}`
      : 'N/A';

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <button onClick={goBack} style={styles.backButton}>
          Back to Listings
        </button>

        {statusMessage && <p style={styles.success}>{statusMessage}</p>}
        {pageError && <p style={styles.error}>{pageError}</p>}

        <div style={styles.card}>
          <div style={styles.topSection}>
            {animal.primary_photo_url ? (
              <img
                src={animal.primary_photo_url}
                alt={animal.name}
                style={styles.image}
              />
            ) : (
              <div style={styles.noPhoto}>No Photo</div>
            )}

            <h1 style={styles.title}>{animal.name}</h1>

            <p
              style={{
                ...styles.status,
                ...getAvailabilityBadgeStyle(animal.availability),
              }}
            >
              <strong>{animal.availability || 'N/A'}</strong>
            </p>
          </div>

          <div style={styles.descriptionBox}>
            {/* <h3 style={styles.sectionHeading}>Description</h3> */}
            <p style={styles.description}>
              {animal.description || 'No description provided.'}
            </p>

            {animal.special_needs && (
              <>
                <h3 style={styles.sectionHeading}>Special Needs</h3>
                <p style={styles.description}>{animal.special_needs}</p>
              </>
            )}
          </div>

          <div style={styles.columns}>
            <div style={styles.infoBox}>
              <div style={styles.detailsBox}><h3 style={styles.topSection}>Pet Details</h3></div>

              <p><strong>Type:</strong> {animal.type || 'N/A'}</p>
              <p><strong>Breed:</strong> {animal.breed || 'N/A'}</p>
              <p><strong>Age:</strong> {animal.age || 'N/A'}</p>
              <p><strong>Sex:</strong> {animal.sex || 'N/A'}</p>
              <p><strong>Size:</strong> {animal.size || 'N/A'}</p>
              <p><strong>Good with children:</strong> {animal.good_with_children ? 'Yes' : 'No'}</p>
              <p><strong>Good with other animals:</strong> {animal.good_with_other_animals ? 'Yes' : 'No'}</p>
              <p><strong>Must be leashed:</strong> {animal.must_be_leashed ? 'Yes' : 'No'}</p>
              <p><strong>Adoption Fee:</strong> {adoptionFee}</p>
            </div>

            <div style={styles.infoBox}>
              <div style={styles.detailsBox}><h3 style={styles.topSection}>Shelter Details</h3></div>

              <p><strong>Shelter:</strong> {animal.organization_name || 'N/A'}</p>
              <p><strong>Address:</strong> {address || 'N/A'}</p>
              <p><strong>Phone:</strong> {animal.shelter_phone || 'N/A'}</p>
              <p><strong>Email:</strong> {animal.shelter_email || 'N/A'}</p>
              <p>
                <strong>Website:</strong>{' '}
                {animal.shelter_website ? (
                  <a
                    href={animal.shelter_website}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    {animal.shelter_website}
                  </a>
                ) : (
                  'N/A'
                )}
              </p>
              <p><strong>Verified:</strong> {animal.shelter_verified ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {user?.role === 'adopter' && (
            <div style={styles.buttons}>
              <button onClick={handleAddToMatches}>
                Add to Matches
              </button>

              <button onClick={handleMessageShelter}>
                Message Shelter
              </button>
            </div>
          )}
        </div>

        <p style={styles.footer}>
          CS Capstone Project - Animal Adoption Matchmaker
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: '#fafafa',
    minHeight: '100vh',
    padding: '40px',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  loadingText: {
    textAlign: 'center',
    color: '#2F3A56',
  },
  backButton: {
    marginBottom: '20px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '28px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  topSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  image: {
    width: '240px',
    height: '170px',
    objectFit: 'cover',
    borderRadius: '10px',
    marginBottom: '14px',
  },
  noPhoto: {
    width: '240px',
    height: '170px',
    background: '#eee',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 14px auto',
    color: '#666',
  },
  title: {
    margin: '8px 0',
    color: '#2F3A56',
  },
  status: {
    margin: 0,
    textTransform: 'capitalize',
  },
  descriptionBox: {
    borderTop: '1px solid #ddd',
    borderBottom: '1px solid #ddd',
    padding: '22px 0',
    marginBottom: '24px',
    textAlign: 'center',
  },
  detailsBox: {
    borderBottom: '1px solid #ddd',
    padding: '1px 0',
    textAlign: 'center',
  },
  description: {
    maxWidth: '650px',
    margin: '0 auto',
    lineHeight: '1.6',
    color: '#444',
  },
  columns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  infoBox: {
    background: '#fafafa',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '20px',
    lineHeight: '1.6',
  },
  sectionHeading: {
    marginTop: 0,
    color: '#2F3A56',
  },
  link: {
    color: '#2F3A56',
    textDecoration: 'underline',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '28px',
  },
  success: {
    padding: '12px',
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #059669',
    borderRadius: '6px',
  },
  error: {
    padding: '12px',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #dc2626',
    borderRadius: '6px',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    marginTop: '30px',
  },
};