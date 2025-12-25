import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
