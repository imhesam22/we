// src/pages/Admin/AdminMusic.jsx
import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../stores/adminStore';
import AdminLayout from './AdminLayout';
import MusicUploadModal from './MusicUploadModal';

const AdminMusic = () => {
  const { music, musicLoading, musicPagination, fetchMusic, deleteMusic, error } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchMusic(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchMusic]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMusic(1, searchTerm);
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMusic(id);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const MusicRow = ({ music }) => (
    <tr className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <img 
            src={music.coverImage} 
            alt={music.title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div>
            <div className="text-white font-medium">{music.title}</div>
            <div className="text-gray-400 text-sm">{music.artist}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-400">{music.genre}</td>
      <td className="px-6 py-4 text-gray-400">{music.duration}</td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <span className="text-blue-400">▶️</span>
          <span className="text-white font-medium">{music.playCount}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <span className="text-amber-400">💰</span>
          <span className="text-white font-medium">{music.totalEarnedCoins}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-400">
        {music.uploadedBy?.username || 'Unknown'}
      </td>
      <td className="px-6 py-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleDelete(music._id, music.title)}
            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Music Management</h1>
            <p className="text-gray-400">Upload and manage platform music</p>
          </div>
          
          <div className="flex space-x-2">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex space-x-2">
              <input
                type="text"
                placeholder="Search music..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Upload Button */}
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upload Music
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Music Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {musicLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-white">Loading music...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Track
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Genre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Plays
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Coins Earned
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Uploaded By
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {music.map((track) => (
                      <MusicRow key={track._id} music={track} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State */}
              {music.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">No music found</div>
                  <div className="text-gray-500 mt-2">
                    {searchTerm ? 'Try changing your search terms' : 'Upload your first track to get started'}
                  </div>
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Upload Music
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Pagination */}
        {musicPagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <span className="text-gray-400">
              Page {currentPage} of {musicPagination.totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, musicPagination.totalPages))}
              disabled={currentPage === musicPagination.totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <MusicUploadModal onClose={() => setShowUploadModal(false)} />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMusic;