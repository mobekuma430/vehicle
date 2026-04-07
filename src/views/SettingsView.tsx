import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  Key, 
  MessageSquare, 
  Globe, 
  Copy, 
  ClipboardList 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface SettingsViewProps {
  currentUser: User;
  onUpdate: (field: string, value: string) => void;
}

const SettingsView = React.memo(function SettingsView({ currentUser, onUpdate }: SettingsViewProps) {
  const { t } = useTranslation();
  const [newUsername, setNewUsername] = useState(currentUser.username);
  const [newPassword, setNewPassword] = useState('');
  const [newPhone, setNewPhone] = useState(currentUser.phone || '');

  const handleBackup = async () => {
    try {
      const res = await fetch('/api/backup');
      if (!res.ok) throw new Error('Backup failed');
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ivms_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error downloading backup:', e);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl space-y-8 p-4 lg:p-8"
    >
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="text-blue-600" />
          {t('change_phone', 'Update Phone Number')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('new_phone', 'New Phone Number')}</label>
            <input 
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. +2519..."
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onUpdate('phone', newPhone)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            {t('save_changes')}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserIcon className="text-blue-600" />
          {t('change_username')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('new_username')}</label>
            <input 
              type="text"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newUsername}
              onChange={e => setNewUsername(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onUpdate('username', newUsername)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            {t('save_changes')}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Key className="text-blue-600" />
          {t('change_password')}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t('new_password')}</label>
            <input 
              type="password"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onUpdate('password', newPassword)}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            {t('save_changes')}
          </button>
        </div>
      </div>

      {currentUser.role === 'ADMIN' && (
        <>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="text-blue-600" />
              Web App Link
            </h3>
            <p className="text-sm text-slate-500">Access the web application from any browser using this link.</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={window.location.href} 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-medium outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                }}
                className="bg-blue-100 text-blue-600 px-4 py-3 rounded-xl font-bold hover:bg-blue-200 transition-all flex items-center gap-2"
              >
                <Copy size={18} />
                Copy
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-blue-600" />
              System Backup
            </h3>
            <p className="text-sm text-slate-500">Download a complete JSON backup of all system data including users, vehicles, requests, and fuel logs.</p>
            <button 
              onClick={handleBackup}
              className="bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all flex items-center gap-2"
            >
              <ClipboardList size={18} />
              Download Backup
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
});

export default SettingsView;
