import React, { useState } from 'react';
import { motion } from 'motion/react';
import { XCircle, CheckCircle2 } from 'lucide-react';
import { User, Vehicle } from '../types';

interface VehicleModalProps {
  onClose: () => void;
  onSave: (v: Partial<Vehicle>) => void;
  users: User[];
  editingVehicle: Vehicle | null;
}

export function VehicleModal({ onClose, onSave, users, editingVehicle }: VehicleModalProps) {
  const [formData, setFormData] = useState({
    id: editingVehicle?.id || undefined,
    plate_number: editingVehicle?.plate_number || '',
    code: editingVehicle?.code || '',
    type: editingVehicle?.type || 'Pickup',
    model: editingVehicle?.model || '',
    region: editingVehicle?.region || 'HQ',
    branch: editingVehicle?.branch || 'Head Office',
    is_static: editingVehicle?.is_static || false,
    assigned_to: editingVehicle?.assigned_to || '',
    maintenance_due_date: editingVehicle?.maintenance_due_date ? new Date(editingVehicle.maintenance_due_date).toISOString().split('T')[0] : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: editingVehicle?.status || 'AVAILABLE'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h2>
            <p className="text-slate-500 text-sm mt-1">{editingVehicle ? 'Update vehicle details and assignment' : 'Register a new vehicle to the fleet'}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
            <XCircle className="text-slate-400" size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Plate Number</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.plate_number}
                onChange={e => setFormData({...formData, plate_number: e.target.value})}
                placeholder="e.g. AA 2-A 12345"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Vehicle Code</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.code}
                onChange={e => setFormData({...formData, code: e.target.value})}
                placeholder="e.g. V-001"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Model</label>
              <input 
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                placeholder="e.g. Toyota Hilux"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Type</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
              >
                <option value="Pickup">Pickup</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Bus">Bus</option>
                <option value="Truck">Truck</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Region</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
              >
                <option value="All Region">All Region</option>
                <option value="HQ">HQ</option>
                <option value="South Region">South Region</option>
                <option value="North Region">North Region</option>
                <option value="East Region">East Region</option>
                <option value="West Region">West Region</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Branch</label>
              <input 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.branch}
                onChange={e => setFormData({...formData, branch: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Maintenance Due Date</label>
              <input 
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.maintenance_due_date}
                onChange={e => setFormData({...formData, maintenance_due_date: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Assigned Driver (Optional)</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.assigned_to || ''}
                onChange={e => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">None</option>
                {users.filter(u => u.role === 'DRIVER').map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="AVAILABLE">Available</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="OUT_OF_SERVICE">Out of Service</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <input 
              type="checkbox"
              id="is_static"
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              checked={formData.is_static}
              onChange={e => setFormData({...formData, is_static: e.target.checked})}
            />
            <label htmlFor="is_static" className="text-sm font-semibold text-slate-700">
              Is Static Vehicle? (Assigned to specific department/branch)
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={20} />
              Save Vehicle
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
