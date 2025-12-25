import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMusicStore } from '../../stores/musicStore';
import { useAuthStore } from '../../stores/authStore';
import MusicGrid from '../../components/Music/MusicGrid';
import { FiSearch, FiMusic } from 'react-icons/fi';

const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchMusic, isLoading } = useMusicStore();
  const { isAuthenticated } = useAuthStore();

  const q = searchParams.get('q') || '';
  const genre = searchParams.get('genre') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  const page = Number(searchParams.get('page') || 1);

  const [music, setMusic] = useState([]);
  const [pagination, setPagination] = useState(null);

  // 🔥 fetch from backend (ONLY source of truth)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await searchMusic(q, {
          genre,
          sort,
          page
        });

        setMusic(res.data || []);
        setPagination(res.pagination || null);
      } catch (err) {
        console.error('❌ Browse fetch error:', err);
        setMusic([]);
      }
    };

    fetchData();
  }, [q, genre, sort, page]);

  const handlePlayMusic = (track) => {
    if (!isAuthenticated) {
      alert('Please login to play music');
      return;
    }
    useMusicStore.getState().playMusic(track, music);
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    params.set('page', 1); // reset page
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white pt-20">
      <div className="container mx-auto px-4 py-8">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">
            {q ? `Results for "${q}"` : 'Browse Music'}
          </h1>
          <p className="text-gray-400">
            {pagination?.total || 0} tracks found
          </p>
        </div>

        {/* FILTER BAR */}
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 mb-8 flex flex-col md:flex-row gap-4">

          {/* Genre */}
          <select
            value={genre}
            onChange={(e) => updateParam('genre', e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none"
          >
            <option value="all">All Genres</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="HipHop">HipHop</option>
            <option value="Electronic">Electronic</option>
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg outline-none"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Played</option>
            <option value="alphabetical">A → Z</option>
          </select>
        </div>

        {/* CONTENT */}
        {isLoading ? (
          <div className="flex flex-col items-center py-20">
            <div className="animate-spin h-10 w-10 border-b-2 border-purple-500 rounded-full" />
            <p className="text-gray-400 mt-4">Loading music…</p>
          </div>
        ) : music.length > 0 ? (
          <MusicGrid
            musicList={music}
            onPlay={handlePlayMusic}
          />
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <FiSearch className="w-14 h-14 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Nothing found</h3>
            <p className="text-gray-400">
              Try another search or change filters
            </p>
          </div>
        )}

        {/* PAGINATION */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              disabled={page <= 1}
              onClick={() => updateParam('page', page - 1)}
              className="px-4 py-2 bg-white/10 rounded disabled:opacity-30"
            >
              Prev
            </button>

            <span className="text-gray-400">
              Page {page} / {pagination.totalPages}
            </span>

            <button
              disabled={page >= pagination.totalPages}
              onClick={() => updateParam('page', page + 1)}
              className="px-4 py-2 bg-white/10 rounded disabled:opacity-30"
            >
              Next
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default BrowsePage;
