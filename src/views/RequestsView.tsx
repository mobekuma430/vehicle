import React from 'react';
import { 
  Filter, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Car, 
  ChevronRight,
  Printer
} from 'lucide-react';
import { User, VehicleRequest } from '../types';
import { StatusBadge } from '../components/StatusBadge';

interface RequestsViewProps {
  requests: VehicleRequest[];
  currentUser: User;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPrint: (request: VehicleRequest) => void;
}

const RequestsView = React.memo(function RequestsView({ requests, currentUser, onApprove, onReject, onPrint }: RequestsViewProps) {
  const canApprove = (req: VehicleRequest) => {
    if (currentUser.role === 'ADMIN') return true;
    if (req.status === 'PENDING_DIRECTORATE' && currentUser.role === 'DIRECTORATE_HEAD' && currentUser.department === req.department) return true;
    if (req.status === 'PENDING_VEHICLE_MANAGER' && currentUser.role === 'VEHICLE_MANAGER') return true;
    return false;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden m-4 lg:m-8">
      <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2 lg:gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium">
            <Filter size={16} className="text-slate-400" />
            <span className="hidden sm:inline">Filter</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium">
            <span className="hidden sm:inline">Sort:</span> Newest
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="px-6 py-4">Request ID</th>
              <th className="px-6 py-4">Requester</th>
              <th className="px-6 py-4">Purpose & Destination</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {req.id}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                      {req.requester_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{req.requester_name}</p>
                      <p className="text-xs text-slate-500">{req.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium">{req.purpose}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                    <MapPin size={12} />
                    {req.destination}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                    <Calendar size={12} />
                    {new Date(req.start_date).toLocaleDateString()}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">to {new Date(req.end_date).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={req.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {canApprove(req) && (
                      <>
                        <button onClick={() => onApprove(req.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Approve">
                          {req.status === 'PENDING_VEHICLE_MANAGER' ? <Car size={18} /> : <CheckCircle2 size={18} />}
                        </button>
                        <button onClick={() => onReject(req.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    {req.status === 'APPROVED' && (
                      <button onClick={() => onPrint(req)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Print Approval">
                        <Printer size={18} />
                      </button>
                    )}
                    <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors" title="View Details">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden divide-y divide-slate-100">
        {requests.map((req) => (
          <div key={req.id} className="p-4 space-y-4">
            <div className="flex justify-between items-start">
              <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {req.id}
              </span>
              <StatusBadge status={req.status} />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-sm font-bold">
                {req.requester_name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold">{req.requester_name}</p>
                <p className="text-xs text-slate-500">{req.department}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{req.purpose}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {req.destination}
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div className="text-xs text-slate-500">
                <div className="flex items-center gap-1 font-medium text-slate-700">
                  <Calendar size={12} />
                  {new Date(req.start_date).toLocaleDateString()}
                </div>
                <p className="text-[10px] mt-0.5">to {new Date(req.end_date).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-1">
                {canApprove(req) && (
                  <>
                    <button onClick={() => onApprove(req.id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      {req.status === 'PENDING_VEHICLE_MANAGER' ? <Car size={18} /> : <CheckCircle2 size={18} />}
                    </button>
                    <button onClick={() => onReject(req.id)} className="p-2 bg-red-50 text-red-600 rounded-lg">
                      <XCircle size={18} />
                    </button>
                  </>
                )}
                {req.status === 'APPROVED' && (
                  <button onClick={() => onPrint(req)} className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Printer size={18} />
                  </button>
                )}
                <button className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default RequestsView;
