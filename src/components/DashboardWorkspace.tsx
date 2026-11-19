import React, { useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  Search,
  Plus,
  Download,
  LogOut,
  Shield,
  BadgeCheck,
  Plane,
  Package,
  Clock,
  CheckCircle2,
  Activity,
  ArrowLeft,
  QrCode,
  X,
  Check,
} from 'lucide-react';
import { trackEvent } from '../lib/firebase';

export type WorkspaceIndustryId = 'DEFENSE' | 'LAW_ENFORCEMENT' | 'AVIATION';

export interface WorkspaceInventoryItem {
  id: string;
  name: string;
  tag: string;
  category: string;
  status: 'Available' | 'Checked Out';
  assignedTo: string;
  updatedAgo: string;
}

export interface WorkspaceIndustryMeta {
  id: WorkspaceIndustryId;
  name: string;
  shortTag: string;
  unitLabel: string;
  returnLocation: string;
  roster: { name: string; role: string; count: string }[];
}

interface CustodyLogEntry {
  id: string;
  itemName: string;
  tag: string;
  action: 'CHECKED_OUT' | 'RETURNED' | 'REGISTERED';
  actor: string;
  timestamp: string;
}

interface DashboardWorkspaceProps {
  user: User;
  selectedIndustry: WorkspaceIndustryId;
  industries: Record<WorkspaceIndustryId, WorkspaceIndustryMeta>;
  itemsByIndustry: Record<WorkspaceIndustryId, WorkspaceInventoryItem[]>;
  onSelectIndustry: (industry: WorkspaceIndustryId) => void;
  onToggleItemStatus: (itemId: string, actorName: string) => void;
  onAddItem: (
    industry: WorkspaceIndustryId,
    item: Omit<WorkspaceInventoryItem, 'id' | 'updatedAgo'>
  ) => void;
  onBackToOverview: () => void;
  onSignOut: () => Promise<void>;
}

