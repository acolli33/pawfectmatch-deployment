import { useState } from 'react';
import { AlertCircle, Check, Heart, ArrowLeft } from 'lucide-react';
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
    { value: 'dog', label: 'Dog', emoji: '🐕' },
    { value: 'cat', label: 'Cat', emoji: '🐈' },
    { value: 'other', label: 'Other', emoji: '🐾' },
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save to localStorage for demo
    localStorage.setItem('adopterPreferences', JSON.stringify(formData));
    
    setSubmitStatus({ 
      type: 'success', 
      message: 'Preferences saved! (Demo mode - stored locally)' 
    });

    setTimeout(() => navigate('/'), 2000);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-t-2xl shadow-lg p-8 border-b-4 border-purple-500">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Find Your Perfect Match</h1>
          </div>
          <p className="text-gray-600">Tell us what you're looking for in a companion animal</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          
          {/* Animal Type Selection */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              What type of animal are you interested in? *
            </label>
            <div className="grid grid-cols-3 gap-4">
              {animalTypeOptions.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleAnimalTypeChange(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.animalTypes.includes(option.value)
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
            {errors.animalTypes && (
              <p className="mt-2 text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.animalTypes}
              </p>
            )}
          </div>

          {/* Breed Preference */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Any specific breed preferences?
            </label>
            <p className="text-sm text-gray-500 mb-3">Optional - leave blank for any breed</p>
            <input
              type="text"
              value={formData.breeds}
              onChange={(e) => setFormData({ ...formData, breeds: e.target.value })}
              placeholder="e.g., Golden Retriever, Tabby, Mixed Breed"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            />
          </div>

          {/* Age Preference */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Age Preference
            </label>
            <select
              value={formData.agePreference}
              onChange={(e) => setFormData({ ...formData, agePreference: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
            >
              <option value="any">Any Age</option>
              <option value="young">Young (under 2 years)</option>
              <option value="adult">Adult (2-7 years)</option>
              <option value="senior">Senior (7+ years)</option>
            </select>
          </div>

          {/* Size Preference */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Size Preference (select all that apply)
            </label>
            <div className="space-y-3">
              {sizeOptions.map(option => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.sizePreference.includes(option.value)
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.sizePreference.includes(option.value)}
                    onChange={() => handleSizeChange(option.value)}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Disposition Requirements */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-3">
              Important Characteristics
            </label>
            <div className="space-y-3">
              <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithChildren}
                  onChange={() => handleDispositionChange('goodWithChildren')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-gray-700">Must be good with children</span>
              </label>
              
              <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.disposition.goodWithOtherAnimals}
                  onChange={() => handleDispositionChange('goodWithOtherAnimals')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-gray-700">Must be good with other animals</span>
              </label>
              
              <label className="flex items-center p-4 rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-300 transition-all">
                <input
                  type="checkbox"
                  checked={formData.disposition.mustBeLeashed}
                  onChange={() => handleDispositionChange('mustBeLeashed')}
                  className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                />
                <span className="ml-3 text-gray-700">Okay if must be leashed at all times</span>
              </label>
            </div>
          </div>

          {/* Distance */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Maximum Distance
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="500"
                value={formData.maxDistance}
                onChange={(e) => setFormData({ ...formData, maxDistance: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-xl font-bold text-purple-600 min-w-[100px]">
                {formData.maxDistance} miles
              </span>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-700 mb-2">
              Additional Notes
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Tell us anything else about what you're looking for
            </p>
            <textarea
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              rows="4"
              placeholder="I'm looking for a calm, house-trained companion who enjoys walks..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
            />
            <p className="mt-2 text-sm text-gray-500 text-right">
              {formData.additionalNotes.length}/1000
            </p>
          </div>

          {/* Status Messages */}
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitStatus.type === 'success' ? (
                <Check className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span>{submitStatus.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Preferences & Start Browsing'}
          </button>
        </div>
      </div>
    </div>
  );
}
