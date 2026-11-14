export type UnitDivision = 'ALL' | 'DOD_JOINT' | 'LAW_ENFORCEMENT' | 'FEDERAL_SPECOPS';
export type AssetCategory = 'ALL' | 'WEAPONS_OPTICS' | 'ARMORED_FLEET' | 'COMMS_CRYPTO' | 'BALLISTICS_EOD';
export type ReadinessState = 'FMC' | 'PMC' | 'DEPLOYED' | 'AUDIT_HOLD';

export interface CustodyEvent {
  id: string;
  timestamp: string;
  action: 'ISSUED_TO_OPERATOR' | 'RFID_GATE_VERIFIED' | 'VAULT_CHECKIN' | 'MAINTENANCE_CALIBRATED' | 'COMSEC_KEY_LOAD';
  actor: string;
  badgeOrCac: string;
  location: string;
  hash: string;
  verifiedBy: 'UHF_RFID_PORTAL' | 'CAC_BIOMETRIC' | '2D_UID_SCANNER';
}

export interface TacticalAsset {
  id: string;
  serial: string;
  nsn: string;
  rfidTag: string;
  name: string;
  model: string;
  division: Exclude<UnitDivision, 'ALL'>;
  divisionLabel: string;
  category: Exclude<AssetCategory, 'ALL'>;
  categoryLabel: string;
  status: ReadinessState;
  custodian: string;
  custodianBadge: string;
  facility: string;
  vaultSlot: string;
  gridCoords: string;
  lastScanAgo: string;
  batteryOrHealth: number;
  roundsOrHours: string;
  nextInspection: string;
  securityLevel: 'SECRET // NOFORN' | 'CJIS RESTRICTED' | 'COMSEC CCI' | 'SENSITIVE ITEM';
  custodyChain: CustodyEvent[];
}

