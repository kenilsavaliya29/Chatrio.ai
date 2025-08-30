'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/components/ThemeContext';
import {
  GaugeCircle,
  Bot,
  Palette,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
  Pencil,
  Check,
  X as CloseIcon,
  ChevronLeft,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

function DashboardLayoutContent({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);

  const currentTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    if (pathname?.startsWith('/dashboard/customize/')) {
      setIsSidebarCollapsed(true);
    }
  }, [pathname]);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentTab]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigation = [
    { name: 'Overview', tab: 'overview', icon: GaugeCircle },
    { name: 'Bots', tab: 'bots', icon: Bot },
    { name: 'Customize', tab: 'customize', icon: Palette }, 
    { name: 'Analytics', tab: 'analytics', icon: BarChart },
    { name: 'Settings', tab: 'settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileDropdownOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSaveName = async () => {
    if (!editedName.trim() || editedName === user.name) {
      setIsEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch('/api/user/update-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: editedName.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        // ideally update auth context, for now just reload name locally
        user.name = editedName.trim();
        setIsEditingName(false);
      } else {
        console.error(data.error || 'Failed to update name');
      }
    } catch (err) {
      console.error('Error updating name', err);
    } finally {
      setSavingName(false);
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    if (isEditingName) {
      setIsEditingName(false);
      setEditedName(user.name || "");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-card border-r border-border z-50 transition-all duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isSidebarCollapsed ? 'w-16' : 'w-64'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isSidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Image
                src="/svgs/logo.svg"
                alt="Chatrio Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-bold text-lg">Chatrio</span>
            </div>
          )}
          
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-1 rounded-md hover:bg-background/50 transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4 rotate-180" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.tab;
            
            return (
              <Link
                key={item.tab}
                href={`/dashboard?tab=${item.tab}`}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-background' 
                    : 'hover:bg-background/50'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-semibold text-sm">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
              </div>
            )}
          </div>
          
          {!isSidebarCollapsed && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-background/50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <Image
                src="/svgs/logo.svg"
                alt="Chatrio Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="font-bold text-lg">Chatrio</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background/50 transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-background font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="hidden sm:block font-medium">{user.name}</span>
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-border">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setIsEditingName(true);
                        setIsProfileDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                      <span>Edit Name</span>
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background/50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Name</h3>
            
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Enter your name"
            />
            
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => setIsEditingName(false)}
                className="flex-1 py-2 px-4 border border-border rounded-lg text-foreground hover:bg-background/50 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="flex-1 py-2 px-4 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {savingName ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const DashboardLayout = ({ children }) => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p className="text-muted-foreground">Preparing your dashboard</p>
        </div>
      </div>
    }>
      <DashboardLayoutContent children={children} />
    </Suspense>
  );
};

export default DashboardLayout; 