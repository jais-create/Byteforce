import {
  AppSettings,
  Product,
  ProductCategory,
  PurchaseOrder,
  SmartAlert,
  Supplier,
} from '../types/inventory';

export const DEFAULT_SETTINGS: AppSettings = {
  companyName: 'Apex Tech Distribution',
  warehouseName: 'West Coast Fulfillment Hub · Bay 4',
  safetyBufferDays: 7,
  criticalDaysThreshold: 3,
  lowStockBufferMultiplier: 1.0,
  autoApproveThresholdUsd: 2500,
  emailDigestEnabled: true,
  slackAlertsEnabled: true,
  forecastConfidenceModel: 'Ensemble Prophet + XGBoost',
};

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'NovaTech Peripherals Ltd.',
    contactName: 'Elena Vance',
    email: 'orders@novatech-supply.com',
    phone: '+1 (415) 890-4412',
    location: 'San Jose, CA',
    avgDeliveryDays: 5,
    reliabilityScore: 96,
    priceCompetitiveness: 92,
    priceMultiplier: 0.96,
    categories: ['Peripherals', 'Accessories & Power'],
    paymentTerms: 'Net 30',
    activeContracts: 34,
  },
  {
    id: 'sup-2',
    name: 'SoundWave Acoustics Corp.',
    contactName: 'Marcus Sterling',
    email: 'fulfillment@soundwave.io',
    phone: '+1 (206) 774-1820',
    location: 'Seattle, WA',
    avgDeliveryDays: 4,
    reliabilityScore: 94,
    priceCompetitiveness: 88,
    priceMultiplier: 1.0,
    categories: ['Audio', 'Peripherals'],
    paymentTerms: 'Net 45',
    activeContracts: 22,
  },
  {
    id: 'sup-3',
    name: 'Apex Silicon & Computing',
    contactName: 'Priya Nair',
    email: 'b2b@apexsilicon.com',
    phone: '+1 (512) 403-9921',
    location: 'Austin, TX',
    avgDeliveryDays: 6,
    reliabilityScore: 98,
    priceCompetitiveness: 86,
    priceMultiplier: 1.02,
    categories: ['Laptops & Computing', 'Storage & Memory'],
    paymentTerms: 'Net 30',
    activeContracts: 28,
  },
  {
    id: 'sup-4',
    name: 'OptiView Display Systems',
    contactName: 'Daniel Park',
    email: 'logistics@optiview.net',
    phone: '+1 (310) 642-7105',
    location: 'Los Angeles, CA',
    avgDeliveryDays: 7,
    reliabilityScore: 91,
    priceCompetitiveness: 90,
    priceMultiplier: 0.98,
    categories: ['Monitors & Displays', 'Accessories & Power'],
    paymentTerms: 'Net 30',
    activeContracts: 19,
  },
  {
    id: 'sup-5',
    name: 'CoreLink Network Hardware',
    contactName: 'Hannah Brooks',
    email: 'supply@corelink-hw.com',
    phone: '+1 (303) 519-8340',
    location: 'Denver, CO',
    avgDeliveryDays: 3,
    reliabilityScore: 95,
    priceCompetitiveness: 84,
    priceMultiplier: 1.04,
    categories: ['Networking', 'Storage & Memory'],
    paymentTerms: 'Net 15',
    activeContracts: 16,
  },
  {
    id: 'sup-6',
    name: 'Pacific Direct Wholesale',
    contactName: 'Kenji Takahashi',
    email: 'trade@pacificdirect.co',
    phone: '+1 (503) 912-3044',
    location: 'Portland, OR',
    avgDeliveryDays: 8,
    reliabilityScore: 87,
    priceCompetitiveness: 97,
    priceMultiplier: 0.91,
    categories: ['Peripherals', 'Audio', 'Accessories & Power', 'Networking'],
    paymentTerms: 'Net 60',
    activeContracts: 31,
  },
];