export const TACTICAL_ASSETS: TacticalAsset[] = [
  {
    id: 'GR-8841-A',
    serial: 'FN-M4A1-994102',
    nsn: '1005-01-561-7224',
    rfidTag: 'EPC-3034-9A01-FF82',
    name: 'M4A1 SOPMOD Block II Carbine',
    model: 'Colt / SOCOM 14.5" Upper + Wilcox RAID-Xe',
    division: 'DOD_JOINT',
    divisionLabel: '1st Special Forces Group (Airborne)',
    category: 'WEAPONS_OPTICS',
    categoryLabel: 'Weapons & Optics',
    status: 'DEPLOYED',
    custodian: 'SFC M. Vance (ODA-142)',
    custodianBadge: 'CAC-9908-4412-US',
    facility: 'JBLM Armory Vault C // Range 19',
    vaultSlot: 'RACK-04 // SLOT-11B',
    gridCoords: '47.0864° N, 122.5811° W',
    lastScanAgo: '14s ago',
    batteryOrHealth: 98,
    roundsOrHours: '1,420 RDS LOGGED',
    nextInspection: '2026-12-01 (Gauging Pass)',
    securityLevel: 'SENSITIVE ITEM',
    custodyChain: [
      {
        id: 'EVT-901',
        timestamp: '2026-11-14 07:42:19 UTC',
        action: 'RFID_GATE_VERIFIED',
        actor: 'GATE-NORTH-02 (Auto-Portal)',
        badgeOrCac: 'PORTAL-UHF-09',
        location: 'JBLM Tactical Range 19',
        hash: '0x9f8c...3e14a8',
        verifiedBy: 'UHF_RFID_PORTAL',
      },
      {
        id: 'EVT-898',
        timestamp: '2026-11-14 05:30:04 UTC',
        action: 'ISSUED_TO_OPERATOR',
        actor: 'SSG R. Kovács (Armorer)',
        badgeOrCac: 'CAC-8812-0039-US',
        location: 'Vault C — Issue Window 2',
        hash: '0x4a21...91bc04',
        verifiedBy: 'CAC_BIOMETRIC',
      },
      {
        id: 'EVT-854',
        timestamp: '2026-11-13 21:15:52 UTC',
        action: 'VAULT_CHECKIN',
        actor: 'SFC M. Vance',
        badgeOrCac: 'CAC-9908-4412-US',
        location: 'Vault C — Rack 04',
        hash: '0x71d0...882fa1',
        verifiedBy: '2D_UID_SCANNER',
      },
    ],
  },
  {
    id: 'GR-3092-L',
    serial: 'L3H-GPNVG-44019',
    nsn: '5855-01-610-3988',
    rfidTag: 'EPC-3034-7C12-104A',
    name: 'L3Harris GPNVG-18 Panoramic Night Vision',
    model: 'Gen-3 White Phosphor Unfilmed Quad-Tube',
    division: 'FEDERAL_SPECOPS',
    divisionLabel: 'FBI HRT // Tactical Aviation',
    category: 'WEAPONS_OPTICS',
    categoryLabel: 'Weapons & Optics',
    status: 'FMC',
    custodian: 'SA D. Reyes (Blue Team)',
    custodianBadge: 'PIV-FBI-40291',
    facility: 'Quantico Cage 02 // Nitrogen Cabinet',
    vaultSlot: 'OPTIC-CAB-02 // TRAY-06',
    gridCoords: '38.5220° N, 77.4108° W',
    lastScanAgo: '38s ago',
    batteryOrHealth: 100,
    roundsOrHours: '184.5 OP HRS',
    nextInspection: '2026-11-28 (Nitrogen Purge Check)',
    securityLevel: 'SECRET // NOFORN',
    custodyChain: [
      {
        id: 'EVT-912',
        timestamp: '2026-11-14 07:54:02 UTC',
        action: 'VAULT_CHECKIN',
        actor: 'Quartermaster T. Brooks',
        badgeOrCac: 'PIV-FBI-11904',
        location: 'Quantico Cage 02 — Smart Locker',
        hash: '0x3b77...c029f2',
        verifiedBy: '2D_UID_SCANNER',
      },
      {
        id: 'EVT-904',
        timestamp: '2026-11-14 01:12:40 UTC',
        action: 'MAINTENANCE_CALIBRATED',
        actor: 'Optics Tech J. Lin',
        badgeOrCac: 'PIV-FBI-77410',
        location: 'Collimation Lab B',
        hash: '0x88e1...1140d9',
        verifiedBy: 'CAC_BIOMETRIC',
      },
    ],
  },
  {
    id: 'GR-7710-M',
    serial: 'LENCO-BC-2024-819',
    nsn: '2320-01-598-4100',
    rfidTag: 'EPC-9901-VEH-8190',
    name: 'Lenco BearCat G3 Armored Rescue Vehicle',
    model: 'NIJ IV / .50 BMG Rated + Turret Thermal Node',
    division: 'LAW_ENFORCEMENT',
    divisionLabel: 'LAPD Metropolitan Division (D-Platoon)',
    category: 'ARMORED_FLEET',
    categoryLabel: 'Armored Fleet',
    status: 'DEPLOYED',
    custodian: 'Sgt. K. Alverez (SWAT-40)',
    custodianBadge: 'LAPD-SERIAL-39104',
    facility: 'Metro Tactical Garage // Active Patrol',
    vaultSlot: 'BAY-01 // TELEMETRY-LIVE',
    gridCoords: '34.0522° N, 118.2437° W',
    lastScanAgo: '4s ago',
    batteryOrHealth: 94,
    roundsOrHours: '11,280 MI // 610 ENG HRS',
    nextInspection: '2026-11-30 (Ballistic Glass Seal)',
    securityLevel: 'CJIS RESTRICTED',
    custodyChain: [
      {
        id: 'EVT-920',
        timestamp: '2026-11-14 07:56:11 UTC',
        action: 'RFID_GATE_VERIFIED',
        actor: 'METRO-BAY-EXIT-01',
        badgeOrCac: 'GATE-READER-01',
        location: '114 E 1st St, Los Angeles, CA',
        hash: '0x55a9...f491e0',
        verifiedBy: 'UHF_RFID_PORTAL',
      },
      {
        id: 'EVT-915',
        timestamp: '2026-11-14 06:45:00 UTC',
        action: 'ISSUED_TO_OPERATOR',
        actor: 'Sgt. K. Alverez',
        badgeOrCac: 'LAPD-SERIAL-39104',
        location: 'Metro Dispatch Kiosk 03',
        hash: '0x12c8...70ea31',
        verifiedBy: 'CAC_BIOMETRIC',
      },
    ],
  },
  {
    id: 'GR-5520-C',
    serial: 'AN-PRC163-009481',
    nsn: '5820-01-682-9910',
    rfidTag: 'EPC-3034-5520-CCI9',
    name: 'AN/PRC-163 Multi-Channel Leader Radio',
    model: 'L3Harris Falcon IV Type-1 NSA Crypto Suite',
    division: 'DOD_JOINT',
    divisionLabel: '2nd Marine Expeditionary Force (II MEF)',
    category: 'COMMS_CRYPTO',
    categoryLabel: 'Comms & Crypto',
    status: 'FMC',
    custodian: 'GySgt H. Mercer (S-6 EKMS)',
    custodianBadge: 'CAC-7741-9201-US',
    facility: 'Camp Lejeune COMSEC Vault 01',
    vaultSlot: 'CCI-SAFE-03 // DRAWER-02',
    gridCoords: '34.6728° N, 77.3485° W',
    lastScanAgo: '1m ago',
    batteryOrHealth: 100,
    roundsOrHours: 'AES-256 KEY EPOCH #49',
    nextInspection: '2026-11-15 (24h Zeroize Audit)',
    securityLevel: 'COMSEC CCI',
    custodyChain: [
      {
        id: 'EVT-919',
        timestamp: '2026-11-14 07:10:09 UTC',
        action: 'COMSEC_KEY_LOAD',
        actor: 'GySgt H. Mercer (COMSEC Custodian)',
        badgeOrCac: 'CAC-7741-9201-US',
        location: 'Camp Lejeune EKMS Vault 01',
        hash: '0xe044...6b12c7',
        verifiedBy: 'CAC_BIOMETRIC',
      },
      {
        id: 'EVT-889',
        timestamp: '2026-11-13 19:00:14 UTC',
        action: 'VAULT_CHECKIN',
        actor: 'Cpl A. Thorne',
        badgeOrCac: 'CAC-6102-8834-US',
        location: 'COMSEC Vault 01 — Cage Reader',
        hash: '0x6a90...019fe4',
        verifiedBy: '2D_UID_SCANNER',
      },
    ],
  },
  {
    id: 'GR-6194-E',
    serial: 'FLIR-PACKBOT-510-77',
    nsn: '1385-01-547-2201',
    rfidTag: 'EPC-3034-EOD-5107',
    name: 'Teledyne FLIR PackBot 510 EOD UGV',
    model: 'Disruptor Mount + CBRN Sensor Payload',
    division: 'LAW_ENFORCEMENT',
    divisionLabel: 'NYPD Emergency Service Unit (Bomb Squad)',
    category: 'BALLISTICS_EOD',
    categoryLabel: 'Ballistics & EOD',
    status: 'PMC',
    custodian: 'Det. S. O’Connor (ESU Truck 1)',
    custodianBadge: 'NYPD-TAX-948210',
    facility: 'Floyd Bennett Field EOD Depot',
    vaultSlot: 'ROBOTICS-CAGE-02',
    gridCoords: '40.5910° N, 73.8906° W',
    lastScanAgo: '2m ago',
    batteryOrHealth: 78,
    roundsOrHours: 'ACTUATOR CALIBRATION DUE',
    nextInspection: '2026-11-16 (Manipulator Torque Check)',
    securityLevel: 'CJIS RESTRICTED',
    custodyChain: [
      {
        id: 'EVT-908',
        timestamp: '2026-11-14 06:02:49 UTC',
        action: 'MAINTENANCE_CALIBRATED',
        actor: 'Robotics Tech M. Patel',
        badgeOrCac: 'NYPD-CIV-20911',
        location: 'Floyd Bennett EOD Bay 2',
        hash: '0xc412...993ab0',
        verifiedBy: '2D_UID_SCANNER',
      },
    ],
  },
  {
    id: 'GR-1129-W',
    serial: 'SIG-MCX-SPEAR-30812',
    nsn: '1005-01-701-8802',
    rfidTag: 'EPC-3034-XM7-3081',
    name: 'XM7 Next Generation Squad Weapon + XM157',
    model: '6.8x51mm Hybrid + Vortex Fire Control Optic',
    division: 'DOD_JOINT',
    divisionLabel: '101st Airborne Division (Air Assault)',
    category: 'WEAPONS_OPTICS',
    categoryLabel: 'Weapons & Optics',
    status: 'FMC',
    custodian: '1LT C. Kowalski (B Co, 1-502 IN)',
    custodianBadge: 'CAC-5591-3302-US',
    facility: 'Fort Campbell Consolidated Armory 07',
    vaultSlot: 'RACK-12 // SLOT-01A',
    gridCoords: '36.6631° N, 87.4742° W',
    lastScanAgo: '9s ago',
    batteryOrHealth: 100,
    roundsOrHours: '340 RDS LOGGED',
    nextInspection: '2026-12-10 (Bore Erosion Scope)',
    securityLevel: 'SENSITIVE ITEM',
    custodyChain: [
      {
        id: 'EVT-924',
        timestamp: '2026-11-14 07:55:48 UTC',
        action: 'RFID_GATE_VERIFIED',
        actor: 'VAULT-07-CAGE-SWEEP',
        badgeOrCac: 'UHF-ARRAY-07',
        location: 'Fort Campbell Armory 07',
        hash: '0x80d1...5e44b2',
        verifiedBy: 'UHF_RFID_PORTAL',
      },
    ],
  },
];

