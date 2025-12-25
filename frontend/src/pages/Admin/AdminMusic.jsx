import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { useAdminStore } from '../../stores/adminStore';
import MusicUploadModal from './MusicUploadModal';
import { FiUpload, FiEdit, FiTrash2, FiPlay, FiEye, FiMusic } from 'react-icons/fi';

const AdminMusic = () => {
  const { 
    music, 
    fetchMusic, 
    deleteMusic, 
    musicLoading, 
    musicPagination, 
    error 
  } = useAdminStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [previewAudio, setPreviewAudio] = useState(null);

  useEffect(() => { 
    fetchMusic(page, searchTerm); 
  }, [fetchMusic, page, searchTerm]);

  const handleDelete = (id, title) => {
    if (window.confirm(`آیا مطمئن هستید که می‌خواهید "${title}" را حذف کنید؟`)) {
      deleteMusic(id);
    }
  };

  const handlePreview = (music) => {
    setSelectedMusic(music);
    setPreviewAudio(`http://localhost:3000/api/music/stream/${music._id}`);
  };

  const handleClosePreview = () => {
    setSelectedMusic(null);
    setPreviewAudio(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <FiMusic className="text-purple-400" />
                مدیریت موزیک‌ها
              </h1>
              <p className="text-gray-400 mt-1">مدیریت و آپلود موزیک‌های پلتفرم</p>
            </div>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold"
            >
              <FiUpload />
              آپلود موزیک جدید
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">کل موزیک‌ها</div>
            <div className="text-2xl font-bold text-white mt-1">{musicPagination?.total || 0}</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">مجموع پخش‌ها</div>
            <div className="text-2xl font-bold text-white mt-1">
              {music?.reduce((sum, m) => sum + (m.playCount || 0), 0) || 0}
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">مجموع بازدیدها</div>
            <div className="text-2xl font-bold text-white mt-1">
              {music?.reduce((sum, m) => sum + (m.viewCount || 0), 0) || 0}
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="text-gray-400 text-sm">صفحه فعلی</div>
            <div className="text-2xl font-bold text-white mt-1">{page}/{musicPagination?.totalPages || 1}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <form 
            onSubmit={(e) => { 
              e.preventDefault(); 
              setPage(1); 
              fetchMusic(1, searchTerm); 
            }}
            className="flex flex-col md:flex-row gap-3"
          >
            <div className="flex-1">
              <input
                type="text"
                placeholder="جستجوی موزیک بر اساس عنوان، هنرمند یا ژانر..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                جستجو
              </button>
              <button 
                type="button"
                onClick={() => { setSearchTerm(''); setPage(1); fetchMusic(1, ''); }}
                className="bg-gray-700 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors font-semibold"
              >
                پاک کردن
              </button>
            </div>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Music Table */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
          {musicLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="animate-spin h-10 w-10 border-b-2 border-purple-500 rounded-full"></div>
              <p className="text-gray-400 mt-4">در حال بارگذاری موزیک‌ها...</p>
            </div>
          ) : music?.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">موزیک</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">ژانر</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">مدت</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">پخش</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">بازدید</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">آپلود کننده</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">تاریخ</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50">
                    {music.map(track => (
                      <tr 
                        key={track._id} 
                        className="hover:bg-gray-700/30 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                              <img 
                                src={track.coverImage} 
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `
                                    <div class="w-full h-full flex items-center justify-center">
                                      <FiMusic class="w-6 h-6 text-gray-400" />
                                    </div>
                                  `;
                                }}
                              />
                            </div>
                            <div className="text-right">
                              <div className="text-white font-semibold text-sm">{track.title}</div>
                              <div className="text-gray-400 text-xs">{track.artist}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                            {track.genre}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{track.duration}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-green-400">
                            <FiPlay className="w-3 h-3" />
                            <span>{track.playCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-blue-400">
                            <FiEye className="w-3 h-3" />
                            <span>{track.viewCount || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 text-sm">
                          {track.uploadedBy?.username || 'نامعلوم'}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(track.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handlePreview(track)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="پیش‌نمایش"
                            >
                              <FiEye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors"
                              title="ویرایش"
                              onClick={() => alert('قابلیت ویرایش به زودی اضافه می‌شود')}
                            >
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(track._id, track.title)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="حذف"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Audio Preview Modal */}
              {selectedMusic && previewAudio && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-lg w-full p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">پیش‌نمایش موزیک</h3>
                      <button
                        onClick={handleClosePreview}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden">
                          <img 
                            src={selectedMusic.coverImage} 
                            alt={selectedMusic.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-white font-bold text-lg">{selectedMusic.title}</h4>
                          <p className="text-gray-300">{selectedMusic.artist}</p>
                          <p className="text-gray-400 text-sm">{selectedMusic.genre} • {selectedMusic.duration}</p>
                        </div>
                      </div>
                      
                      <audio
                        controls
                        autoPlay
                        className="w-full h-12"
                        src={previewAudio}
                        onError={(e) => {
                          console.error('Preview audio error:', e);
                          alert('خطا در بارگذاری فایل صوتی');
                        }}
                      />
                      
                      <div className="text-center pt-4 border-t border-gray-700">
                        <button
                          onClick={handleClosePreview}
                          className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          بستن
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiMusic className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">هیچ موزیکی پیدا نشد</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز موزیکی آپلود نشده است'}
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg hover:shadow-xl transition-all duration-300 font-semibold"
              >
                اولین موزیک را آپلود کنید
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {musicPagination?.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-800/50 rounded-xl p-4 border border-gray-700">
            <div className="text-gray-400 text-sm">
              نمایش {((page - 1) * 10) + 1} تا {Math.min(page * 10, musicPagination.total)} از {musicPagination.total} موزیک
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <span>قبلی</span>
              </button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, musicPagination.totalPages) }, (_, i) => {
                  const pageNum = page <= 3 
                    ? i + 1 
                    : page >= musicPagination.totalPages - 2 
                      ? musicPagination.totalPages - 4 + i 
                      : page - 2 + i;
                  
                  if (pageNum > 0 && pageNum <= musicPagination.totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          page === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, musicPagination.totalPages))}
                disabled={page === musicPagination.totalPages}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <span>بعدی</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <MusicUploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </AdminLayout>
  );
};

export default AdminMusic;