import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { XCircle, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface VehicleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newRequest: any;
  setNewRequest: (req: any) => void;
  requestError: string | null;
}

export function VehicleRequestModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  newRequest, 
  setNewRequest, 
  requestError 
}: VehicleRequestModalProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 my-auto"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold">{t('new_request')}</h3>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={onSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('purpose')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. Site Inspection"
                    value={newRequest.purpose}
                    onChange={e => setNewRequest({...newRequest, purpose: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('destination')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g. Adama Branch"
                    value={newRequest.destination}
                    onChange={e => setNewRequest({...newRequest, destination: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('start_date')}</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newRequest.start_date}
                    onChange={e => setNewRequest({...newRequest, start_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('end_date')}</label>
                  <input 
                    required
                    type="datetime-local" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newRequest.end_date}
                    onChange={e => setNewRequest({...newRequest, end_date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('vehicle_type')}</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newRequest.vehicle_type}
                    onChange={e => setNewRequest({...newRequest, vehicle_type: e.target.value})}
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Pickup">Pickup</option>
                    <option value="Van">Van</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('priority')}</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    value={newRequest.priority}
                    onChange={e => setNewRequest({...newRequest, priority: e.target.value as any})}
                  >
                    <option value="LOW">{t('low', 'Low')}</option>
                    <option value="MEDIUM">{t('medium', 'Medium')}</option>
                    <option value="HIGH">{t('high', 'High')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('department')}</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newRequest.department}
                    onChange={e => setNewRequest({...newRequest, department: e.target.value})}
                  >
                    <option value="All">All</option>
                    <option value="Operation">Operation</option>
                    <option value="HR">Human Resources</option>
                    <option value="IT">IT</option>
                    <option value="Finance">Finance</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">{t('region')}</label>
                  <select 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newRequest.region}
                    onChange={e => setNewRequest({...newRequest, region: e.target.value})}
                  >
                    <option value="All Region">All Region</option>
                    <option value="HQ">{t('hq')}</option>
                    <option value="South Region">South Region</option>
                    <option value="North Region">North Region</option>
                    <option value="East Region">East Region</option>
                    <option value="West Region">West Region</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_static" 
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  checked={newRequest.is_static}
                  onChange={e => setNewRequest({...newRequest, is_static: e.target.checked})}
                />
                <label htmlFor="is_static" className="text-sm font-medium text-slate-700">{t('static_assignment')}</label>
              </div>
              {requestError && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                  <AlertTriangle size={16} />
                  {requestError}
                </div>
              )}
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  {t('submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
