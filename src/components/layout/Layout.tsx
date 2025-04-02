import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex h-screen">
      <Sidebar /> {/* Your navigation */}
      <main className="flex-1 overflow-y-auto p-4">
         {/* Page content will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;