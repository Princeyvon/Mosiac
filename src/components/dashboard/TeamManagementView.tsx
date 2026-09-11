import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TeamMember } from '../../types';
import {
  Shield,
  Plus,
  ChevronDown,
  ChevronUp,
  Key,
  Lock,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  Check,
  Mail,
  User
} from 'lucide-react';

export const TeamManagementView: React.FC = () => {
  const { teamMembers, toggleTeamMemberActive, updateTeamMember, addTeamMember, showToast } = useStore();

  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(teamMembers[0]?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Local draft states for editing member credentials
  const [editingPins, setEditingPins] = useState<Record<string, string>>({});
  const [editingPasswords, setEditingPasswords] = useState<Record<string, string>>({});
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // New member form
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<TeamMember['role']>('Senior Curator');
  const [newPin, setNewPin] = useState('5678');
  const [newPassword, setNewPassword] = useState('Pass1234!');

  const toggleAccordion = (id: string) => {
    setExpandedMemberId(prev => (prev === id ? null : id));
  };

  const handlePinChange = (memberId: string, pin: string) => {
    setEditingPins(prev => ({ ...prev, [memberId]: pin }));
  };

  const handlePasswordChange = (memberId: string, pass: string) => {
    setEditingPasswords(prev => ({ ...prev, [memberId]: pass }));
  };

  const savePin = (memberId: string) => {
    const pin = editingPins[memberId];
    if (!pin || pin.trim().length < 4) {
      showToast('PIN must be at least 4 digits');
      return;
    }
    updateTeamMember(memberId, { pin: pin.trim() });
  };

  const savePassword = (memberId: string) => {
    const pass = editingPasswords[memberId];
    if (!pass || pass.trim().length < 6) {
      showToast('Password must be at least 6 characters');
      return;
    }
    updateTeamMember(memberId, { password: pass.trim() });
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    addTeamMember({
      name: newName.trim(),
      username: newUsername.trim() || newName.toLowerCase().replace(/\s+/g, '.'),
      email: newEmail.trim(),
      role: newRole,
      active: true,
      pin: newPin.trim() || '1234',
      password: newPassword.trim() || 'Studio2026!'
    });

    // Reset form
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPin('5678');
    setNewPassword('Pass1234!');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Access Control · Personnel & Security
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Studio Team Members
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage personnel status, access tiers, 4-digit PINs, and authentication credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-[11px] font-medium tracking-wider uppercase rounded-sm hover:bg-neutral-800 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Cancel' : 'Add Team Member'}</span>
        </button>
      </div>

      {/* New Member Form Modal / Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateMember}
          className="bg-white border border-neutral-300 rounded-sm p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-black" />
              <span>Provision New Team Member</span>
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">Status: Active upon creation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Username
              </label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                placeholder="e.g. m.lin"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="maya@rugmosiac.com"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Role Tier
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-black bg-white font-medium"
              >
                <option value="Studio Director">Studio Director</option>
                <option value="Senior Curator">Senior Curator</option>
                <option value="Atelier Manager">Atelier Manager</option>
                <option value="Logistics Lead">Logistics Lead</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                4-Digit Studio PIN
              </label>
              <input
                type="text"
                maxLength={6}
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="e.g. 5678"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                Initial Password
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Password123"
                className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono focus:outline-black bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs uppercase tracking-wider rounded-sm hover:bg-neutral-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white text-xs uppercase tracking-wider font-semibold rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              Add Member
            </button>
          </div>
        </form>
      )}

      {/* Accordion List for Team Members */}
      <div className="border border-neutral-200 bg-white rounded-sm divide-y divide-neutral-200 shadow-2xs overflow-hidden">
        {teamMembers.map(member => {
          const isExpanded = expandedMemberId === member.id;
          const currentPin = editingPins[member.id] ?? member.pin;
          const currentPassword = editingPasswords[member.id] ?? (member.password || '••••••••');
          const isPassVisible = Boolean(showPasswordMap[member.id]);

          return (
            <div key={member.id} className="transition-colors">
              {/* Accordion Row Header */}
              <div
                onClick={() => toggleAccordion(member.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-neutral-50/80 cursor-pointer select-none transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Avatar / Initials */}
                  <div
                    className={`w-9 h-9 rounded-sm flex items-center justify-center font-bold text-xs uppercase ${
                      member.active ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {member.name
                      .split(' ')
                      .map(p => p[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  {/* Name and Username */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-neutral-900 truncate">
                        {member.name}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400">
                        @{member.username}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate flex items-center gap-2">
                      <span>{member.role}</span>
                      <span>·</span>
                      <span className="font-mono text-[10px] text-neutral-400">{member.email}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Active Status + Accordion Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-sm text-[10px] uppercase font-mono tracking-wider font-semibold ${
                      member.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-500 border border-neutral-200'
                    }`}
                  >
                    {member.active ? 'Active' : 'Inactive'}
                  </span>

                  <div className="p-1 rounded text-neutral-400 hover:text-black">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-800" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Accordion Expanded Body */}
              {isExpanded && (
                <div className="p-5 bg-neutral-50/80 border-t border-neutral-100 space-y-5 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">
                      Account Credentials & Security Management
                    </span>

                    {/* Active / Inactive Status Switch */}
                    <button
                      type="button"
                      onClick={() => toggleTeamMemberActive(member.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-sm transition-colors cursor-pointer ${
                        member.active
                          ? 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {member.active ? (
                        <>
                          <UserX className="w-3.5 h-3.5" />
                          <span>Deactivate Access</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Activate Access</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* PIN Management Box */}
                    <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-3">
                      <div className="flex items-center gap-2 text-neutral-900 font-semibold text-xs">
                        <Key className="w-4 h-4 text-neutral-600" />
                        <span>Staff Quick-Access PIN (4 Digits)</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Used for fast terminal verification and studio staging approval.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={currentPin}
                          onChange={e => handlePinChange(member.id, e.target.value)}
                          className="w-32 border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-center focus:outline-black"
                        />
                        <button
                          type="button"
                          onClick={() => savePin(member.id)}
                          className="px-3 py-1.5 bg-black text-white text-[10px] font-medium uppercase tracking-wider rounded-sm hover:bg-neutral-800 cursor-pointer"
                        >
                          Update PIN
                        </button>
                      </div>
                    </div>

                    {/* Password Management Box */}
                    <div className="p-4 bg-white border border-neutral-200 rounded-sm space-y-3">
                      <div className="flex items-center gap-2 text-neutral-900 font-semibold text-xs">
                        <Lock className="w-4 h-4 text-neutral-600" />
                        <span>Studio Dashboard Password</span>
                      </div>
                      <p className="text-[11px] text-neutral-500">
                        Authentication secret required for master atelier dashboard sign-in.
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type={isPassVisible ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={e => handlePasswordChange(member.id, e.target.value)}
                            className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black pr-8"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordMap(prev => ({ ...prev, [member.id]: !prev[member.id] }))
                            }
                            className="absolute right-2 top-2 text-neutral-400 hover:text-black cursor-pointer"
                            aria-label="Toggle password visibility"
                          >
                            {isPassVisible ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => savePassword(member.id)}
                          className="px-3 py-1.5 bg-black text-white text-[10px] font-medium uppercase tracking-wider rounded-sm hover:bg-neutral-800 cursor-pointer shrink-0"
                        >
                          Update Pass
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Metadata and Role Row */}
                  <div className="p-4 bg-white border border-neutral-200 rounded-sm grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                        Role Assignment
                      </span>
                      <select
                        value={member.role}
                        onChange={e => updateTeamMember(member.id, { role: e.target.value as any })}
                        className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs bg-white focus:outline-black font-medium"
                      >
                        <option value="Studio Director">Studio Director</option>
                        <option value="Senior Curator">Senior Curator</option>
                        <option value="Atelier Manager">Atelier Manager</option>
                        <option value="Logistics Lead">Logistics Lead</option>
                      </select>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                        Contact Email
                      </span>
                      <input
                        type="email"
                        value={member.email}
                        onChange={e => updateTeamMember(member.id, { email: e.target.value })}
                        className="w-full border border-neutral-300 rounded-sm px-2.5 py-1 text-xs font-mono bg-white focus:outline-black"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1">
                        Activity Log
                      </span>
                      <span className="inline-block pt-1 font-mono text-[11px] text-neutral-600">
                        Last Active: {member.lastActive || 'Today'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
