import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Car, Trash2, Edit } from 'lucide-react';
import { User, Vehicle } from '../types';
import { cn } from '../lib/utils';

interface FleetViewProps {
  vehicles: Vehicle[];
  users: User[];
  currentUser: User;
  onAdd: () => void;
  onEdit: (v: Vehicle) => void;
  onDelete: (id: string) => void;
  vehicleId?: string;
}

const FleetView = React.memo(function FleetView({ vehicles, users, currentUser, onAdd, onEdit, onDelete, vehicleId }: FleetViewProps) {
  const canAdd = currentUser.role === 'ADMIN' || currentUser.role === 'VEHICLE_MANAGER';
  const canEdit = currentUser.role === 'ADMIN' || currentUser.role === 'VEHICLE_MANAGER';

  const visibleVehicles = currentUser.role === 'DRIVER' 
    ? vehicles.filter(v => v.assigned_to === currentUser.id)
    : vehicles;

  useEffect(() => {
    if (vehicleId) {
      const element = document.getElementById(`vehicle-${vehicleId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        element.classList.add('ring-2', 'ring-blue-500');
        setTimeout(() => element.classList.remove('ring-2', 'ring-blue-500'), 2000);
      }
    }
  }, [vehicleId, vehicles]);

  return (
    <div className="space-y-6 p-4 lg:p-8">
      {canAdd && (
        <div className="flex justify-end">
          <button 
            onClick={onAdd}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {visibleVehicles.map((v) => (
          <div key={v.id} id={`vehicle-${v.id}`} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-4">
              <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold font-mono">
                {v.plate_number}
              </div>
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                v.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                v.status === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
              )}>
                {v.status}
              </span>
            </div>
            <h4 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{v.model}</h4>
            <p className="text-sm text-slate-500 mb-6">{v.type} • {v.code}</p>
            
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Region</span>
                <span className="font-semibold">{v.region}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Maintenance Due</span>
                <span className={cn(
                  "font-semibold",
                  new Date(v.maintenance_due_date) < new Date() ? 'text-red-500' : 'text-slate-700'
                )}>
                  {new Date(v.maintenance_due_date).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Driver</span>
                <span className="font-semibold">{v.assigned_to ? users.find(u => u.id === v.assigned_to)?.username || 'Unknown' : 'Unassigned'}</span>
              </div>
            </div>
            {canEdit && (
              <div className="mt-4 pt-4 border-t border-slate-50 flex gap-2">
                <button 
                  onClick={() => onEdit(v)}
                  className="flex-1 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={14} />
                  Edit / Assign
                </button>
                <button 
                  onClick={() => onDelete(v.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default FleetView;