// Anchor hero products matching the required demo scenario and AI insights
const HERO_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Wireless Mouse',
    sku: 'SS-PER-001',
    category: 'Peripherals',
    currentStock: 12,
    minStock: 45,
    maxStock: 180,
    dailyAvgDemand: 8,
    demandTrendPct: 22,
    supplierId: 'sup-1', // NovaTech, 5 days delivery -> 1.5 days to stockout
    unitPrice: 28.5,
    retailPrice: 49.99,
    warehouseLocation: 'Aisle A-04',
    lastRestocked: '2026-10-28',
  },
  {
    id: 'prod-002',
    name: 'Bluetooth Headphones',
    sku: 'SS-AUD-002',
    category: 'Audio',
    currentStock: 26,
    minStock: 42,
    maxStock: 160,
    dailyAvgDemand: 7,
    demandTrendPct: 25,
    supplierId: 'sup-2', // SoundWave, 4 days delivery -> 3.7 days to stockout
    unitPrice: 74.0,
    retailPrice: 129.99,
    warehouseLocation: 'Aisle B-11',
    lastRestocked: '2026-11-01',
  },
  {
    id: 'prod-003',
    name: 'Mechanical Keyboards',
    sku: 'SS-PER-003',
    category: 'Peripherals',
    currentStock: 20,
    minStock: 55,
    maxStock: 200,
    dailyAvgDemand: 10,
    demandTrendPct: 18,
    supplierId: 'sup-1', // 5d delivery + 7d buffer + 2d surge adjustment -> ~120 units recommended
    unitPrice: 64.0,
    retailPrice: 114.99,
    warehouseLocation: 'Aisle A-06',
    lastRestocked: '2026-10-25',
  },
  {
    id: 'prod-004',
    name: 'UltraSharp 27" 4K Monitor',
    sku: 'SS-MON-004',
    category: 'Monitors & Displays',
    currentStock: 0,
    minStock: 18,
    maxStock: 60,
    dailyAvgDemand: 3,
    demandTrendPct: 14,
    supplierId: 'sup-4',
    unitPrice: 310.0,
    retailPrice: 489.0,
    warehouseLocation: 'Aisle D-02',
    lastRestocked: '2026-10-14',
  },
  {
    id: 'prod-005',
    name: 'ProBook 14" Business Laptop',
    sku: 'SS-LAP-005',
    category: 'Laptops & Computing',
    currentStock: 9,
    minStock: 20,
    maxStock: 65,
    dailyAvgDemand: 4,
    demandTrendPct: 12,
    supplierId: 'sup-3',
    unitPrice: 780.0,
    retailPrice: 1149.0,
    warehouseLocation: 'Vault C-01',
    lastRestocked: '2026-10-30',
  },
  {
    id: 'prod-006',
    name: 'USB-C 10-in-1 Docking Hub',
    sku: 'SS-ACC-006',
    category: 'Accessories & Power',
    currentStock: 19,
    minStock: 38,
    maxStock: 150,
    dailyAvgDemand: 6,
    demandTrendPct: 19,
    supplierId: 'sup-1',
    unitPrice: 42.0,
    retailPrice: 79.99,
    warehouseLocation: 'Aisle A-12',
    lastRestocked: '2026-11-02',
  },
  {
    id: 'prod-007',
    name: 'Wi-Fi 7 Tri-Band Mesh Router',
    sku: 'SS-NET-007',
    category: 'Networking',
    currentStock: 0,
    minStock: 15,
    maxStock: 55,
    dailyAvgDemand: 3,
    demandTrendPct: 15,
    supplierId: 'sup-5',
    unitPrice: 165.0,
    retailPrice: 279.0,
    warehouseLocation: 'Aisle E-03',
    lastRestocked: '2026-10-11',
  },
  {
    id: 'prod-008',
    name: 'NVMe Gen4 2TB SSD',
    sku: 'SS-STO-008',
    category: 'Storage & Memory',
    currentStock: 22,
    minStock: 35,
    maxStock: 140,
    dailyAvgDemand: 5,
    demandTrendPct: 11,
    supplierId: 'sup-3',
    unitPrice: 98.0,
    retailPrice: 159.99,
    warehouseLocation: 'Vault C-08',
    lastRestocked: '2026-11-04',
  },
  {
    id: 'prod-009',
    name: 'Studio Condenser USB Mic',
    sku: 'SS-AUD-009',
    category: 'Audio',
    currentStock: 215,
    minStock: 25,
    maxStock: 110,
    dailyAvgDemand: 2,
    demandTrendPct: -9,
    supplierId: 'sup-2',
    unitPrice: 58.0,
    retailPrice: 99.0,
    warehouseLocation: 'Aisle B-15',
    lastRestocked: '2026-09-20',
  },
  {
    id: 'prod-010',
    name: '4K AI Autofocus Webcam',
    sku: 'SS-PER-010',
    category: 'Peripherals',
    currentStock: 16,
    minStock: 30,
    maxStock: 120,
    dailyAvgDemand: 5,
    demandTrendPct: 16,
    supplierId: 'sup-1',
    unitPrice: 62.0,
    retailPrice: 109.99,
    warehouseLocation: 'Aisle A-09',
    lastRestocked: '2026-11-01',
  },
];