export interface CapabilitySpec {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: { label: string; value: string }[];
  specs: string[];
}

export const CORE_CAPABILITIES: CapabilitySpec[] = [
  {
    id: 'serialized-tracking',
    code: 'SYS-MOD // 01',
    title: 'Serialized Asset & IUID Tracking',
    subtitle: 'Zero-ambiguity visibility down to component serials, optics, and COMSEC keys.',
    description:
      'Track every serialized weapon, suppressor, thermal sight, body armor plate, and cryptographic fill device across installations and patrol divisions. Automatically cross-references MIL-STD-130 IUID DataMatrix codes, NSNs, and agency property tags.',
    metrics: [
      { label: 'SERIAL ACCURACY', value: '99.998%' },
      { label: 'KIT HIERARCHY DEPTH', value: 'Sub-Component' },
    ],
    specs: [
      'MIL-STD-130 IUID, NSN, LIN & ATF NFA Registry serialization',
      'Parent-child kit binding (Carbine → Optic → IR Laser → Suppressor)',
      'Automated ammunition lot & round-count lifecycle tracking',
      'COMSEC CCI & controlled narcotic/evidence locker custody enforcement',
    ],
  },
  {
    id: 'armory-fleet-readiness',
    code: 'SYS-MOD // 02',
    title: 'Armory & Tactical Fleet Readiness',
    subtitle: 'Live FMC / PMC / NMC mission-capability telemetry across vaults and motor pools.',
    description:
      'Replace clipboards, DA Form 2062s, and Excel spreadsheets with live command readiness dashboards. Know instantaneously which squads, SWAT platoons, and armored vehicles are Fully Mission Capable before an operation launches.',
    metrics: [
      { label: 'VAULT INVENTORY TIME', value: '74 Sec' },
      { label: 'DEADLINE PREVENTED', value: '-68% NMC' },
    ],
    specs: [
      'Real-time FMC / PMC / NMC readiness aggregation by unit or precinct',
      'Predictive barrel-wear, hydrostatic test & armor expiration alerts',
      'Automated DA Form 2062 / 3161 & police quartermaster digital hand receipts',
      'Armored vehicle telemetry integration (CAN-bus engine hours & bay presence)',
    ],
  },
  {
    id: 'rfid-field-scanning',
    code: 'SYS-MOD // 03',
    title: 'Multi-Modal RFID, Barcode & DDIL Sync',
    subtitle: 'Passive UHF armory portals, ruggedized handhelds, and zero-connectivity field operation.',
    description:
      'Walk a full Pelican loadout through an armory doorway and verify 40+ serialized items in 1.2 seconds. In austere or jammed environments (DDIL), field tablets store cryptographically signed transactions locally and sync over TAK / mesh.',
    metrics: [
      { label: 'BULK PORTAL READ', value: '120 tags/sec' },
      { label: 'OFFLINE SYNC', value: 'Zero-Trust CRDT' },
    ],
    specs: [
      'Passive UHF RFID doorway portals & smart weapon-rack sensor strips',
      'MIL-STD-810H handheld 2D IUID DataMatrix + NFC + CAC/PIV badge readers',
      'Air-gapped & DDIL (Denied, Degraded, Intermittent, Limited) mesh sync',
      'Native ATAK / CivTAK cursor-on-target (CoT) logistics overlay plugin',
    ],
  },
  {
    id: 'audit-chain-of-custody',
    code: 'SYS-MOD // 04',
    title: 'Immutable Chain-of-Custody & Audit Logs',
    subtitle: 'Cryptographic handoff verification built for Inspector General, ATF, and CJIS audits.',
    description:
      'Every sign-out, shift transfer, range issue, and maintenance action is dual-signed with CAC/PIV hardware tokens or biometric PINs and anchored to a tamper-evident SHA-256 ledger. Generate 100% sensitive-item audit packets in one click.',
    metrics: [
      { label: 'AUDIT PREP TIME', value: '< 30 Sec' },
      { label: 'LEDGER INTEGRITY', value: 'SHA-256 + HSM' },
    ],
    specs: [
      'Dual-custody biometric + CAC/PIV smartcard sign-out verification',
      'Automated unreturned-item curfew alerts & geofence breach triggers',
      'One-click DoD cyclic sensitive-item inventory & CALEA/CJIS compliance exports',
      'Tamper-evident hash chain preventing retroactive log alteration',
    ],
  },
];
