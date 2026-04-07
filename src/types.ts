export type UserRole = 'ADMIN' | 'DIRECTOR_GENERAL' | 'DEPUTY_DIRECTOR' | 'TEAM_LEADER' | 'DIRECTORATE_HEAD' | 'VEHICLE_MANAGER' | 'DRIVER';

export interface Region {
  id: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  department?: string;
  region?: string;
  branch?: string;
  branch_phone?: string;
  phone?: string;
}

export interface Vehicle {
  id: string;
  plate_number: string;
  code: string;
  type: string;
  model: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE' | 'STATIC_LOCKED';
  region: string;
  branch: string;
  is_static: boolean;
  assigned_to?: string;
  maintenance_due_date: string;
}

export type RequestStatus = 'PENDING_DIRECTORATE' | 'PENDING_VEHICLE_MANAGER' | 'APPROVED' | 'REJECTED' | 'RETURNED';

export interface VehicleRequest {
  id: string;
  requester_id: string;
  requester_name?: string;
  region: string;
  branch: string;
  department: string;
  purpose: string;
  start_date: string;
  end_date: string;
  destination: string;
  vehicle_type: string;
  is_static: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: RequestStatus;
  directorate_approver_id?: string;
  directorate_approval_date?: string;
  vehicle_manager_approver_id?: string;
  vehicle_manager_approval_date?: string;
  assigned_vehicle_id?: string;
  assigned_driver_id?: string;
  rejection_reason?: string;
  created_at: string;
}

export type FuelRequestStatus = 'PENDING_TEAM_LEADER' | 'PENDING_DIRECTORATE' | 'PENDING_VEHICLE_MANAGER' | 'APPROVED' | 'REJECTED';

export interface FuelRequest {
  id: string;
  driver_id: string;
  driver_name?: string;
  vehicle_id: string;
  vehicle_plate?: string;
  amount: number;
  current_mileage: number;
  status: FuelRequestStatus;
  team_leader_approver_id?: string;
  directorate_approver_id?: string;
  vehicle_manager_approver_id?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'REQUEST' | 'FUEL' | 'MAINTENANCE' | 'SYSTEM';
  read: boolean;
  created_at: string;
  vehicle_id?: string;
}
