import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function cleanList(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .replace(/[{}"]/g, '')
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function showList(value) {
  const list = cleanList(value);
  return list.length > 0 ? list.join(', ') : 'Any';
}

function showValue(value) {
  return value ? String(value) : 'Any';
}


export default function AdopterListingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [preferences, setPreferences] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pageError, setPageError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadListings = async () => {
      if (!user?.email || user.role !== 'adopter') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPageError('');

        const headers = {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
        };

        const [animalsResponse, preferencesResponse, matchesResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/animals`, { headers }),
          fetch(`${API_BASE_URL}/api/preferences/me`, { headers }),
          fetch(`${API_BASE_URL}/api/swipes/matches`, { headers }),
        ]);

        const animalsResult = await animalsResponse.json();
        const preferencesResult = await preferencesResponse.json();
        const matchesResult = await matchesResponse.json();

        if (!animalsResponse.ok || !animalsResult.ok) {
          setPageError(animalsResult.error || 'Failed to load listings');
          return;
        }

        if (!preferencesResponse.ok || !preferencesResult.ok || !preferencesResult.data) {
          setPageError('Please save your adoption preferences before browsing matches.');
          setAnimals([]);
          setPreferences(null);
          return;
        }

        const savedPreferences = preferencesResult.data;
        setPreferences(savedPreferences);

        const matchedAnimalIds = Array.isArray(matchesResult.data)
          ? matchesResult.data.map((animal) => String(animal.id))
          : [];

        const preferredTypes = cleanList(savedPreferences.animal_types);
        const preferredSizes = cleanList(savedPreferences.size_preferences);
        const preferredBreeds = cleanList(savedPreferences.breeds);
        const agePreference = String(savedPreferences.age_preference || 'any').toLowerCase();

        const filteredAnimals = (animalsResult.data || []).filter((animal) => {
          const animalId = String(animal.id);
          const animalType = String(animal.type || '').trim().toLowerCase();
          const animalSize = String(animal.size || '').trim().toLowerCase();
          const animalBreed = String(animal.breed || '').trim().toLowerCase();
          const availability = String(animal.availability || '').trim().toLowerCase();
          const animalAge = Number(animal.age);

          if (matchedAnimalIds.includes(animalId)) return false;
          if (availability && availability !== 'available') return false;

          if (preferredTypes.length > 0 && !preferredTypes.includes(animalType)) {
            return false;
          }

          if (preferredSizes.length > 0 && !preferredSizes.includes(animalSize)) {
            return false;
          }

          if (preferredBreeds.length > 0) {
            const breedMatches = preferredBreeds.some((breed) =>
              animalBreed.includes(breed)
            );

            if (!breedMatches) return false;
          }

          if (agePreference === 'young' && Number.isFinite(animalAge) && animalAge >= 2) {
            return false;
          }

          if (
            agePreference === 'adult' &&
            Number.isFinite(animalAge) &&
            (animalAge < 2 || animalAge > 7)
          ) {
            return false;
          }

          if (agePreference === 'senior' && Number.isFinite(animalAge) && animalAge <= 7) {
            return false;
          }

          if (savedPreferences.good_with_children && !animal.good_with_children) {
            return false;
          }

          if (savedPreferences.good_with_other_animals && !animal.good_with_other_animals) {
            return false;
          }

          return true;
        });

        setAnimals(filteredAnimals);
        setCurrentIndex(0);
      } catch (error) {
        console.error('Failed to load listings:', error);
        setPageError('Unable to connect to the server. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadListings();
  }, [user]);

  const goToNextAnimal = () => {
    if (currentIndex < animals.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(animals.length);
      setStatusMessage("You've reached the end of your available listings.");
    }
  };

  const handleSkip = () => {
    setPageError('');
    setStatusMessage('');
    goToNextAnimal();
  };

  const handleMatch = async (animal) => {
    setPageError('');
    setStatusMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/swipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
        },
        body: JSON.stringify({
          animal_id: animal.id,
          action: 'like',
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        setPageError(result.error || 'Failed to save match');
        return;
      }

      const remainingAnimals = animals.filter((item) => item.id !== animal.id);

      setAnimals(remainingAnimals);

      if (remainingAnimals.length === 0) {
        setCurrentIndex(0);
        setStatusMessage("You've matched with all available animals.");
        return;
      }

      if (currentIndex >= remainingAnimals.length) {
        setCurrentIndex(remainingAnimals.length - 1);
      }
    } catch (error) {
      console.error('Failed to save match:', error);
      setPageError('Unable to save match. Please try again.');
    }
  };

  const handleMessageShelter = async (animal) => {
    setPageError('');
    setStatusMessage('');

    try {
      const headers = {
        'Content-Type': 'application/json',
        'x-demo-email': user.email,
        'x-demo-role': user.role,
      };

      const matchResponse = await fetch(`${API_BASE_URL}/api/swipes`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          animal_id: animal.id,
          action: 'like',
        }),
      });

      const matchResult = await matchResponse.json();

      if (!matchResponse.ok || !matchResult.ok) {
        setPageError(matchResult.error || 'Failed to save match');
        return;
      }

      const threadResponse = await fetch(`${API_BASE_URL}/api/messages/threads`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          animal_id: animal.id,
        }),
      });

      const threadResult = await threadResponse.json();

      if (!threadResponse.ok || !threadResult.ok) {
        setPageError(threadResult.error || 'Failed to start conversation');
        return;
      }

      const threadId = threadResult.data?.id || threadResult.data?.thread_id;

      if (!threadId) {
        setPageError('Conversation was created, but the thread could not be opened.');
        return;
      }

      navigate(`/contact?threadId=${encodeURIComponent(threadId)}`);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setPageError('Unable to start conversation. Please try again.');
    }
  };

  const currentAnimal = animals[currentIndex];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .listings-card {
            grid-template-columns: 1fr !important;
          }
          .listings-image-box {
            min-height: 240px !important;
          }
          .listings-nav-buttons {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
          }
          .listings-nav-buttons button {
            margin-right: 0 !important;
          }
        }
      `}</style>

      <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1>PawfectMatch</h1>
            <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: '5px 0' }}>Animal Matches</h2>
            <p style={{ color: '#595959', marginTop: '10px' }}>
              Browse available animals that match your adoption preferences
            </p>
          </header>

          <main>
            <div style={{ textAlign: 'center', marginBottom: '30px' }} className="listings-nav-buttons">
              <button onClick={() => navigate('/preferences')} style={{ marginRight: '12px' }}>
                Update Preferences
              </button>
              <button onClick={() => navigate('/matches')} style={{ marginRight: '12px' }}>
                View Matches
              </button>
              <button onClick={() => navigate('/adopter-menu')} style={{ marginRight: '12px' }}>
                Back to Dashboard
              </button>
              <button onClick={() => { logout(); navigate('/'); }}>
                Log Out
              </button>
            </div>

            {preferences && (
              <div style={styles.filterBox}>
                <p style={{ marginTop: 0, marginBottom: '10px', fontWeight: '700' }}>
                  Applied Filters
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={styles.filterPill}><strong>Type:</strong> {showList(preferences.animal_types)}</span>
                  <span style={styles.filterPill}><strong>Breed:</strong> {showList(preferences.breeds)}</span>
                  <span style={styles.filterPill}><strong>Age:</strong> {showValue(preferences.age_preference)}</span>
                  <span style={styles.filterPill}><strong>Size:</strong> {showList(preferences.size_preferences)}</span>
                  <span style={styles.filterPill}><strong>Max Distance:</strong> {preferences.max_distance || 'Any'} miles</span>
                  {preferences.good_with_children && <span style={styles.filterPill}>Good with children</span>}
                  {preferences.good_with_other_animals && <span style={styles.filterPill}>Good with other animals</span>}
                </div>
              </div>
            )}

            {statusMessage && (
              <div role="status" style={styles.successMessage}>{statusMessage}</div>
            )}

            {pageError && (
              <div role="alert" style={styles.errorMessage}>{pageError}</div>
            )}

            {loading ? (
              <p style={{ textAlign: 'center' }}>Loading listings...</p>
            ) : animals.length === 0 ? (
              <div style={styles.emptyBox}>
                <h2 style={{ marginTop: 0, fontSize: '18px' }}>No matching listings yet</h2>
                <p style={{ color: '#595959' }}>
                  Try updating your preferences or check back later.
                </p>
              </div>
            ) : !currentAnimal ? (
              <div style={styles.emptyBox}>
                <h2 style={{ marginTop: 0, fontSize: '18px' }}>No more animals to review</h2>
                <p style={{ color: '#595959' }}>
                  You have reviewed all currently matching animals.
                </p>
                <button onClick={() => setCurrentIndex(0)}>Start Over</button>
              </div>
            ) : (
              <div>
                <p style={{ textAlign: 'center', color: '#595959', marginBottom: '15px' }}>
                  {currentIndex + 1} of {animals.length}
                </p>

                <div style={styles.card} className="listings-card">
                  <div style={styles.imageBox} className="listings-image-box">
                    {currentAnimal.primary_photo_url ? (
                      <img
                        src={currentAnimal.primary_photo_url}
                        alt={currentAnimal.name}
                        style={styles.image}
                      />
                    ) : (
                      <div style={styles.noPhoto}>No Photo</div>
                    )}
                  </div>

                  <div style={styles.cardContent}>
                    <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '20px' }}>
                      {currentAnimal.name}
                    </h2>

                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        ...styles.badge,
                        ...getAvailabilityBadgeStyle(currentAnimal.availability),
                      }}>
                        {currentAnimal.availability}
                      </span>
                    </div>

                    <p style={styles.detail}><strong>Type:</strong> {currentAnimal.type}</p>
                    <p style={styles.detail}><strong>Breed:</strong> {currentAnimal.breed || 'N/A'}</p>
                    <p style={styles.detail}><strong>Sex:</strong> {currentAnimal.sex}</p>
                    <p style={styles.detail}><strong>Size:</strong> {currentAnimal.size || 'N/A'}</p>
                    <p style={styles.detail}><strong>Age:</strong> {currentAnimal.age || 'N/A'}</p>

                    <p style={{ marginTop: '14px', color: '#555' }}>
                      {currentAnimal.description || 'No description provided.'}
                    </p>

                    <div style={styles.actions}>
                      <button
                        type="button"
                        onClick={handleSkip}
                        aria-label="Skip animal"
                        style={{
                          ...styles.swipeButton,
                          backgroundColor: '#eadfd7',
                          color: '#8a5a3b',
                        }}
                      >
                        ✕
                      </button>
                      <button type="button" onClick={() => handleMessageShelter(currentAnimal)}>
                        Message Shelter
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMatch(currentAnimal)}
                        aria-label="Match with animal"
                        style={{
                          ...styles.swipeButton,
                          backgroundColor: '#dbeadf',
                          color: '#355e3b',
                        }}
                      >
                        ♥
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <p style={{ ...styles.footer, color: '#595959' }}>
              CS Capstone Project - Animal Adoption Matchmaker
            </p>
          </main>

        </div>
      </div>
    </>
  );
}

const styles = {
  filterBox: {
    background: '#ffffff',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '18px 20px',
    marginBottom: '24px',
    fontSize: '14px',
    color: '#2C2C34',
  },
  filterPill: {
    display: 'inline-block',
    color: '#2C2C34',
    fontSize: '14px',
    fontWeight: '400',
    textTransform: 'capitalize',
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
  card: {
    background: 'white',
    border: '1px solid #ddd',
    borderRadius: '10px',
    overflow: 'hidden',
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    maxWidth: '900px',
    margin: '0 auto',
  },
  imageBox: {
    background: '#f5f5f5',
    minHeight: '360px',
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
    color: '#595959',
  },
  cardContent: {
    padding: '24px',
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
  actions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginTop: '28px',
  },
  swipeButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '1px solid #D7C3AE',
    cursor: 'pointer',
    fontSize: '26px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: '12px',
    marginTop: '30px',
  },
};