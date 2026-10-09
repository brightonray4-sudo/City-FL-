export type ItemCategory = 
  | 'crafts' 
  | 'spices_food' 
  | 'textiles' 
  | 'gemstones' 
  | 'safari_gear' 
  | 'wildlife_curios'
  | 'fanicha'; // Handcrafted Kenyan Furniture

export type VehicleId = 
  | 'foot' 
  | 'matatu' 
  | 'cruiser' 
  | 'bodaboda' 
  | 'rangerover' 
  | 'helicopter' 
  | 'privatejet';

export type TimeOfDay = 'dawn' | 'noon' | 'sunset' | 'night';

export type WeatherType = 'clear' | 'heavy_rain' | 'foggy_morning' | 'golden_heatwave';

export interface WeatherCondition {
  id: WeatherType;
  name: string;
  swahiliName: string;
  icon: string;
  description: string;
  ambientLightColor: number;
  sunIntensity: number;
  fogDensity: number;
  fogColor: number;
  trafficCongestionMultiplier: number;
  animalActivityModifier: {
    lionSpawnBoost: number;
    elephantSpawnBoost: number;
    photoValueBonus: number;
  };
  gameplayTip: string;
}

export interface TradeItem {
  id: string;
  name: string;
  swahiliName: string;
  category: ItemCategory;
  basePrice: number; // in Kenyan Shillings (KES)
  description: string;
  icon: string;
  weight: number; // kg
  rarity: 'common' | 'uncommon' | 'rare' | 'exotic';
}

export interface MarketItemListing {
  itemId: string;
  stock: number;
  maxStock: number;
  currentPrice: number;
  priceTrend: 'up' | 'down' | 'stable';
  volatility: number;
  boughtByPlayer: number;
  soldByPlayer: number;
}

export interface MerchantNPC {
  name: string;
  title: string;
  avatar: string;
  shengGreeting: string;
  bargainAffinity: number; // 0 to 1
  personalityDescription: string;
}

export interface Marketplace {
  id: string;
  name: string;
  district: string;
  tagline: string;
  description: string;
  worldPos: { x: number; z: number };
  color: string;
  merchant: MerchantNPC;
  inventory: Record<string, MarketItemListing>;
  specialtyCategory: ItemCategory;
  demandBonusMultiplier: Record<ItemCategory, number>; // items in high demand pay more
}

export interface InventorySlot {
  itemId: string;
  quantity: number;
  avgPurchasePrice: number;
}

export interface WildlifePhoto {
  id: string;
  animalSpecies: string;
  animalSwahili: string;
  quality: number; // 0 - 100
  kesReward: number;
  timestamp: string;
  location: string;
  notes: string;
}

export interface Quest {
  id: string;
  title: string;
  client: string;
  type: 'trade_arbitrage' | 'delivery' | 'wildlife_photo' | 'matatu_rush';
  description: string;
  targetMarketId?: string;
  targetAnimal?: string;
  targetItemId?: string;
  targetQuantity?: number;
  currentProgress: number;
  targetProgress: number;
  rewardKES: number;
  rewardReputation: number;
  completed: boolean;
}

export interface WildlifeEntity {
  id: string;
  species: 'lion' | 'elephant' | 'giraffe' | 'zebra' | 'rhino';
  swahiliName: string;
  scientificName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  basePhotoValue: number;
  position: { x: number; z: number };
  heading: number;
  behavior: 'grazing' | 'walking' | 'resting' | 'alert';
  behaviorTimer: number;
  scale: number;
  funFact: string;
}

export interface PlayerStats {
  kes: number;
  reputation: Record<string, number>;
  totalTrades: number;
  totalProfitKES: number;
  distanceTraveledKm: number;
  photosTaken: number;
}

export interface TrafficBottleneck {
  id: string;
  name: string;
  swahiliTitle: string;
  roadName: string;
  cause: 'police_checkpoint' | 'matatu_stage_rush' | 'mkokoteni_spill' | 'road_works' | 'expressway_merge';
  position: { x: number; z: number };
  radius: number;
  severity: number; // 0 to 100%
  description: string;
  detourAdvice: string;
  active: boolean;
  clearTimeRemainingSec: number;
}

export interface RealEstateProperty {
  id: string;
  name: string;
  swahiliTitle: string;
  location: string;
  priceKES: number;
  dailyIncomeKES: number; // passive rent income
  description: string;
  category: 'mansion' | 'penthouse' | 'safari_lodge' | 'estate' | 'apartment';
  features: string[];
  worldPos: { x: number; z: number };
  isOwned: boolean;
  furnishedItems: string[]; // fanichas placed in property
}

export interface OnlinePlayer {
  id: string;
  name: string;
  title: string;
  avatar: string;
  netWorthKES: number;
  currentVehicle: VehicleId;
  propertyCount: number;
  location: string;
  status: 'driving' | 'trading' | 'flying' | 'at_estate' | 'safari_patrol';
  lastAction: string;
  isFriend?: boolean;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  symbol: string;
  sector: 'equities' | 'plantations' | 'mining' | 'aviation';
  priceKES: number;
  dividendYieldPercent: number;
  description: string;
  ownedShares: number;
}


