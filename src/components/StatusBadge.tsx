import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Car
} from 'lucide-react';

export function StatusBadge({ status }: { status: string }) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING_DIRECTORATE':
        return { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={12} />, label: 'Directorate Approval' };
      case 'PENDING_VEHICLE_MANAGER':
        return { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <Clock size={12} />, label: 'Vehicle Manager' };
      case 'APPROVED':
        return { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 size={12} />, label: 'Approved' };
      case 'REJECTED':
        return { color: 'bg-red-50 text-red-700 border-red-100', icon: <XCircle size={12} />, label: 'Rejected' };
      case 'COMPLETED':
        return { color: 'bg-slate-50 text-slate-700 border-slate-100', icon: <CheckCircle2 size={12} />, label: 'Completed' };
      case 'PENDING_TEAM_LEADER':
        return { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock size={12} />, label: 'Team Leader Approval' };
      case 'ASSIGNED':
        return { color: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: <Car size={12} />, label: 'Assigned' };
      default:
        return { color: 'bg-slate-50 text-slate-600 border-slate-100', icon: <AlertCircle size={12} />, label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
}
