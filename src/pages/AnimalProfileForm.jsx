import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnimalProfileForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    ageYears: '',
    ageMonths: '',
    sex: '',
    size: '',
    weightLbs: '',
    color: '',
    disposition: {
      goodWithChildren: false,
      goodWithOtherAnimals: false,
      mustBeLeashed: false,
    },
    availability: 'available',
    description: '',
    medicalNotes: '',
  });

  const [photos, setPhotos] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Animal name is required';
    if (!formData.type) newErrors.type = 'Animal type is required';
    if (formData.ageYears === '' && formData.ageMonths === '') {
      newErrors.age = 'Please provide at least age in years or months';
    }
    if (!formData.sex) newErrors.sex = 'Sex is required';
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }
    if (photos.length === 0) newErrors.photos = 'Please upload at least one photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDispositionChange = (key) => {
    setFormData(prev => ({
      ...prev,
      disposition: { ...prev.disposition, [key]: !prev.disposition[key] }
    }));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    setPhotos(prev => [...prev, ...newPhotos].slice(0, 5));
  };

  const removePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please fix the errors above' });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const animals = JSON.parse(localStorage.getItem('animals') || '[]');
    animals.push({ ...formData, photos: photos.map(p => p.name), id: Date.now() });
    localStorage.setItem('animals', JSON.stringify(animals));
    
    setSubmitStatus({ 
      type: 'success', 
      message: `${formData.name}'s profile created successfully!` 
    });

    setTimeout(() => navigate('/menu'), 2000);
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Left Panel - Info */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <h1 style={styles.leftTitle}>Create Animal Profile</h1>
          <p style={styles.leftDescription}>
            Add a new animal to your shelter's adoption listings. Complete profiles help potential adopters make informed decisions.
          </p>
          
          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Required Information:</h3>
            <ul style={styles.infoList}>
              <li>Animal name and type</li>
              <li>Age and sex</li>
              <li>At least one photo</li>
              <li>Detailed description (50+ characters)</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Best Practices:</h3>
            <ul style={styles.infoList}>
              <li>Use clear, well-lit photos</li>
              <li>Write an engaging description</li>
              <li>Be honest about temperament</li>
              <li>Include any special needs</li>
            </ul>
          </div>

          <div style={styles.infoSection}>
            <h3 style={styles.infoTitle}>Photo Tips:</h3>
            <ul style={styles.infoList}>
              <li>Upload up to 5 photos</li>
              <li>First photo is the primary</li>
              <li>Show personality and features</li>
              <li>Avoid blurry images</li>
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
          <h2 style={styles.formTitle}>Animal Information</h2>
          <p style={styles.formSubtitle}>All fields marked with * are required</p>
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

          {/* Basic Information Section */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Basic Information</h3>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.section}>
              <label style={styles.label}>Animal Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Buddy"
                style={styles.input}
              />
              {errors.name && <p style={styles.errorText}>{errors.name}</p>}
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Animal Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={styles.select}
              >
                <option value="">Select type</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="other">Other</option>
              </select>
              {errors.type && <p style={styles.errorText}>{errors.type}</p>}
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.section}>
              <label style={styles.label}>Breed</label>
              <input
                type="text"
                value={formData.breed}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                placeholder="e.g., Golden Retriever"
                style={styles.input}
              />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Sex *</label>
              <select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                style={styles.select}
              >
                <option value="">Select sex</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="unknown">Unknown</option>
              </select>
              {errors.sex && <p style={styles.errorText}>{errors.sex}</p>}
            </div>
          </div>

          <div style={styles.gridTwo}>
            <div style={styles.section}>
              <label style={styles.label}>Age (Years) *</label>
              <input
                type="number"
                min="0"
                max="30"
                value={formData.ageYears}
                onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                placeholder="0-30"
                style={styles.input}
              />
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Age (Additional Months)</label>
              <input
                type="number"
                min="0"
                max="11"
                value={formData.ageMonths}
                onChange={(e) => setFormData({ ...formData, ageMonths: e.target.value })}
                placeholder="0-11"
                style={styles.input}
              />
            </div>
          </div>
          {errors.age && <p style={styles.errorText}>{errors.age}</p>}

          <div style={styles.gridTwo}>
            <div style={styles.section}>
              <label style={styles.label}>Size</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                style={styles.select}
              >
                <option value="">Select size</option>
                <option value="small">Small (under 25 lbs)</option>
                <option value="medium">Medium (25-50 lbs)</option>
                <option value="large">Large (50-100 lbs)</option>
                <option value="extra-large">Extra Large (100+ lbs)</option>
              </select>
            </div>

            <div style={styles.section}>
              <label style={styles.label}>Weight (lbs)</label>
              <input
                type="number"
                min="0"
                value={formData.weightLbs}
                onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
                placeholder="Weight in pounds"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Color/Markings</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="e.g., Brown with white patches"
              style={styles.input}
            />
          </div>

          {/* Disposition Section */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Disposition & Behavior</h3>
          </div>

          <div style={styles.section}>
            <div style={styles.checkboxGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithChildren}
                  onChange={() => handleDispositionChange('goodWithChildren')}
                  style={styles.checkbox}
                />
                <span>Good with children</span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithOtherAnimals}
                  onChange={() => handleDispositionChange('goodWithOtherAnimals')}
                  style={styles.checkbox}
                />
                <span>Good with other animals</span>
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.disposition.mustBeLeashed}
                  onChange={() => handleDispositionChange('mustBeLeashed')}
                  style={styles.checkbox}
                />
                <span>Must be leashed at all times</span>
              </label>
            </div>
          </div>

          {/* Photos Section */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Photos *</h3>
          </div>

          <div style={styles.section}>
            <label style={styles.uploadLabel}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                style={styles.fileInput}
              />
              <div style={styles.uploadBox}>
                <p style={styles.uploadText}>Click to upload photos</p>
                <p style={styles.uploadSubtext}>Up to 5 photos (PNG, JPG)</p>
              </div>
            </label>

            {photos.length > 0 && (
              <div style={styles.photoGrid}>
                {photos.map((photo, index) => (
                  <div key={photo.id} style={styles.photoItem}>
                    <img src={photo.preview} alt={`Preview ${index + 1}`} style={styles.photoPreview} />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      style={styles.removeButton}
                    >
                      ×
                    </button>
                    {index === 0 && <div style={styles.primaryBadge}>Primary</div>}
                  </div>
                ))}
              </div>
            )}
            {errors.photos && <p style={styles.errorText}>{errors.photos}</p>}
          </div>

          {/* Description Section */}
          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Description *</h3>
          </div>

          <div style={styles.section}>
            <label style={styles.label}>About This Animal</label>
            <p style={styles.helpText}>Describe personality, energy level, favorite activities (minimum 50 characters)</p>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
              placeholder="Tell potential adopters about this animal's personality, habits, and what makes them special..."
              style={styles.textarea}
            />
            <p style={styles.charCount}>{formData.description.length}/2000 characters</p>
            {errors.description && <p style={styles.errorText}>{errors.description}</p>}
          </div>

          <div style={styles.section}>
            <label style={styles.label}>Medical Notes (Optional)</label>
            <p style={styles.helpText}>Any medical conditions, medications, or special care requirements</p>
            <textarea
              value={formData.medicalNotes}
              onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
              rows="3"
              placeholder="e.g., Takes medication for arthritis, needs special diet..."
              style={styles.textarea}
            />
          </div>

          {/* Availability Section */}
          <div style={styles.section}>
            <label style={styles.label}>Availability Status</label>
            <select
              value={formData.availability}
              onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              style={styles.select}
            >
              <option value="available">Available for Adoption</option>
              <option value="pending">Adoption Pending</option>
              <option value="adopted">Adopted</option>
              <option value="hold">On Hold</option>
            </select>
          </div>

          {/* Submit Buttons */}
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
              {loading ? 'Creating Profile...' : 'Create Animal Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/menu')}
              style={styles.cancelButton}
            >
              Cancel
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
    maxWidth: '800px',
  },
  sectionHeader: {
    marginTop: '40px',
    marginBottom: '24px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e3a8a',
    margin: 0,
  },
  section: {
    marginBottom: '24px',
  },
  gridTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '6px',
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
  uploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  fileInput: {
    display: 'none',
  },
  uploadBox: {
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    padding: '30px',
    textAlign: 'center',
    backgroundColor: '#f9fafb',
    transition: 'border-color 0.2s',
  },
  uploadText: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#374151',
    margin: '0 0 4px 0',
  },
  uploadSubtext: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '16px',
  },
  photoItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #d1d5db',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    width: '28px',
    height: '28px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    backgroundColor: '#059669',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
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
    display: 'flex',
    gap: '12px',
  },
  submitButton: {
    flex: 1,
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
  cancelButton: {
    padding: '14px 24px',
    backgroundColor: 'transparent',
    color: '#6b7280',
    border: '2px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
