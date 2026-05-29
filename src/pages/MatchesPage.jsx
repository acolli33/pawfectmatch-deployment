import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function MatchesPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [pageError, setPageError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'x-demo-email': user.email,
    'x-demo-role': user.role,
    "x-demo-token": localStorage.getItem("pm_token"),
  });

  useEffect(() => {
    loadMatches();
  }, [user]);

  const loadMatches = async () => {
    if (!user?.email || user.role !== 'adopter') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setPageError('');

      const response = await fetch(`${API_BASE_URL}/api/swipes/matches`, {
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to load matches');
        return;
      }

      setAnimals(result.data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      setPageError('Unable to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMessageShelter = async (animal) => {
    setOpenMenuId(null);
    setPageError('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/threads`, {
        method: 'POST',
        headers: getHeaders(),
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
      console.error('Failed to start conversation:', error);
      setPageError('Unable to start conversation. Please try again.');
    }
  };

  const handleRemoveMatch = async (animal) => {
    setOpenMenuId(null);
    setPageError('');
    setStatusMessage('');

    const confirmed = window.confirm(`Remove ${animal.name} from your matches?`);

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/swipes/${animal.id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to remove match');
        return;
      }

      setAnimals((currentAnimals) =>
        currentAnimals.filter((item) => item.id !== animal.id)
      );

      setStatusMessage(`${animal.name} was removed from your matches.`);
    } catch (error) {
      console.error('Failed to remove match:', error);
      setPageError('Unable to remove match. Please try again.');
    }
  };

  const toggleMenu = (event, animalId) => {
    event.stopPropagation();

    if (openMenuId === animalId) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(animalId);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1>PawfectMatch</h1>
          <p>Your Matches</p>
          <p style={styles.subtitle}>
            View pet listings you matched with
          </p>
        </div>

        <div style={styles.navButtons}>
          <button
            onClick={() => navigate('/adopter-listings')}
            style={{ marginRight: '12px' }}
          >
            Browse More Pets
          </button>

          <button
            onClick={() => navigate('/adopter-menu')}
            style={{ marginRight: '12px' }}
          >
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

        {statusMessage && (
          <div style={styles.successMessage}>
            {statusMessage}
          </div>
        )}

        {pageError && (
          <div style={styles.errorMessage}>
            {pageError}
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center' }}>Loading matches...</p>
        ) : animals.length === 0 ? (
          <div style={styles.emptyBox}>
            <h3 style={{ marginTop: 0 }}>No matches yet</h3>
            <p style={{ color: '#666' }}>
              Start browsing pet listings and click the heart to add pets here.
            </p>

            <button onClick={() => navigate('/adopter-listings')}>
              Browse Pets
            </button>
          </div>
        ) : (
          <div style={styles.list}>
            {animals.map((animal) => (
              <div key={animal.id} style={styles.card}>
                <div style={styles.imageBox}>
                  {animal.primary_photo_url ? (
                    <img
                      src={animal.primary_photo_url}
                      alt={animal.name}
                      style={styles.image}
                    />
                  ) : (
                    <div style={styles.noPhoto}>No Photo</div>
                  )}
                </div>

                <div style={styles.cardContent}>
                  <div style={styles.cardTop}>
                    <div>
                      <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
                        <Link
                          to={`/animal-listing-details/${animal.id}`}
                          style={{
                            color: '#2F3A56',
                            textDecoration: 'underline',
                          }}
                        >
                          {animal.name}
                        </Link>
                      </h3>

                      <div style={{ marginBottom: '12px' }}>
                        <span
                          style={{...styles.badge, ...getAvailabilityBadgeStyle(animal.availability),}}
                        >
                          {animal.availability}
                        </span>
                      </div>

                      <p style={styles.detail}>
                        <strong>Shelter:</strong> {animal.organization_name || 'N/A'}
                      </p>

                      <p style={styles.detail}>
                        <strong>Type:</strong> {animal.type}
                      </p>

                      <p style={styles.detail}>
                        <strong>Breed:</strong> {animal.breed || 'N/A'}
                      </p>

                      <p style={styles.detail}>
                        <strong>Sex:</strong> {animal.sex}
                      </p>

                      <p style={styles.detail}>
                        <strong>Size:</strong> {animal.size || 'N/A'}
                      </p>

                      <p style={styles.detail}>
                        <strong>Age:</strong> {animal.age || 'N/A'}
                      </p>
                    </div>

                    <div
                      style={styles.menuWrapper}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        aria-label={`Open actions for ${animal.name}`}
                        onClick={(event) => toggleMenu(event, animal.id)}
                        style={styles.menuButton}
                      >
                        ⋯
                      </button>

                      {openMenuId === animal.id && (
                        <div style={styles.dropdownMenu}>
                          <button
                            type="button"
                            onClick={() => navigate(`/animal-listing-details/${animal.id}`)}
                            style={styles.dropdownItem}
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMessageShelter(animal)}
                            style={styles.dropdownItem}
                          >
                            Message Shelter
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveMatch(animal)}
                            style={{
                              ...styles.dropdownItem,
                              ...styles.dangerItem,
                            }}
                          >
                            Remove Match
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={styles.description}>
                    {animal.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

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
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  subtitle: {
    color: '#666',
    marginTop: '10px',
  },
  navButtons: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  successMessage: {
    marginBottom: '20px',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #059669',
    background: '#d1fae5',
    color: '#065f46',
    fontSize: '14px',
  },
  errorMessage: {
    marginBottom: '20px',
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid #dc2626',
    background: '#fee2e2',
    color: '#991b1b',
    fontSize: '14px',
  },
  emptyBox: {
    background: 'white',
    padding: '30px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    textAlign: 'center',
  },
  list: {
    display: 'grid',
    gap: '20px',
  },
  card: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
  },
  imageBox: {
    background: '#f5f5f5',
    minHeight: '220px',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  noPhoto: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  cardContent: {
    padding: '20px',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '20px',
  },
  badge: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detail: {
    margin: '4px 0',
  },
  description: {
    marginTop: '14px',
    color: '#555',
  },
  menuWrapper: {
    position: 'relative',
    textAlign: 'right',
    minWidth: '44px',
  },
  menuButton: {
    padding: '4px 8px',
    marginTop: 0,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#2F3A56',
    cursor: 'pointer',
    fontSize: '26px',
    fontWeight: '700',
    lineHeight: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '32px',
    right: 0,
    zIndex: 20,
    width: '175px',
    backgroundColor: '#ffffff',
    border: '1px solid #D7C3AE',
    borderRadius: '10px',
    boxShadow: '0 8px 20px rgba(47, 58, 86, 0.16)',
    overflow: 'hidden',
    textAlign: 'left',
  },
  dropdownItem: {
    width: '100%',
    display: 'block',
    padding: '12px 14px',
    marginTop: 0,
    border: 'none',
    borderRadius: 0,
    backgroundColor: '#ffffff',
    color: '#2C2C34',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'left',
  },
  dangerItem: {
    color: '#b94b4b',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#999',
    marginTop: '30px',
  },
};