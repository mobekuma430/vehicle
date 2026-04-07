import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  CheckCircle2, 
  XCircle, 
  Printer,
  Car
} from 'lucide-react';
import { User, FuelRequest, FuelRequestStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { formatDate } from '../lib/utils';

interface FuelViewProps {
  fuelRequests: FuelRequest[];
  users: User[];
  currentUser: User;
  onApprove: (id: string, status: FuelRequestStatus, driver_id: string) => void;
  onPrint: (request: FuelRequest) => void;
}

const FuelView = React.memo(function FuelView({ fuelRequests = [], users = [], currentUser, onApprove, onPrint }: FuelViewProps) {
  const { t } = useTranslation();
  
  const safeFuelRequests = Array.isArray(fuelRequests) ? fuelRequests : [];
  
  const filtered = currentUser.role === 'DRIVER' 
    ? safeFuelRequests.filter(r => r.driver_id === currentUser.id)
    : (currentUser.role === 'TEAM_LEADER' || currentUser.role === 'DIRECTORATE_HEAD')
    ? safeFuelRequests.filter(r => {
        const driver = users.find(u => u.id === r.driver_id);
        return driver?.department === currentUser.department;
      })
    : safeFuelRequests;

  const canApprove = (req: FuelRequest) => {
    if (currentUser.role === 'ADMIN') return true;
    if (req.status === 'PENDING_TEAM_LEADER' && currentUser.role === 'TEAM_LEADER') return true;
    if (req.status === 'PENDING_DIRECTORATE' && currentUser.role === 'DIRECTORATE_HEAD') return true;
    return false;
  };

  const getNextStatus = (currentStatus: FuelRequestStatus): FuelRequestStatus => {
    if (currentStatus === 'PENDING_TEAM_LEADER') return 'PENDING_DIRECTORATE';
    return 'APPROVED';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden m-4 lg:m-8">
      <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-slate-800">{t('fuel_requests', 'Fuel Requests')}</h3>
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (L)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mileage</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{r.driver_name}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.vehicle_plate}</td>
                <td className="px-6 py-4 text-sm font-bold text-blue-600">{r.amount}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{r.current_mileage.toLocaleString()} km</td>
                <td className="px-6 py-4">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-6 py-4 text-xs text-slate-500">{formatDate(r.created_at)}</td>
                <td className="px-6 py-4">
                  {canApprove(r) && !['APPROVED', 'REJECTED'].includes(r.status) && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => onApprove(r.id, getNextStatus(r.status), r.driver_id)}
                        className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button 
                        onClick={() => onApprove(r.id, 'REJECTED', r.driver_id)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                      <button 
                        onClick={() => onPrint(r)}
                        className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Print"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {filtered.map((req) => (
          <div key={req.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                  {req.driver_name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold">{req.driver_name}</p>
                  <p className="text-xs text-slate-500">{formatDate(req.created_at)}</p>
                </div>
              </div>
              <StatusBadge status={req.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('vehicle', 'Vehicle')}</p>
                <div className="flex items-center gap-2">
                  <Car size={14} className="text-slate-400" />
                  <span className="text-sm font-bold">{req.vehicle_plate}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">{t('amount', 'Amount')}</p>
                <span className="text-sm font-bold text-blue-600">{req.amount} Liters</span>
              </div>
            </div>
            {canApprove(req) && !['APPROVED', 'REJECTED'].includes(req.status) && (
              <div className="flex gap-2">
                <button 
                  onClick={() => onApprove(req.id, getNextStatus(req.status), req.driver_id)}
                  className="flex-1 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  Approve
                </button>
                <button 
                  onClick={() => onApprove(req.id, 'REJECTED', req.driver_id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default FuelView;
