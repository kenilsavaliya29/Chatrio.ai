'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
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

const DashboardLayout = ({ children }) => {
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
    <div className="bg-background">
      {/* Dashboard Navbar */}
      <nav className="w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="px-3 py-3 lg:px-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start">
              <Link href="/" className="flex items-center">
                <Image
                  src="/svgs/logo.svg"
                  alt="Logo"
                  width={30}
                  height={30}
                  className={resolvedTheme === 'light' ? 'filter invert' : ''}
                />
                <span className="ml-3 text-xl font-bold">Chatrio</span>
              </Link>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className=" flex items-center space-x-2 p-2 rounded-full hover:bg-muted transition-colors duration-300"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass-effect-darker rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-300"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className=" block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-300"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* wrapper */}
      <div className='container mx-auto flex min-h-screen gap-5  pt-14'>
        {/* Mobile menu button - Positioned absolutely */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="fixed bottom-4 left-4 p-3 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 lg:hidden z-50"
        >
          {isSidebarOpen ? (
            <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
          ) : (
            <Menu className="w-6 h-6 transition-transform duration-300" />
          )}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 lg:relative lg:z-0 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:opacity-100'
            } lg:translate-x-0 ${isSidebarCollapsed ? 'lg:w-[90px]' : 'lg:w-1/4'}`}
        >
          <div className="h-full px-3 py-4 flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

            <div className={`flex flex-col mb-6 space-y-2.5 ${isSidebarCollapsed ? 'items-center' : 'items-start'}`}>
              {isSidebarCollapsed ? (
                <div className="w-11 h-11 bg-primary rounded-full flex items-center justify-center my-1.5 cursor-pointer" title={user.name}>
                  <span className="text-primary-foreground text-lg font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              ) : (
                <>
                  {isEditingName ? (
                    <div className="flex items-center gap-2 w-full ">
                      <input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-1 px-2 py-1 rounded-md bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                      <button onClick={handleSaveName} disabled={savingName} className="p-1 rounded hover:bg-muted">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => { setIsEditingName(false); setEditedName(user.name); }} className="p-1 rounded hover:bg-muted">
                        <CloseIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate max-w-[120px]" title={user.name}>{user.name}</h3>
                      <button onClick={() => setIsEditingName(true)} className="p-1 rounded hover:bg-muted">
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground max-w-[150px]" title={user.email}>{user.email}</p>
                  <p className="text-xs text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full">{user.plan || 'Free'} Plan</p>
                </>
              )}
            </div>

            <ul className="space-y-1.5 font-medium flex-grow overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.tab;
                return (
                  <li key={item.name}>
                    <Link
                      href={`/dashboard?tab=${item.tab}`}
                      title={isSidebarCollapsed ? item.name : ''}
                      className={`flex items-center p-2.5 text-sm rounded-lg group transition-colors ${isActive
                        ? 'bg-muted text-foreground'
                        : 'text-foreground hover:bg-muted'
                        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-5 h-5 transition duration-75 ${isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground group-hover:text-foreground'
                        }`} />
                      {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  </li>
                );
              })}

            </ul>

            <div className="pt-2">
              <button
                onClick={handleToggleSidebar}
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className={ `flex items-center w-full p-2.5 text-sm rounded-lg group transition-colors text-foreground hover:bg-muted ${isSidebarCollapsed ? 'justify-center' : ''}`}
              >
                <ChevronLeft
                  className={`w-5 h-5 transition-transform duration-300 text-muted-foreground group-hover:text-foreground ${isSidebarCollapsed ? 'rotate-180' : 'rotate-0'}`}
                />
                {!isSidebarCollapsed && (
                  <span className="ml-3">Collapse</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        <div
          onClick={() => setIsSidebarOpen(false)}
          className={`fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        />

        {/* Main Content */}
        <div className={`flex-1 p-4s transition-all duration-300 ${isSidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div className="p-4 rounded-lg pt-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout; 