// Deterministic generator for the remaining 90 realistic electronics SKUs -> Total 100 products
const CATALOG_TEMPLATES: Array<{
  name: string;
  category: ProductCategory;
  supplierId: string;
  unitPrice: number;
  demand: number;
}> = [
  { name: 'Ergonomic Vertical Mouse', category: 'Peripherals', supplierId: 'sup-1', unitPrice: 36, demand: 4 },
  { name: 'Compact 75% Tactile Keyboard', category: 'Peripherals', supplierId: 'sup-1', unitPrice: 72, demand: 5 },
  { name: 'Precision Trackpad Pro', category: 'Peripherals', supplierId: 'sup-6', unitPrice: 68, demand: 2 },
  { name: 'Dual-Mode Numeric Keypad', category: 'Peripherals', supplierId: 'sup-1', unitPrice: 21, demand: 3 },
  { name: '1080p Dual-Mic Conference Cam', category: 'Peripherals', supplierId: 'sup-2', unitPrice: 48, demand: 4 },
  { name: 'Wireless Presenter Laser Remote', category: 'Peripherals', supplierId: 'sup-6', unitPrice: 24, demand: 2 },
  { name: 'Active Noise-Canceling Earbuds', category: 'Audio', supplierId: 'sup-2', unitPrice: 65, demand: 6 },
  { name: 'Desktop Stereo Soundbar', category: 'Audio', supplierId: 'sup-2', unitPrice: 54, demand: 3 },
  { name: 'Enterprise UC Mono Headset', category: 'Audio', supplierId: 'sup-2', unitPrice: 44, demand: 5 },
  { name: 'Omnidirectional Conference Speaker', category: 'Audio', supplierId: 'sup-2', unitPrice: 89, demand: 2 },
  { name: 'Studio Monitor Headphones', category: 'Audio', supplierId: 'sup-6', unitPrice: 92, demand: 2 },
  { name: 'Portable Bluetooth Travel Speaker', category: 'Audio', supplierId: 'sup-2', unitPrice: 38, demand: 4 },
  { name: 'Workstation 16" Developer Laptop', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 1240, demand: 2 },
  { name: 'UltraLight 13" Executive Ultrabook', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 920, demand: 3 },
  { name: 'Mini Desktop Compute Node i7', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 540, demand: 2 },
  { name: 'ChromeEnterprise 14" Fleetbook', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 360, demand: 4 },
  { name: 'Rugged Field Tablet 11"', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 610, demand: 1 },
  { name: 'Thin Client VDI Terminal', category: 'Laptops & Computing', supplierId: 'sup-3', unitPrice: 245, demand: 3 },
  { name: '34" Curved Ultrawide Monitor', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 430, demand: 2 },
  { name: '24" IPS Ergonomic Office Monitor', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 145, demand: 6 },
  { name: '15.6" Portable USB-C Travel Display', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 128, demand: 4 },
  { name: '32" Color-Calibrated Creator Display', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 590, demand: 1 },
  { name: 'Dual Monitor Gas-Spring Arm', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 52, demand: 5 },
  { name: '27" QHD 165Hz Productivity Panel', category: 'Monitors & Displays', supplierId: 'sup-4', unitPrice: 235, demand: 3 },
  { name: '8-Port Gigabit Managed Switch', category: 'Networking', supplierId: 'sup-5', unitPrice: 68, demand: 4 },
  { name: '24-Port PoE+ Rackmount Switch', category: 'Networking', supplierId: 'sup-5', unitPrice: 240, demand: 2 },
  { name: 'Wi-Fi 6E Ceiling Access Point', category: 'Networking', supplierId: 'sup-5', unitPrice: 118, demand: 4 },
  { name: 'Cat6A Shielded Patch Cable Pack', category: 'Networking', supplierId: 'sup-5', unitPrice: 19, demand: 9 },
  { name: 'USB-C to 2.5GbE Ethernet Adapter', category: 'Networking', supplierId: 'sup-5', unitPrice: 22, demand: 6 },
  { name: '5G Enterprise Failover Gateway', category: 'Networking', supplierId: 'sup-5', unitPrice: 295, demand: 1 },
  { name: 'Portable Rugged 2TB USB-C SSD', category: 'Storage & Memory', supplierId: 'sup-3', unitPrice: 112, demand: 4 },
  { name: 'DDR5 32GB SO-DIMM Memory Kit', category: 'Storage & Memory', supplierId: 'sup-3', unitPrice: 84, demand: 4 },
  { name: '4-Bay NAS Storage Enclosure', category: 'Storage & Memory', supplierId: 'sup-5', unitPrice: 380, demand: 1 },
  { name: '8TB Enterprise NAS Hard Drive', category: 'Storage & Memory', supplierId: 'sup-3', unitPrice: 155, demand: 3 },
  { name: '256GB Encrypted USB-C Flash Drive', category: 'Storage & Memory', supplierId: 'sup-6', unitPrice: 29, demand: 7 },
  { name: 'SDXC UHS-II 128GB Pro Card', category: 'Storage & Memory', supplierId: 'sup-6', unitPrice: 34, demand: 5 },
  { name: '140W GaN 4-Port USB-C Charger', category: 'Accessories & Power', supplierId: 'sup-1', unitPrice: 46, demand: 7 },
  { name: '27,000mAh PD Laptop Power Bank', category: 'Accessories & Power', supplierId: 'sup-1', unitPrice: 55, demand: 5 },
  { name: '65W Slim Universal Travel Adapter', category: 'Accessories & Power', supplierId: 'sup-6', unitPrice: 28, demand: 6 },
  { name: '1500VA Smart Sinewave UPS', category: 'Accessories & Power', supplierId: 'sup-5', unitPrice: 175, demand: 2 },
  { name: 'Aluminum Ventilated Laptop Stand', category: 'Accessories & Power', supplierId: 'sup-4', unitPrice: 26, demand: 6 },
  { name: 'Thunderbolt 4 Active Cable (2m)', category: 'Accessories & Power', supplierId: 'sup-1', unitPrice: 32, demand: 5 },
  { name: 'Braided USB-C 240W Cable 3-Pack', category: 'Accessories & Power', supplierId: 'sup-6', unitPrice: 16, demand: 10 },
  { name: 'Magnetic Privacy Screen 14"', category: 'Accessories & Power', supplierId: 'sup-4', unitPrice: 31, demand: 4 },
  { name: 'Smart 8-Outlet Surge Strip', category: 'Accessories & Power', supplierId: 'sup-6', unitPrice: 24, demand: 6 },
];

