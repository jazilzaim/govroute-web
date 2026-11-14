import React, { useState } from 'react';
import {
  Home,
  Folder,
  ScanLine,
  Settings,
  Lock,
  Shield,
  ArrowUpRight,
  Check,
  Search,
  QrCode,
  Wifi,
  Battery,
  ChevronRight,
  RefreshCw,
  X,
} from 'lucide-react';

type ScreenTab = 'HOME' | 'ASSETS' | 'SCAN' | 'SETTINGS';

interface InventoryItem {
  id: string;
  name: string;
  serial: string;
  nsn: string;
  category: 'Weapons' | 'Optics' | 'Fleet' | 'Comms';
  status: 'In Vault' | 'Issued';
  custodian: string;
  timestamp: string;
}

const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: '1',
    name: 'M4A1 SOPMOD Carbine',
    serial: 'FN-994102',
    nsn: '1005-01-561-7224',
    category: 'Weapons',
    status: 'In Vault',
    custodian: 'Vault C · Rack 04',
    timestamp: '2m ago',
  },
  {
    id: '2',
    name: 'L3Harris GPNVG-18 NVG',
    serial: 'L3H-44019',
    nsn: '5855-01-610-3988',
    category: 'Optics',
    status: 'Issued',
    custodian: 'SFC M. Vance',
    timestamp: '14m ago',
  },
  {
    id: '3',
    name: 'Lenco BearCat G3',
    serial: 'BC-2024-819',
    nsn: '2320-01-598-4100',
    category: 'Fleet',
    status: 'Issued',
    custodian: 'Sgt. K. Alverez',
    timestamp: '41m ago',
  },
  {
    id: '4',
    name: 'AN/PRC-163 TAC Radio',
    serial: 'PRC-009481',
    nsn: '5820-01-682-9910',
    category: 'Comms',
    status: 'In Vault',
    custodian: 'COMSEC Safe 01',
    timestamp: '1h ago',
  },
  {
    id: '5',
    name: 'SIG MCX SPEAR XM7',
    serial: 'SIG-30812',
    nsn: '1005-01-701-8802',
    category: 'Weapons',
    status: 'In Vault',
    custodian: 'Vault C · Rack 12',
    timestamp: '2h ago',
  },
];

