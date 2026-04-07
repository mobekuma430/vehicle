import React, { useState } from 'react';
import { Menu, Bell, Search, User as UserIcon, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User, Notification } from '../types';
import { Sidebar } from './Sidebar';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  activeView: string;
  setActiveView: (view: string) => void;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  isOnline: boolean;
}

export function Layout({ 
  children, 
  currentUser, 
  activeView, 
  setActiveView, 
  onLogout, 
  notifications, 
  onMarkNotificationRead,
  isOnline
}: LayoutProps) {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        currentUser={currentUser} 
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Menu size={24} className="text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 w-64 lg:w-96 group focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
              <Search size={18} className="text-slate-400 group-focus-within:text-blue-500" />
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                className="bg-transparent border-none outline-none text-sm w-full font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Online Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
              <div className={cn("w-2 h-2 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2.5 hover:bg-slate-50 rounded-xl transition-all relative group"
              >
                <Bell size={22} className="text-slate-500 group-hover:text-blue-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-bold text-slate-800">{t('notifications')}</h4>
                    <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {unreadCount} New
                    </span>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={cn(
                            "p-4 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                            !n.read && "bg-blue-50/30"
                          )}
                          onClick={() => onMarkNotificationRead(n.id)}
                        >
                          <div className="flex gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                              n.type === 'REQUEST' ? "bg-blue-100 text-blue-600" :
                              n.type === 'FUEL' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                            )}>
                              <Bell size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{n.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                                {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 shrink-0" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={24} className="text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-50 rounded-2xl transition-all group border border-transparent hover:border-slate-100"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-slate-200 group-hover:scale-105 transition-transform">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentUser.role.replace('_', ' ')}</p>
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isProfileOpen && "rotate-180")} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-black text-slate-800 truncate">{currentUser.email}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => {
                        setActiveView('settings');
                        setIsProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <UserIcon size={18} />
                      Profile Settings
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function LogOut({ size }: { size: number }) {
  return <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />;
}
