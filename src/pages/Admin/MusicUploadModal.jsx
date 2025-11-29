// src/components/Admin/MusicUploadModal.jsx - English Version
import React, { useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import { FiUpload, FiMusic, FiImage, FiX, FiCheck } from 'react-icons/fi';

const MusicUploadModal = ({ onClose }) => {
  const { uploadMusic, loading, error } = useAdminStore();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    duration: '',
    genre: ''
  });
  const [files, setFiles] = useState({
    audioFile: null,
    coverImage: null
  });
  const [preview, setPreview] = useState({
    coverImage: null
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    
    if (fileList && fileList[0]) {
      const file = fileList[0];
      
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));

      // Image preview
      if (name === 'coverImage') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(prev => ({
            ...prev,
            coverImage: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    
    if (fileType === 'coverImage') {
      setPreview(prev => ({
        ...prev,
        coverImage: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!files.audioFile || !files.coverImage) {
      alert('Please select both audio file and cover image');
      return;
    }

    const uploadData = new FormData();
    
    Object.keys(formData).forEach(key => {
      uploadData.append(key, formData[key]);
    });
    
    uploadData.append('audioFile', files.audioFile);
    uploadData.append('coverImage', files.coverImage);

    try {
      await uploadMusic(uploadData);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.artist && 
      formData.duration &&
      formData.genre &&
      files.audioFile &&
      files.coverImage
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Upload New Music</h2>
            <p className="text-gray-400 text-sm mt-1">Upload music files from your computer</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* File Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Audio File */}
              <div className="space-y-3">
                <label className="block text-white font-medium text-sm">
                  Audio File *
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
                  files.audioFile 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 hover:border-purple-500 bg-gray-700/50'
                }`}>
                  <input
                    type="file"
                    name="audioFile"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="audioFile"
                  />
                  <label htmlFor="audioFile" className="cursor-pointer block">
                    <div className="text-center">
                      {files.audioFile ? (
                        <div className="space-y-2">
                          <FiCheck className="w-8 h-8 text-green-400 mx-auto" />
                          <p className="text-green-400 text-sm font-medium">File Selected</p>
                          <p className="text-green-300 text-xs truncate">{files.audioFile.name}</p>
                          <button
                            type="button"
                            onClick={() => removeFile('audioFile')}
                            className="text-red-400 hover:text-red-300 text-xs mt-2"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FiMusic className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-gray-400 text-sm">Select Audio File</p>
                          <p className="text-gray-500 text-xs">MP3, WAV, OGG (Max 50MB)</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Cover Image */}
              <div className="space-y-3">
                <label className="block text-white font-medium text-sm">
                  Cover Image *
                </label>
                <div className={`border-2 border-dashed rounded-xl p-4 transition-all duration-200 ${
                  files.coverImage 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-gray-600 hover:border-purple-500 bg-gray-700/50'
                }`}>
                  <input
                    type="file"
                    name="coverImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="coverImage"
                  />
                  <label htmlFor="coverImage" className="cursor-pointer block">
                    <div className="text-center">
                      {preview.coverImage ? (
                        <div className="space-y-2">
                          <img 
                            src={preview.coverImage} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded mx-auto"
                          />
                          <p className="text-green-400 text-sm font-medium">Image Selected</p>
                          <button
                            type="button"
                            onClick={() => removeFile('coverImage')}
                            className="text-red-400 hover:text-red-300 text-xs mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <FiImage className="w-8 h-8 text-gray-400 mx-auto" />
                          <p className="text-gray-400 text-sm">Select Cover Image</p>
                          <p className="text-gray-500 text-xs">JPG, PNG, WebP</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Music Info */}
            <div className="bg-gray-700/30 rounded-xl p-4 border border-gray-600">
              <h3 className="text-white font-medium mb-4">Music Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Song title"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    name="artist"
                    value={formData.artist}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="Artist name"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    placeholder="e.g., 3:45"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Genre *
                  </label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select Genre</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="R&B">R&B</option>
                    <option value="Classical">Classical</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Country">Country</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Upload Status */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium text-sm mb-2">Upload Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Audio File:</span>
                  <span className={files.audioFile ? "text-green-400" : "text-red-400"}>
                    {files.audioFile ? "✅ Selected" : "❌ Not Selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Cover Image:</span>
                  <span className={files.coverImage ? "text-green-400" : "text-red-400"}>
                    {files.coverImage ? "✅ Selected" : "❌ Not Selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Music Info:</span>
                  <span className={isFormValid() ? "text-green-400" : "text-yellow-400"}>
                    {isFormValid() ? "✅ Complete" : "⚠️ Incomplete"}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer - Buttons */}
        <div className="border-t border-gray-700 p-4 bg-gray-900/50">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={!isFormValid() || loading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4 mr-2" />
                  Upload Music
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MusicUploadModal;