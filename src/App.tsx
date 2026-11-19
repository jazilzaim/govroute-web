import React, { useState, useRef, useEffect } from 'react';
import {
  Home,
  Folder,
  ScanLine,
  Users,
  ArrowUpRight,
  Check,
  Search,
  QrCode,
  Globe,
  Lock,
  Download,
  Package,
  Clock,
  ChevronDown,
  Shield,
  Plane,
  BadgeCheck,
  LogIn,
  LogOut,
  LayoutDashboard,
} from 'lucide-react';
import { trackEvent } from './lib/firebase';
import { useAuth } from './context/AuthContext';
import { AuthModal, type AuthModalMode } from './components/AuthModal';
import { DashboardWorkspace } from './components/DashboardWorkspace';
import { usePwaInstall } from './hooks/usePwaInstall';
import { TacticalScene3D } from './components/TacticalScene3D';
import { Tilt3DCard, Reveal3D, ScrollKeyframeHud } from './components/Spatial3D';

type ScreenTab = 'HOME' | 'INVENTORY' | 'SCAN' | 'TEAM';
type IndustryId = 'DEFENSE' | 'LAW_ENFORCEMENT' | 'AVIATION';

interface InventoryItem {
  id: string;
  name: string;
  tag: string;
  category: string;
  status: 'Available' | 'Checked Out';
  assignedTo: string;
  updatedAgo: string;
}

interface IndustryProfile {
  id: IndustryId;
  name: string;
  shortTag: string;
  unitLabel: string;
  defaultHolder: string;
  returnLocation: string;
  headline: string;
  headlineItalic: string;
  summary: string;
  roster: { name: string; role: string; count: string }[];
  benefits: { num: string; title: string; desc: string }[];
  metrics: { label: string; value: string }[];
  sampleItems: InventoryItem[];
}

