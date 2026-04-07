import React, { useState } from 'react';
import { motion } from 'motion/react';
import { XCircle } from 'lucide-react';
import { User, Vehicle } from '../types';

interface AssignmentModalProps {
  vehicles: Vehicle[];
  users: User[];
  onClose: () => void;
  onConfirm: (vId: string, dId: string) => void;
}

export function AssignmentModal({ vehicles, users, onClose, onConfirm }: AssignmentModalProps) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const drivers = users.filter(u => u.role === 'DRIVER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle || !selectedDriver) {
      // In a real app, we'd use a better notification system
      return;
    }
    onConfirm(selectedVehicle, selectedDriver);
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
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">Assign Vehicle & Driver</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors shadow-sm">
            <XCircle className="text-slate-400" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Select Vehicle</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={selectedVehicle}
              onChange={e => setSelectedVehicle(e.target.value)}
            >
              <option value="">Select a vehicle...</option>
              {availableVehicles.map(v => (
                <option key={v.id} value={v.id}>{v.plate_number} - {v.model}</option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-xs text-red-500 mt-1 font-medium">No vehicles currently available</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">Select Driver</label>
            <select 
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={selectedDriver}
              onChange={e => setSelectedDriver(e.target.value)}
            >
              <option value="">Select a driver...</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={availableVehicles.length === 0}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Assignment
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