const VARIANT_SUFFIXES = ['Gen 2', 'Pro Edition'];

function buildRemainingProducts(): Product[] {
  const result: Product[] = [];
  const catCode: Record<ProductCategory, string> = {
    Peripherals: 'PER',
    Audio: 'AUD',
    'Laptops & Computing': 'LAP',
    'Monitors & Displays': 'MON',
    Networking: 'NET',
    'Storage & Memory': 'STO',
    'Accessories & Power': 'ACC',
  };

  for (let i = 0; i < 90; i++) {
    const template = CATALOG_TEMPLATES[i % CATALOG_TEMPLATES.length];
    const pass = Math.floor(i / CATALOG_TEMPLATES.length);
    const num = i + 11;
    const suffix = pass === 0 ? '' : ` ${VARIANT_SUFFIXES[(pass - 1) % VARIANT_SUFFIXES.length]}`;
    const name = `${template.name}${suffix}`;
    const sku = `SS-${catCode[template.category]}-${String(num).padStart(3, '0')}`;

    const dailyAvgDemand = Math.max(1, template.demand + ((i % 3) - 1));
    const minStock = dailyAvgDemand * 6;
    const maxStock = dailyAvgDemand * 26;

    // Deliberately distribute realistic inventory health across the 90 items:
    // ~72 healthy, ~11 low stock, ~4 critical, ~3 excess (plus the 10 hero products)
    let currentStock: number;
    let demandTrendPct: number;

    if (i % 23 === 4) {
      // Critical stock item
      currentStock = Math.max(2, Math.floor(dailyAvgDemand * 2));
      demandTrendPct = 14 + (i % 9);
    } else if (i % 9 === 2) {
      // Low stock item
      currentStock = Math.max(4, Math.floor(minStock * 0.72));
      demandTrendPct = 7 + (i % 10);
    } else if (i % 29 === 10) {
      // Excess inventory item
      currentStock = Math.floor(maxStock * 1.45);
      demandTrendPct = -10 - (i % 6);
    } else {
      // Healthy inventory item
      currentStock = Math.floor(minStock * 1.5 + ((i * 7) % (dailyAvgDemand * 12)));
      demandTrendPct = ((i % 15) - 4);
    }

    const unitPrice = Math.round(template.unitPrice * (pass === 0 ? 1 : 1.12) * 100) / 100;
    const retailPrice = Math.round(unitPrice * 1.58 * 100) / 100;
    const aisleLetters = ['A', 'B', 'C', 'D', 'E'];
    const warehouseLocation = `Aisle ${aisleLetters[i % aisleLetters.length]}-${String((i % 18) + 1).padStart(2, '0')}`;
    const dayOffset = (i % 20) + 1;
    const lastRestocked = `2026-10-${String(Math.min(28, dayOffset + 5)).padStart(2, '0')}`;

    result.push({
      id: `prod-${String(num).padStart(3, '0')}`,
      name,
      sku,
      category: template.category,
      currentStock,
      minStock,
      maxStock,
      dailyAvgDemand,
      demandTrendPct,
      supplierId: template.supplierId,
      unitPrice,
      retailPrice,
      warehouseLocation,
      lastRestocked,
    });
  }

  return result;
}

