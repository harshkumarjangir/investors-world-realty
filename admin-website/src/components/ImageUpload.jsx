import React, { useState } from 'react';
import axios from 'axios';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ value, onChange, folder = 'misc', label = 'Image' }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Assuming your backend is running on port 5001
      const response = await axios.post(`http://localhost:5001/api/upload/${folder}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.url) {
        onChange(response.data.url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      
      {error && (
        <div className="text-red-500 text-xs mb-2">{error}</div>
      )}

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 group bg-gray-50 flex items-center justify-center min-h-[120px]">
          <img 
            src={value} 
            alt="Uploaded preview" 
            className="max-h-48 w-full object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x400?text=Invalid+Image';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          />
          <div className={`
            border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center transition-colors
            ${isUploading ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:border-gold-500 hover:bg-gold-50/10'}
          `}>
            {isUploading ? (
              <>
                <Loader2 size={32} className="text-gold-500 animate-spin mb-2" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Click or drag image to upload</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