const INDUSTRIES: Record<IndustryId, IndustryProfile> = {
  DEFENSE: {
    id: 'DEFENSE',
    name: 'Defense',
    shortTag: 'Armories, Battalions & Field Units',
    unitLabel: '1st Bn Armory',
    defaultHolder: 'Sgt. J. Mercer',
    returnLocation: 'Armory Vault A4',
    headline: 'Built for the armory, supply room, and',
    headlineItalic: 'daily unit operations.',
    summary:
      'Replace paper hand-receipts and multi-hour equipment counts with an installable web app every service member and supply specialist can launch in any browser—whether in the armory or out on training.',
    roster: [
      { name: 'Sgt. M. Vance', role: '1st Squad Leader', count: '1 item out' },
      { name: 'Cpl. A. Thorne', role: 'Comms Specialist', count: '1 item out' },
      { name: 'Sgt. J. Mercer', role: 'Unit Armorer', count: 'All returned' },
    ],
    benefits: [
      {
        num: '01',
        title: 'Rapid Sensitive-Item Counts',
        desc: 'Complete 100% serialized weapon, optic, and night-vision inventory sweeps in minutes using any browser-enabled device camera.',
      },
      {
        num: '02',
        title: 'Digital Hand Receipts',
        desc: 'Issue rifles, radios, and field kits to squads in one tap—eliminating messy clipboards and lost paper sign-out sheets.',
      },
      {
        num: '03',
        title: '100% Offline PWA Mode',
        desc: 'Keep checking gear in and out during austere training exercises or deployments with offline service-worker caching.',
      },
      {
        num: '04',
        title: 'Change-of-Command Ready',
        desc: 'Export clean, timestamped unit property logs in a single click for inspections and leadership handoffs.',
      },
    ],
    metrics: [
      { label: 'VAULT COUNT SPEED', value: 'Under 3 Minutes' },
      { label: 'FIELD CONNECTIVITY', value: 'Works 100% Offline' },
      { label: 'GEAR TRACKED', value: 'Weapons, Optics, Comms & Fleet' },
      { label: 'TRAINING REQUIRED', value: 'Under 60 Seconds' },
    ],
    sampleItems: [
      {
        id: 'def-1',
        name: 'M4A1 SOPMOD Carbine',
        tag: 'SN #994102',
        category: 'Weapons & Optics',
        status: 'Available',
        assignedTo: 'Armory Rack A4',
        updatedAgo: '2m ago',
      },
      {
        id: 'def-2',
        name: 'AN/PVS-31B Night Vision',
        tag: 'SN #44019',
        category: 'Weapons & Optics',
        status: 'Checked Out',
        assignedTo: 'Sgt. M. Vance',
        updatedAgo: '14m ago',
      },
      {
        id: 'def-3',
        name: 'AN/PRC-163 Tactical Radio',
        tag: 'SN #009481',
        category: 'Comms',
        status: 'Checked Out',
        assignedTo: 'Cpl. A. Thorne',
        updatedAgo: '38m ago',
      },
      {
        id: 'def-4',
        name: 'JLTV Utility Vehicle #08',
        tag: 'BUMPER #412',
        category: 'Motor Pool',
        status: 'Available',
        assignedTo: 'Motor Pool Bay 2',
        updatedAgo: '1h ago',
      },
      {
        id: 'def-5',
        name: 'Squad Combat Lifesaver Bag',
        tag: 'KIT #3081',
        category: 'Medical',
        status: 'Available',
        assignedTo: 'Supply Cage B',
        updatedAgo: '2h ago',
      },
    ],
  },
  LAW_ENFORCEMENT: {
    id: 'LAW_ENFORCEMENT',
    name: 'Law Enforcement',
    shortTag: 'Precincts, Patrol & SWAT Divisions',
    unitLabel: 'Metro Precinct 04',
    defaultHolder: 'Ofc. M. Delgado',
    returnLocation: 'Quartermaster Locker 02',
    headline: 'Faster shift changes so officers spend less time at the',
    headlineItalic: 'equipment window.',
    summary:
      'Get patrol officers out of the supply room and onto the street. Scan out body cameras, tasers, patrol rifles, and cruiser keys at roll call in seconds with automatic end-of-shift return reminders.',
    roster: [
      { name: 'Ofc. K. Alverez', role: 'Patrol Unit 14', count: '1 item out' },
      { name: 'Sgt. D. Brooks', role: 'SWAT Team Lead', count: '1 item out' },
      { name: 'Ofc. M. Delgado', role: 'Day Shift Quartermaster', count: 'All returned' },
    ],
    benefits: [
      {
        num: '01',
        title: '10-Second Roll Call Issue',
        desc: 'Scan radios, body-worn cameras, tasers, and cruiser keys in a single tap so shift changes never bottleneck.',
      },
      {
        num: '02',
        title: 'Cruiser & SWAT Kit Tracking',
        desc: 'Track gear assigned to specific patrol vehicles, K9 units, or SWAT trucks alongside individual officer loadouts.',
      },
      {
        num: '03',
        title: 'Automatic Shift Reminders',
        desc: 'Automatically notify officers at the end of their tour if a radio, rifle, or key ring has not been checked back in.',
      },
      {
        num: '04',
        title: 'Effortless Precinct Audits',
        desc: 'Maintain a clean, searchable custody history for every piece of department equipment without touching a spreadsheet.',
      },
    ],
    metrics: [
      { label: 'ROLL CALL CHECK-OUT', value: 'Under 2 Seconds / Item' },
      { label: 'UNRETURNED GEAR', value: 'Automated Shift Alerts' },
      { label: 'GEAR TRACKED', value: 'Radios, BWCs, Rifles & Cruisers' },
      { label: 'SETUP TIME', value: 'Import Roster in 5 Mins' },
    ],
    sampleItems: [
      {
        id: 'le-1',
        name: 'Axon Body 4 Camera',
        tag: 'BWC #1042',
        category: 'Patrol Electronics',
        status: 'Available',
        assignedTo: 'Docking Bay 03',
        updatedAgo: '4m ago',
      },
      {
        id: 'le-2',
        name: 'Patrol Interceptor SUV #14',
        tag: 'UNIT #819',
        category: 'Fleet Vehicles',
        status: 'Checked Out',
        assignedTo: 'Ofc. K. Alverez',
        updatedAgo: '22m ago',
      },
      {
        id: 'le-3',
        name: 'Lenco BearCat SWAT Kit',
        tag: 'TAC #409',
        category: 'SWAT & Ballistics',
        status: 'Checked Out',
        assignedTo: 'Sgt. D. Brooks',
        updatedAgo: '49m ago',
      },
      {
        id: 'le-4',
        name: 'Motorola APX 8000 Radio',
        tag: 'RAD #9481',
        category: 'Comms',
        status: 'Available',
        assignedTo: 'Charging Rack A',
        updatedAgo: '1h ago',
      },
      {
        id: 'le-5',
        name: 'Taser 10 & Duty Holster',
        tag: 'CEW #7712',
        category: 'Less-Lethal',
        status: 'Available',
        assignedTo: 'Armory Locker 09',
        updatedAgo: '3h ago',
      },
    ],
  },
  AVIATION: {
    id: 'AVIATION',
    name: 'Aviation',
    shortTag: 'Hangar Tool Cribs, FOD & Flight Line',
    unitLabel: 'Hangar Bay 02',
    defaultHolder: 'Tech R. Vance (A&P)',
    returnLocation: 'Tool Crib Shadowboard B',
    headline: 'Total tool accountability and FOD prevention from the',
    headlineItalic: 'hangar to the flight line.',
    summary:
      'Never delay a sortie or flight over a missing tool or misplaced rotable part. Track calibrated torque wrenches, avionics test kits, and ground support equipment across every aircraft tail number.',
    roster: [
      { name: 'M. Chen (A&P Lead)', role: 'Tail #N402GX Crew', count: '1 item out' },
      { name: 'Capt. L. Miller', role: 'Flight Line Ops', count: '1 item out' },
      { name: 'R. Vance', role: 'Tool Crib Coordinator', count: 'All returned' },
    ],
    benefits: [
      {
        num: '01',
        title: 'Zero-FOD Tool Verification',
        desc: 'Sign toolboxes and shadowboards out to a specific aircraft tail number—and verify 100% tool return before aircraft release.',
      },
      {
        num: '02',
        title: 'Calibration & Expiry Alerts',
        desc: 'Automatically flag torque wrenches, pitot-static testers, and life rafts before their calibration or inspection dates expire.',
      },
      {
        num: '03',
        title: 'AOG & Rotable Spares Lookup',
        desc: 'Search any part number or serial tag from the tarmac to see which hangar bay or supply shelf has the part in stock.',
      },
      {
        num: '04',
        title: 'GSE & Tarmac Tracking',
        desc: 'Know which flight crew or maintenance bay currently has every tug, GPU power cart, borescope, and headset kit.',
      },
    ],
    metrics: [
      { label: 'FOD CLEARANCE CHECK', value: '100% Tail-Number Linked' },
      { label: 'CALIBRATION TRACKING', value: 'Automated Due-Date Alerts' },
      { label: 'GEAR TRACKED', value: 'Tool Cribs, Rotables & GSE' },
      { label: 'DEVICE SUPPORT', value: 'Any Browser · Installable PWA' },
    ],
    sampleItems: [
      {
        id: 'av-1',
        name: 'Snap-On Digital Torque Wrench',
        tag: 'CAL #TW-882',
        category: 'Calibrated Tools',
        status: 'Available',
        assignedTo: 'Shadowboard A1',
        updatedAgo: '5m ago',
      },
      {
        id: 'av-2',
        name: 'Olympus Turbine Borescope Kit',
        tag: 'NDT #4019',
        category: 'Inspection Gear',
        status: 'Checked Out',
        assignedTo: 'M. Chen · Tail #402',
        updatedAgo: '18m ago',
      },
      {
        id: 'av-3',
        name: '28V Ground Power Unit (GPU)',
        tag: 'GSE #109',
        category: 'Ground Support',
        status: 'Checked Out',
        assignedTo: 'Capt. L. Miller · Ramp 3',
        updatedAgo: '35m ago',
      },
      {
        id: 'av-4',
        name: 'Garmin G5000 Avionics LRU',
        tag: 'P/N #011-042',
        category: 'Rotable Spares',
        status: 'Available',
        assignedTo: 'Bonded Cage 04',
        updatedAgo: '1h ago',
      },
      {
        id: 'av-5',
        name: 'RVSM Pitot-Static Test Box',
        tag: 'CAL #PS-210',
        category: 'Avionics Test',
        status: 'Available',
        assignedTo: 'Tool Crib Bay 2',
        updatedAgo: '2h ago',
      },
    ],
  },
};