export function DashboardWorkspace({
  user,
  selectedIndustry,
  industries,
  itemsByIndustry,
  onSelectIndustry,
  onToggleItemStatus,
  onAddItem,
  onBackToOverview,
  onSignOut,
}: DashboardWorkspaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Available' | 'Checked Out'>('ALL');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const displayName =
    (user.user_metadata?.full_name as string | undefined)?.trim() ||
    user.email?.split('@')[0] ||
    'Operator';
  const userSector = (user.user_metadata?.sector as string | undefined) || industries[selectedIndustry].name;

  const [activityLog, setActivityLog] = useState<CustodyLogEntry[]>([
    {
      id: 'init-1',
      itemName: 'Session Authenticated',
      tag: 'SUPABASE-JWT',
      action: 'REGISTERED',
      actor: displayName,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const currentProfile = industries[selectedIndustry];
  const items = itemsByIndustry[selectedIndustry];

  const availableCount = items.filter((i) => i.status === 'Available').length;
  const checkedOutCount = items.filter((i) => i.status === 'Checked Out').length;
  const readinessPct = items.length > 0 ? Math.round((availableCount / items.length) * 100) : 100;

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.assignedTo.toLowerCase().includes(q)
      );
    });
  }, [items, searchQuery, statusFilter]);

  const flashBanner = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 3200);
  };

  const getIndustryIcon = (id: WorkspaceIndustryId) => {
    switch (id) {
      case 'DEFENSE':
        return <Shield className="w-3.5 h-3.5" />;
      case 'LAW_ENFORCEMENT':
        return <BadgeCheck className="w-3.5 h-3.5" />;
      case 'AVIATION':
        return <Plane className="w-3.5 h-3.5" />;
    }
  };

  const handleToggleItem = (item: WorkspaceInventoryItem) => {
    const nextAction = item.status === 'Available' ? 'CHECKED_OUT' : 'RETURNED';
    onToggleItemStatus(item.id, displayName);
    setActivityLog((prev) => [
      {
        id: `evt-${Date.now()}`,
        itemName: item.name,
        tag: item.tag,
        action: nextAction,
        actor: displayName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 14),
    ]);
    flashBanner(
      nextAction === 'CHECKED_OUT'
        ? `Checked out ${item.name} to ${displayName}`
        : `Returned ${item.name} to ${currentProfile.returnLocation}`
    );
  };

  const handleQuickScan = () => {
    const target = items.find((i) => i.status === 'Available') || items[0];
    if (!target) return;
    handleToggleItem(target);
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newTag.trim()) return;

    onAddItem(selectedIndustry, {
      name: newName.trim(),
      tag: newTag.trim().toUpperCase(),
      category: newCategory.trim() || 'General Equipment',
      status: 'Available',
      assignedTo: currentProfile.returnLocation,
    });

    setActivityLog((prev) => [
      {
        id: `evt-${Date.now()}`,
        itemName: newName.trim(),
        tag: newTag.trim().toUpperCase(),
        action: 'REGISTERED',
        actor: displayName,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 14),
    ]);

    trackEvent('workspace_add_item', { industry: selectedIndustry });
    flashBanner(`Registered ${newName.trim()} (${newTag.trim().toUpperCase()})`);
    setNewName('');
    setNewTag('');
    setNewCategory('');
    setAddModalOpen(false);
  };

  const handleExportReport = () => {
    const rows = [
      ['Name', 'Serial / Tag', 'Category', 'Status', 'Assigned To / Location', 'Last Updated'],
      ...items.map((i) => [i.name, i.tag, i.category, i.status, i.assignedTo, i.updatedAgo]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `govroute-${selectedIndustry.toLowerCase()}-shift-report.csv`;
    link.click();
    URL.revokeObjectURL(url);

    trackEvent('workspace_export_csv', { industry: selectedIndustry });
    flashBanner(`Exported ${currentProfile.name} shift inventory CSV.`);
  };

  const handleSignOutClick = async () => {
    setSigningOut(true);
    await onSignOut();
    setSigningOut(false);
  };

  return (
    <main className="max-w-[1340px] mx-auto px-6 sm:px-10 py-10 lg:py-14 space-y-8">
      {/* Top Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-[#0C0C0E] font-mono text-[10px] tracking-[0.2em] text-neutral-300 uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AUTHENTICATED WORKSPACE · {currentProfile.unitLabel}</span>
          </div>
          <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.06]">
            Welcome back, <span className="italic text-neutral-400">{displayName}.</span>
          </h1>
          <p className="text-sm text-neutral-400 font-light mt-3 max-w-2xl">
            Signed in as <span className="text-neutral-200">{user.email}</span> · Active sector:{' '}
            <span className="text-neutral-200">{currentProfile.name}</span>. Issue or return
            serialized equipment below with live custody timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToOverview}
            className="px-4 py-2.5 rounded-xl border border-white/15 bg-[#0C0C0E] hover:border-white/30 text-neutral-300 hover:text-white font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={handleExportReport}
            className="px-4 py-2.5 rounded-xl border border-white/15 bg-[#0C0C0E] hover:border-white/30 text-neutral-200 hover:text-white font-mono text-[11px] uppercase tracking-[0.14em] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-[11px] font-semibold uppercase tracking-[0.14em] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Status Toast Banner */}
      {statusBanner && (
        <div className="rounded-2xl bg-white text-black px-4 py-3 text-xs font-medium flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-neutral-600 hover:text-black cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sector Selector + Metric Strip */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-500 uppercase mr-1">
              ACTIVE SECTOR:
            </span>
            {(Object.keys(industries) as WorkspaceIndustryId[]).map((id) => {
              const active = selectedIndustry === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectIndustry(id)}
                  className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.14em] uppercase transition-all cursor-pointer border flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-[#0C0C0E] text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {getIndustryIcon(id)}
                  <span>{industries[id].name}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleQuickScan}
            className="px-4 py-2 rounded-full border border-white/20 bg-[#0C0C0E] hover:bg-white hover:text-black text-white font-mono text-[11px] tracking-[0.14em] uppercase flex items-center gap-2 transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>1-Tap Quick Scan</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">TOTAL TRACKED</span>
              <Package className="w-4 h-4" />
            </div>
            <div className="text-3xl font-semibold text-white mt-3">{items.length}</div>
            <div className="text-xs text-neutral-500 mt-1">{currentProfile.unitLabel}</div>
          </div>

          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">READY IN VAULT</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-3xl font-semibold text-white mt-3">{availableCount}</div>
            <div className="text-xs text-neutral-500 mt-1">Available for issue</div>
          </div>

          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">CHECKED OUT</span>
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-3xl font-semibold text-white mt-3">{checkedOutCount}</div>
            <div className="text-xs text-neutral-500 mt-1">Currently in custody</div>
          </div>

          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-5">
            <div className="flex items-center justify-between text-neutral-500">
              <span className="font-mono text-[10px] tracking-[0.18em] uppercase">READINESS</span>
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-3xl font-semibold text-white mt-3">{readinessPct}%</div>
            <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-2.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${readinessPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Equipment Ledger + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Equipment Table */}
        <div className="lg:col-span-8 bg-[#0B0B0D] border border-white/[0.08] rounded-3xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                SERIALIZED EQUIPMENT LEDGER
              </div>
              <h2 className="font-serif-editorial text-2xl text-white font-normal mt-0.5">
                {currentProfile.name} Inventory
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(['ALL', 'Available', 'Checked Out'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-colors cursor-pointer border ${
                    statusFilter === status
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-[#121214] text-neutral-400 border-white/[0.08] hover:text-white'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item name, serial tag, category, or holder..."
              className="w-full bg-[#121214] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
            />
          </div>

          <div className="space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-white/10 rounded-2xl">
                No equipment matches your current filter.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isAvailable = item.status === 'Available';
                return (
                  <div
                    key={item.id}
                    className="bg-[#121214] border border-white/[0.07] hover:border-white/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-white">{item.name}</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-neutral-300 border border-white/[0.08]">
                          {item.tag}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {item.category} ·{' '}
                        <span className="text-neutral-300">{item.assignedTo}</span> ·{' '}
                        <span>{item.updatedAgo}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                          isAvailable
                            ? 'bg-white/10 text-white border-white/20'
                            : 'bg-transparent text-neutral-400 border-white/10'
                        }`}
                      >
                        {item.status}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleToggleItem(item)}
                        className={`px-3.5 py-2 rounded-xl font-mono text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                          isAvailable
                            ? 'bg-white hover:bg-neutral-200 text-black'
                            : 'border border-white/20 hover:bg-white hover:text-black text-white'
                        }`}
                      >
                        {isAvailable ? 'Check Out' : 'Return'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 4 Cols: Custody Feed & Account Session Card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Activity Feed */}
          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                LIVE CUSTODY LOG
              </div>
              <span className="font-mono text-[10px] text-neutral-500">
                {activityLog.length} events
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {activityLog.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-[#121214] border border-white/[0.06] rounded-xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-white">
                      {entry.action.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {entry.timestamp}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-200 truncate">{entry.itemName}</div>
                  <div className="text-[11px] text-neutral-500">
                    {entry.tag} · {entry.actor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account & Session Card */}
          <div className="bg-[#0B0B0D] border border-white/[0.08] rounded-3xl p-6 space-y-4">
            <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
              OPERATOR SESSION
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-500">Operator</span>
                <span className="text-white font-medium">{displayName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-500">Email</span>
                <span className="text-neutral-200 truncate max-w-[200px]">{user.email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
                <span className="text-neutral-500">Primary Sector</span>
                <span className="text-neutral-200">{userSector}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-500">User ID</span>
                <span className="font-mono text-[10px] text-neutral-400">
                  {user.id.slice(0, 8)}...{user.id.slice(-4)}
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={signingOut}
              onClick={handleSignOutClick}
              className="w-full py-3 rounded-xl border border-white/15 hover:bg-white hover:text-black text-white font-mono text-[11px] uppercase tracking-[0.16em] flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddModalOpen(false);
          }}
        >
          <div className="bg-[#0C0C0E] border border-white/15 rounded-3xl max-w-md w-full p-8 relative">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                REGISTER ASSET · {currentProfile.name.toUpperCase()}
              </div>
              <h3 className="font-serif-editorial text-3xl text-white font-normal">
                Add serialized item
              </h3>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                  EQUIPMENT NAME
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., AN/PVS-14 Night Vision Monocular"
                  className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                  SERIAL / ASSET TAG
                </label>
                <input
                  type="text"
                  required
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="e.g., SN #772104"
                  className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                  CATEGORY
                </label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Weapons & Optics"
                  className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer mt-2"
              >
                Register Equipment
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