export const INITIAL_PRODUCTS: Product[] = [...HERO_PRODUCTS, ...buildRemainingProducts()];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2026-1041',
    supplierId: 'sup-4',
    supplierName: 'OptiView Display Systems',
    productId: 'prod-004',
    productName: 'UltraSharp 27" 4K Monitor',
    sku: 'SS-MON-004',
    quantity: 40,
    unitPrice: 310.0,
    totalCost: 12400.0,
    orderDate: '2026-11-12',
    expectedDeliveryDate: '2026-11-19',
    status: 'Shipped',
    notes: 'Priority freight replenishment for out-of-stock display SKU.',
  },
  {
    id: 'PO-2026-1042',
    supplierId: 'sup-5',
    supplierName: 'CoreLink Network Hardware',
    productId: 'prod-007',
    productName: 'Wi-Fi 7 Tri-Band Mesh Router',
    sku: 'SS-NET-007',
    quantity: 35,
    unitPrice: 165.0,
    totalCost: 5775.0,
    orderDate: '2026-11-15',
    expectedDeliveryDate: '2026-11-18',
    status: 'Approved',
    notes: 'Expedited 3-day fulfillment.',
  },
  {
    id: 'PO-2026-1043',
    supplierId: 'sup-3',
    supplierName: 'Apex Silicon & Computing',
    productId: 'prod-008',
    productName: 'NVMe Gen4 2TB SSD',
    sku: 'SS-STO-008',
    quantity: 60,
    unitPrice: 98.0,
    totalCost: 5880.0,
    orderDate: '2026-11-17',
    expectedDeliveryDate: '2026-11-23',
    status: 'Pending',
    notes: 'Awaiting warehouse bay allocation confirmation.',
  },
  {
    id: 'PO-2026-1038',
    supplierId: 'sup-2',
    supplierName: 'SoundWave Acoustics Corp.',
    productId: 'prod-017',
    productName: 'Active Noise-Canceling Earbuds',
    sku: 'SS-AUD-017',
    quantity: 80,
    unitPrice: 65.0,
    totalCost: 5200.0,
    orderDate: '2026-11-06',
    expectedDeliveryDate: '2026-11-10',
    status: 'Delivered',
    notes: 'Received and inspected in Bay 4.',
  },
];