export function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();

  const [selectedIndustry, setSelectedIndustry] = useState<IndustryId>('DEFENSE');
  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);
  const sectionDropdownRef = useRef<HTMLDivElement>(null);
  const accountDropdownRef = useRef<HTMLDivElement>(null);

  const [activeView, setActiveView] = useState<'landing' | 'workspace'>('landing');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');
  const prevUserIdRef = useRef<string | null>(null);

  const [activeScreen, setActiveScreen] = useState<ScreenTab>('HOME');
  const [itemsByIndustry, setItemsByIndustry] = useState<Record<IndustryId, InventoryItem[]>>({
    DEFENSE: INDUSTRIES.DEFENSE.sampleItems,
    LAW_ENFORCEMENT: INDUSTRIES.LAW_ENFORCEMENT.sampleItems,
    AVIATION: INDUSTRIES.AVIATION.sampleItems,
  });

  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [autoReminders, setAutoReminders] = useState(true);
  const [offlineSync, setOfflineSync] = useState(true);

  const currentProfile = INDUSTRIES[selectedIndustry];
  const items = itemsByIndustry[selectedIndustry];
  const availableCount = items.filter((i) => i.status === 'Available').length;
  const checkedOutCount = items.filter((i) => i.status === 'Checked Out').length;

  const userDisplayName =
    (user?.user_metadata?.full_name as string | undefined)?.trim() ||
    user?.email?.split('@')[0] ||
    '';

  const userInitials = userDisplayName
    ? userDisplayName
        .split(/\s+/)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'OP';

  // Switch cleanly into workspace on login / restored session, and back to landing on sign-out
  useEffect(() => {
    const currentUserId = user?.id ?? null;
    if (currentUserId && prevUserIdRef.current !== currentUserId) {
      setActiveView('workspace');
      const metaSector = user?.user_metadata?.sector as string | undefined;
      if (metaSector === 'Law Enforcement') {
        setSelectedIndustry('LAW_ENFORCEMENT');
      } else if (metaSector === 'Aviation') {
        setSelectedIndustry('AVIATION');
      } else if (metaSector === 'Defense') {
        setSelectedIndustry('DEFENSE');
      }
    } else if (!currentUserId && prevUserIdRef.current) {
      setActiveView('landing');
      setAccountDropdownOpen(false);
    }
    prevUserIdRef.current = currentUserId;
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target as Node)) {
        setNavDropdownOpen(false);
      }
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(e.target as Node)) {
        setSectionDropdownOpen(false);
      }
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(e.target as Node)) {
        setAccountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuthModal = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    trackEvent('open_auth_modal', { mode });
  };

  const handleSignOut = async () => {
    setAccountDropdownOpen(false);
    await signOut();
    setActiveView('landing');
    trackEvent('auth_logout', {});
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  const handleInstallPwa = async () => {
    const outcome = await promptInstall();
    trackEvent('pwa_install_click', { outcome });
    if (outcome === 'accepted') {
      showToast('GovRoute PWA installed');
    } else if (outcome === 'unavailable') {
      showToast('Use your browser menu to Install App / Add to Home Screen');
    }
  };

  const handleSelectIndustry = (industry: IndustryId, scrollToSection = false) => {
    setSelectedIndustry(industry);
    setSelectedItemId(null);
    setNavDropdownOpen(false);
    setSectionDropdownOpen(false);
    trackEvent('select_industry', { industry });
    showToast(`Loaded ${INDUSTRIES[industry].name} inventory preset`);
    if (scrollToSection) {
      if (activeView !== 'landing') {
        setActiveView('landing');
        setTimeout(() => {
          document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' });
        }, 60);
      } else {
        document.getElementById('industries')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleScreenChange = (screen: ScreenTab) => {
    setActiveScreen(screen);
    trackEvent('select_preview_screen', { screen, industry: selectedIndustry });
  };

  const toggleItemStatus = (id: string, holderOverride?: string) => {
    const holderName = holderOverride || userDisplayName || currentProfile.defaultHolder;
    setItemsByIndustry((prev) => ({
      ...prev,
      [selectedIndustry]: prev[selectedIndustry].map((item) => {
        if (item.id !== id) return item;
        const nextStatus = item.status === 'Available' ? 'Checked Out' : 'Available';
        trackEvent('demo_inventory_toggle', {
          industry: selectedIndustry,
          item_name: item.name,
          next_status: nextStatus,
        });
        showToast(
          nextStatus === 'Checked Out'
            ? `Checked out ${item.name} to ${holderName}`
            : `Returned ${item.name} to ${currentProfile.returnLocation}`
        );
        return {
          ...item,
          status: nextStatus,
          assignedTo:
            nextStatus === 'Checked Out' ? holderName : currentProfile.returnLocation,
          updatedAgo: 'Just now',
        };
      }),
    }));
  };

  const handleAddItem = (
    industry: IndustryId,
    newItem: Omit<InventoryItem, 'id' | 'updatedAgo'>
  ) => {
    setItemsByIndustry((prev) => ({
      ...prev,
      [industry]: [
        {
          ...newItem,
          id: `${industry.toLowerCase()}-${Date.now()}`,
          updatedAgo: 'Just now',
        },
        ...prev[industry],
      ],
    }));
  };

  const handleQuickScan = () => {
    const target = items.find((i) => i.status === 'Available') || items[0];
    trackEvent('demo_camera_scan', { industry: selectedIndustry, item_name: target.name });
    toggleItemStatus(target.id);
  };

  const filteredPhoneItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      i.tag.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      i.assignedTo.toLowerCase().includes(phoneSearch.toLowerCase())
  );

  const getIndustryIcon = (id: IndustryId) => {
    switch (id) {
      case 'DEFENSE':
        return <Shield className="w-4 h-4" />;
      case 'LAW_ENFORCEMENT':
        return <BadgeCheck className="w-4 h-4" />;
      case 'AVIATION':
        return <Plane className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white bg-minimal-grid relative">
      {/* TOP MINIMALIST NAVIGATION BAR */}
      <header className="border-b border-white/[0.08] bg-[#060606]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 h-20 flex items-center justify-between">
          {/* Left Brand */}
          <a
            href="#preview"
            onClick={(e) => {
              if (activeView === 'workspace') {
                e.preventDefault();
                setActiveView('landing');
              }
            }}
            className="flex items-center gap-3.5"
          >
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
                DEFENSE · LAW ENFORCEMENT · AVIATION
              </div>
            </div>
          </a>

          {/* Center Numbered Links + Industries Dropdown */}
          <nav className="hidden xl:flex items-center gap-9 font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
            <a
              href="#preview"
              onClick={() => setActiveView('landing')}
              className="hover:text-white transition-colors leading-relaxed"
            >
              <span className="block text-neutral-500">01. THE</span>
              <span>APP</span>
            </a>

            <a
              href="#features"
              onClick={() => setActiveView('landing')}
              className="hover:text-white transition-colors leading-relaxed"
            >
              <span className="block text-neutral-500">02. BUILT FOR</span>
              <span>SPEED</span>
            </a>

            {/* 03. INDUSTRIES DROPDOWN */}
            <div className="relative" ref={navDropdownRef}>
              <button
                onClick={() => setNavDropdownOpen((prev) => !prev)}
                className="hover:text-white transition-colors leading-relaxed text-left uppercase cursor-pointer flex items-end gap-1.5 group"
              >
                <div>
                  <span className="block text-neutral-500">03. SELECT</span>
                  <span className="text-white">INDUSTRIES ({currentProfile.name})</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 mb-0.5 text-neutral-400 transition-transform ${
                    navDropdownOpen ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {navDropdownOpen && (
                <div className="absolute left-0 mt-4 w-72 rounded-2xl bg-[#0C0C0E] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 z-50">
                  <div className="px-3 py-2 text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase border-b border-white/[0.06]">
                    SELECT SECTOR TO PREVIEW
                  </div>
                  {(Object.keys(INDUSTRIES) as IndustryId[]).map((id, idx) => {
                    const ind = INDUSTRIES[id];
                    const active = selectedIndustry === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleSelectIndustry(id, true)}
                        className={`w-full text-left px-3.5 py-3 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer mt-1 ${
                          active
                            ? 'bg-white text-black'
                            : 'text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <span
                            className={`mt-0.5 ${
                              active ? 'text-black' : 'text-neutral-400'
                            }`}
                          >
                            {getIndustryIcon(id)}
                          </span>
                          <div>
                            <div className="font-mono text-xs font-bold tracking-wider uppercase">
                              0{idx + 1}. {ind.name}
                            </div>
                            <div
                              className={`text-[10px] tracking-normal normal-case font-sans mt-0.5 ${
                                active ? 'text-neutral-700' : 'text-neutral-400'
                              }`}
                            >
                              {ind.shortTag}
                            </div>
                          </div>
                        </div>
                        {active && <Check className="w-3.5 h-3.5 shrink-0 mt-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <a
              href="#workflow"
              onClick={() => setActiveView('landing')}
              className="hover:text-white transition-colors leading-relaxed"
            >
              <span className="block text-neutral-500">04. HOW IT</span>
              <span>WORKS</span>
            </a>

            <button
              onClick={() => (user ? setActiveView('workspace') : openAuthModal('signup'))}
              className="hover:text-white transition-colors leading-relaxed text-left uppercase cursor-pointer"
            >
              <span className="block text-neutral-500">05. GET</span>
              <span>STARTED</span>
            </button>
          </nav>

          {/* Right Auth & CTA Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveView((prev) => (prev === 'workspace' ? 'landing' : 'workspace'))
                  }
                  className={`rounded-xl px-4 py-2.5 font-mono text-[11px] font-semibold tracking-[0.14em] uppercase flex items-center gap-2 transition-colors cursor-pointer border ${
                    activeView === 'workspace'
                      ? 'bg-white text-black border-white'
                      : 'bg-[#0C0C0E] text-white border-white/15 hover:border-white/35'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {activeView === 'workspace' ? 'Overview' : 'Workspace'}
                  </span>
                </button>

                <div className="relative" ref={accountDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setAccountDropdownOpen((prev) => !prev)}
                    className="rounded-xl border border-white/15 bg-[#0C0C0E] hover:border-white/35 pl-2.5 pr-3 py-2 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-white text-black font-mono text-[11px] font-bold flex items-center justify-center">
                      {userInitials}
                    </div>
                    <div className="hidden sm:block text-left max-w-[140px]">
                      <div className="text-xs font-medium text-white truncate leading-tight">
                        {userDisplayName}
                      </div>
                      <div className="font-mono text-[9px] text-neutral-500 uppercase tracking-wider truncate">
                        Signed In
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                        accountDropdownOpen ? 'rotate-180 text-white' : ''
                      }`}
                    />
                  </button>

                  {accountDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0C0C0E] border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 z-50">
                      <div className="px-3 py-2.5 border-b border-white/[0.06]">
                        <div className="text-xs font-medium text-white truncate">
                          {userDisplayName}
                        </div>
                        <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                          {user.email}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveView('workspace');
                          setAccountDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-neutral-200 hover:bg-white/[0.06] hover:text-white flex items-center gap-2.5 mt-1 cursor-pointer transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Open Inventory Workspace</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2.5 rounded-xl text-xs text-neutral-300 hover:bg-white/[0.06] hover:text-white flex items-center gap-2.5 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => openAuthModal('login')}
                  className="rounded-xl border border-white/15 bg-[#0C0C0E] hover:border-white/35 hover:text-white text-neutral-200 px-4 sm:px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  disabled={authLoading}
                  onClick={() => openAuthModal('signup')}
                  className="bg-white hover:bg-neutral-200 text-black rounded-xl px-5 py-3 font-mono text-[11px] font-semibold tracking-[0.16em] uppercase flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <span>Sign Up</span>
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {user && activeView === 'workspace' ? (
        <DashboardWorkspace
          user={user}
          selectedIndustry={selectedIndustry}
          industries={INDUSTRIES}
          itemsByIndustry={itemsByIndustry}
          onSelectIndustry={(industry) => handleSelectIndustry(industry, false)}
          onToggleItemStatus={(itemId, actorName) => toggleItemStatus(itemId, actorName)}
          onAddItem={handleAddItem}
          onBackToOverview={() => setActiveView('landing')}
          onSignOut={handleSignOut}
        />
      ) : (
        <>
          <TacticalScene3D selectedIndustry={selectedIndustry} activeScreen={activeScreen} />
          <ScrollKeyframeHud />

      {/* HERO SECTION */}
      <main
        id="preview"
        className="relative z-10 max-w-[1340px] mx-auto px-6 sm:px-10 pt-14 pb-24 lg:pt-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* LEFT COLUMN: Editorial Headline, User-Friendly Copy & Screen Selector Cards */}
          <div className="lg:col-span-7 pt-2">
            {/* Top Rounded Pill Badge + Optional PWA Install Button */}
            <div className="flex flex-wrap items-center gap-3 mb-9">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.12] bg-[#0C0C0E] font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-300 uppercase">
                <span className="w-2 h-2 rounded-full bg-white" />
                <span>DEFENSE · LAW ENFORCEMENT · AVIATION · WEB APP (PWA)</span>
              </div>

              {canInstall && (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Install PWA</span>
                </button>
              )}

              {isInstalled && (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 font-mono text-[10px] tracking-[0.16em] text-emerald-300 uppercase">
                  <Check className="w-3 h-3" />
                  <span>PWA Installed</span>
                </div>
              )}
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
              with a fast, installable Progressive Web App your entire team can launch in any
              browser on day one—no app store required. Whether managing an armory, a police
              precinct, or an aviation hangar tool crib, scan any item with your device camera and
              see who has what in seconds.
            </p>

            {/* Quick Industry Switcher Bar right above the Web App Screen Selector */}
            <div className="mt-10 max-w-[650px] flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.18em] text-neutral-500 uppercase mr-2">
                PREVIEW INDUSTRY:
              </span>
              {(Object.keys(INDUSTRIES) as IndustryId[]).map((id) => {
                const active = selectedIndustry === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectIndustry(id, false)}
                    className={`px-3.5 py-1.5 rounded-full font-mono text-[11px] tracking-[0.14em] uppercase transition-all cursor-pointer border flex items-center gap-1.5 ${
                      active
                        ? 'bg-white text-black border-white font-semibold'
                        : 'bg-[#0C0C0E] text-neutral-400 border-white/10 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {getIndustryIcon(id)}
                    <span>{INDUSTRIES[id].name}</span>
                  </button>
                );
              })}
            </div>

            {/* Interactive Live Preview Selector Header */}
            <div className="mt-8 pt-2 max-w-[650px]">
              <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-500 uppercase mb-4">
                <span>
                  INTERACTIVE {currentProfile.name.toUpperCase()} PWA — SELECT VIEW:
                </span>
                <span className="hidden sm:inline text-neutral-500">
                  CLICK INSIDE WEB APP TO INTERACT →
                </span>
              </div>

              {/* 4 Selector Cards */}
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
                      onClick={() => handleScreenChange(tab.id)}
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

          {/* RIGHT COLUMN: Interactive 3D Spatial Progressive Web App Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <Tilt3DCard maxTilt={5} className="w-full max-w-[440px] rounded-[28px]">
              {/* Floating 3D Depth Badge (Top-Left) */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E0E11]/90 backdrop-blur-md border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.85)] absolute -left-8 top-14 z-20 pointer-events-none animate-float-3d">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-[9px] tracking-[0.18em] text-neutral-200 uppercase">
                  {availableCount}/{items.length} READY
                </span>
              </div>

              {/* Floating 3D Depth Badge (Bottom-Right) */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0E0E11]/90 backdrop-blur-md border border-white/15 shadow-[0_14px_40px_rgba(0,0,0,0.85)] absolute -right-6 bottom-20 z-20 pointer-events-none animate-float-3d-alt">
                <span className="font-mono text-[9px] tracking-[0.18em] text-neutral-300 uppercase">
                  SHA-256 · PWA CACHE
                </span>
              </div>

              <div className="w-full rounded-[28px] p-[1px] bg-gradient-to-b from-white/25 via-white/[0.1] to-white/[0.04] shadow-[0_30px_100px_rgba(0,0,0,0.9)]">
                {/* Inner PWA Window Shell */}
                <div className="bg-[#09090B]/90 backdrop-blur-xl rounded-[27px] h-[680px] flex flex-col justify-between overflow-hidden relative">
                {/* Top Minimalist Web App / PWA Chrome Bar */}
                <div>
                  <div className="px-4 py-3 bg-[#0E0E11] border-b border-white/[0.07] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                      <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                    </div>

                    <div className="flex-1 max-w-[220px] px-3 py-1 rounded-lg bg-[#16161A] border border-white/[0.07] flex items-center justify-center gap-1.5 font-mono text-[10px] text-neutral-400 truncate">
                      <Lock className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                      <span className="truncate">govroute-app.web.app</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleInstallPwa}
                      title={
                        isInstalled
                          ? 'Running as installed PWA'
                          : 'Install GovRoute as a Progressive Web App'
                      }
                      className="px-2.5 py-1 rounded-lg border border-white/15 bg-white/[0.04] hover:bg-white hover:text-black text-neutral-300 font-mono text-[9px] tracking-[0.14em] uppercase flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      {isInstalled ? (
                        <>
                          <Globe className="w-2.5 h-2.5" />
                          <span>PWA</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-2.5 h-2.5" />
                          <span>Install</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* App Bar Inside Web App */}
                  <div className="px-6 pt-3.5 pb-4 flex items-center justify-between border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl border border-white/25 bg-[#121215] flex items-center justify-center font-mono text-[11px] font-bold tracking-tighter text-white">
                        GR
                      </div>
                      <div>
                        <span className="text-base font-medium tracking-tight text-white block leading-none">
                          {activeScreen === 'HOME' && 'Home'}
                          {activeScreen === 'INVENTORY' && 'Equipment'}
                          {activeScreen === 'SCAN' && 'Quick Scan'}
                          {activeScreen === 'TEAM' && 'Shift Roster'}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-500 uppercase flex items-center gap-1.5 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{currentProfile.name} · Offline-Ready PWA</span>
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400 font-normal">
                      {currentProfile.unitLabel}
                    </span>
                  </div>
                </div>

                {/* Toast notification inside web app preview */}
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
                          onClick={() => handleScreenChange('INVENTORY')}
                          className="bg-[#121214] hover:bg-[#17171A] transition-colors border border-white/[0.07] rounded-2xl p-4 cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-neutral-400 mb-3" />
                          <div className="text-2xl font-semibold text-white">{items.length}</div>
                          <div className="text-xs text-neutral-500 mt-1">Total Tracked Items</div>
                        </div>

                        <div
                          onClick={() => handleScreenChange('SCAN')}
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
                          <span>Ready in Crib/Room: {availableCount}</span>
                          <span>Issued Out: {checkedOutCount}</span>
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
                          placeholder="Search item, tag, or holder..."
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
                          Point your device camera or barcode scanner at any QR sticker or serial
                          tag to check gear in or out right in the browser.
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
                          <span className="text-white font-medium">
                            {userDisplayName || currentProfile.defaultHolder}
                          </span>
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
                        <div className="text-xs font-medium text-white">
                          On-Duty {currentProfile.name} Roster
                        </div>
                        {currentProfile.roster.map((member) => (
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
                            Notify team when equipment is still out
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
                        onClick={() => {
                          trackEvent('export_shift_report', { industry: selectedIndustry });
                          showToast(`${currentProfile.name} shift report PDF downloaded.`);
                        }}
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
                        onClick={() => handleScreenChange(nav.id)}
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
            </Tilt3DCard>
          </div>
        </div>
      </main>

      {/* SECTION 02: USER-FRIENDLY APPEAL */}
      <section
        id="features"
        className="relative z-10 border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <Reveal3D>
          <div className="max-w-2xl mb-16">
            <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase mb-4">
              02. BUILT FOR SPEED & SIMPLICITY
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
              So intuitive your team will{' '}
              <span className="italic text-neutral-400">actually enjoy</span> using it.
            </h2>
          </div>
        </Reveal3D>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Zero Training Required',
              desc: 'Designed like a modern consumer app—not a 1990s government database. Any officer, soldier, or aviation tech can learn it in 60 seconds.',
            },
            {
              num: '02',
              title: '1-Tap Check-In & Out',
              desc: 'Scan a barcode with your device camera or USB/Bluetooth scanner and tap once to assign rifles, radios, patrol vehicles, or calibrated hangar tools.',
            },
            {
              num: '03',
              title: 'Instant Who-Has-What',
              desc: 'Type any serial number, tail number, vehicle unit, or team member name to see exactly who has an item and when it was checked out.',
            },
            {
              num: '04',
              title: 'Automatic Shift Reports',
              desc: 'Stop typing up end-of-shift inventory logs by hand. Export clean, ready-to-share PDF handoff reports in one tap.',
            },
          ].map((item, idx) => (
            <Reveal3D key={item.num} delayMs={idx * 75} className="h-full">
              <Tilt3DCard maxTilt={7} className="h-full rounded-2xl">
                <div className="h-full bg-[#0B0B0D]/80 backdrop-blur-md border border-white/[0.1] hover:border-white/25 transition-colors rounded-2xl p-7 flex flex-col justify-between min-h-[240px]">
                  <span className="font-mono text-xs text-neutral-500">{item.num}</span>
                  <div>
                    <h3 className="font-mono text-sm font-semibold tracking-wider uppercase text-white mb-2.5">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </Tilt3DCard>
            </Reveal3D>
          ))}
        </div>
      </section>

      {/* SECTION 03: INDUSTRIES DROPDOWN & SECTOR BENEFITS (DEFENSE, LAW ENFORCEMENT, AVIATION) */}
      <section
        id="industries"
        className="relative z-10 border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        {/* Top Row: Section Label + Interactive Industry Dropdown Selector */}
        <Reveal3D>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase mb-4">
                03. SECTORS WE SERVE — {currentProfile.name.toUpperCase()}
              </div>
              <h2 className="font-serif-editorial text-4xl sm:text-5xl lg:text-[56px] text-white font-normal leading-[1.08]">
                {currentProfile.headline}{' '}
                <span className="italic text-neutral-400">{currentProfile.headlineItalic}</span>
              </h2>
              <p className="mt-5 text-neutral-400 text-base sm:text-lg leading-relaxed font-light">
                {currentProfile.summary}
              </p>
            </div>

            {/* Interactive Sector Dropdown Control */}
            <div className="relative shrink-0" ref={sectionDropdownRef}>
              <div className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-2">
                CHOOSE INDUSTRY SECTOR:
              </div>
              <button
                onClick={() => setSectionDropdownOpen((prev) => !prev)}
                className="w-full sm:w-72 bg-white text-black rounded-2xl px-5 py-4 font-mono text-xs font-bold tracking-[0.16em] uppercase flex items-center justify-between gap-4 cursor-pointer shadow-[0_0_30px_rgba(255,255,255,0.12)]"
              >
                <span className="flex items-center gap-2.5">
                  {getIndustryIcon(selectedIndustry)}
                  <span>{currentProfile.name}</span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    sectionDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {sectionDropdownOpen && (
                <div className="absolute right-0 mt-2 w-full sm:w-80 rounded-2xl bg-[#0C0C0E]/95 backdrop-blur-xl border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 z-30">
                  {(Object.keys(INDUSTRIES) as IndustryId[]).map((id, idx) => {
                    const ind = INDUSTRIES[id];
                    const active = selectedIndustry === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleSelectIndustry(id, false)}
                        className={`w-full text-left px-4 py-3.5 rounded-xl transition-all flex items-start justify-between gap-3 cursor-pointer mt-1 first:mt-0 ${
                          active ? 'bg-white text-black' : 'text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-0.5 ${active ? 'text-black' : 'text-neutral-400'}`}>
                            {getIndustryIcon(id)}
                          </span>
                          <div>
                            <div className="font-mono text-xs font-bold tracking-wider uppercase">
                              0{idx + 1}. {ind.name}
                            </div>
                            <div
                              className={`text-xs mt-0.5 ${
                                active ? 'text-neutral-700' : 'text-neutral-400'
                              }`}
                            >
                              {ind.shortTag}
                            </div>
                          </div>
                        </div>
                        {active && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Reveal3D>

        {/* 4 Tailored Benefits Cards for the Selected Sector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {currentProfile.benefits.map((benefit, idx) => (
            <Reveal3D key={benefit.num} delayMs={idx * 75} className="h-full">
              <Tilt3DCard maxTilt={7} className="h-full rounded-2xl">
                <div className="h-full bg-[#0B0B0D]/80 backdrop-blur-md border border-white/[0.1] hover:border-white/25 transition-colors rounded-2xl p-7 flex flex-col justify-between min-h-[240px]">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-neutral-500">{benefit.num}</span>
                    <span className="font-mono text-[10px] tracking-widest uppercase text-neutral-500">
                      {currentProfile.name}
                    </span>
                  </div>
                  <div className="mt-6">
                    <h3 className="font-mono text-sm font-semibold tracking-wider uppercase text-white mb-2.5">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-neutral-400 leading-relaxed font-light">
                      {benefit.desc}
                    </p>
                  </div>
                </div>
              </Tilt3DCard>
            </Reveal3D>
          ))}
        </div>

        {/* Sector Impact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {currentProfile.metrics.map((m, idx) => (
            <Reveal3D key={m.label} delayMs={idx * 60}>
              <Tilt3DCard maxTilt={6} className="rounded-2xl">
                <div className="bg-[#0B0B0D]/80 backdrop-blur-md border border-white/[0.08] rounded-2xl p-5">
                  <div className="font-mono text-[10px] tracking-[0.18em] text-neutral-500 uppercase">
                    {m.label}
                  </div>
                  <div className="font-mono text-sm text-white mt-2 font-medium">{m.value}</div>
                </div>
              </Tilt3DCard>
            </Reveal3D>
          ))}
        </div>
      </section>

      {/* SECTION 04: EVERYDAY WORKFLOW */}
      <section
        id="workflow"
        className="relative z-10 border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <Reveal3D className="lg:col-span-6 space-y-6">
            <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase">
              04. GOODBYE CLIPBOARDS & SPREADSHEETS
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
              Turn a two-hour gear count into a{' '}
              <span className="italic text-neutral-400">two-minute walk-through.</span>
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed font-light max-w-xl">
              Whether you are running morning roll call at a police precinct, managing a battalion
              armory, or checking out calibrated tools on the flight line, GovRoute gets your people
              out of the supply room and back to the mission.
            </p>
          </Reveal3D>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { label: 'SETUP TIME', value: 'Import CSV in 5 Minutes' },
              { label: 'HARDWARE NEEDED', value: 'Any Browser · Installable PWA' },
              { label: 'CHECK-OUT SPEED', value: 'Under 2 Seconds per Item' },
              { label: 'OFFLINE SUPPORT', value: 'Works Offline via PWA Cache' },
            ].map((spec, idx) => (
              <Reveal3D key={spec.label} delayMs={idx * 70}>
                <Tilt3DCard maxTilt={7} className="rounded-2xl h-full">
                  <div className="h-full bg-[#0B0B0D]/80 backdrop-blur-md border border-white/[0.09] hover:border-white/25 transition-colors rounded-2xl p-6">
                    <div className="font-mono text-[10px] tracking-[0.18em] text-neutral-500 uppercase">
                      {spec.label}
                    </div>
                    <div className="font-mono text-sm text-white mt-2 font-medium">
                      {spec.value}
                    </div>
                  </div>
                </Tilt3DCard>
              </Reveal3D>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {/* MINIMALIST FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.08] py-12 bg-[#060606]/75 backdrop-blur-md">
        <div className="max-w-[1340px] mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] tracking-[0.16em] text-neutral-500 uppercase">
          <div>GOVROUTE INC. · DEFENSE · LAW ENFORCEMENT · AVIATION</div>
          <div className="flex items-center gap-6">
            {user ? (
              <button
                type="button"
                onClick={() => setActiveView('workspace')}
                className="hover:text-white transition-colors uppercase cursor-pointer"
              >
                OPEN WORKSPACE ↗
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="hover:text-white transition-colors uppercase cursor-pointer"
                >
                  LOG IN
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-white hover:text-neutral-300 transition-colors uppercase cursor-pointer"
                >
                  SIGN UP ↗
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

      {/* SUPABASE AUTH MODAL (LOGIN & SIGN UP) */}
      <AuthModal
        open={authModalOpen}
        initialMode={authModalMode}
        defaultSector={currentProfile.name}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={() => {
          setAuthModalOpen(false);
          setActiveView('workspace');
        }}
      />
    </div>
  );
}

export default App;
