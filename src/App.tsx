import React, { useState } from 'react';
import {
  Home,
  Folder,
  ScanLine,
  Users,
  ArrowUpRight,
  Check,
  Search,
  QrCode,
  Wifi,
  Package,
  Clock,
  X,
} from 'lucide-react';

type ScreenTab = 'HOME' | 'INVENTORY' | 'SCAN' | 'TEAM';

interface InventoryItem {
  id: string;
  name: string;
  tag: string;
  category: 'Weapons & Optics' | 'Vehicles' | 'Radios' | 'Field Gear';
  status: 'Available' | 'Checked Out';
  assignedTo: string;
  updatedAgo: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: 'M4A1 Patrol Carbine',
    tag: 'TAG #4102',
    category: 'Weapons & Optics',
    status: 'Available',
    assignedTo: 'Armory Rack A4',
    updatedAgo: '2m ago',
  },
  {
    id: '2',
    name: 'Night Vision Binoculars',
    tag: 'TAG #4019',
    category: 'Weapons & Optics',
    status: 'Checked Out',
    assignedTo: 'Sgt. M. Vance',
    updatedAgo: '14m ago',
  },
  {
    id: '3',
    name: 'Patrol Cruiser #14',
    tag: 'UNIT #819',
    category: 'Vehicles',
    status: 'Checked Out',
    assignedTo: 'Ofc. K. Alverez',
    updatedAgo: '41m ago',
  },
  {
    id: '4',
    name: 'Motorola APX Handheld Radio',
    tag: 'TAG #9481',
    category: 'Radios',
    status: 'Available',
    assignedTo: 'Charging Dock 02',
    updatedAgo: '1h ago',
  },
  {
    id: '5',
    name: 'Ballistic Shield & Med Kit',
    tag: 'TAG #3081',
    category: 'Field Gear',
    status: 'Available',
    assignedTo: 'Locker B12',
    updatedAgo: '2h ago',
  },
];

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenTab>('HOME');
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoReminders, setAutoReminders] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistOrg, setWaitlistOrg] = useState('Law Enforcement Department');

  const availableCount = items.filter((i) => i.status === 'Available').length;
  const checkedOutCount = items.filter((i) => i.status === 'Checked Out').length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const toggleItemStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus = item.status === 'Available' ? 'Checked Out' : 'Available';
        showToast(
          nextStatus === 'Checked Out'
            ? `Checked out ${item.name} to Sgt. J. Mercer`
            : `Returned ${item.name} to Armory`
        );
        return {
          ...item,
          status: nextStatus,
          assignedTo: nextStatus === 'Checked Out' ? 'Sgt. J. Mercer' : 'Armory Rack A4',
          updatedAgo: 'Just now',
        };
      })
    );
  };

  const handleQuickScan = () => {
    const target = items.find((i) => i.status === 'Available') || items[0];
    toggleItemStatus(target.id);
  };

  const filteredPhoneItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      i.tag.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      i.assignedTo.toLowerCase().includes(phoneSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#060606] text-white bg-minimal-grid relative">
      {/* TOP MINIMALIST NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] bg-[#060606]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Left Brand */}
          <a href="#" className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center shrink-0">
              <div className="w-7 h-7 border-[1.75px] border-black rounded-md flex items-center justify-center font-mono font-bold text-xs tracking-tighter">
                GR
              </div>
            </div>
            <div>
              <div className="font-mono text-sm font-semibold tracking-[0.28em] text-white">
                GOVROUTE
              </div>
              <div className="font-mono text-[9px] tracking-[0.16em] text-neutral-500 uppercase mt-0.5">
                SIMPLE INVENTORY FOR MILITARY & POLICE
              </div>
            </div>
          </a>

          {/* Center Numbered Links */}
          <nav className="hidden lg:flex items-center gap-12 font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
            <a href="#preview" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">01. THE</span>
              <span>APP</span>
            </a>
            <a href="#features" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">02. BUILT FOR</span>
              <span>SPEED</span>
            </a>
            <a href="#workflow" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">03. HOW IT</span>
              <span>WORKS</span>
            </a>
            <a href="#workflow" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">04. FIELD</span>
              <span>TEAMS</span>
            </a>
            <button
              onClick={() => {
                setWaitlistSubmitted(false);
                setWaitlistOpen(true);
              }}
              className="hover:text-white transition-colors leading-relaxed text-left uppercase cursor-pointer"
            >
              <span className="block text-neutral-500">05. CONTACT</span>
              <span>US</span>
            </button>
          </nav>

          {/* Right White Pill CTA */}
          <button
            onClick={() => {
              setWaitlistSubmitted(false);
              setWaitlistOpen(true);
            }}
            className="bg-white hover:bg-neutral-200 text-black rounded-xl px-6 py-3 font-mono text-[11px] font-semibold tracking-[0.18em] uppercase flex items-center gap-3 transition-colors cursor-pointer"
          >
            <span className="text-center leading-tight">
              JOIN
              <br />
              WAITLIST
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main id="preview" className="max-w-[1340px] mx-auto px-6 sm:px-10 pt-14 pb-24 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* LEFT COLUMN: Editorial Headline, User-Friendly Copy & Screen Selector Cards */}
          <div className="lg:col-span-7 pt-2">
            {/* Top Rounded Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.12] bg-[#0C0C0E] font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-300 uppercase mb-9">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>ZERO TRAINING REQUIRED · MILITARY & LAW ENFORCEMENT · iOS & ANDROID</span>
            </div>

            {/* Classical Serif Headline with Italic Muted Contrast */}
            <h1 className="font-serif-editorial text-[54px] sm:text-[72px] lg:text-[84px] leading-[1.02] tracking-[-0.02em] text-white font-normal">
              Inventory tracking made{' '}
              <span className="italic text-neutral-400 font-normal">effortless</span> for the
              frontline.
            </h1>

            {/* Calm, User-Friendly Description Paragraph */}
            <p className="mt-8 text-neutral-400 text-base sm:text-[19px] leading-[1.68] font-light max-w-[640px]">
              GOVROUTE replaces messy clipboards, paper sign-out sheets, and clunky spreadsheets
              with a clean mobile app your entire unit or precinct can use on day one. Scan any item
              with your phone camera, check out gear in a single tap, and see who has what in
              seconds.
            </p>

            {/* Interactive Live Preview Selector Header */}
            <div className="mt-14 pt-2 max-w-[650px]">
              <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-500 uppercase mb-4">
                <span>INTERACTIVE LIVE APP PREVIEW — SELECT SCREEN:</span>
                <span className="hidden sm:inline text-neutral-500">
                  CLICK INSIDE DEVICE TO INTERACT →
                </span>
              </div>

              {/* 4 Selector Cards matching the reference image */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(
                  [
                    {
                      id: 'HOME',
                      num: '01',
                      title: 'HOME',
                      sub: 'At-a-glance stock & activity.',
                      icon: Home,
                    },
                    {
                      id: 'INVENTORY',
                      num: '02',
                      title: 'ITEMS',
                      sub: 'Search & filter all equipment.',
                      icon: Folder,
                    },
                    {
                      id: 'SCAN',
                      num: '03',
                      title: 'SCAN',
                      sub: '1-tap camera check-in & out.',
                      icon: ScanLine,
                    },
                    {
                      id: 'TEAM',
                      num: '04',
                      title: 'TEAM',
                      sub: 'Shift roster & quick reports.',
                      icon: Users,
                    },
                  ] as const
                ).map((tab) => {
                  const isActive = activeScreen === tab.id;
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveScreen(tab.id)}
                      className={`text-left rounded-2xl p-4 transition-all cursor-pointer border flex flex-col justify-between min-h-[126px] ${
                        isActive
                          ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.12)]'
                          : 'bg-[#0C0C0E] text-white border-white/[0.1] hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono text-[10px] tracking-widest text-neutral-500">
                          {tab.num}
                        </span>
                        <IconComponent
                          className={`w-4 h-4 ${
                            isActive ? 'text-black' : 'text-neutral-400'
                          }`}
                        />
                      </div>

                      <div className="mt-4">
                        <div className="font-mono text-xs font-bold tracking-[0.12em] uppercase">
                          {tab.title}
                        </div>
                        <div
                          className={`text-[11px] leading-snug mt-1 ${
                            isActive ? 'text-neutral-600' : 'text-neutral-500'
                          }`}
                        >
                          {tab.sub}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Minimalist iPhone Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[400px] rounded-[54px] p-[11px] bg-gradient-to-b from-[#2A2A2E] via-[#1B1B1E] to-[#121214] shadow-[0_25px_90px_rgba(0,0,0,0.85)] border border-white/10">
              {/* Inner Screen Bezel */}
              <div className="bg-[#09090B] rounded-[44px] h-[720px] flex flex-col justify-between overflow-hidden border border-black relative">
                {/* Top iOS Status Bar + Dynamic Island */}
                <div>
                  <div className="px-7 pt-4 pb-2 flex items-center justify-between text-xs font-medium text-white">
                    <span className="tracking-tight font-semibold">5:02</span>
                    <div className="w-24 h-6 bg-black rounded-full" />
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] tracking-widest text-neutral-400">••••</span>
                      <Wifi className="w-3.5 h-3.5 text-white" />
                      <div className="w-5 h-2.5 border border-white/60 rounded-[3px] p-[1px] flex items-center">
                        <div className="w-full h-full bg-white rounded-[1px]" />
                      </div>
                    </div>
                  </div>

                  {/* App Bar Inside Phone */}
                  <div className="px-6 pt-3 pb-4 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-white/25 bg-[#121215] flex items-center justify-center font-mono text-[11px] font-bold tracking-tighter text-white">
                        GR
                      </div>
                      <span className="text-lg font-medium tracking-tight text-white">
                        {activeScreen === 'HOME' && 'Home'}
                        {activeScreen === 'INVENTORY' && 'Equipment'}
                        {activeScreen === 'SCAN' && 'Quick Scan'}
                        {activeScreen === 'TEAM' && 'Shift Roster'}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 font-normal">Unit 04</span>
                  </div>
                </div>

                {/* Toast notification inside phone */}
                {toastMessage && (
                  <div className="mx-5 mt-3 px-3.5 py-2.5 rounded-xl bg-white text-black text-xs font-medium flex items-center gap-2 shadow-lg">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{toastMessage}</span>
                  </div>
                )}

                {/* Screen Content Area */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {/* SCREEN 01: HOME */}
                  {activeScreen === 'HOME' && (
                    <>
                      {/* 2 Top Metric Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setActiveScreen('INVENTORY')}
                          className="bg-[#121214] hover:bg-[#17171A] transition-colors border border-white/[0.07] rounded-2xl p-4 cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-neutral-400 mb-3" />
                          <div className="text-2xl font-semibold text-white">{items.length}</div>
                          <div className="text-xs text-neutral-500 mt-1">Total Tracked Items</div>
                        </div>

                        <div
                          onClick={() => setActiveScreen('SCAN')}
                          className="bg-[#121214] hover:bg-[#17171A] transition-colors border border-white/[0.07] rounded-2xl p-4 cursor-pointer"
                        >
                          <Clock className="w-4 h-4 text-neutral-400 mb-3" />
                          <div className="text-2xl font-semibold text-white">{checkedOutCount}</div>
                          <div className="text-xs text-neutral-500 mt-1">Checked Out Now</div>
                        </div>
                      </div>

                      {/* Equipment Availability Card */}
                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="font-medium text-white">Equipment Availability</span>
                          <span className="text-neutral-400">
                            {availableCount} of {items.length} Ready
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${(availableCount / items.length) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-3">
                          <span>Ready in Room: {availableCount}</span>
                          <span>On Patrol / Field: {checkedOutCount}</span>
                        </div>
                      </div>

                      {/* Recent Activity List */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-sm font-medium text-white">Recent Activity</span>
                          <span className="text-[11px] text-neutral-500">Tap item to toggle</span>
                        </div>

                        <div className="space-y-2">
                          {items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleItemStatus(item.id)}
                              className="bg-[#121214] hover:bg-[#17171A] border border-white/[0.07] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
                            >
                              <div>
                                <div className="text-xs font-medium text-white">{item.name}</div>
                                <div className="text-[11px] text-neutral-500 mt-0.5">
                                  {item.tag} · {item.assignedTo}
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                                    item.status === 'Available'
                                      ? 'bg-white/10 text-white border-white/20'
                                      : 'bg-transparent text-neutral-400 border-white/10'
                                  }`}
                                >
                                  {item.status}
                                </span>
                                <div className="text-[10px] text-neutral-600 mt-1">
                                  {item.updatedAgo}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SCREEN 02: INVENTORY */}
                  {activeScreen === 'INVENTORY' && (
                    <>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={phoneSearch}
                          onChange={(e) => setPhoneSearch(e.target.value)}
                          placeholder="Search gear, tag, or officer..."
                          className="w-full bg-[#121214] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
                        />
                      </div>

                      <div className="space-y-2">
                        {filteredPhoneItems.map((item) => {
                          const expanded = selectedItemId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItemId(expanded ? null : item.id)}
                              className="bg-[#121214] border border-white/[0.07] rounded-2xl p-3.5 cursor-pointer transition-colors hover:border-white/20"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-white">{item.name}</div>
                                  <div className="text-[11px] text-neutral-500 mt-0.5">
                                    {item.tag} · {item.assignedTo}
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                                    item.status === 'Available'
                                      ? 'bg-white text-black border-white font-semibold'
                                      : 'bg-transparent text-neutral-300 border-white/15'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              {expanded && (
                                <div className="mt-3 pt-3 border-t border-white/[0.07] text-[11px] text-neutral-400 space-y-1.5">
                                  <div className="flex justify-between">
                                    <span>Category:</span>
                                    <span className="text-white">{item.category}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Current Holder:</span>
                                    <span className="text-white">{item.assignedTo}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItemStatus(item.id);
                                    }}
                                    className="w-full mt-2 py-2 rounded-lg bg-white text-black font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                                  >
                                    {item.status === 'Available'
                                      ? '1-Tap Check Out'
                                      : '1-Tap Return Item'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* SCREEN 03: QUICK SCAN */}
                  {activeScreen === 'SCAN' && (
                    <div className="space-y-4">
                      <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 rounded-2xl border border-white/20 bg-white/[0.03] mx-auto flex items-center justify-center mb-4">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-sm font-medium text-white">
                          Point & Shoot Check-Out
                        </div>
                        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                          Point your phone camera at any barcode, QR sticker, or serial tag to check
                          gear in or out in under a second.
                        </p>

                        <button
                          onClick={handleQuickScan}
                          className="mt-5 w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Simulate Camera Scan
                        </button>
                      </div>

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 space-y-2.5 text-xs">
                        <div className="flex justify-between text-neutral-400">
                          <span>Logged-In User</span>
                          <span className="text-white font-medium">Sgt. J. Mercer</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Scan Mode</span>
                          <span className="text-white">Auto Check-Out / Return</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Works Offline</span>
                          <span className="text-white">Yes (Auto-Syncs)</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 04: TEAM & PREFERENCES */}
                  {activeScreen === 'TEAM' && (
                    <div className="space-y-3">
                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 space-y-3">
                        <div className="text-xs font-medium text-white">On-Duty Shift Roster</div>
                        {[
                          { name: 'Sgt. M. Vance', role: 'Squad Leader', count: '1 item out' },
                          { name: 'Ofc. K. Alverez', role: 'Patrol Unit 14', count: '1 item out' },
                          { name: 'Sgt. J. Mercer', role: 'Armory Lead', count: 'All returned' },
                        ].map((member) => (
                          <div
                            key={member.name}
                            className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs"
                          >
                            <div>
                              <div className="text-white font-medium">{member.name}</div>
                              <div className="text-[11px] text-neutral-500">{member.role}</div>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-300">
                              {member.count}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">
                            End-of-Shift Reminders
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Notify officers when gear is still out
                          </div>
                        </div>
                        <button
                          onClick={() => setAutoReminders(!autoReminders)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            autoReminders ? 'bg-white' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              autoReminders
                                ? 'bg-black translate-x-4'
                                : 'bg-neutral-400 translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">Offline Field Mode</div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Keep scanning with zero cell service
                          </div>
                        </div>
                        <button
                          onClick={() => setOfflineSync(!offlineSync)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            offlineSync ? 'bg-white' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              offlineSync
                                ? 'bg-black translate-x-4'
                                : 'bg-neutral-400 translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <button
                        onClick={() => showToast('Shift inventory PDF report downloaded.')}
                        className="w-full py-3 rounded-xl border border-white/20 hover:bg-white hover:text-black text-white font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Export 1-Click Shift Report
                      </button>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Tab Bar Inside Phone */}
                <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#0B0B0D] grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'HOME', label: 'Home', icon: Home },
                      { id: 'INVENTORY', label: 'Items', icon: Folder },
                      { id: 'SCAN', label: 'Scan', icon: ScanLine },
                      { id: 'TEAM', label: 'Team', icon: Users },
                    ] as const
                  ).map((nav) => {
                    const active = activeScreen === nav.id;
                    const Icon = nav.icon;
                    return (
                      <button
                        key={nav.id}
                        onClick={() => setActiveScreen(nav.id)}
                        className={`flex flex-col items-center gap-1 py-1 cursor-pointer transition-colors ${
                          active ? 'text-white' : 'text-neutral-600 hover:text-neutral-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{nav.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SECTION 02: USER-FRIENDLY APPEAL */}
      <section
        id="features"
        className="border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase mb-4">
            02. BUILT FOR SPEED & SIMPLICITY
          </div>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
            So intuitive your team will{' '}
            <span className="italic text-neutral-400">actually enjoy</span> using it.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Zero Training Required',
              desc: 'Designed like a modern consumer app—not a 1990s government database. Any officer or soldier can learn it in 60 seconds.',
            },
            {
              num: '02',
              title: '1-Tap Check-In & Out',
              desc: 'Scan a barcode with your phone camera and tap once to assign rifles, radios, vehicles, or medical kits.',
            },
            {
              num: '03',
              title: 'Instant Who-Has-What',
              desc: 'Type any serial number, vehicle unit, or officer name to see exactly who has an item and when it was checked out.',
            },
            {
              num: '04',
              title: 'Automatic Shift Reports',
              desc: 'Stop typing up end-of-shift inventory logs by hand. Export clean, ready-to-share PDF handoff reports in one tap.',
            },
          ].map((item) => (
            <div
              key={item.num}
              className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between min-h-[240px]"
            >
              <span className="font-mono text-xs text-neutral-500">{item.num}</span>
              <div>
                <h3 className="font-mono text-sm font-semibold tracking-wider uppercase text-white mb-2.5">
                  {item.title}
                </h3>
                <p className="text-sm text-neutral-400 leading-relaxed font-light">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 03: EVERYDAY WORKFLOW */}
      <section
        id="workflow"
        className="border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase">
              03. GOODBYE CLIPBOARDS & SPREADSHEETS
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
              Turn a two-hour gear count into a{' '}
              <span className="italic text-neutral-400">two-minute walk-through.</span>
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed font-light max-w-xl">
              Whether you are running morning shift change at a busy police precinct or managing
              equipment across a battalion armory, GovRoute gets your people out of the supply room
              and back to the mission.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { label: 'SETUP TIME', value: 'Import CSV in 5 Minutes' },
              { label: 'HARDWARE NEEDED', value: 'Any iPhone, iPad, or Android' },
              { label: 'CHECK-OUT SPEED', value: 'Under 2 Seconds per Item' },
              { label: 'CELL SERVICE REQUIRED', value: 'Works 100% Offline in Field' },
            ].map((spec) => (
              <div
                key={spec.label}
                className="bg-[#0B0B0D] border border-white/[0.08] rounded-2xl p-6"
              >
                <div className="font-mono text-[10px] tracking-[0.18em] text-neutral-500 uppercase">
                  {spec.label}
                </div>
                <div className="font-mono text-sm text-white mt-2 font-medium">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MINIMALIST FOOTER */}
      <footer className="border-t border-white/[0.08] py-12">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
          <div>GOVROUTE INC. · VETERAN-FOUNDED · BUILT FOR MILITARY & LAW ENFORCEMENT</div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setWaitlistSubmitted(false);
                setWaitlistOpen(true);
              }}
              className="hover:text-white transition-colors uppercase cursor-pointer"
            >
              JOIN WAITLIST ↗
            </button>
          </div>
        </div>
      </footer>

      {/* CLEAN MINIMALIST WAITLIST MODAL */}
      {waitlistOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0C0E] border border-white/15 rounded-3xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setWaitlistOpen(false)}
              className="absolute top-6 right-6 text-neutral-500 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {waitlistSubmitted ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-10 h-10 rounded-full bg-white text-black mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="font-serif-editorial text-3xl text-white">You’re on the list</h3>
                <p className="text-sm text-neutral-400 font-light">
                  We have registered <span className="text-white">{waitlistEmail}</span> (
                  {waitlistOrg}) for early access.
                </p>
                <button
                  onClick={() => setWaitlistOpen(false)}
                  className="mt-2 w-full py-3 rounded-xl bg-white text-black font-mono text-xs font-semibold uppercase tracking-widest cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setWaitlistSubmitted(true);
                }}
                className="space-y-5"
              >
                <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase">
                  EARLY ACCESS
                </div>
                <h3 className="font-serif-editorial text-3xl text-white font-normal">
                  Join the GovRoute Waitlist
                </h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Get early access for your military unit or law enforcement department. Set up
                  takes less than 5 minutes.
                </p>

                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                    TEAM / DEPARTMENT
                  </label>
                  <select
                    value={waitlistOrg}
                    onChange={(e) => setWaitlistOrg(e.target.value)}
                    className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option>Law Enforcement Department</option>
                    <option>Military Unit / Armory</option>
                    <option>National Guard / Reserve</option>
                    <option>Federal / State Agency</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                    WORK EMAIL
                  </label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="you@department.gov"
                    className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                >
                  Join Waitlist ↗
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
