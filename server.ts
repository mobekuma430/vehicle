import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('CRITICAL: Supabase URL or Service Role Key is missing. Check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Afro Message SMS Integration
async function sendSms(to: string, message: string, requestId?: string) {
  const token = process.env.AFRO_MESSAGE_TOKEN;
  const identifier = process.env.AFRO_MESSAGE_IDENTIFIER;

  if (!token || !identifier) {
    console.warn('Afro Message token or identifier is missing. SMS not sent.');
    return { success: false, error: 'Missing credentials' };
  }

  try {
    const response = await fetch('https://api.afromessage.com/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to,
        message,
        identifier,
        sender: identifier // Some versions use sender
      })
    });

    const result = await response.json();
    console.log('Afro Message Response:', result);

    // Log the SMS attempt
    if (requestId) {
      await supabase.from('sms_logs').insert({
        id: `SMS-${Date.now()}`,
        request_id: requestId,
        recipient_phone: to,
        content: message,
        status: result.acknowledge === 'success' ? 'SENT' : 'FAILED'
      });
    }

    return { success: result.acknowledge === 'success', result };
  } catch (error) {
    console.error('Error sending SMS via Afro Message:', error);
    return { success: false, error };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Seed initial admin if not exists (Supabase version)
  const seedInitialData = async () => {
    try {
      console.log('Checking for initial data in Supabase...');
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('username', 'admin')
        .maybeSingle();

      if (adminError) {
        if (adminError.code === '42P01') {
          console.error('CRITICAL: "users" table does not exist in Supabase. Please run the SQL schema in supabase_schema.sql');
        } else {
          console.error('Error checking for admin user:', adminError);
        }
        return;
      }

      if (!adminUser) {
        console.log('Seeding initial admin user...');
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync('admin123', salt);
        
        const { error: insertError } = await supabase.from('users').insert({
          id: 'admin-1',
          username: 'admin',
          email: 'motionline2023@gmail.com',
          password_hash: hash,
          name: 'System Admin',
          role: 'ADMIN',
          department: 'Vehicle Management',
          region: 'HQ',
          branch: 'Main'
        });

        if (insertError) {
          console.error('Error seeding admin:', insertError);
        } else {
          console.log('Admin user seeded successfully.');
          // Seed some vehicles
          const seedVehicles = [
            { id: 'v1', plate_number: 'ET-12345', code: 'V001', type: 'Sedan', model: 'Toyota Corolla', status: 'AVAILABLE', region: 'South Region', branch: 'Main', maintenance_due_date: '2026-12-31' },
            { id: 'v2', plate_number: 'ET-67890', code: 'V002', type: 'SUV', model: 'Toyota Land Cruiser', status: 'AVAILABLE', region: 'North Region', branch: 'Main', maintenance_due_date: '2026-12-31' },
            { id: 'v3', plate_number: 'ET-55555', code: 'V003', type: 'Pickup', model: 'Toyota Hilux', status: 'AVAILABLE', region: 'East Region', branch: 'Main', maintenance_due_date: '2026-12-31' },
            { id: 'v4', plate_number: 'ET-99999', code: 'V004', type: 'Van', model: 'Toyota Hiace', status: 'MAINTENANCE', region: 'West Region', branch: 'Main', maintenance_due_date: '2026-03-20' },
          ];

          const { error: vehError } = await supabase.from('vehicles').insert(seedVehicles);
          if (vehError) console.error('Error seeding vehicles:', vehError);
          else console.log('Sample vehicles seeded successfully.');
        }
      } else {
        console.log('Admin user already exists.');
      }
    } catch (err) {
      console.error('Unexpected error during seeding:', err);
    }
  };

  await seedInitialData();

  // API Routes
  app.get('/api/health', async (req, res) => {
    const tables = ['users', 'vehicles', 'requests', 'sms_logs', 'fuel_requests', 'notifications'];
    const tableStatus: Record<string, boolean> = {};
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      tableStatus[table] = !error || error.code !== '42P01';
    }

    const allTablesExist = Object.values(tableStatus).every(v => v);

    res.json({ 
      status: allTablesExist ? 'ok' : 'error', 
      database: 'supabase',
      tables: tableStatus,
      config: {
        url: !!supabaseUrl,
        key: !!supabaseServiceRoleKey
      }
    });
  });

  // Auth
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) throw error;

      if (user && bcrypt.compareSync(password, user.password_hash)) {
        const { password_hash, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: 'Invalid username or password' });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Database error during login' });
    }
  });

  app.patch('/api/users/:id/phone', async (req, res) => {
    const { id } = req.params;
    const { newPhone } = req.body;
    const { error } = await supabase.from('users').update({ phone: newPhone }).eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.patch('/api/users/:id/password', async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    
    const { error } = await supabase
      .from('users')
      .update({ password_hash: hash })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.patch('/api/users/:id/username', async (req, res) => {
    const { id } = req.params;
    const { newUsername } = req.body;
    
    const { error } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('id', id);

    if (error) return res.status(400).json({ error: 'Username already taken or invalid' });
    res.json({ success: true });
  });

  // Users Management
  app.get('/api/users', async (req, res) => {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, name, role, department, region, branch, branch_phone')
      .order('name');
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(users || []);
  });

  app.post('/api/users', async (req, res) => {
    const { username, email, name, role, department, region, branch, branch_phone, phone, password } = req.body;
    const id = `USR-${Date.now()}`;
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password || 'user123', salt);
    
    const { error } = await supabase
      .from('users')
      .insert({
        id, username, email, password_hash: hash, name, role, department, region, branch, branch_phone, phone
      });

    if (error) return res.status(400).json({ error: 'User already exists or invalid data' });
    res.json({ id });
  });

  // Regions
  app.get('/api/regions', async (req, res) => {
    const { data: regions, error } = await supabase
      .from('regions')
      .select('*')
      .order('name');
    
    if (error) {
      // Fallback if table doesn't exist yet
      return res.json([
        { id: 'HQ', name: 'HQ' },
        { id: 'South Region', name: 'South Region' },
        { id: 'North Region', name: 'North Region' },
        { id: 'East Region', name: 'East Region' },
        { id: 'West Region', name: 'West Region' }
      ]);
    }
    res.json(regions || []);
  });

  app.post('/api/regions', async (req, res) => {
    const { name } = req.body;
    const id = `REG-${Date.now()}`;
    const { error } = await supabase
      .from('regions')
      .insert({ id, name });
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, id });
  });

  app.put('/api/regions/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const { error } = await supabase
      .from('regions')
      .update({ name })
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  app.delete('/api/regions/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Vehicles
  app.get('/api/vehicles', async (req, res) => {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('plate_number');
    
    if (error) return res.status(400).json({ error: error.message });
    res.json(vehicles || []);
  });

  app.post('/api/vehicles', async (req, res) => {
    const { plate_number, code, type, model, region, branch, is_static, maintenance_due_date, status, assigned_to } = req.body;
    const id = `VEH-${Date.now()}`;
    
    const { error } = await supabase
      .from('vehicles')
      .insert({
        id, 
        plate_number, 
        code, 
        type, 
        model, 
        region, 
        branch, 
        is_static: is_static ? true : false, 
        maintenance_due_date,
        status: status || 'AVAILABLE',
        assigned_to: assigned_to || null,
        created_at: new Date().toISOString()
      });

    if (error) return res.status(400).json({ error: error.message });
    res.json({ id, ...req.body });
  });

  app.put('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const { plate_number, code, type, model, region, branch, is_static, maintenance_due_date, status, assigned_to } = req.body;
    
    const { error } = await supabase
      .from('vehicles')
      .update({
        plate_number, 
        code, 
        type, 
        model, 
        region, 
        branch, 
        is_static: is_static ? true : false, 
        maintenance_due_date,
        status: status || 'AVAILABLE',
        assigned_to: assigned_to || null
      })
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ id, ...req.body });
  });

  app.delete('/api/vehicles/:id', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Requests
  app.get('/api/requests', async (req, res) => {
    try {
      // Specify the relationship explicitly to avoid ambiguity
      const { data: requests, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:users!requests_requester_id_fkey (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('Join query failed:', error.message);
        throw error;
      }

      const formattedRequests = requests.map((r: any) => ({
        ...r,
        requester_name: r.requester?.name || 'Unknown'
      }));
      res.json(formattedRequests);
    } catch (err: any) {
      console.error('Error fetching requests:', err);
      // Fallback to simple query if join fails
      try {
        const { data: simpleRequests, error: simpleError } = await supabase
          .from('requests')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) {
          const isMissingTable = simpleError.code === '42P01' || 
                                simpleError.message?.includes('schema cache') || 
                                simpleError.message?.includes('does not exist');
          if (isMissingTable) {
            console.warn('Requests table not found, returning empty array.');
            return res.json([]);
          }
          throw simpleError;
        }
        res.json(simpleRequests?.map(r => ({ ...r, requester_name: 'User' })) || []);
      } catch (fallbackErr: any) {
        res.status(500).json({ error: fallbackErr.message });
      }
    }
  });

  app.post('/api/requests', async (req, res) => {
    const { requester_id, region, branch, department, purpose, start_date, end_date, destination, vehicle_type, is_static, priority } = req.body;
    const id = `REQ-${Date.now()}`;
    
    // Check if there are any available vehicles
    let query = supabase.from('vehicles').select('id').eq('status', 'AVAILABLE');
    if (vehicle_type) {
      query = query.eq('type', vehicle_type);
    }
    const { data: availableVehicles } = await query;

    const hasAvailableVehicles = availableVehicles && availableVehicles.length > 0;
    const initialStatus = hasAvailableVehicles ? 'PENDING_DIRECTORATE' : 'REJECTED';

    const { error } = await supabase
      .from('requests')
      .insert({
        id, requester_id, region, branch, department, purpose, start_date, end_date, destination, vehicle_type, 
        is_static: is_static ? true : false, 
        priority, status: initialStatus, created_at: new Date().toISOString()
      });

    if (error) return res.status(400).json({ error: error.message });

    if (!hasAvailableVehicles) {
      // Notify requester about auto-rejection
      await supabase.from('notifications').insert({
        id: `NOTIF-${Date.now()}`,
        user_id: requester_id,
        message: `Your vehicle request was automatically rejected because there are no available vehicles at this time.`,
        type: 'APP'
      });
    }

    res.json({ id, status: initialStatus });
  });

  app.patch('/api/requests/:id/approve', async (req, res) => {
    const { id } = req.params;
    const { approver_id, role, vehicle_id, driver_id } = req.body;
    
    if (role === 'DIRECTORATE_HEAD') {
      const { error } = await supabase
        .from('requests')
        .update({ 
          status: 'PENDING_VEHICLE_MANAGER', 
          directorate_approver_id: approver_id, 
          directorate_approval_date: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) return res.status(400).json({ error: error.message });
    } else if (role === 'VEHICLE_MANAGER') {
      const { error: reqError } = await supabase
        .from('requests')
        .update({ 
          status: 'APPROVED', 
          vehicle_manager_approver_id: approver_id, 
          vehicle_manager_approval_date: new Date().toISOString(), 
          assigned_vehicle_id: vehicle_id, 
          assigned_driver_id: driver_id 
        })
        .eq('id', id);
      
      if (reqError) return res.status(400).json({ error: reqError.message });
      
      // Update vehicle status
      await supabase
        .from('vehicles')
        .update({ status: 'ASSIGNED' })
        .eq('id', vehicle_id);

      // Send SMS to driver
      try {
        const { data: driver } = await supabase.from('users').select('name, phone').eq('id', driver_id).single();
        const { data: vehicle } = await supabase.from('vehicles').select('plate_number').eq('id', vehicle_id).single();
        const { data: request } = await supabase.from('requests').select('destination, start_date, requester_id').eq('id', id).single();

        let requesterInfo = { name: 'N/A', phone: 'N/A' };
        if (request?.requester_id) {
          const { data: requester } = await supabase.from('users').select('name, phone').eq('id', request.requester_id).single();
          if (requester) requesterInfo = requester;
        }

        if (driver?.phone) {
          const message = `Dear ${driver.name}, vehicle request ${id} is approved. Assigned vehicle: ${vehicle?.plate_number}. Destination: ${request?.destination}. Start Time: ${new Date(request?.start_date).toLocaleString()}. Requester: ${requesterInfo.name} (${requesterInfo.phone}).`;
          await sendSms(driver.phone, message, id);
        }
      } catch (smsErr) {
        console.error('Failed to process SMS notification:', smsErr);
      }
    }
    res.json({ success: true });
  });

  app.patch('/api/requests/:id/reject', async (req, res) => {
    const { id } = req.params;
    const { approver_id, reason, role } = req.body;
    
    const updateData: any = { 
      status: 'REJECTED', 
      rejection_reason: reason 
    };

    if (role === 'DIRECTORATE_HEAD') {
      updateData.directorate_approver_id = approver_id;
      updateData.directorate_approval_date = new Date().toISOString();
    } else {
      updateData.vehicle_manager_approver_id = approver_id;
      updateData.vehicle_manager_approval_date = new Date().toISOString();
    }
    
    const { error } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Fuel Requests
  app.get('/api/fuel-requests', async (req, res) => {
    const { data: fuelRequests, error } = await supabase
      .from('fuel_requests')
      .select(`
        *,
        driver:users!fuel_requests_driver_id_fkey (name),
        vehicle:vehicles!fuel_requests_vehicle_id_fkey (plate_number)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      const isMissingTable = error.code === '42P01' || 
                            error.message?.includes('schema cache') || 
                            error.message?.includes('does not exist');
      
      if (isMissingTable) {
        console.warn('Fuel requests table not found or schema not refreshed, returning empty array.');
        return res.json([]);
      }
      console.error('Fuel requests fetch error:', error.message);
      return res.status(400).json({ error: error.message });
    }
    
    const formatted = fuelRequests?.map((r: any) => ({
      ...r,
      driver_name: r.driver?.name || 'Unknown',
      vehicle_plate: r.vehicle?.plate_number || 'Unknown'
    })) || [];
    res.json(formatted);
  });

  app.post('/api/fuel-requests', async (req, res) => {
    const { driver_id, vehicle_id, amount, current_mileage } = req.body;
    const id = `FUEL-${Date.now()}`;
    
    const { error } = await supabase
      .from('fuel_requests')
      .insert({
        id, driver_id, vehicle_id, amount, current_mileage, status: 'PENDING_TEAM_LEADER'
      });

    if (error) return res.status(400).json({ error: error.message });
    
    // Notify Team Leaders
    const { data: managers } = await supabase.from('users').select('id').eq('role', 'TEAM_LEADER');
    if (managers) {
      for (const m of managers) {
        await supabase.from('notifications').insert({
          id: `NOTIF-${Date.now()}-${m.id}`,
          user_id: m.id,
          message: `New fuel request from driver for vehicle ${vehicle_id}`,
          type: 'APP'
        });
      }
    }

    res.json({ id });
  });

  app.patch('/api/fuel-requests/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, driver_id, approver_id, role } = req.body;
    
    const updateData: any = { status };
    if (role === 'TEAM_LEADER') {
      updateData.team_leader_approver_id = approver_id;
    } else if (role === 'DIRECTORATE_HEAD') {
      updateData.directorate_approver_id = approver_id;
    } else if (role === 'VEHICLE_MANAGER' || role === 'ADMIN') {
      updateData.directorate_approver_id = approver_id;
    }

    const { error } = await supabase
      .from('fuel_requests')
      .update(updateData)
      .eq('id', id);

    if (error) return res.status(400).json({ error: error.message });

    if (status === 'APPROVED' || status === 'REJECTED') {
      // Notify Driver (Simulate SMS)
      const message = `Your fuel request has been ${status.toLowerCase()}.`;
      await supabase.from('notifications').insert({
        id: `NOTIF-${Date.now()}-${driver_id}`,
        user_id: driver_id,
        message,
        type: 'SMS'
      });
      console.log(`[SMS SIMULATION] To Driver ${driver_id}: ${message}`);
    } else {
      // Notify next approver
      let nextRole = '';
      if (status === 'PENDING_DIRECTORATE') nextRole = 'DIRECTORATE_HEAD';

      if (nextRole) {
        const { data: managers } = await supabase.from('users').select('id').eq('role', nextRole);
        if (managers) {
          for (const m of managers) {
            await supabase.from('notifications').insert({
              id: `NOTIF-${Date.now()}-${m.id}`,
              user_id: m.id,
              message: `New fuel request pending your approval`,
              type: 'APP'
            });
          }
        }
      }
    }

    res.json({ success: true });
  });

  app.get('/api/backup', async (req, res) => {
    try {
      const [users, vehicles, requests, fuel_requests, notifications, sms_logs] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('vehicles').select('*'),
        supabase.from('requests').select('*'),
        supabase.from('fuel_requests').select('*'),
        supabase.from('notifications').select('*'),
        supabase.from('sms_logs').select('*')
      ]);

      res.json({
        users: users.data || [],
        vehicles: vehicles.data || [],
        requests: requests.data || [],
        fuel_requests: fuel_requests.data || [],
        notifications: notifications.data || [],
        sms_logs: sms_logs.data || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate backup' });
    }
  });

  // Notifications
  app.get('/api/notifications/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId || userId === 'undefined') {
        return res.json([]);
      }
      
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        const isMissingTable = error.code === '42P01' || 
                              error.message?.includes('schema cache') || 
                              error.message?.includes('does not exist');
        
        if (isMissingTable) {
          console.warn('Notifications table not found or schema not refreshed, returning empty array.');
          return res.json([]);
        }
        return res.status(400).json({ error: error.message });
      }
      res.json(notifications || []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.patch('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    
    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