export const INITIAL_ALERTS: SmartAlert[] = [
  {
    id: 'alt-001',
    title: 'Critical Stockout Imminent: Wireless Mouse',
    description:
      'Only 12 units remaining with 8 units/day average demand. Supplier NovaTech requires 5 days delivery — stockout predicted in 1.5 days.',
    category: 'Critical Stock',
    severity: 'Critical',
    timestamp: '10 mins ago',
    productId: 'prod-001',
    sku: 'SS-PER-001',
    resolved: false,
  },
  {
    id: 'alt-002',
    title: 'Out of Stock: UltraSharp 27" 4K Monitor',
    description:
      'Current stock is 0 units. Inbound PO-2026-1041 (40 units) is currently in transit and scheduled to arrive Nov 19.',
    category: 'Critical Stock',
    severity: 'Critical',
    timestamp: '34 mins ago',
    productId: 'prod-004',
    sku: 'SS-MON-004',
    resolved: false,
  },
  {
    id: 'alt-003',
    title: 'Demand Surge (+25%): Bluetooth Headphones',
    description:
      '7-day velocity jumped 25% above baseline. Current 26 units will deplete in 3.7 days ahead of the 4-day supplier lead time.',
    category: 'Predicted Stockout',
    severity: 'Critical',
    timestamp: '1 hour ago',
    productId: 'prod-002',
    sku: 'SS-AUD-002',
    resolved: false,
  },
  {
    id: 'alt-004',
    title: 'Low Inventory Warning: Mechanical Keyboards',
    description:
      'Stock fell to 20 units (below 55-unit safety floor). AI recommends replenishing 120 units to cover 5-day lead time and surge buffer.',
    category: 'Low Inventory',
    severity: 'Warning',
    timestamp: '2 hours ago',
    productId: 'prod-003',
    sku: 'SS-PER-003',
    resolved: false,
  },
  {
    id: 'alt-005',
    title: 'Low Inventory Warning: ProBook 14" Business Laptop',
    description:
      '9 units remaining at 4 units/day burn rate (2.3 days cover) vs. 6-day lead time from Apex Silicon.',
    category: 'Predicted Stockout',
    severity: 'Critical',
    timestamp: '3 hours ago',
    productId: 'prod-005',
    sku: 'SS-LAP-005',
    resolved: false,
  },
  {
    id: 'alt-006',
    title: 'Delayed Supplier Shipment: OptiView Display Systems',
    description:
      'Carrier weather advisory along I-5 corridor may add +1 day to PO-2026-1041 delivery schedule.',
    category: 'Delayed Delivery',
    severity: 'Warning',
    timestamp: '5 hours ago',
    productId: 'prod-004',
    sku: 'SS-MON-004',
    resolved: false,
  },
  {
    id: 'alt-007',
    title: 'Excess Inventory Alert: Studio Condenser USB Mic',
    description:
      '215 units on hand represents 107.5 days of supply while demand declined 9%. Consider promotional markdown or pausing reorders.',
    category: 'Excess Inventory',
    severity: 'Info',
    timestamp: 'Yesterday, 4:15 PM',
    productId: 'prod-009',
    sku: 'SS-AUD-009',
    resolved: false,
  },
];
