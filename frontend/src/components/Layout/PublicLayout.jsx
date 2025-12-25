import Header from './Header';
import Sidebar from './Sidebar';
import MusicPlayer from '../Music/MusicPlayer';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="bg-gray-900 min-h-screen text-white flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {/* Player همیشه پایین */}
      <MusicPlayer />
    </div>
  );
};

export default PublicLayout;