export function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenTab>('HOME');
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [airGappedMode, setAirGappedMode] = useState(true);
  const [biometricSign, setBiometricSign] = useState(true);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistOrg, setWaitlistOrg] = useState('Military / DoD Unit');

  const inVaultCount = items.filter((i) => i.status === 'In Vault').length;
  const issuedCount = items.filter((i) => i.status === 'Issued').length;

  const toggleItemStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextStatus = item.status === 'In Vault' ? 'Issued' : 'In Vault';
        return {
          ...item,
          status: nextStatus,
          custodian: nextStatus === 'Issued' ? 'Sgt. J. Mercer' : 'Vault C · Verified',
          timestamp: 'Just now',
        };
      })
    );
  };

  const handleSimulateScan = () => {
    const target = items.find((i) => i.status === 'In Vault') || items[0];
    toggleItemStatus(target.id);
    setScanSuccess(`RFID Tag Verified: ${target.name} (${target.serial})`);
    setTimeout(() => setScanSuccess(null), 3000);
  };

  const filteredPhoneItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(phoneSearch.toLowerCase()) ||
      i.serial.toLowerCase().includes(phoneSearch.toLowerCase())
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
                AMERICA-FIRST TACTICAL LOGISTICS
              </div>
            </div>
          </a>

          {/* Center Numbered Links */}
          <nav className="hidden lg:flex items-center gap-12 font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
            <a href="#vault" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">01. THE</span>
              <span>ARMORY</span>
            </a>
            <a href="#capabilities" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">02. CORE</span>
              <span>CAPABILITIES</span>
            </a>
            <a href="#cryptography" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">03. CHAIN OF</span>
              <span>CUSTODY</span>
            </a>
            <a href="#compliance" className="hover:text-white transition-colors leading-relaxed">
              <span className="block text-neutral-500">04. SECURITY</span>
              <span>COMPLIANCE</span>
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
      <main id="vault" className="max-w-[1340px] mx-auto px-6 sm:px-10 pt-14 pb-24 lg:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* LEFT COLUMN: Editorial Headline, Description & Screen Selector Cards */}
          <div className="lg:col-span-7 pt-2">
            {/* Top Rounded Pill Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/[0.12] bg-[#0C0C0E] font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-300 uppercase mb-9">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>VETERAN-ENGINEERED · MILITARY & LAW ENFORCEMENT · iOS & ANDROID</span>
            </div>

            {/* Classical Serif Headline with Italic Muted Contrast */}
            <h1 className="font-serif-editorial text-[54px] sm:text-[72px] lg:text-[84px] leading-[1.02] tracking-[-0.02em] text-white font-normal">
              Commanding the{' '}
              <span className="italic text-neutral-400 font-normal">tactical inventory</span> of
              American forces.
            </h1>

            {/* Calm, Minimalist Description Paragraph */}
            <p className="mt-8 text-neutral-400 text-base sm:text-[19px] leading-[1.68] font-light max-w-[640px]">
              GOVROUTE is a Veteran-Engineered, America-First, zero-trust logistics platform built
              to track serialized weapons, optics, and fleet assets for military units and law
              enforcement agencies. Every custody handoff is signed locally on your device before it
              ever touches the cloud—operating seamlessly across armories, precincts, and air-gapped
              environments.
            </p>

            {/* Interactive Live Preview Selector Header */}
            <div className="mt-14 pt-2 max-w-[650px]">
              <div className="flex items-center justify-between font-mono text-[10px] sm:text-[11px] tracking-[0.2em] text-neutral-500 uppercase mb-4">
                <span>INTERACTIVE LIVE ARMORY PREVIEW — SELECT SCREEN:</span>
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
                      sub: 'Armory overview & readiness.',
                      icon: Home,
                    },
                    {
                      id: 'ASSETS',
                      num: '02',
                      title: 'ASSETS',
                      sub: 'Serialized weapons & fleet.',
                      icon: Folder,
                    },
                    {
                      id: 'SCAN',
                      num: '03',
                      title: 'SCAN',
                      sub: 'RFID & barcode custody issue.',
                      icon: ScanLine,
                    },
                    {
                      id: 'SETTINGS',
                      num: '04',
                      title: 'SETTINGS',
                      sub: 'Zero-trust & CJIS audit export.',
                      icon: Settings,
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
                        <span
                          className={`font-mono text-[10px] tracking-widest ${
                            isActive ? 'text-neutral-500' : 'text-neutral-500'
                          }`}
                        >
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
                        {activeScreen === 'ASSETS' && 'Inventory'}
                        {activeScreen === 'SCAN' && 'RFID Scanner'}
                        {activeScreen === 'SETTINGS' && 'Security'}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500 font-normal">Armorer</span>
                  </div>
                </div>

                {/* Screen Content Area (Scrollable) */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                  {/* SCREEN 01: HOME */}
                  {activeScreen === 'HOME' && (
                    <>
                      {/* 2 Top Metric Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div
                          onClick={() => setActiveScreen('ASSETS')}
                          className="bg-[#121214] hover:bg-[#17171A] transition-colors border border-white/[0.07] rounded-2xl p-4 cursor-pointer"
                        >
                          <Folder className="w-4 h-4 text-neutral-400 mb-3" />
                          <div className="text-2xl font-semibold text-white">{items.length}</div>
                          <div className="text-xs text-neutral-500 mt-1">Serialized Assets</div>
                        </div>

                        <div
                          onClick={() => setActiveScreen('SCAN')}
                          className="bg-[#121214] hover:bg-[#17171A] transition-colors border border-white/[0.07] rounded-2xl p-4 cursor-pointer"
                        >
                          <Lock className="w-4 h-4 text-neutral-400 mb-3" />
                          <div className="text-2xl font-semibold text-white">100%</div>
                          <div className="text-xs text-neutral-500 mt-1">Custody Verified</div>
                        </div>
                      </div>

                      {/* Armory Vault Readiness Bar Card */}
                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4">
                        <div className="flex items-center justify-between text-xs mb-2.5">
                          <span className="font-medium text-white">Vault Accountability</span>
                          <span className="text-neutral-400">
                            {inVaultCount} of {items.length} In Vault
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${(inVaultCount / items.length) * 100}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-3">
                          <span>In Vault: {inVaultCount}</span>
                          <span>Field Issued: {issuedCount}</span>
                        </div>
                      </div>

                      {/* Recent Custody Transfers */}
                      <div className="pt-1">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-sm font-medium text-white">Recent Custody Log</span>
                          <button
                            onClick={() => setActiveScreen('ASSETS')}
                            className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                          >
                            View all →
                          </button>
                        </div>

                        <div className="space-y-2">
                          {items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => toggleItemStatus(item.id)}
                              className="bg-[#121214] hover:bg-[#17171A] border border-white/[0.07] rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-colors"
                              title="Click to toggle Vault / Issued state"
                            >
                              <div>
                                <div className="text-xs font-medium text-white">{item.name}</div>
                                <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                  {item.serial} · {item.custodian}
                                </div>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                    item.status === 'In Vault'
                                      ? 'bg-white/10 text-white border-white/20'
                                      : 'bg-transparent text-neutral-400 border-white/10'
                                  }`}
                                >
                                  {item.status}
                                </span>
                                <div className="text-[10px] text-neutral-600 mt-1">
                                  {item.timestamp}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* SCREEN 02: ASSETS */}
                  {activeScreen === 'ASSETS' && (
                    <>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={phoneSearch}
                          onChange={(e) => setPhoneSearch(e.target.value)}
                          placeholder="Search serial or weapon..."
                          className="w-full bg-[#121214] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/30"
                        />
                      </div>

                      <div className="space-y-2">
                        {filteredPhoneItems.map((item) => {
                          const expanded = selectedItemId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() =>
                                setSelectedItemId(expanded ? null : item.id)
                              }
                              className="bg-[#121214] border border-white/[0.07] rounded-2xl p-3.5 cursor-pointer transition-colors hover:border-white/20"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-xs font-medium text-white">{item.name}</div>
                                  <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                                    SN: {item.serial}
                                  </div>
                                </div>
                                <span
                                  className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                                    item.status === 'In Vault'
                                      ? 'bg-white text-black border-white font-semibold'
                                      : 'bg-transparent text-neutral-300 border-white/15'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              </div>

                              {expanded && (
                                <div className="mt-3 pt-3 border-t border-white/[0.07] text-[11px] font-mono text-neutral-400 space-y-1.5">
                                  <div className="flex justify-between">
                                    <span>NSN:</span>
                                    <span className="text-white">{item.nsn}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Custodian:</span>
                                    <span className="text-white">{item.custodian}</span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItemStatus(item.id);
                                    }}
                                    className="w-full mt-2 py-1.5 rounded-lg bg-white text-black font-mono text-[10px] font-semibold uppercase tracking-wider cursor-pointer"
                                  >
                                    {item.status === 'In Vault'
                                      ? 'Sign Out to Operator'
                                      : 'Check Back Into Vault'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* SCREEN 03: SCAN */}
                  {activeScreen === 'SCAN' && (
                    <div className="space-y-4">
                      <div className="bg-[#121214] border border-white/[0.08] rounded-2xl p-6 text-center relative overflow-hidden">
                        <div className="w-16 h-16 rounded-2xl border border-white/20 bg-white/[0.03] mx-auto flex items-center justify-center mb-4">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-sm font-medium text-white">
                          UHF RFID & IUID Scanner
                        </div>
                        <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                          Hold device near weapon UID matrix or walk through armory portal to sign
                          custody block.
                        </p>

                        <button
                          onClick={handleSimulateScan}
                          className="mt-5 w-full py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Simulate RFID Scan
                        </button>
                      </div>

                      {scanSuccess && (
                        <div className="bg-white/10 border border-white/20 rounded-xl p-3 text-xs font-mono text-white flex items-center gap-2">
                          <Check className="w-4 h-4 shrink-0" />
                          <span>{scanSuccess}</span>
                        </div>
                      )}

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-neutral-400">
                          <span>Active Signer</span>
                          <span className="text-white font-mono">CAC-8492-US</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Signature Cipher</span>
                          <span className="text-white font-mono">SHA-256 / FIPS</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>Offline Mesh Queue</span>
                          <span className="text-white font-mono">0 Pending</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SCREEN 04: SETTINGS */}
                  {activeScreen === 'SETTINGS' && (
                    <div className="space-y-3">
                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">
                            Air-Gapped DDIL Mode
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Store custody blocks locally offline
                          </div>
                        </div>
                        <button
                          onClick={() => setAirGappedMode(!airGappedMode)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            airGappedMode ? 'bg-white' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              airGappedMode
                                ? 'bg-black translate-x-4'
                                : 'bg-neutral-400 translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">
                            CAC + Biometric Dual Sign
                          </div>
                          <div className="text-[11px] text-neutral-500 mt-0.5">
                            Require hardware token on weapon issue
                          </div>
                        </div>
                        <button
                          onClick={() => setBiometricSign(!biometricSign)}
                          className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${
                            biometricSign ? 'bg-white' : 'bg-neutral-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full transition-transform ${
                              biometricSign
                                ? 'bg-black translate-x-4'
                                : 'bg-neutral-400 translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      <div className="bg-[#121214] border border-white/[0.07] rounded-2xl p-4 space-y-2">
                        <div className="text-xs font-medium text-white">
                          Compliance & Audit Packet
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          Generate signed DA Form 2062 or CJIS chain-of-custody ledger export.
                        </p>
                        <button
                          onClick={() => setScanSuccess('Exported signed SHA-256 audit log.')}
                          className="mt-2 w-full py-2.5 rounded-xl border border-white/20 hover:bg-white hover:text-black text-white font-mono text-[11px] uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Export Audit Ledger
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Navigation Tab Bar Inside Phone */}
                <div className="px-6 py-3.5 border-t border-white/[0.06] bg-[#0B0B0D] grid grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'HOME', label: 'Home', icon: Home },
                      { id: 'ASSETS', label: 'Assets', icon: Folder },
                      { id: 'SCAN', label: 'Scan', icon: ScanLine },
                      { id: 'SETTINGS', label: 'Settings', icon: Settings },
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

      {/* SECTION 02: MINIMALIST CAPABILITIES */}
      <section
        id="capabilities"
        className="border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <div className="max-w-2xl mb-16">
          <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase mb-4">
            02. CORE CAPABILITIES
          </div>
          <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
            Built for zero-blindspot{' '}
            <span className="italic text-neutral-400">accountability.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              num: '01',
              title: 'Serialized Asset Tracking',
              desc: 'Track weapons, optics, suppressors, and COMSEC keys by MIL-STD-130 IUID, NSN, and serial number.',
            },
            {
              num: '02',
              title: 'Armory & Fleet Readiness',
              desc: 'Instantaneous visibility into vault counts, patrol vehicle readiness, and scheduled maintenance.',
            },
            {
              num: '03',
              title: 'RFID & Barcode Scanning',
              desc: 'Verify entire Pelican loadouts in seconds via passive UHF portals or rugged iOS & Android devices.',
            },
            {
              num: '04',
              title: 'Immutable Audit Logs',
              desc: 'Every handoff is signed with CAC/PIV credentials and anchored to a tamper-evident SHA-256 ledger.',
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

      {/* SECTION 03 & 04: CRYPTOGRAPHY & COMPLIANCE */}
      <section
        id="cryptography"
        className="border-t border-white/[0.08] py-24 max-w-[1340px] mx-auto px-6 sm:px-10"
      >
        <div id="compliance" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="font-mono text-[11px] tracking-[0.22em] text-neutral-500 uppercase">
              03. ZERO-KNOWLEDGE CUSTODY & COMPLIANCE
            </div>
            <h2 className="font-serif-editorial text-4xl sm:text-5xl text-white font-normal leading-tight">
              Encrypted on-device.{' '}
              <span className="italic text-neutral-400">Sovereign by design.</span>
            </h2>
            <p className="text-neutral-400 text-base leading-relaxed font-light max-w-xl">
              Sensitive unit inventories never traverse public commercial relays. GovRoute signs
              every custody record locally with FIPS 140-3 validated cryptography and deploys inside
              AWS GovCloud, SIPR/air-gapped enclaves, or offline field kits.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            {[
              { label: 'ENCRYPTION STANDARD', value: 'AES-256-GCM / FIPS 140-3' },
              { label: 'LAW ENFORCEMENT', value: 'CJIS Security Policy v5.9' },
              { label: 'DEFENSE SERIALIZATION', value: 'MIL-STD-130 IUID & DPAS' },
              { label: 'FIELD CONNECTIVITY', value: 'Offline DDIL & TAK Sync' },
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
          <div>GOVROUTE INC. · VETERAN-FOUNDED · UNITED STATES OF AMERICA</div>
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
                <h3 className="font-serif-editorial text-3xl text-white">Request Received</h3>
                <p className="text-sm text-neutral-400 font-light">
                  We have registered <span className="text-white">{waitlistEmail}</span> ({waitlistOrg})
                  for early armory deployment access.
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
                  EARLY ACCESS & PILOT DEPLOYMENT
                </div>
                <h3 className="font-serif-editorial text-3xl text-white font-normal">
                  Join the GovRoute Waitlist
                </h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Exclusively available to U.S. military units, federal agencies, and state & local
                  law enforcement departments.
                </p>

                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                    UNIT / AGENCY TYPE
                  </label>
                  <select
                    value={waitlistOrg}
                    onChange={(e) => setWaitlistOrg(e.target.value)}
                    className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white focus:outline-none focus:border-white/30"
                  >
                    <option>Military / DoD Unit</option>
                    <option>Law Enforcement / SWAT Division</option>
                    <option>Federal Agency</option>
                    <option>National Guard / State Defense</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono text-[10px] tracking-widest uppercase text-neutral-400 mb-2">
                    OFFICIAL EMAIL (.MIL / .GOV / AGENCY)
                  </label>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="name@agency.gov"
                    className="w-full bg-[#141417] border border-white/10 rounded-xl px-3.5 py-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/30"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono text-xs font-semibold tracking-[0.16em] uppercase transition-colors cursor-pointer"
                >
                  Request Access ↗
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
