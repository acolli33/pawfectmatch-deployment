import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdopterPreferencesForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    animalTypes: [],
    breeds: '',
    searchLocation: '',
    agePreference: 'any',
    sizePreference: [],
    disposition: {
      goodWithChildren: false,
      goodWithOtherAnimals: false,
      mustBeLeashed: false,
    },
    maxDistance: 50,
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const animalTypeOptions = [
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'other', label: 'Other' },
  ];

  const sizeOptions = [
    { value: 'small', label: 'Small (under 25 lbs)' },
    { value: 'medium', label: 'Medium (25-50 lbs)' },
    { value: 'large', label: 'Large (50-100 lbs)' },
    { value: 'extra-large', label: 'Extra Large (100+ lbs)' },
  ];

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.email || user.role !== 'adopter') return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/preferences/me`, {
          headers: {
            'Content-Type': 'application/json',
            'x-demo-email': user.email,
            'x-demo-role': user.role,
            'x-demo-token': localStorage.getItem('pm_token'),
          },
        });
        const result = await response.json();
        if (!response.ok || !result.ok || !result.data) return;
        const saved = result.data;
        setFormData({
          animalTypes: Array.isArray(saved.animal_types) ? saved.animal_types : [],
          breeds: saved.breeds || '',
          searchLocation: saved.search_location || '',
          agePreference: saved.age_preference || 'any',
          sizePreference: Array.isArray(saved.size_preferences) ? saved.size_preferences : [],
          disposition: {
            goodWithChildren: saved.good_with_children || false,
            goodWithOtherAnimals: saved.good_with_other_animals || false,
            mustBeLeashed: false,
          },
          maxDistance: saved.max_distance || 50,
          additionalNotes: saved.additional_notes || '',
        });
      } catch (error) {
        console.error('Failed to load preferences:', error);
      }
    };
    loadPreferences();
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (formData.animalTypes.length === 0) newErrors.animalTypes = 'Please select at least one animal type';
    if (formData.maxDistance < 1 || formData.maxDistance > 500) newErrors.maxDistance = 'Distance must be between 1 and 500 miles';
    if (formData.additionalNotes.length > 1000) newErrors.additionalNotes = 'Notes must be less than 1000 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnimalTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      animalTypes: prev.animalTypes.includes(type)
        ? prev.animalTypes.filter((t) => t !== type)
        : [...prev.animalTypes, type]
    }));
  };

  const handleSizeChange = (size) => {
    setFormData((prev) => ({
      ...prev,
      sizePreference: prev.sizePreference.includes(size)
        ? prev.sizePreference.filter((s) => s !== size)
        : [...prev.sizePreference, size]
    }));
  };

  const handleDispositionChange = (key) => {
    setFormData((prev) => ({
      ...prev,
      disposition: { ...prev.disposition, [key]: !prev.disposition[key] }
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
      return;
    }
    if (!user?.email || user.role !== 'adopter') {
      setSubmitStatus({ type: 'error', message: 'You must be logged in as an adopter to save preferences.' });
      return;
    }
    setLoading(true);
    setSubmitStatus(null);
    try {
      const payload = {
        animalTypes: formData.animalTypes,
        breeds: formData.breeds,
        searchLocation: formData.searchLocation,
        agePreference: formData.agePreference,
        sizePreference: formData.sizePreference,
        disposition: formData.disposition,
        maxDistance: formData.maxDistance,
        additionalNotes: formData.additionalNotes,
      };
      const response = await fetch(`${API_BASE_URL}/api/preferences/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-email': user.email,
          'x-demo-role': user.role,
          'x-demo-token': localStorage.getItem('pm_token'),
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (result.details) setErrors(result.details);
        setSubmitStatus({ type: 'error', message: result.error || 'Failed to save preferences.' });
        return;
      }
      setSubmitStatus({ type: 'success', message: 'Preferences saved successfully!' });
      setTimeout(() => navigate('/adopter-listings'), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setSubmitStatus({ type: 'error', message: 'Unable to connect to the server. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const colors = {
    cream: '#FFF7ED',
    mauve: '#B46D92',
    navy: '#2F3A56',
    tan: '#D7C3AE',
    text: '#2C2C34',
    softTan: '#EADFD2',
    otherTan: '#d7c3ae1e',
  };

  const styles = {
    container: { display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif', backgroundColor: colors.otherTan },
    leftPanel: { width: '380px', backgroundColor: colors.softTan, borderRight: `1px solid ${colors.tan}`, overflowY: 'auto' },
    leftContent: { padding: '40px 30px' },
    leftTitle: { fontSize: '28px', fontWeight: 'bold', color: colors.navy, marginBottom: '16px', marginTop: 0 },
    leftDescription: { fontSize: '15px', color: colors.text, lineHeight: '1.6', marginBottom: '30px' },
    infoSection: { marginBottom: '30px' },
    infoTitle: { fontSize: '16px', fontWeight: '600', color: colors.navy, marginBottom: '12px', marginTop: 0 },
    infoList: { margin: 0, paddingLeft: '20px', color: colors.text, fontSize: '14px', lineHeight: '1.8' },
    backButton: { marginTop: '20px', padding: '10px 20px', backgroundColor: colors.navy, color: colors.cream, border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', width: '100%' },
    rightPanel: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: colors.cream, overflowY: 'auto' },
    formHeader: { padding: '30px 40px', borderBottom: `1px solid ${colors.navy}`, backgroundColor: colors.otherTan },
    formTitle: { fontSize: '24px', fontWeight: 'bold', color: colors.navy, margin: '0 0 8px 0' },
    formSubtitle: { fontSize: '14px', color: colors.text, margin: 0 },
    formContent: { padding: '40px', maxWidth: '800px' },
    section: { marginBottom: '32px' },
    label: { display: 'block', fontSize: '14px', fontWeight: '600', color: colors.text, marginBottom: '6px' },
    helpText: { fontSize: '13px', color: colors.text, marginBottom: '8px', marginTop: '-4px' },
    input: { width: '100%', padding: '10px 12px', border: `1px solid ${colors.tan}`, borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', backgroundColor: colors.otherTan, color: colors.text },
    select: { width: '100%', padding: '10px 12px', border: `1px solid ${colors.tan}`, borderRadius: '6px', fontSize: '14px', backgroundColor: colors.otherTan, color: colors.text, cursor: 'pointer', fontFamily: 'Arial, sans-serif' },
    textarea: { width: '100%', padding: '10px 12px', border: `1px solid ${colors.tan}`, borderRadius: '6px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif', backgroundColor: colors.otherTan, color: colors.text },
    buttonGroup: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
    optionButton: { padding: '12px 24px', border: '2px solid', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' },
    checkboxGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: colors.text, cursor: 'pointer' },
    checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: colors.mauve },
    slider: { width: '100%', height: '6px', cursor: 'pointer', accentColor: colors.mauve },
    sliderLabels: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: colors.text, marginTop: '8px' },
    charCount: { textAlign: 'right', fontSize: '12px', color: colors.text, marginTop: '4px' },
    statusMessage: { padding: '12px 16px', borderRadius: '6px', border: '1px solid', marginBottom: '24px', fontSize: '14px' },
    errorText: { color: '#dc2626', fontSize: '13px', marginTop: '6px' },
    buttonContainer: { marginTop: '40px', paddingTop: '24px', borderTop: `1px solid ${colors.tan}` },
    submitButton: { width: '100%', padding: '14px', backgroundColor: colors.navy, color: colors.cream, border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', transition: 'background-color 0.2s' },
    cancelButton: { width: '100%', padding: '14px', backgroundColor: colors.softTan, color: colors.text, border: `2px solid ${colors.tan}`, borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '10px' },
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .preferences-container { flex-direction: column !important; height: auto !important; min-height: 100vh; }
          .preferences-left { width: 100% !important; border-right: none !important; border-bottom: 1px solid #D7C3AE; }
          .preferences-right { width: 100% !important; }
          .preferences-form-content { padding: 20px !important; }
          .preferences-form-header { padding: 20px !important; }
        }
      `}</style>

      <div style={styles.container} className="preferences-container">

        <aside style={styles.leftPanel} className="preferences-left" aria-label="Form guidance">
          <div style={styles.leftContent}>
            <h1 style={styles.leftTitle}>Find Your Perfect Match</h1>
            <p style={styles.leftDescription}>
              Tell us what you're looking for in a companion animal and we'll help you find your perfect match.
            </p>
            <div style={styles.infoSection}>
              <h2 style={styles.infoTitle}>What We'll Ask:</h2>
              <ul style={styles.infoList}>
                <li>Type of animal you're interested in</li>
                <li>Size and age preferences</li>
                <li>Behavioral requirements</li>
                <li>How far you're willing to travel</li>
              </ul>
            </div>
            <div style={styles.infoSection}>
              <h2 style={styles.infoTitle}>Why This Helps:</h2>
              <ul style={styles.infoList}>
                <li>Better matches for your lifestyle</li>
                <li>Saves time browsing</li>
                <li>Increases adoption success</li>
                <li>Finds compatible companions</li>
              </ul>
            </div>
            <button onClick={() => navigate('/adopter-menu')} style={styles.backButton}>Back to Menu</button>
          </div>
        </aside>

        <main style={styles.rightPanel} className="preferences-right">
          <header style={styles.formHeader} className="preferences-form-header">
            <h2 style={styles.formTitle}>Adoption Preferences</h2>
            <p style={styles.formSubtitle}>Help us find your perfect companion</p>
          </header>

          <div style={styles.formContent} className="preferences-form-content">
            {submitStatus && (
              <div role="alert" style={{
                ...styles.statusMessage,
                backgroundColor: submitStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
                borderColor: submitStatus.type === 'success' ? '#059669' : '#dc2626',
                color: submitStatus.type === 'success' ? '#065f46' : '#991b1b',
              }}>
                {submitStatus.message}
              </div>
            )}

            <div style={styles.section}>
              <label style={styles.label}>What type of animal are you interested in? *</label>
              <div style={styles.buttonGroup}>
                {animalTypeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAnimalTypeChange(option.value)}
                    style={{
                      ...styles.optionButton,
                      backgroundColor: formData.animalTypes.includes(option.value) ? colors.navy : colors.otherTan,
                      color: formData.animalTypes.includes(option.value) ? colors.cream : colors.text,
                      borderColor: formData.animalTypes.includes(option.value) ? colors.navy : colors.tan,
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.animalTypes && <p style={styles.errorText} role="alert">{errors.animalTypes}</p>}
            </div>

            <div style={styles.section}>
              <label htmlFor="breeds" style={styles.label}>Any specific breed preferences?</label>
              <p style={styles.helpText}>Optional - leave blank for any breed</p>
              <input id="breeds" type="text" value={formData.breeds} onChange={(e) => setFormData({ ...formData, breeds: e.target.value })} placeholder="e.g., Golden Retriever, Tabby, Mixed Breed" style={styles.input} />
            </div>

            <div style={styles.section}>
              <label htmlFor="searchLocation" style={styles.label}>Search Location</label>
              <p style={styles.helpText}>Enter the city, state, or ZIP code where you want to search</p>
              <input id="searchLocation" type="text" value={formData.searchLocation} onChange={(e) => setFormData({ ...formData, searchLocation: e.target.value })} placeholder="e.g., Portland, OR or 97201" style={styles.input} />
            </div>

            <div style={styles.section}>
              <label htmlFor="agePreference" style={styles.label}>Age Preference</label>
              <select id="agePreference" value={formData.agePreference} onChange={(e) => setFormData({ ...formData, agePreference: e.target.value })} style={styles.select}>
                <option value="any">Any Age</option>
                <option value="young">Young (under 2 years)</option>
                <option value="adult">Adult (2-7 years)</option>
                <option value="senior">Senior (7+ years)</option>
              </select>
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Size Preference (select all that apply)</label>
              <div style={styles.checkboxGroup}>
                {sizeOptions.map(option => (
                  <label key={option.value} style={styles.checkboxLabel}>
                    <input type="checkbox" checked={formData.sizePreference.includes(option.value)} onChange={() => handleSizeChange(option.value)} style={styles.checkbox} />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Important Characteristics</label>
              <div style={styles.checkboxGroup}>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.disposition.goodWithChildren} onChange={() => handleDispositionChange('goodWithChildren')} style={styles.checkbox} />
                  <span>Must be good with children</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.disposition.goodWithOtherAnimals} onChange={() => handleDispositionChange('goodWithOtherAnimals')} style={styles.checkbox} />
                  <span>Must be good with other animals</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" checked={formData.disposition.mustBeLeashed} onChange={() => handleDispositionChange('mustBeLeashed')} style={styles.checkbox} />
                  <span>Okay if must be leashed at all times</span>
                </label>
              </div>
            </div>

            <div style={styles.section}>
              <label htmlFor="maxDistance" style={styles.label}>Maximum Distance: {formData.maxDistance} miles</label>
              <input id="maxDistance" type="range" min="1" max="500" value={formData.maxDistance} onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })} style={styles.slider} />
              <div style={styles.sliderLabels}>
                <span>1 mile</span>
                <span>500 miles</span>
              </div>
            </div>

            <div style={styles.section}>
              <label htmlFor="additionalNotes" style={styles.label}>Additional Notes</label>
              <p style={styles.helpText}>Tell us anything else about what you're looking for</p>
              <textarea id="additionalNotes" value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} rows="4" placeholder="I'm looking for a calm, house-trained companion who enjoys walks..." style={styles.textarea} />
              <p style={styles.charCount} aria-live="polite">{formData.additionalNotes.length}/1000 characters</p>
              {errors.additionalNotes && <p style={styles.errorText} role="alert">{errors.additionalNotes}</p>}
            </div>

            <div style={styles.buttonContainer}>
              <button type="button" onClick={handleSubmit} disabled={loading} style={{ ...styles.submitButton, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Saving...' : 'Save Preferences & Start Browsing'}
              </button>
              <button type="button" onClick={() => navigate('/adopter-menu')} style={styles.cancelButton}>Cancel</button>
            </div>
          </div>
        </main>

      </div>
    </>
  );
}