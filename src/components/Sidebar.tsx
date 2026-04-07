import React from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Truck, 
  Fuel, 
  Settings, 
  LogOut,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User, UserRole } from '../types';
import { cn } from '../lib/utils';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  currentUser: User;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ activeView, setActiveView, currentUser, onLogout, isOpen, setIsOpen }: SidebarProps) {
  const { t } = useTranslation();

  const menuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'DIRECTORATE_HEAD', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DRIVER'] },
    { id: 'requests', label: t('requests'), icon: <ClipboardList size={20} />, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'DIRECTORATE_HEAD', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DRIVER'] },
    { id: 'fleet', label: t('fleet'), icon: <Truck size={20} />, roles: ['ADMIN', 'VEHICLE_MANAGER', 'DRIVER'] },
    { id: 'fuel', label: t('fuel'), icon: <Fuel size={20} />, roles: ['ADMIN', 'TEAM_LEADER', 'DIRECTORATE_HEAD', 'DRIVER'] },
    { id: 'settings', label: t('settings'), icon: <Settings size={20} />, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'DIRECTORATE_HEAD', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DRIVER'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser.role));

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 transform lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Truck className="text-white" size={24} />
            </div>
            <span className="font-black text-xl tracking-tight text-slate-800">IVMS</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 hover:bg-slate-50 rounded-lg">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          {filteredMenu.map((item) => (
            <button 
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                activeView === item.id 
                  ? "bg-blue-50 text-blue-600 shadow-sm" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
