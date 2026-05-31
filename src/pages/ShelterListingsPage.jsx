import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function getAvailabilityBadgeStyle(status) {
  if (status === 'available') return { color: '#355e3b' };
  if (status === 'pending') return { color: '#7a6230' };
  if (status === 'adopted') return { color: '#8a5a3b' };
  return { color: '#5f5a52' };
}

export default function ShelterListingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [animals, setAnimals] = useState([]);
  const [shelterName, setShelterName] = useState('Your Listings');
  const [pageError, setPageError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const closeMenu = () => setOpenMenuId(null);
    const handleEscape = (event) => { if (event.key === 'Escape') setOpenMenuId(null); };
    document.addEventListener('click', closeMenu);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('click', closeMenu);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    const loadPageData = async () => {
      if (!user?.email || user.role !== 'shelter') return;
      try {
        const headers = {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
          "x-demo-token": localStorage.getItem("pm_token"),
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
    setOpenMenuId(null);
    if (!window.confirm('Delete this listing?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/animals/${animalId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
          "x-demo-token": localStorage.getItem("pm_token"),
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

  const toggleMenu = (event, animalId) => {
    event.stopPropagation();
    setOpenMenuId((currentId) => currentId === animalId ? null : animalId);
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .shelter-listings-card {
            grid-template-columns: 1fr !important;
          }
          .shelter-listings-image {
            min-height: 200px !important;
          }
          .shelter-listings-nav {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 8px;
          }
          .shelter-listings-nav button {
            margin-right: 0 !important;
          }
        }
      `}</style>

      <div style={{ background: '#fafafa', minHeight: '100vh', padding: '40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

          <header style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1>PawfectMatch</h1>
            <h2 style={{ fontSize: '16px', fontWeight: 'normal', margin: '5px 0' }}>{shelterName}</h2>
            <p style={{ color: '#595959', marginTop: '10px' }}>
              Manage your shelter&apos;s animal listings
            </p>
          </header>

          <main>
            <div style={{ textAlign: 'center', marginBottom: '30px' }} className="shelter-listings-nav">
              <button onClick={() => navigate('/animal/new')} style={{ marginRight: '12px' }}>
                Create New Listing
              </button>
              <button onClick={() => navigate('/shelter-menu')} style={{ marginRight: '12px' }}>
                Back to Dashboard
              </button>
              <button onClick={() => { logout(); navigate('/'); }}>
                Log Out
              </button>
            </div>

            {pageError && (
              <div
                role="alert"
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
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                <h2 style={{ marginTop: 0, fontSize: '18px' }}>No listings yet</h2>
                <p style={{ color: '#595959' }}>Create your first animal listing to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    className="shelter-listings-card"
                    style={{
                      background: 'white',
                      border: '1px solid #ddd',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      display: 'grid',
                      gridTemplateColumns: '240px 1fr',
                    }}
                  >
                    <div className="shelter-listings-image" style={{ background: '#f5f5f5', minHeight: '220px' }}>
                      {animal.primary_photo_url ? (
                        <img
                          src={animal.primary_photo_url}
                          alt={animal.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#595959' }}>
                          No Photo
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px' }}>
                        <div>
                          <h2 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>{animal.name}</h2>
                          <div style={{ marginBottom: '12px' }}>
                            <span style={{ display: 'inline-block', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize', ...getAvailabilityBadgeStyle(animal.availability) }}>
                              {animal.availability}
                            </span>
                          </div>
                          <p style={{ margin: '4px 0' }}><strong>Type:</strong> {animal.type}</p>
                          <p style={{ margin: '4px 0' }}><strong>Breed:</strong> {animal.breed || 'N/A'}</p>
                          <p style={{ margin: '4px 0' }}><strong>Sex:</strong> {animal.sex}</p>
                          <p style={{ margin: '4px 0' }}><strong>Size:</strong> {animal.size || 'N/A'}</p>
                        </div>

                        <div
                          style={{ position: 'relative', textAlign: 'right', minWidth: '44px' }}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label={`Open actions for ${animal.name}`}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === animal.id}
                            onClick={(event) => toggleMenu(event, animal.id)}
                            style={styles.menuButton}
                          >
                            ⋯
                          </button>

                          {openMenuId === animal.id && (
                            <div
                              role="menu"
                              aria-label={`Actions for ${animal.name}`}
                              style={styles.dropdownMenu}
                              onClick={(event) => event.stopPropagation()}
                            >
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => { setOpenMenuId(null); navigate(`/animal/${animal.id}/edit`); }}
                                style={styles.dropdownItem}
                              >
                                Edit Listing
                              </button>
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => handleDelete(animal.id)}
                                style={{ ...styles.dropdownItem, ...styles.deleteDropdownItem }}
                              >
                                Delete Listing
                              </button>
                            </div>
                          )}
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

            <p style={{ textAlign: 'center', fontSize: '12px', color: '#595959', marginTop: '30px' }}>
              CS Capstone Project - Animal Adoption Matchmaker
            </p>
          </main>

        </div>
      </div>
    </>
  );
}

const styles = {
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
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '32px',
    right: 0,
    zIndex: 20,
    width: '160px',
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
  deleteDropdownItem: {
    color: '#b94b4b',
  },
};