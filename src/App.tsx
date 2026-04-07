import React, { useState, useEffect, useCallback } from 'react';
import { 
  Car, 
  Lock, 
  ArrowRight, 
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';

// Types
import { User, Vehicle, VehicleRequest, UserRole, FuelRequest, FuelRequestStatus, Notification, Region } from './types';

// Utils & Libs
import { cn } from './lib/utils';
import { generateApprovalPDF, generateFuelApprovalPDF } from './lib/pdf';
import { supabase } from './supabase';

// Components
import { Layout } from './components/Layout';
import DashboardView from './views/DashboardView';
import RequestsView from './views/RequestsView';
import FleetView from './views/FleetView';
import FuelView from './views/FuelView';
import SettingsView from './views/SettingsView';

// Modals
import { VehicleModal } from './components/VehicleModal';
import { UserModal } from './components/UserModal';
import { AssignmentModal } from './components/AssignmentModal';
import { VehicleRequestModal } from './components/VehicleRequestModal';
import { ConfirmationModal } from './components/ConfirmationModal';

export default function App() {
  const { t, i18n } = useTranslation();
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  
  // App State
  const [activeView, setActiveView] = useState('dashboard');
  const [requests, setRequests] = useState<VehicleRequest[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [fuelRequests, setFuelRequests] = useState<FuelRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // UI State
  const [loading, setLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dbStatus, setDbStatus] = useState<{ ok: boolean, message?: string } | null>(null);
  
  // Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (reason?: string) => void;
    showInput?: boolean;
    variant?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Form State
  const [newRequest, setNewRequest] = useState({
    purpose: '',
    destination: '',
    start_date: '',
    end_date: '',
    vehicle_type: 'Sedan',
    priority: 'MEDIUM' as const,
    region: 'South Region',
    branch: 'Main Branch',
    department: 'Operation',
    is_static: false
  });

  // Initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('ivms_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    checkDbStatus();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Data Fetching
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [reqRes, vehRes, userRes, fuelRes, regRes] = await Promise.all([
        fetch('/api/requests'),
        fetch('/api/vehicles'),
        fetch('/api/users'),
        fetch('/api/fuel-requests'),
        fetch('/api/regions')
      ]);
      
      const [reqData, vehData, userData, fuelData, regData] = await Promise.all([
        reqRes.json(),
        vehRes.json(),
        userRes.json(),
        fuelRes.json(),
        regRes.json()
      ]);

      setRequests(Array.isArray(reqData) ? reqData : []);
      setVehicles(Array.isArray(vehData) ? vehData : []);
      setUsers(Array.isArray(userData) ? userData : []);
      setFuelRequests(Array.isArray(fuelData) ? fuelData : []);
      setRegions(Array.isArray(regData) ? regData : []);
      
      fetchNotifications(currentUser.id);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchNotifications = async (userId: string) => {
    if (!userId || userId === 'undefined') return;
    try {
      const res = await fetch(`/api/notifications/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Error fetching notifications:', e);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchData();
      const interval = setInterval(() => fetchNotifications(currentUser.id), 30000);
      
      // Real-time subscriptions
      const requestsChannel = supabase.channel('requests-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, fetchData)
        .subscribe();

      const vehiclesChannel = supabase.channel('vehicles-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, fetchData)
        .subscribe();

      return () => {
        clearInterval(interval);
        supabase.removeChannel(requestsChannel);
        supabase.removeChannel(vehiclesChannel);
      };
    }
  }, [currentUser, fetchData]);

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setDbStatus({ ok: data.status === 'ok', message: data.message });
    } catch (e) {
      setDbStatus({ ok: false, message: 'Server connection failed' });
    }
  };

  // Handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        localStorage.setItem('ivms_user', JSON.stringify(user));
      } else {
        const data = await res.json();
        setLoginError(data.error || t('invalid_credentials'));
      }
    } catch (error) {
      setLoginError('Server error. Please check database connection.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ivms_user');
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const hasAvailableVehicles = vehicles.some(v => v.status === 'AVAILABLE' && v.type === newRequest.vehicle_type);
    if (!hasAvailableVehicles) {
      setRequestError('No free vehicle available of this type');
      setTimeout(() => setRequestError(null), 3000);
      return;
    }

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRequest, requester_id: currentUser.id })
      });
      if (res.ok) {
        setIsRequestModalOpen(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!currentUser) return;
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    if (request.status === 'PENDING_VEHICLE_MANAGER' && (currentUser.role === 'VEHICLE_MANAGER' || currentUser.role === 'ADMIN')) {
      setSelectedRequestId(requestId);
      setIsAssignmentModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: currentUser.id,
          role: currentUser.role === 'ADMIN' ? 'DIRECTORATE_HEAD' : currentUser.role,
        })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleConfirmAssignment = async (vehicle_id: string, driver_id: string) => {
    if (!currentUser || !selectedRequestId) return;
    try {
      const res = await fetch(`/api/requests/${selectedRequestId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approver_id: currentUser.id,
          role: 'VEHICLE_MANAGER',
          vehicle_id,
          driver_id
        })
      });
      if (res.ok) {
        fetchData();
        setIsAssignmentModalOpen(false);
        setSelectedRequestId(null);
      }
    } catch (error) {
      console.error('Error assigning vehicle:', error);
    }
  };

  const handleReject = (requestId: string) => {
    if (!currentUser) return;
    setConfirmation({
      isOpen: true,
      title: 'Reject Request',
      message: 'Are you sure you want to reject this vehicle request? Please provide a reason.',
      showInput: true,
      variant: 'danger',
      onConfirm: async (reason) => {
        if (!reason) return;
        try {
          const res = await fetch(`/api/requests/${requestId}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ approver_id: currentUser.id, reason, role: currentUser.role })
          });
          if (res.ok) fetchData();
        } catch (error) {
          console.error('Error rejecting request:', error);
        }
      }
    });
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (e) {
      console.error('Error marking notification as read:', e);
    }
  };

  const handleUpdateSettings = async (field: string, value: string) => {
    if (!currentUser) return;
    try {
      const type = field === 'username' ? 'username' : field === 'password' ? 'password' : 'phone';
      const bodyKey = type === 'username' ? 'newUsername' : type === 'password' ? 'newPassword' : 'newPhone';
      
      const res = await fetch(`/api/users/${currentUser.id}/${type}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [bodyKey]: value })
      });
      
      if (res.ok) {
        alert(t('update_success'));
        if (type !== 'password') {
          const updatedUser = { ...currentUser, [type]: value };
          setCurrentUser(updatedUser);
          localStorage.setItem('ivms_user', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      const isEdit = !!vehicleData.id;
      const url = isEdit ? `/api/vehicles/${vehicleData.id}` : '/api/vehicles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleData)
      });
      if (res.ok) {
        setIsVehicleModalOpen(false);
        setEditingVehicle(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    setConfirmation({
      isOpen: true,
      title: 'Delete Vehicle',
      message: 'Are you sure you want to delete this vehicle? This action cannot be undone.',
      showInput: false,
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
          if (res.ok) fetchData();
        } catch (error) {
          console.error('Error deleting vehicle:', error);
        }
      }
    });
  };

  const handleApproveFuel = async (id: string, status: FuelRequestStatus, driver_id: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/fuel-requests/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status, 
          driver_id,
          approver_id: currentUser.id,
          role: currentUser.role
        })
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error('Error approving fuel:', e);
    }
  };

  const handlePrintFuel = (request: FuelRequest) => {
    const requester = users.find(u => u.id === request.driver_id) || { name: 'Unknown' } as User;
    const vehicleManager = users.find(u => u.role === 'VEHICLE_MANAGER');
    const directorateApprover = users.find(u => u.id === request.directorate_approver_id);
    generateFuelApprovalPDF(request, requester, vehicleManager?.name || 'N/A', directorateApprover?.name || 'N/A');
  };

  const handlePrintRequest = (request: VehicleRequest) => {
    const requester = users.find(u => u.id === request.requester_id) || { name: 'Unknown' } as User;
    const vehicleManager = users.find(u => u.id === request.vehicle_manager_approver_id);
    const directorateApprover = users.find(u => u.id === request.directorate_approver_id);
    const vehicle = vehicles.find(v => v.id === request.assigned_vehicle_id);
    const driver = users.find(u => u.id === request.assigned_driver_id);
    generateApprovalPDF(request, requester, vehicle, driver, vehicleManager?.name || 'N/A', directorateApprover?.name || 'N/A');
  };

  // Render Login
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-100 border border-slate-100 overflow-hidden"
        >
          <div className="bg-blue-600 p-10 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <Car size={200} className="absolute -bottom-10 -right-10 rotate-12" />
            </div>
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl overflow-hidden p-2">
              <img src="https://i.postimg.cc/26Mn2Bpb/best-logo-vehicle.png" alt="ESAA VMS Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">ESAA VMS</h1>
            <p className="text-blue-100 font-medium">{t('fleet_management_system', 'Fleet Management System')}</p>
          </div>

          <div className="p-10 space-y-8">
            {dbStatus && !dbStatus.ok && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 text-amber-800 shadow-sm">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-600 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-base">Database Action Required</p>
                  <p className="text-sm opacity-90 leading-relaxed">{dbStatus.message}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('username')}</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="admin"
                    value={loginForm.username}
                    onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>
              {loginError && (
                <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">
                  {loginError}
                </p>
              )}
              <button 
                type="submit"
                disabled={dbStatus?.ok === false}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {t('login')}
                <ArrowRight size={20} />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-center text-xs text-slate-400 font-medium mb-4 uppercase tracking-widest">{t('select_language')}</p>
              <div className="flex justify-center gap-3">
                {['en', 'am', 'om'].map(lang => (
                  <button 
                    key={lang}
                    onClick={() => i18n.changeLanguage(lang)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                      i18n.language === lang ? "bg-blue-100 text-blue-600 ring-2 ring-blue-200" : "text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main App
  return (
    <Layout 
      currentUser={currentUser} 
      activeView={activeView} 
      setActiveView={setActiveView} 
      onLogout={handleLogout}
      notifications={notifications}
      onMarkNotificationRead={handleMarkNotificationRead}
      isOnline={!isOffline}
    >
      {activeView === 'dashboard' && (
        <DashboardView 
          currentUser={currentUser} 
          vehicles={vehicles} 
          requests={requests} 
          onNewRequest={() => setIsRequestModalOpen(true)}
          onViewFleet={() => setActiveView('fleet')}
          onViewRequests={() => setActiveView('requests')}
        />
      )}
      {activeView === 'requests' && (
        <RequestsView 
          requests={requests} 
          currentUser={currentUser} 
          onApprove={handleApprove} 
          onReject={handleReject}
          onPrint={handlePrintRequest}
        />
      )}
      {activeView === 'fleet' && (
        <FleetView 
          vehicles={vehicles} 
          users={users} 
          currentUser={currentUser} 
          onAdd={() => { setEditingVehicle(null); setIsVehicleModalOpen(true); }}
          onEdit={(v) => { setEditingVehicle(v); setIsVehicleModalOpen(true); }}
          onDelete={handleDeleteVehicle}
        />
      )}
      {activeView === 'fuel' && (
        <FuelView 
          fuelRequests={fuelRequests} 
          users={users} 
          currentUser={currentUser} 
          onApprove={handleApproveFuel}
          onPrint={handlePrintFuel}
        />
      )}
      {activeView === 'settings' && (
        <SettingsView 
          currentUser={currentUser} 
          onUpdate={handleUpdateSettings}
        />
      )}

      {/* Modals */}
      <VehicleRequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleCreateRequest}
        newRequest={newRequest}
        setNewRequest={setNewRequest}
        requestError={requestError}
      />

      {isVehicleModalOpen && (
        <VehicleModal 
          onClose={() => setIsVehicleModalOpen(false)}
          onSave={handleSaveVehicle}
          users={users}
          editingVehicle={editingVehicle}
        />
      )}

      {isAssignmentModalOpen && (
        <AssignmentModal 
          vehicles={vehicles}
          users={users}
          onClose={() => setIsAssignmentModalOpen(false)}
          onConfirm={handleConfirmAssignment}
        />
      )}

      {isUserModalOpen && (
        <UserModal 
          onClose={() => setIsUserModalOpen(false)}
          onSave={async (u) => {
            try {
              const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(u)
              });
              if (res.ok) {
                setIsUserModalOpen(false);
                fetchData();
              }
            } catch (e) {
              console.error(e);
            }
          }}
        />
      )}

      <ConfirmationModal 
        isOpen={confirmation.isOpen}
        onClose={() => setConfirmation({ ...confirmation, isOpen: false })}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        showInput={confirmation.showInput}
        variant={confirmation.variant}
      />
    </Layout>
  );
}
