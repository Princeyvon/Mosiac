import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ImageUploadField } from './ImageUploadField';
import {
  User,
  Mail,
  Key,
  Shield,
  Bell,
  Check,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const ProfileManagementView: React.FC = () => {
  const { userProfile, updateUserProfile, showToast } = useStore();

  const [form, setForm] = useState({ ...userProfile });
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(form);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleReset = () => {
    setForm({ ...userProfile });
    showToast('Reverted profile form to saved values');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Account Management · Atelier Personnel
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Admin Profile & Atelier Settings
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure your personal director identity, security PIN, notifications, and avatar.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase font-medium tracking-wider rounded-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          <button
            type="submit"
            form="profile-form"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar & Summary Card */}
        <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Director Portrait & Visual Avatar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4">
              <ImageUploadField
                label="Profile Avatar"
                value={form.avatar}
                onChange={url => setForm(prev => ({ ...prev, avatar: url }))}
                aspectRatio="square"
                helperText="Upload staff headshot or paste from clipboard"
              />
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-900">{form.name || 'Studio Director'}</span>
                  <span className="text-[10px] font-mono bg-black text-white px-2 py-0.5 rounded-xs uppercase">
                    {form.role || 'Administrator'}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed font-light">
                  {form.bio || 'Curatorial director for Mosiac atelier collections.'}
                </p>
                <div className="text-[11px] font-mono text-neutral-400">
                  Logged in as <span className="text-neutral-700">@{form.username}</span> ({form.email})
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity & Contact Details */}
        <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Personal & Access Credentials
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-neutral-300 rounded-sm px-3.5 py-2 text-xs focus:outline-black font-medium"
                  placeholder="e.g. Maya Lin"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Staff Handle / Username
              </label>
              <div className="flex items-center">
                <span className="text-neutral-400 text-xs px-3 py-2 bg-neutral-100 border border-r-0 border-neutral-300 rounded-l-sm font-mono">
                  @
                </span>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  className="w-full border border-neutral-300 rounded-r-sm px-3 py-2 text-xs font-mono focus:outline-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Official Studio Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-neutral-300 rounded-sm px-3.5 py-2 text-xs font-mono focus:outline-black"
                  placeholder="director@rugmosiac.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
                Role Title
              </label>
              <input
                type="text"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-neutral-300 rounded-sm px-3.5 py-2 text-xs focus:outline-black font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
              Curatorial Bio & Responsibility Scope
            </label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => setForm({ ...form, bio: e.target.value })}
              className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black leading-relaxed"
              placeholder="Overseeing global textile commissions, custom loom weaving, and architectural client relations..."
            />
          </div>
        </div>

        {/* Security & Notifications */}
        <div className="bg-white border border-neutral-200 rounded-sm p-6 space-y-5 shadow-2xs">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-2">
            Terminal PIN & Notification Preferences
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <Key className="w-4 h-4 text-black" />
                <span>Terminal Quick-PIN</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Your 4-digit security code for instant terminal authorization.
              </p>
              <input
                type="text"
                maxLength={6}
                value={form.pin}
                onChange={e => setForm({ ...form, pin: e.target.value })}
                className="w-36 border border-neutral-300 rounded-sm px-3 py-2 text-center text-sm font-mono font-bold tracking-widest focus:outline-black bg-white"
              />
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-sm space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-800">
                <Bell className="w-4 h-4 text-black" />
                <span>Atelier Alerts</span>
              </div>
              <p className="text-[11px] text-neutral-500">
                Receive real-time alerts when new orders are placed or stock runs low.
              </p>
              <label className="flex items-center gap-3 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={form.notificationsEnabled}
                  onChange={e => setForm({ ...form, notificationsEnabled: e.target.checked })}
                  className="w-4 h-4 rounded-xs text-black focus:ring-black cursor-pointer"
                />
                <span className="text-xs font-medium text-neutral-800">
                  {form.notificationsEnabled ? 'Notifications Enabled' : 'Notifications Muted'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
