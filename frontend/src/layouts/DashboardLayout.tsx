import { useState } from 'react';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, UserCircle, Menu, X } from 'lucide-react';

const DashboardLayout = () => {
  const logout = useAuthStore((state) => state.logout);
  const userName = useAuthStore((state) => state.userName) || 'Admin';
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white font-bold">
                V
              </div>
              <h1 className="text-xl font-bold text-gray-900 mr-6">VShield</h1>
            </div>
            <nav className="hidden sm:flex gap-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary py-5' : 'text-gray-500 hover:text-gray-900 py-5'}`
                }
                end
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/candidates" 
                className={({ isActive }) => 
                  `text-sm font-medium transition-colors ${isActive ? 'text-primary border-b-2 border-primary py-5' : 'text-gray-500 hover:text-gray-900 py-5'}`
                }
              >
                Candidates
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <UserCircle size={20} />
              <span className="text-sm font-medium">{userName}</span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <LogOut size={18} />
                <span className="text-sm font-medium">Logout</span>
              </button>
              
              {showLogoutConfirm && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 animate-fade-in">
                  <p className="text-sm text-gray-800 font-medium mb-3">Are you sure you want to logout?</p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowLogoutConfirm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden text-gray-500 hover:text-gray-900 p-2 ml-2 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>
      
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-b shadow-sm absolute top-16 left-0 right-0 z-40 animate-fade-in">
          <div className="px-4 pt-2 pb-4 space-y-1 flex flex-col">
            <NavLink 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`
              }
              end
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/candidates" 
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => 
                `block px-3 py-2 rounded-md text-base font-medium ${isActive ? 'bg-primary/5 text-primary' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              Candidates
            </NavLink>
          </div>
        </div>
      )}
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
