import { useState } from 'react';
import { AlertCircle, Check, Upload, X, PawPrint, ArrowLeft } from 'lucide-react';
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
    newsItem: '',
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Save to localStorage for demo
    const animals = JSON.parse(localStorage.getItem('animals') || '[]');
    animals.push({ ...formData, photos: photos.map(p => p.name), id: Date.now() });
    localStorage.setItem('animals', JSON.stringify(animals));
    
    setSubmitStatus({ 
      type: 'success', 
      message: `${formData.name}'s profile created! (Demo mode - stored locally)` 
    });

    setTimeout(() => navigate('/'), 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-t-2xl shadow-lg p-8 border-b-4 border-green-500">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <PawPrint className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Create Animal Profile</h1>
          </div>
          <p className="text-gray-600">Add a new animal to your shelter's adoption listings</p>
        </div>

        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span>{submitStatus.message}</span>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Animal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Buddy"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                {errors.name && <p className="mt-1 text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Animal Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                >
                  <option value="">Select type</option>
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && <p className="mt-1 text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.type}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g., Golden Retriever"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sex *</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                >
                  <option value="">Select sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="unknown">Unknown</option>
                </select>
                {errors.sex && <p className="mt-1 text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.sex}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Years) *</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={formData.ageYears}
                  onChange={(e) => setFormData({ ...formData, ageYears: e.target.value })}
                  placeholder="0-30"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Age (Additional Months)</label>
                <input
                  type="number"
                  min="0"
                  max="11"
                  value={formData.ageMonths}
                  onChange={(e) => setFormData({ ...formData, ageMonths: e.target.value })}
                  placeholder="0-11"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
                {errors.age && <p className="mt-1 text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.age}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Size</label>
                <select
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                >
                  <option value="">Select size</option>
                  <option value="small">Small (under 25 lbs)</option>
                  <option value="medium">Medium (25-50 lbs)</option>
                  <option value="large">Large (50-100 lbs)</option>
                  <option value="extra-large">Extra Large (100+ lbs)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Weight (lbs)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.weightLbs}
                  onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
                  placeholder="Weight in pounds"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">
              Disposition & Behavior
            </h2>
            <div className="space-y-3">
              {['goodWithChildren', 'goodWithOtherAnimals', 'mustBeLeashed'].map((key) => (
                <label key={key} className="flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-green-300 transition-all">
                  <input
                    type="checkbox"
                    checked={formData.disposition[key]}
                    onChange={() => handleDispositionChange(key)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="ml-3 text-gray-700 font-medium">
                    {key === 'goodWithChildren' && 'Good with children'}
                    {key === 'goodWithOtherAnimals' && 'Good with other animals'}
                    {key === 'mustBeLeashed' && 'Must be leashed at all times'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Photos *</h2>
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500">Up to 5 photos (PNG, JPG)</p>
                </div>
                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {photos.map((photo, index) => (
                  <div key={photo.id} className="relative group">
                    <img src={photo.preview} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => removePhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {index === 0 && <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">Primary</div>}
                  </div>
                ))}
              </div>
            )}
            {errors.photos && <p className="mt-2 text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.photos}</p>}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">Description *</h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="6"
              placeholder="Describe the animal's personality, energy level, favorite activities..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all resize-none"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">{formData.description.length}/2000 characters</p>
              {errors.description && <p className="text-red-600 text-sm flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.description}</p>}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Profile...' : 'Create Animal Profile'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
