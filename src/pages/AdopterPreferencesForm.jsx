import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdopterPreferencesForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    animalTypes: [],
    breeds: '',
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

  const validateForm = () => {
    const newErrors = {};
    if (formData.animalTypes.length === 0) {
      newErrors.animalTypes = 'Please select at least one animal type';
    }
    if (formData.maxDistance < 1 || formData.maxDistance > 500) {
      newErrors.maxDistance = 'Distance must be between 1 and 500 miles';
    }
    if (formData.additionalNotes.length > 1000) {
      newErrors.additionalNotes = 'Notes must be less than 1000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnimalTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      animalTypes: prev.animalTypes.includes(type)
        ? prev.animalTypes.filter(t => t !== type)
        : [...prev.animalTypes, type]
    }));
  };

  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      sizePreference: prev.sizePreference.includes(size)
        ? prev.sizePreference.filter(s => s !== size)
        : [...prev.sizePreference, size]
    }));
  };

  const handleDispositionChange = (key) => {
    setFormData(prev => ({
      ...prev,
      disposition: {
        ...prev.disposition,
        [key]: !prev.disposition[key]
      }
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    
    localStorage.setItem('adopterPreferences', JSON.stringify(formData));
    
    setSubmitStatus({ 
      type: 'success', 
      message: 'Preferences saved successfully!' 
    });

    setTimeout(() => navigate('/menu'), 2000);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Info */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.leftTitle}>Find Your Perfect Match</h1>
          <p style={styles.leftDescription}>
            Tell us what you're looking for in a companion animal and we'll help you find your perfect match.
          </p>
          
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>What We'll Ask:</h3>
            <ul style={styles.infoList}>
              <li>Type of animal you're interested in</li>
              <li>Size and age preferences</li>
              <li>Behavioral requirements</li>
              <li>How far you're willing to travel</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Why This Helps:</h3>
            <ul style={styles.infoList}>
              <li>Better matches for your lifestyle</li>
              <li>Saves time browsing</li>
              <li>Increases adoption success</li>
              <li>Finds compatible companions</li>
            </ul>
          </div>

          <button onClick={() => navigate('/menu')} style={styles.backButton}>
            Back to Menu
          </button>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formHeader}>
          <h2 style={styles.formTitle}>Adoption Preferences</h2>
          <p style={styles.formSubtitle}>Help us find your perfect companion</p>
        </div>

        <div style={styles.formContent}>
          {/* Status Messages */}
          {submitStatus && (
            <div style={{
              ...styles.statusMessage,
              backgroundColor: submitStatus.type === 'success' ? '#d1fae5' : '#fee2e2',
              borderColor: submitStatus.type === 'success' ? '#059669' : '#dc2626',
              color: submitStatus.type === 'success' ? '#065f46' : '#991b1b',
            }}>
              {submitStatus.message}
            </div>
          )}

          {/* Animal Type Selection */}
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
                    backgroundColor: formData.animalTypes.includes(option.value) ? '#2563eb' : '#ffffff',
                    color: formData.animalTypes.includes(option.value) ? '#ffffff' : '#374151',
                    borderColor: formData.animalTypes.includes(option.value) ? '#2563eb' : '#d1d5db',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
            {errors.animalTypes && (
              <p style={styles.errorText}>{errors.animalTypes}</p>
            )}
          </div>

          {/* Breed Preference */}
          <div style={styles.section}>
            <label style={styles.label}>Any specific breed preferences?</label>
            <p style={styles.helpText}>Optional - leave blank for any breed</p>
            <input
              type="text"
              value={formData.breeds}
              onChange={(e) => setFormData({ ...formData, breeds: e.target.value })}
              placeholder="e.g., Golden Retriever, Tabby, Mixed Breed"
              style={styles.input}
            />
          </div>

          {/* Age Preference */}
          <div style={styles.section}>
            <label style={styles.label}>Age Preference</label>
            <select
              value={formData.agePreference}
              onChange={(e) => setFormData({ ...formData, agePreference: e.target.value })}
              style={styles.select}
            >
              <option value="any">Any Age</option>
              <option value="young">Young (under 2 years)</option>
              <option value="adult">Adult (2-7 years)</option>
              <option value="senior">Senior (7+ years)</option>
            </select>
          </div>

          {/* Size Preference */}
          <div style={styles.section}>
            <label style={styles.label}>Size Preference (select all that apply)</label>
            <div style={styles.checkboxGroup}>
              {sizeOptions.map(option => (
                <label key={option.value} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.sizePreference.includes(option.value)}
                    onChange={() => handleSizeChange(option.value)}
                    style={styles.checkbox}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Disposition Requirements */}
          <div style={styles.section}>
            <label style={styles.label}>Important Characteristics</label>
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithChildren}
                  onChange={() => handleDispositionChange('goodWithChildren')}
                  style={styles.checkbox}
                />
                <span>Must be good with children</span>
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithOtherAnimals}
                  onChange={() => handleDispositionChange('goodWithOtherAnimals')}
                  style={styles.checkbox}
                />
                <span>Must be good with other animals</span>
              </label>
              
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.mustBeLeashed}
                  onChange={() => handleDispositionChange('mustBeLeashed')}
                  style={styles.checkbox}
                />
                <span>Okay if must be leashed at all times</span>
              </label>
            </div>
          </div>

          {/* Distance */}
          <div style={styles.section}>
            <label style={styles.label}>Maximum Distance: {formData.maxDistance} miles</label>
            <input
              type="range"
              min="1"
              max="500"
              value={formData.maxDistance}
              onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })}
              style={styles.slider}
            />
            <div style={styles.sliderLabels}>
              <span>1 mile</span>
              <span>500 miles</span>
            </div>
          </div>

          {/* Additional Notes */}
          <div style={styles.section}>
            <label style={styles.label}>Additional Notes</label>
            <p style={styles.helpText}>Tell us anything else about what you're looking for</p>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows="4"
              placeholder="I'm looking for a calm, house-trained companion who enjoys walks..."
              style={styles.textarea}
            />
            <p style={styles.charCount}>{formData.additionalNotes.length}/1000 characters</p>
            {errors.additionalNotes && (
              <p style={styles.errorText}>{errors.additionalNotes}</p>
            )}
          </div>

          {/* Submit Button */}
          <div style={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                ...styles.submitButton,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Saving...' : 'Save Preferences & Start Browsing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9fafb',
  },
  leftPanel: {
    width: '380px',
    backgroundColor: '#f0f4f8',
    borderRight: '1px solid #d1d5db',
    overflowY: 'auto',
  },
  leftContent: {
    padding: '40px 30px',
  },
  leftTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: '16px',
    marginTop: 0,
  },
  leftDescription: {
    fontSize: '15px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  infoSection: {
    marginBottom: '30px',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: '12px',
    marginTop: 0,
  },
  infoList: {
    margin: 0,
    paddingLeft: '20px',
    color: '#4b5563',
    fontSize: '14px',
    lineHeight: '1.8',
  },
  backButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    overflowY: 'auto',
  },
  formHeader: {
    padding: '30px 40px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  formTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1e3a8a',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
  },
  formContent: {
    padding: '40px',
    maxWidth: '700px',
  },
  section: {
    marginBottom: '32px',
  },
  label: {
    display: 'block',
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
  },
  helpText: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '8px',
    marginTop: '-4px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontFamily: 'Arial, sans-serif',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  optionButton: {
    padding: '12px 24px',
    border: '2px solid',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  checkboxGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  slider: {
    width: '100%',
    height: '6px',
    cursor: 'pointer',
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px',
  },
  statusMessage: {
    padding: '12px 16px',
    borderRadius: '6px',
    border: '1px solid',
    marginBottom: '24px',
    fontSize: '14px',
  },
  errorText: {
    color: '#dc2626',
    fontSize: '13px',
    marginTop: '6px',
  },
  buttonContainer: {
    marginTop: '40px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};

