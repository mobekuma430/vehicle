import React from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  ClipboardList, 
  Fuel, 
  Wrench, 
  Users, 
  MapPin, 
  BarChart3,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { User, Vehicle, VehicleRequest } from '../types';

interface DashboardViewProps {
  currentUser: User;
  vehicles: Vehicle[];
  requests: VehicleRequest[];
  onNewRequest: () => void;
  onViewFleet: () => void;
  onViewRequests: () => void;
}

const DashboardView = React.memo(function DashboardView({ 
  currentUser, 
  vehicles, 
  requests,
  onNewRequest,
  onViewFleet,
  onViewRequests
}: DashboardViewProps) {
  const allJourneyCards = [
    { title: 'Vehicles', icon: <Car size={32} className="text-orange-500" />, onClick: onViewFleet, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'VEHICLE_MANAGER', 'TEAM_LEADER'] },
    { title: 'Requests', icon: <ClipboardList size={32} className="text-blue-500" />, onClick: onViewRequests, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DIRECTORATE_HEAD'] },
    { title: 'New Request', icon: <Plus size={32} className="text-emerald-500" />, onClick: onNewRequest, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DIRECTORATE_HEAD', 'DRIVER'] },
    { title: 'Fuel Logs', icon: <Fuel size={32} className="text-amber-500" />, onClick: () => {}, roles: ['ADMIN', 'DIRECTOR_GENERAL', 'DEPUTY_DIRECTOR', 'VEHICLE_MANAGER', 'TEAM_LEADER', 'DIRECTORATE_HEAD', 'DRIVER'] },
  ];

  const journeyCards = allJourneyCards.filter(card => card.roles.includes(currentUser.role));

  const totalVehicles = vehicles?.length || 0;
  const availableVehicles = vehicles?.filter(v => v.status === 'AVAILABLE').length || 0;
  const maintenanceVehicles = vehicles?.filter(v => v.status === 'MAINTENANCE').length || 0;

  return (
    <div className="bg-slate-50 min-h-full pb-20">
      {/* Wavy Header */}
      <div className="relative overflow-hidden rounded-b-[2rem] sm:rounded-b-[2.5rem] bg-gradient-to-r from-amber-400 via-rose-500 to-pink-600 p-4 sm:p-6 pt-8 sm:pt-12 pb-20 sm:pb-24 text-white shadow-lg">
        {/* Background Waves */}
        <svg className="absolute bottom-0 left-0 w-full h-24 sm:h-32 text-slate-50" preserveAspectRatio="none" viewBox="0 0 1440 320" fill="currentColor">
          <path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,176C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h1 className="text-xl sm:text-2xl font-black truncate max-w-[200px] sm:max-w-none text-slate-900">Solomon B</h1>
          </div>
        </div>
      </div>

      {/* Vehicle Stats Summary */}
      {(currentUser.role === 'ADMIN' || currentUser.role === 'DIRECTOR_GENERAL' || currentUser.role === 'DEPUTY_DIRECTOR' || currentUser.role === 'VEHICLE_MANAGER' || currentUser.role === 'TEAM_LEADER') && (
        <div className="px-4 sm:px-6 -mt-12 relative z-20 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100 flex justify-between items-center gap-2">
            <div className="flex flex-col items-center flex-1 border-r border-slate-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-1 sm:mb-2">
                <Car size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800">{totalVehicles}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Total</span>
            </div>
            <div className="flex flex-col items-center flex-1 border-r border-slate-100">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1 sm:mb-2">
                <CheckCircle2 size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800">{availableVehicles}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Free</span>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1 sm:mb-2">
                <Wrench size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-slate-800">{maintenanceVehicles}</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">Repair</span>
            </div>
          </div>
        </div>
      )}

      {/* Cards Section */}
      <div className="px-4 sm:px-6 relative z-20">
        <h2 className="text-lg font-bold text-slate-800 mb-4 px-1">Dashboard</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {journeyCards.map((card, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={card.onClick}
              className="bg-white rounded-2xl p-4 h-36 relative shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
            >
              <h3 className="font-bold text-slate-700 text-sm">{card.title}</h3>
              <div className="absolute bottom-3 right-3 opacity-90">
                {card.icon}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default DashboardView;
