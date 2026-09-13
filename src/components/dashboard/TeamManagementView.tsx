import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { TeamMember, TeamPermissions } from '../../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../../context/StoreContext';
import { CustomSelect } from '../common/CustomSelect';
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
  User,
  Sliders,
  Trash2,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Layers,
  Settings,
  DollarSign,
  FileText,
  Truck,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const TeamManagementView: React.FC = () => {
  const {
    teamMembers,
    toggleTeamMemberActive,
    updateTeamMember,
    addTeamMember,
    deleteTeamMember,
    activeTeamMember,
    setActiveTeamMemberId,
    showToast,
    currentPermissions
  } = useStore();

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
  const [customNewPermissions, setCustomNewPermissions] = useState<TeamPermissions>(
    DEFAULT_ROLE_PERMISSIONS['Senior Curator']
  );

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

  const handleRoleChange = (memberId: string, newRole: TeamMember['role']) => {
    const defaultPerms = DEFAULT_ROLE_PERMISSIONS[newRole] || DEFAULT_ROLE_PERMISSIONS['Custom Role'];
    updateTeamMember(memberId, {
      role: newRole,
      permissions: defaultPerms
    });
    showToast(`Updated role to ${newRole} with default permissions`);
  };

  const handleTogglePermission = (memberId: string, permKey: keyof TeamPermissions) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return;

    const currentPerms = member.permissions || DEFAULT_ROLE_PERMISSIONS[member.role] || DEFAULT_ROLE_PERMISSIONS['Studio Director'];
    const updatedPerms: TeamPermissions = {
      ...currentPerms,
      [permKey]: !currentPerms[permKey]
    };

    updateTeamMember(memberId, {
      permissions: updatedPerms,
      role: 'Custom Role' // marks as custom when selectively toggled
    });
  };

  const handleApplyPreset = (memberId: string, rolePresetName: keyof typeof DEFAULT_ROLE_PERMISSIONS) => {
    const preset = DEFAULT_ROLE_PERMISSIONS[rolePresetName];
    if (!preset) return;
    updateTeamMember(memberId, {
      role: rolePresetName as any,
      permissions: { ...preset }
    });
    showToast(`Applied ${rolePresetName} permission preset`);
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
      password: newPassword.trim() || 'Studio2026!',
      permissions: customNewPermissions
    });

    // Reset form
    setNewName('');
    setNewUsername('');
    setNewEmail('');
    setNewPin('5678');
    setNewPassword('Pass1234!');
    setShowAddForm(false);
  };

  const permissionItems: { key: keyof TeamPermissions; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'canViewDashboard',
      label: 'Overview & Analytics',
      desc: 'Access main dashboard summary cards and performance stats',
      icon: <Eye className="w-3.5 h-3.5 text-neutral-600" />
    },
    {
      key: 'canViewFinancials',
      label: 'Financials & Margins',
      desc: 'View unit cost price, profit margins, and atelier revenue figures',
      icon: <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
    },
    {
      key: 'canEditProducts',
      label: 'Edit Product Details',
      desc: 'Modify titles, descriptions, dimensions, prices, and imagery',
      icon: <Layers className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      key: 'canCreateProducts',
      label: 'Create New Works',
      desc: 'Draft and upload new rug works into catalogue inventory',
      icon: <Plus className="w-3.5 h-3.5 text-purple-600" />
    },
    {
      key: 'canPublishLive',
      label: 'Publish Live Storefront',
      desc: 'Commit and sync staged atelier changes to public storefront',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />
    },
    {
      key: 'canDeleteProducts',
      label: 'Deaccession / Delete Works',
      desc: 'Permanently remove archived editions and pieces from database',
      icon: <Trash2 className="w-3.5 h-3.5 text-red-600" />
    },
    {
      key: 'canManageOrders',
      label: 'Order Fulfilment',
      desc: 'Inspect customer acquisitions and advance shipping/transit status',
      icon: <Truck className="w-3.5 h-3.5 text-indigo-600" />
    },
    {
      key: 'canManageClientele',
      label: 'Clientele Directory',
      desc: 'View collector contacts, private trade accounts, and addresses',
      icon: <Users className="w-3.5 h-3.5 text-cyan-600" />
    },
    {
      key: 'canManageDiscounts',
      label: 'Promos & Sample Sales',
      desc: 'Configure promotional popups, discount codes, and sample sale badges',
      icon: <ShoppingBag className="w-3.5 h-3.5 text-rose-600" />
    },
    {
      key: 'canManageStoreSettings',
      label: 'Store Settings & Formulas',
      desc: 'Configure collections, rug shapes/styles, sizing guide, and weight formulas',
      icon: <Settings className="w-3.5 h-3.5 text-orange-600" />
    },
    {
      key: 'canManagePolicies',
      label: 'Terms & Studio Policies',
      desc: 'Update shipping disclaimers, 30-day guarantee, and legal agreements',
      icon: <FileText className="w-3.5 h-3.5 text-teal-600" />
    },
    {
      key: 'canManageTeam',
      label: 'Team Security & Access',
      desc: 'Add/remove personnel, adjust role credentials, and assign permissions',
      icon: <Shield className="w-3.5 h-3.5 text-neutral-800" />
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Access Control · Personnel & Security
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Studio Team & Granular Permissions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Choose what employees can access, view, edit, or publish across the studio environment.
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

      {/* Live Persona Simulation Selector */}
      <div className="p-4 bg-neutral-900 text-white rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Active Logged-in Staff Persona</span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Switch active staff member to test their real-time permission boundaries throughout the studio.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <CustomSelect
            value={activeTeamMember.id}
            onChange={id => setActiveTeamMemberId(id)}
            options={teamMembers.map(m => ({
              value: m.id,
              label: m.name,
              sublabel: `${m.role} · ${m.active ? 'Active' : 'Inactive'}`,
              badge: m.role.split(' ')[0]
            }))}
            buttonClassName="bg-neutral-800 border-neutral-700 text-white hover:bg-neutral-700"
            menuClassName="bg-neutral-900 border-neutral-800 text-white"
          />
        </div>
      </div>

      {/* New Member Form Modal / Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleCreateMember}
          className="bg-white border border-neutral-300 rounded-sm p-5 sm:p-6 space-y-5 shadow-sm animate-in fade-in duration-200"
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
                Role Assignment Preset
              </label>
              <CustomSelect
                value={newRole}
                onChange={val => {
                  const role = val as TeamMember['role'];
                  setNewRole(role);
                  if (DEFAULT_ROLE_PERMISSIONS[role]) {
                    setCustomNewPermissions(DEFAULT_ROLE_PERMISSIONS[role]);
                  }
                }}
                options={[
                  { value: 'Studio Director', label: 'Studio Director', sublabel: 'Full administrator access' },
                  { value: 'Senior Curator', label: 'Senior Curator', sublabel: 'Catalogue & pricing control' },
                  { value: 'Atelier Manager', label: 'Atelier Manager', sublabel: 'Orders & inventory' },
                  { value: 'Logistics Lead', label: 'Logistics Lead', sublabel: 'Shipping & client directory' },
                  { value: 'Custom Role', label: 'Custom Role', sublabel: 'Tailored permissions' }
                ]}
              />
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

          <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200">
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
              Provision Member
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
          const perms = member.permissions || DEFAULT_ROLE_PERMISSIONS[member.role] || DEFAULT_ROLE_PERMISSIONS['Studio Director'];

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
                      {member.id === activeTeamMember.id && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono uppercase bg-neutral-900 text-white">
                          Current Persona
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-500 truncate flex items-center gap-2">
                      <span className="font-medium text-neutral-800">{member.role}</span>
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
                <div className="p-5 bg-neutral-50/80 border-t border-neutral-100 space-y-6 animate-in fade-in duration-150">
                  {/* Action Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-200">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 font-semibold">
                      Account Credentials & Security Management
                    </span>

                    <div className="flex items-center gap-2">
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

                      {teamMembers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove team member ${member.name}?`)) {
                              deleteTeamMember(member.id);
                            }
                          }}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-neutral-200 rounded-sm transition-colors cursor-pointer"
                          title="Delete Member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GRANULAR PERMISSIONS MATRIX SECTION */}
                  <div className="p-5 bg-white border border-neutral-200 rounded-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-black" />
                          <span>Granular Access & Editing Permissions</span>
                        </h4>
                        <p className="text-[11px] text-neutral-500">
                          Toggle specific capabilities for this user or choose a pre-configured role template.
                        </p>
                      </div>

                      {/* Quick Role Presets */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 mr-1">Presets:</span>
                        {(['Studio Director', 'Senior Curator', 'Atelier Manager', 'Logistics Lead'] as const).map(rolePreset => (
                          <button
                            key={rolePreset}
                            type="button"
                            onClick={() => handleApplyPreset(member.id, rolePreset)}
                            className={`px-2 py-1 text-[10px] uppercase font-mono rounded-xs transition-colors cursor-pointer border ${
                              member.role === rolePreset
                                ? 'bg-black text-white border-black'
                                : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-neutral-400'
                            }`}
                          >
                            {rolePreset.split(' ')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Permission Toggles Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissionItems.map(item => {
                        const isAllowed = Boolean(perms[item.key]);

                        return (
                          <div
                            key={item.key}
                            onClick={() => handleTogglePermission(member.id, item.key)}
                            className={`p-3 rounded-sm border transition-all cursor-pointer select-none flex items-start justify-between gap-3 ${
                              isAllowed
                                ? 'bg-neutral-50/80 border-neutral-300 hover:border-neutral-400'
                                : 'bg-white border-neutral-200 opacity-60 hover:opacity-90'
                            }`}
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                {item.icon}
                                <span className="font-semibold text-xs text-neutral-900 truncate">
                                  {item.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-neutral-500 leading-tight">
                                {item.desc}
                              </p>
                            </div>

                            {/* Toggle Switch */}
                            <div
                              className={`w-8 h-4 rounded-full transition-colors relative shrink-0 mt-0.5 ${
                                isAllowed ? 'bg-black' : 'bg-neutral-300'
                              }`}
                            >
                              <div
                                className={`w-3 h-3 rounded-full bg-white transition-transform absolute top-0.5 ${
                                  isAllowed ? 'left-4.5' : 'left-0.5'
                                }`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Credentials Section */}
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
                          className="w-32 border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono font-bold tracking-widest text-center focus:outline-black bg-white"
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
                            className="w-full border border-neutral-300 rounded-sm px-3 py-1.5 text-xs font-mono focus:outline-black pr-8 bg-white"
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
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">
                        Role Assignment
                      </span>
                      <CustomSelect
                        value={member.role}
                        onChange={val => handleRoleChange(member.id, val as TeamMember['role'])}
                        options={[
                          { value: 'Studio Director', label: 'Studio Director' },
                          { value: 'Senior Curator', label: 'Senior Curator' },
                          { value: 'Atelier Manager', label: 'Atelier Manager' },
                          { value: 'Logistics Lead', label: 'Logistics Lead' },
                          { value: 'Custom Role', label: 'Custom Role' }
                        ]}
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">
                        Contact Email
                      </span>
                      <input
                        type="email"
                        value={member.email}
                        onChange={e => updateTeamMember(member.id, { email: e.target.value })}
                        className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-xs font-mono bg-white focus:outline-black"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-400 mb-1.5">
                        Activity Log
                      </span>
                      <div className="pt-2 font-mono text-[11px] text-neutral-600">
                        Last Active: {member.lastActive || 'Today'}
                      </div>
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
