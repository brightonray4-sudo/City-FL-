import React, { useState, useEffect, useRef } from 'react';
import { WorldScene } from './game3d/WorldScene';
import { Marketplace, VehicleId, InventorySlot, WildlifePhoto, Quest, WildlifeEntity, TrafficBottleneck, RealEstateProperty, OnlinePlayer, WeatherCondition, WeatherType } from './types/game';
import { INITIAL_MARKETS, INITIAL_CHAT_MESSAGES, ChatMessage, calculateBuyPrice, calculateSellPrice, TRADE_ITEMS } from './data/economy';
import { INITIAL_QUESTS, INITIAL_WILDLIFE } from './data/questsAndWildlife';
import { LUXURY_VEHICLES, INITIAL_PROPERTIES, INITIAL_ONLINE_PLAYERS, BuyableVehicle } from './data/realEstateAndLuxury';
import { WEATHER_PRESETS } from './data/weather';
import { soundManager } from './audio/soundManager';

import { MarketTradeModal } from './components/MarketTradeModal';
import { ChatOverlay } from './components/ChatOverlay';
import { WildlifeCameraHUD } from './components/WildlifeCameraHUD';
import { EconomyOverviewModal } from './components/EconomyOverviewModal';
import { GarageModal } from './components/GarageModal';
import { QuestsModal } from './components/QuestsModal';
import { MiniMap } from './components/MiniMap';
import { RadioPlayer } from './components/RadioPlayer';
import { FieldGuideModal } from './components/FieldGuideModal';
import { LoginModal, UserProfile } from './components/LoginModal';
import { LuxuryDealershipModal } from './components/LuxuryDealershipModal';
import { RealEstateModal } from './components/RealEstateModal';
import { OnlinePlayersModal } from './components/OnlinePlayersModal';
import { WeatherModal } from './components/WeatherModal';

import { 
  Camera, 
  Store, 
  Truck, 
  Award, 
  TrendingUp, 
  BookOpen, 
  Compass, 
  Sun, 
  Moon, 
  Clock, 
  Volume2, 
  VolumeX,
  Gauge,
  Navigation,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Home,
  Plane,
  Users,
  User,
  AlertTriangle,
  ShieldCheck,
  Flame,
  Bell,
  LogIn
} from 'lucide-react';

export default function App() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const worldSceneRef = useRef<WorldScene | null>(null);

  // Online Account & Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('nairobi_safari_user_profile');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      username: 'Captain_Kariuki',
      avatar: '🤠',
      title: 'East Africa High-Flyer (Tajiri)',
      joinDate: 'Oct 2026',
    };
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Vehicles & Aircraft Dealership State
  const [vehicles, setVehicles] = useState<BuyableVehicle[]>(() => {
    try {
      const saved = localStorage.getItem('nairobi_safari_owned_vehicles');
      if (saved) {
        const ownedIds = new Set(JSON.parse(saved));
        return LUXURY_VEHICLES.map(v => ({ ...v, isOwned: v.isOwned || ownedIds.has(v.id) }));
      }
    } catch (_) {}
    return LUXURY_VEHICLES;
  });
  const [isDealershipOpen, setIsDealershipOpen] = useState<boolean>(false);

  // Real Estate & Mansions State
  const [properties, setProperties] = useState<RealEstateProperty[]>(() => {
    try {
      const saved = localStorage.getItem('nairobi_safari_properties');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_PROPERTIES;
  });
  const [isRealEstateOpen, setIsRealEstateOpen] = useState<boolean>(false);

  // Online Players Roster & Leaderboard
  const [onlinePlayers] = useState<OnlinePlayer[]>(INITIAL_ONLINE_PLAYERS);
  const [isOnlinePlayersOpen, setIsOnlinePlayersOpen] = useState<boolean>(false);

  // Traffic Bottleneck & Gridlock System
  const [trafficBottlenecks, setTrafficBottlenecks] = useState<TrafficBottleneck[]>([]);
  const [playerInJam, setPlayerInJam] = useState<boolean>(false);
  const [currentJam, setCurrentJam] = useState<TrafficBottleneck | null>(null);
  const [jamAlertDismissed, setJamAlertDismissed] = useState<boolean>(false);

  // Dynamic Weather System State
  const [currentWeather, setCurrentWeather] = useState<WeatherCondition>(WEATHER_PRESETS.clear);
  const [isWeatherModalOpen, setIsWeatherModalOpen] = useState<boolean>(false);

  // Game States
  const [markets, setMarkets] = useState<Marketplace[]>(INITIAL_MARKETS);
  const [wildlife] = useState<WildlifeEntity[]>(INITIAL_WILDLIFE);
  const [playerCash, setPlayerCash] = useState<number>(3800); // starts with 3,800 KES
  const [playerInventory, setPlayerInventory] = useState<InventorySlot[]>([
    { itemId: 'mahindi_choma', quantity: 2, avgPurchasePrice: 90 },
    { itemId: 'bush_dawa_tincture', quantity: 1, avgPurchasePrice: 650 },
  ]);
  const [currentVehicle, setCurrentVehicle] = useState<VehicleId>('matatu');
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [recentPhotos, setRecentPhotos] = useState<WildlifePhoto[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [totalTrades, setTotalTrades] = useState<number>(0);
  const [totalProfit, setTotalProfit] = useState<number>(0);

  // HUD Dynamic Feedback
  const [speedKmH, setSpeedKmH] = useState<number>(0);
  const [gameTimeString, setGameTimeString] = useState<string>('08:30 EAT');
  const [dayNightProgress, setDayNightProgress] = useState<number>(0.1);
  const [playerPos, setPlayerPos] = useState({ x: 0, z: 10, heading: 0 });
  const [activeMarketProximity, setActiveMarketProximity] = useState<Marketplace | null>(null);
  const [activeNpcProximity, setActiveNpcProximity] = useState<{ name: string; role: string; dialogue: string } | null>(null);
  const [animalInView, setAnimalInView] = useState<WildlifeEntity | null>(null);
  const [animalDistance, setAnimalDistance] = useState<number>(0);

  // Modals & Panels
  const [activeModalMarket, setActiveModalMarket] = useState<Marketplace | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isEconomyOverviewOpen, setIsEconomyOverviewOpen] = useState<boolean>(false);
  const [isGarageOpen, setIsGarageOpen] = useState<boolean>(false);
  const [isQuestsOpen, setIsQuestsOpen] = useState<boolean>(false);
  const [isFieldGuideOpen, setIsFieldGuideOpen] = useState<boolean>(false);

  // Mobile Touch Controls
  const [touchSteerLeft, setTouchSteerLeft] = useState(false);
  const [touchSteerRight, setTouchSteerRight] = useState(false);
  const [touchGas, setTouchGas] = useState(false);
  const [touchBrake, setTouchBrake] = useState(false);

  // Initialize 3D World Scene
  useEffect(() => {
    if (!canvasContainerRef.current) return;

    const scene = new WorldScene(
      canvasContainerRef.current,
      markets,
      wildlife,
      {
        onMarketProximity: (m) => setActiveMarketProximity(m),
        onAnimalInView: (a, dist) => {
          setAnimalInView(a);
          setAnimalDistance(dist);
        },
        onSpeedUpdate: (spd) => setSpeedKmH(spd),
        onTimeUpdate: (_hour, str, progress) => {
          setGameTimeString(str);
          setDayNightProgress(progress);
        },
        onPositionUpdate: (pos) => setPlayerPos(pos),
        onNpcProximity: (npc) => setActiveNpcProximity(npc),
        onBottlenecksUpdate: (list) => setTrafficBottlenecks(list),
        onPlayerInJam: (inJam, jam) => {
          setPlayerInJam(inJam);
          setCurrentJam(jam);
          if (inJam) {
            setJamAlertDismissed(false);
          }
        },
        onWeatherChange: (w) => handleWeatherChange(w),
      }
    );

    worldSceneRef.current = scene;

    return () => {
      scene.destroy();
      worldSceneRef.current = null;
    };
  }, []);

  // Update touch inputs to 3D world
  useEffect(() => {
    if (worldSceneRef.current) {
      worldSceneRef.current.setTouchInput(
        touchGas,
        touchBrake,
        touchSteerLeft,
        touchSteerRight,
        false
      );
    }
  }, [touchGas, touchBrake, touchSteerLeft, touchSteerRight]);

  // Keyboard shortcut listener for interactive shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in chat
      if (document.activeElement?.tagName === 'INPUT') return;

      if (e.code === 'KeyE' && activeMarketProximity) {
        setActiveModalMarket(activeMarketProximity);
      } else if (e.code === 'KeyC') {
        togglePhotoCamera();
      } else if (e.code === 'KeyT') {
        setIsChatOpen(prev => !prev);
      } else if (e.code === 'KeyM') {
        setIsEconomyOverviewOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [activeMarketProximity, isCameraActive]);

  // Vehicle Switch Handler
  const handleSelectVehicle = (vehicle: VehicleId) => {
    setCurrentVehicle(vehicle);
    if (worldSceneRef.current) {
      worldSceneRef.current.setVehicle(vehicle);
    }
  };

  // Photo camera toggle
  const togglePhotoCamera = () => {
    const nextState = !isCameraActive;
    setIsCameraActive(nextState);
    if (worldSceneRef.current) {
      worldSceneRef.current.setPhotoCameraMode(nextState);
    }
  };

  // Weather change and selection handlers
  const handleWeatherChange = (newWeather: WeatherCondition) => {
    setCurrentWeather(newWeather);

    let text = '';
    if (newWeather.id === 'heavy_rain') {
      text = '🌧️ KMD TAHADHARI YA MVUA: Mvua kubwa ya Masika inanyesha Nairobi CBD! Foleni imeongezeka kwa +65% barabara zikiwa telezi. Tumia Expressway au panda Boda Boda!';
    } else if (newWeather.id === 'foggy_morning') {
      text = '🌫️ KWS ILANI YA PORINI: Ukungu mzito wa asubuhi kote Aberdares na Mara! Simba wameonekana wakiwinda. Zawadi za picha za wanyama zimeongezwa kwa +35%!';
    } else if (newWeather.id === 'golden_heatwave') {
      text = '☀️ RIPOTI YA MARA: Joto kali la kiangazi linaendelea. Makundi ya tembo na punda milia yanakusanyika kando ya vyanzo vya maji!';
    } else {
      text = '☀️ HALI YA HEWA: Anga safi na jua mwanana kote Nairobi na mbuga ya wanyama.';
    }

    const notice: ChatMessage = {
      id: `weather_${Date.now()}`,
      sender: 'Kenya Met & Ranger Dispatch',
      role: 'ranger',
      avatar: '🌤️',
      channel: 'all',
      text,
      shengSubtext: `${newWeather.name} active across Kenya. Gameplay modifiers applied.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [notice, ...prev]);
  };

  const handleSelectWeather = (wType: WeatherType) => {
    if (worldSceneRef.current) {
      worldSceneRef.current.setWeather(wType);
    }
  };

  // Snap wildlife photo handler
  const handleSnapPhoto = (photo: WildlifePhoto) => {
    // Dynamic Weather photo bonus (+35% for foggy morning mist captures!)
    const weatherBonus = currentWeather.animalActivityModifier.photoValueBonus;
    const finalReward = weatherBonus > 0
      ? Math.round(photo.kesReward * (1 + weatherBonus))
      : photo.kesReward;

    setPlayerCash(c => c + finalReward);
    const photoWithReward = { ...photo, kesReward: finalReward };
    setRecentPhotos(prev => [photoWithReward, ...prev]);

    // Check if any quest matches this photo
    setQuests(prevQuests =>
      prevQuests.map(q => {
        if (q.type === 'wildlife_photo' && q.targetAnimal && photo.animalSpecies.toLowerCase().includes(q.targetAnimal)) {
          return { ...q, currentProgress: q.targetProgress };
        }
        return q;
      })
    );

    // Broadcast photo announcement to radio/chat!
    const bonusText = weatherBonus > 0
      ? ` (Includes +${Math.round(weatherBonus * 100)}% ${currentWeather.name} Mist Bounty Bonus!)`
      : '';

    const newBroadcast: ChatMessage = {
      id: `chat_snap_${Date.now()}`,
      sender: 'KWS Wildlife Dispatch',
      role: 'ranger',
      avatar: '📸',
      channel: 'safari_rangers',
      text: `Hongera! New high-res photo captured of ${photo.animalSwahili} (${photo.quality}% clarity) awarded ${finalReward.toLocaleString()} KES!${bonusText}`,
      shengSubtext: 'Safari photography bounty registered at Kenya Wildlife Service.',
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [newBroadcast, ...prev]);
  };

  // Buy Item from Marketplace
  const handleBuyItem = (itemId: string, quantity: number, pricePerUnit: number) => {
    const totalCost = pricePerUnit * quantity;
    if (playerCash < totalCost) return;

    setPlayerCash(c => c - totalCost);

    // Update Player Inventory
    setPlayerInventory(prev => {
      const existing = prev.find(i => i.itemId === itemId);
      if (existing) {
        const totalQty = existing.quantity + quantity;
        const newAvg = (existing.avgPurchasePrice * existing.quantity + totalCost) / totalQty;
        return prev.map(i => i.itemId === itemId ? { ...i, quantity: totalQty, avgPurchasePrice: newAvg } : i);
      }
      return [...prev, { itemId, quantity, avgPurchasePrice: pricePerUnit }];
    });

    // Update Market Stock & Raise Price due to scarcity (Player purchasing pressure)
    setMarkets(prevMarkets =>
      prevMarkets.map(m => {
        if (activeModalMarket && m.id === activeModalMarket.id) {
          const itemListing = m.inventory[itemId];
          if (!itemListing) return m;

          const updatedStock = Math.max(0, itemListing.stock - quantity);
          // Price climbs when bought out
          const newPrice = Math.round(itemListing.currentPrice * 1.05);

          return {
            ...m,
            inventory: {
              ...m.inventory,
              [itemId]: {
                ...itemListing,
                stock: updatedStock,
                currentPrice: newPrice,
                priceTrend: 'up',
                boughtByPlayer: itemListing.boughtByPlayer + quantity,
              },
            },
          };
        }
        return m;
      })
    );

    setTotalTrades(t => t + 1);

    // Live chat broadcast
    const marketName = activeModalMarket?.name.split(' ')[0] || 'Market';
    const msg: ChatMessage = {
      id: `buy_${Date.now()}`,
      sender: activeModalMarket?.merchant.name || 'Merchant',
      role: 'merchant',
      avatar: activeModalMarket?.merchant.avatar || '🏪',
      channel: 'market_rumors',
      text: `Mteja amenunua ${quantity}x ya bidhaa hii! Stock inapungua kule ${marketName}. Bei inapanda taratibu!`,
      shengSubtext: `Heavy purchases reported at ${marketName}. Supply diminishing!`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [msg, ...prev]);
  };

  // Sell Item to Marketplace
  const handleSellItem = (itemId: string, quantity: number, pricePerUnit: number) => {
    const totalRevenue = pricePerUnit * quantity;
    const invSlot = playerInventory.find(i => i.itemId === itemId);
    if (!invSlot || invSlot.quantity < quantity) return;

    const unitCost = invSlot.avgPurchasePrice;
    const profit = Math.round((pricePerUnit - unitCost) * quantity);

    setPlayerCash(c => c + totalRevenue);
    setTotalProfit(p => p + profit);
    setTotalTrades(t => t + 1);

    // Update Player Inventory
    setPlayerInventory(prev =>
      prev
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i)
        .filter(i => i.quantity > 0)
    );

    // Update Market Stock & Drop Price due to supply saturation
    setMarkets(prevMarkets =>
      prevMarkets.map(m => {
        if (activeModalMarket && m.id === activeModalMarket.id) {
          const itemListing = m.inventory[itemId];
          const currentStock = itemListing ? itemListing.stock : 0;
          const currentPrice = itemListing ? itemListing.currentPrice : pricePerUnit;

          // Price decreases slightly when dumped
          const newPrice = Math.max(20, Math.round(currentPrice * 0.96));

          return {
            ...m,
            inventory: {
              ...m.inventory,
              [itemId]: {
                itemId,
                stock: currentStock + quantity,
                maxStock: itemListing ? itemListing.maxStock : 20,
                currentPrice: newPrice,
                priceTrend: 'down',
                volatility: itemListing ? itemListing.volatility : 0.05,
                boughtByPlayer: itemListing ? itemListing.boughtByPlayer : 0,
                soldByPlayer: (itemListing?.soldByPlayer || 0) + quantity,
              },
            },
          };
        }
        return m;
      })
    );
  };

  // Complete Quest Handler
  const handleCompleteQuest = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;

    if (quest.type === 'delivery' && quest.targetItemId) {
      // Deduct items from inventory
      setPlayerInventory(prev =>
        prev
          .map(i => i.itemId === quest.targetItemId ? { ...i, quantity: i.quantity - (quest.targetQuantity || 1) } : i)
          .filter(i => i.quantity > 0)
      );
    }

    setPlayerCash(c => c + quest.rewardKES);
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, completed: true } : q));

    // Chat celebration broadcast
    const doneMsg: ChatMessage = {
      id: `quest_done_${Date.now()}`,
      sender: quest.client,
      role: 'citizen',
      avatar: '🌟',
      channel: 'all',
      text: `Asante sana! Agizo la "${quest.title}" limekamilika! Pesa ya KES ${quest.rewardKES.toLocaleString()} imelipwa taslimu.`,
      shengSubtext: `Order completed! Payment dispatched.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [doneMsg, ...prev]);
  };

  // Chat message sender
  const handleSendMessage = (text: string, channel: 'all' | 'nairobi_cb' | 'safari_rangers' | 'market_rumors') => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'Player (Driver / Trader)',
      role: 'player',
      avatar: '🤠',
      channel,
      text,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [newMsg, ...prev]);

    // NPC automatic reply simulation
    setTimeout(() => {
      let reply: ChatMessage;
      if (text.toLowerCase().includes('simba') || text.toLowerCase().includes('lion')) {
        reply = {
          id: `rep_${Date.now()}`,
          sender: 'Ranger Jackson (Mara Post)',
          role: 'ranger',
          avatar: '🤠',
          channel: 'safari_rangers',
          text: 'Ndio! Simba wako karibu na kopjes upande wa magharibi. Endesha gari pole pole ukiingia kwenye nyasi ndefu.',
          shengSubtext: 'Lions confirmed near western rock kopjes. Drive stealthily through tall grass.',
          timeAgo: 'Just now',
        };
      } else if (text.toLowerCase().includes('fanicha') || text.toLowerCase().includes('meza')) {
        reply = {
          id: `rep_${Date.now()}`,
          sender: 'Fundi Omari (Ngong Road)',
          role: 'merchant',
          avatar: '🪵',
          channel: 'market_rumors',
          text: 'Karakhana ya Ngong Road iko tayari! Nina meza ya mahogany iliyo tayari kwa bei ya KES 7,200 pekee. Karibu upakie kwenye gari!',
          shengSubtext: 'Ngong Road workshop has fresh solid mahogany tables waiting for transport!',
          timeAgo: 'Just now',
        };
      } else {
        reply = {
          id: `rep_${Date.now()}`,
          sender: 'Kev Makanga (Ngara)',
          role: 'matatu_crew',
          avatar: '🧢',
          channel: 'nairobi_cb',
          text: 'Safi sana buda! Hapa Ngara tuko rada. Endesha gari poa tusikwame kwa jam ya Uhuru Highway!',
          shengSubtext: 'Roger that! Stay sharp and navigate clear of expressway traffic.',
          timeAgo: 'Just now',
        };
      }
      setChatMessages(prev => [reply, ...prev]);
    }, 1200);
  };

  // Fast Travel handler
  const handleFastTravel = (targetMarket: Marketplace) => {
    if (worldSceneRef.current) {
      worldSceneRef.current.teleportTo(targetMarket.worldPos.x + 6, targetMarket.worldPos.z + 6);
    }
  };

  // Player Net Worth Calculation (Cash + Estates + Vehicles + Inventory Cargo)
  const playerNetWorth = 
    playerCash +
    properties.filter(p => p.isOwned).reduce((sum, p) => sum + p.priceKES, 0) +
    vehicles.filter(v => v.isOwned).reduce((sum, v) => sum + v.priceKES, 0) +
    playerInventory.reduce((sum, slot) => sum + slot.quantity * slot.avgPurchasePrice, 0);

  // Profile Save / Login Handler
  const handleSaveProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    try {
      localStorage.setItem('nairobi_safari_user_profile', JSON.stringify(newProfile));
    } catch (_) {}
    const loginMsg: ChatMessage = {
      id: `login_${Date.now()}`,
      sender: newProfile.username,
      role: 'player',
      avatar: newProfile.avatar,
      channel: 'all',
      text: `Karibu Nairobi! ${newProfile.username} (${newProfile.title}) ameingia mtandaoni kwenye Server 01.`,
      shengSubtext: `${newProfile.username} has logged into Nairobi Server 01.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [loginMsg, ...prev]);
  };

  // Buy Vehicle from Dealership (Cars, Helicopters, Private Jets)
  const handleBuyVehicle = (vehicle: BuyableVehicle) => {
    if (playerCash < vehicle.priceKES) return;
    const newCash = playerCash - vehicle.priceKES;
    setPlayerCash(newCash);

    const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? { ...v, isOwned: true } : v);
    setVehicles(updatedVehicles);
    try {
      const ownedIds = updatedVehicles.filter(v => v.isOwned).map(v => v.id);
      localStorage.setItem('nairobi_safari_owned_vehicles', JSON.stringify(ownedIds));
    } catch (_) {}

    const broadcast: ChatMessage = {
      id: `veh_${Date.now()}`,
      sender: 'Westlands Motors & Wilson Aviation',
      role: 'merchant',
      avatar: '🏎️',
      channel: 'all',
      text: `Hongera ${userProfile.username}! Umemiliki ${vehicle.name} (${vehicle.priceKES.toLocaleString()} KES)! Gari / ndege iko tayari kwa kuruka au kuendeshwa.`,
      shengSubtext: `Fleet acquisition registered at hangar!`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [broadcast, ...prev]);
  };

  // Deploy Vehicle to Nairobi
  const handleDeployVehicle = (vehicleId: VehicleId) => {
    handleSelectVehicle(vehicleId);
    soundManager.playHorn();
  };

  // Buy Real Estate Property (Mansions, Penthouses, Lodges)
  const handleBuyProperty = (property: RealEstateProperty) => {
    if (playerCash < property.priceKES) return;
    const newCash = playerCash - property.priceKES;
    setPlayerCash(newCash);

    const updatedProperties = properties.map(p => p.id === property.id ? { ...p, isOwned: true } : p);
    setProperties(updatedProperties);
    try {
      localStorage.setItem('nairobi_safari_properties', JSON.stringify(updatedProperties));
    } catch (_) {}

    const deedMsg: ChatMessage = {
      id: `prop_${Date.now()}`,
      sender: 'Kenya Land Registry & Deeds',
      role: 'citizen',
      avatar: '🏛️',
      channel: 'all',
      text: `Hati miliki imetolewa rasmi! ${userProfile.username} sasa anamiliki ${property.name} huko ${property.location}! Mapato ya kodi ni KES ${property.dailyIncomeKES.toLocaleString()} kwa siku.`,
      shengSubtext: `Deed confirmed. Estate added to portfolio.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [deedMsg, ...prev]);
  };

  // Furnish Property with Handcrafted Fanicha Furniture
  const handleFurnishProperty = (propertyId: string, fanichaItemId: string) => {
    const invSlot = playerInventory.find(i => i.itemId === fanichaItemId && i.quantity > 0);
    if (!invSlot) return;

    // Deduct 1 from inventory
    setPlayerInventory(prev => 
      prev
        .map(i => i.itemId === fanichaItemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    );

    // Add to property and boost daily income by 15%
    const updatedProperties = properties.map(p => {
      if (p.id === propertyId) {
        const newFurnished = [...p.furnishedItems, fanichaItemId];
        const boostedIncome = Math.round(p.dailyIncomeKES * 1.15);
        return { ...p, furnishedItems: newFurnished, dailyIncomeKES: boostedIncome };
      }
      return p;
    });
    setProperties(updatedProperties);
    try {
      localStorage.setItem('nairobi_safari_properties', JSON.stringify(updatedProperties));
    } catch (_) {}

    const furItem = TRADE_ITEMS[fanichaItemId];
    const prop = properties.find(p => p.id === propertyId);
    const furMsg: ChatMessage = {
      id: `fur_${Date.now()}`,
      sender: 'Fundi Omari (Ngong Road Workshop)',
      role: 'merchant',
      avatar: '🪵',
      channel: 'market_rumors',
      text: `Fanicha safi ya ${furItem?.name || 'mbao'} imefungwa kwenye ${prop?.name || 'jumba'}! Kodi ya jumba imepanda kwa asilimia 15!`,
      shengSubtext: `Handcrafted Fanicha installed. Property valuation and rental yield increased by 15%!`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [furMsg, ...prev]);
  };

  // Collect Rent Dividends from Owned Estates
  const handleCollectRent = () => {
    const totalDailyRent = properties.filter(p => p.isOwned).reduce((acc, p) => acc + p.dailyIncomeKES, 0);
    if (totalDailyRent <= 0) return;

    setPlayerCash(c => c + totalDailyRent);
    const rentMsg: ChatMessage = {
      id: `rent_${Date.now()}`,
      sender: 'M-Pesa Estate Dividends',
      role: 'citizen',
      avatar: '💰',
      channel: 'all',
      text: `CONFIRMED: KES ${totalDailyRent.toLocaleString()} rent dividends deposited to your M-Pesa from your Nairobi estates portfolio.`,
      shengSubtext: `Daily property rental payout cleared.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [rentMsg, ...prev]);
  };

  // Direct Message to Online Players
  const handleSendOnlineMessage = (recipientName: string) => {
    setIsChatOpen(true);
    const promptMsg: ChatMessage = {
      id: `chat_prompt_${Date.now()}`,
      sender: userProfile.username,
      role: 'player',
      avatar: userProfile.avatar,
      channel: 'nairobi_cb',
      text: `@${recipientName}: Niaje mkuu! Tuko rada Nairobi streets. How's the fleet and trade doing?`,
      shengSubtext: `Direct radio hail to ${recipientName}.`,
      timeAgo: 'Just now',
    };
    setChatMessages(prev => [promptMsg, ...prev]);

    setTimeout(() => {
      const replyMsg: ChatMessage = {
        id: `rep_online_${Date.now()}`,
        sender: recipientName,
        role: 'citizen',
        avatar: '👑',
        channel: 'nairobi_cb',
        text: `Poa sana @${userProfile.username}! Niko juu ya anga nikiruka na jet kuelekea Mara. Kuja tupatane kwa airstrip!`,
        shengSubtext: `Cruising above the clouds! Catch me at the airstrip.`,
        timeAgo: 'Just now',
      };
      setChatMessages(prev => [replyMsg, ...prev]);
    }, 1000);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 font-sans">
      
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasContainerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* TOP HUD BAR */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        
        {/* Left: Brand, Time, Login Chip & Speedometer */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Brand & Time */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-stone-900/90 border border-stone-700/80 shadow-2xl backdrop-blur-md">
            <span className="text-xl">🇰🇪</span>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-white tracking-wide font-display">
                  NAIROBI SAFARI
                </h1>
                <span className="text-stone-500">·</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider hidden sm:inline">
                  Wild Horizons
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-300 font-mono mt-0.5">
                {dayNightProgress > 0.25 && dayNightProgress < 0.65 ? (
                  <Sun size={12} className="text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon size={12} className="text-cyan-300" />
                )}
                <span className="font-semibold text-white">{gameTimeString}</span>
                <span className="text-stone-500">|</span>
                <span className="text-[9px] text-stone-400">15m cycle</span>
              </div>
            </div>
          </div>

          {/* User Profile & Login Button */}
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 shadow-2xl backdrop-blur-md text-stone-200 transition-all hover:scale-105"
            title="Citizen ID & Account Login"
          >
            <span className="text-xl">{userProfile.avatar}</span>
            <div className="text-left hidden md:block">
              <div className="text-xs font-extrabold text-white leading-tight flex items-center gap-1.5">
                <span>{userProfile.username}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-amber-300 font-semibold block leading-tight">
                {userProfile.title}
              </div>
            </div>
          </button>

          {/* Speedometer */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 border border-stone-700/80 shadow-2xl backdrop-blur-md font-mono">
            <Gauge size={16} className="text-amber-400" />
            <div>
              <div className="text-xs font-bold text-white leading-none">
                {speedKmH} <span className="text-[10px] text-stone-400">KM/H</span>
              </div>
              <div className="text-[9px] text-stone-400 uppercase tracking-widest mt-0.5">
                {currentVehicle.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Dynamic Weather HUD Chip & Live Radio Player */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Dynamic Weather HUD Chip */}
          <button
            onClick={() => setIsWeatherModalOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer ${
              currentWeather.id === 'heavy_rain'
                ? 'bg-blue-950/90 border-blue-400/80 text-blue-100 ring-2 ring-blue-500/30'
                : currentWeather.id === 'foggy_morning'
                ? 'bg-slate-900/90 border-cyan-400/80 text-cyan-100 ring-2 ring-cyan-500/30'
                : currentWeather.id === 'golden_heatwave'
                ? 'bg-amber-950/90 border-amber-400/80 text-amber-100 ring-2 ring-amber-500/30'
                : 'bg-stone-900/90 border-stone-700/80 text-stone-200'
            }`}
            title="Kenya Met Department: Click for Live Weather Forecast & Controls"
          >
            <span className="text-xl animate-bounce-subtle">{currentWeather.icon}</span>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{currentWeather.name}</span>
                <span className="text-[10px] text-amber-300 font-medium hidden md:inline">({currentWeather.swahiliName})</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] font-semibold mt-0.5">
                {currentWeather.id === 'heavy_rain' ? (
                  <span className="text-rose-300 bg-rose-950/90 px-1.5 py-0.2 rounded border border-rose-500/40">
                    🌧️ Gridlock +65% · Slick
                  </span>
                ) : currentWeather.id === 'foggy_morning' ? (
                  <span className="text-cyan-300 bg-cyan-950/90 px-1.5 py-0.2 rounded border border-cyan-500/40">
                    🦁 Lions Stalking · +35% Photo Bounty
                  </span>
                ) : currentWeather.id === 'golden_heatwave' ? (
                  <span className="text-amber-300 bg-amber-950/90 px-1.5 py-0.2 rounded border border-amber-500/40">
                    🐘 Elephants at Waterhole
                  </span>
                ) : (
                  <span className="text-emerald-300">
                    ✓ Clear Savannah Skies
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Live Radio Player */}
          <div className="hidden xl:block">
            <RadioPlayer />
          </div>
        </div>

        {/* Right: Wallet & Quick Actions Bar */}
        <div className="flex items-center gap-2.5 pointer-events-auto">
          {/* Player KES Wallet */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 border border-emerald-500/50 shadow-2xl backdrop-blur-md">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <div className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">
                M-Pesa / Cash
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-emerald-400 tracking-tight">
                {playerCash.toLocaleString()} <span className="text-[10px] text-stone-400 font-bold">KES</span>
              </div>
            </div>
          </div>

          {/* Luxury Dealership (Cars & Jets) */}
          <button
            onClick={() => setIsDealershipOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600/90 to-amber-500/90 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-extrabold text-xs shadow-2xl backdrop-blur-md transition-all hover:scale-105"
            title="Buy Cars, Choppers & Private Jets"
          >
            <Plane size={15} />
            <span className="hidden sm:inline">Fleet & Jets</span>
          </button>

          {/* Real Estate (Mansions & Penthouses) */}
          <button
            onClick={() => setIsRealEstateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 text-amber-300 font-bold text-xs shadow-2xl backdrop-blur-md transition-all hover:scale-105"
            title="Buy Mansions, Penthouses & Lodges"
          >
            <Home size={15} />
            <span className="hidden sm:inline">Estates</span>
          </button>

          {/* Online Players Leaderboard */}
          <button
            onClick={() => setIsOnlinePlayersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 text-stone-200 font-bold text-xs shadow-2xl backdrop-blur-md transition-all hover:scale-105"
            title="Online Players & Moguls (64 Online)"
          >
            <Users size={15} className="text-cyan-400" />
            <span className="hidden md:inline">Online (64)</span>
          </button>

          {/* Action Icons Menu */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-900/90 border border-stone-700/80 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => setIsGarageOpen(true)}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors"
              title="Vehicle Garage & Rides"
            >
              <Truck size={17} />
            </button>
            <button
              onClick={() => setIsEconomyOverviewOpen(true)}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors"
              title="Commodity Exchange & Arbitrage"
            >
              <TrendingUp size={17} />
            </button>
            <button
              onClick={() => setIsQuestsOpen(true)}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors relative"
              title="Missions & Deliveries"
            >
              <Award size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400"></span>
            </button>
            <button
              onClick={togglePhotoCamera}
              className={`p-2 rounded-xl transition-colors ${
                isCameraActive
                  ? 'bg-amber-500 text-stone-950'
                  : 'hover:bg-stone-800 text-stone-300 hover:text-amber-400'
              }`}
              title="Safari Telephoto Camera [C]"
            >
              <Camera size={17} />
            </button>
            <button
              onClick={() => setIsFieldGuideOpen(true)}
              className="p-2 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition-colors"
              title="Field Guide & Cultural Codex"
            >
              <BookOpen size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* TOP-RIGHT CORNER: RADAR MINIMAP WITH BOTTLENECKS */}
      <div className="absolute top-20 right-4 z-30 pointer-events-auto hidden sm:block">
        <MiniMap
          playerPos={playerPos}
          markets={markets}
          wildlife={wildlife}
          bottlenecks={trafficBottlenecks}
          onMarketClick={(m) => setActiveModalMarket(m)}
        />
      </div>

      {/* DYNAMIC TRAFFIC BOTTLENECK / GRIDLOCK WARNING BANNER */}
      {playerInJam && currentJam && !jamAlertDismissed && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92vw] pointer-events-auto animate-bounce-subtle">
          <div className="p-4 rounded-2xl bg-stone-950/95 border-2 border-red-500/90 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5 text-stone-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={15} /> NAIROBI TRAFFIC JAM DETECTED ({currentJam.severity}% GRIDLOCK)
                </span>
              </div>
              <button
                onClick={() => setJamAlertDismissed(true)}
                className="text-stone-400 hover:text-white text-xs px-2.5 py-0.5 rounded-lg bg-stone-900 border border-stone-800 transition-colors"
              >
                Dismiss ✕
              </button>
            </div>

            <div className="flex items-start gap-3 mt-0.5">
              <div className="text-3xl shrink-0">
                {currentJam.cause === 'police_checkpoint' ? '🚨' : currentJam.cause === 'mkokoteni_spill' ? '🥭' : currentJam.cause === 'matatu_stage_rush' ? '🚐' : '🚧'}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white font-display">
                  {currentJam.name} · <span className="text-stone-400 font-normal">{currentJam.roadName}</span>
                </h4>
                <p className="text-xs text-stone-300 mt-0.5">
                  {currentJam.description}
                </p>
                <p className="text-xs text-amber-300 font-semibold mt-1">
                  💡 Detour Advice: {currentJam.detourAdvice}
                </p>
              </div>
            </div>

            <div className="mt-1 pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
              <div className="text-stone-300 font-medium">
                {currentVehicle === 'bodaboda' ? (
                  <span className="text-emerald-400 font-bold">✓ Boda Boda Filter Active: Slicing through gridlock without delay!</span>
                ) : currentVehicle === 'helicopter' || currentVehicle === 'privatejet' ? (
                  <span className="text-cyan-400 font-bold">✓ Soaring above Nairobi traffic jams in clear airspace!</span>
                ) : (
                  <span className="text-amber-400">⚠️ Vehicle crawling in queue! Squeeze through on Boda Boda or bypass via Expressway!</span>
                )}
              </div>
              <button
                onClick={() => soundManager.playHorn()}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow transition-colors shrink-0"
              >
                📢 Honk [H]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROXIMITY MARKET NOTIFICATION BANNER (When player approaches market stall) */}
      {activeMarketProximity && !activeModalMarket && !isCameraActive && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-auto animate-bounce-subtle">
          <div 
            onClick={() => setActiveModalMarket(activeMarketProximity)}
            className="cursor-pointer px-6 py-3 rounded-2xl bg-stone-900/95 border-2 border-amber-500/80 shadow-2xl backdrop-blur-md flex items-center gap-4 hover:scale-105 transition-all text-stone-100"
          >
            <span className="text-3xl">{activeMarketProximity.merchant.avatar}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  {activeMarketProximity.district}
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-xs text-stone-300">Market Open</span>
              </div>
              <h3 className="text-base font-bold text-white font-display">
                {activeMarketProximity.name}
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Press <kbd className="px-1.5 py-0.5 rounded bg-stone-800 border border-stone-700 text-amber-300 font-mono text-[10px]">E</kbd> or Click to Trade Goods & Fanicha
              </p>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS & MOBILE TOUCHPAD */}
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Matatu Horn Button */}
        <button
          onClick={() => {
            soundManager.playHorn();
          }}
          className="px-4 py-2.5 rounded-2xl bg-stone-900/90 hover:bg-stone-800 border border-amber-500/50 shadow-xl backdrop-blur-md text-amber-400 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 group"
        >
          <span>📢</span>
          <span>Matatu Air Horn [H]</span>
        </button>

        {/* On-Screen Touch Driving Controls */}
        <div className="grid grid-cols-3 gap-2 p-2 bg-stone-950/80 rounded-2xl border border-stone-800/80 backdrop-blur-md shadow-2xl">
          <div></div>
          <button
            onPointerDown={() => setTouchGas(true)}
            onPointerUp={() => setTouchGas(false)}
            onPointerLeave={() => setTouchGas(false)}
            className="w-12 h-12 rounded-xl bg-stone-800 active:bg-amber-500 active:text-stone-950 text-white font-bold flex items-center justify-center border border-stone-700 shadow-md transition-colors"
          >
            ▲
          </button>
          <div></div>
          <button
            onPointerDown={() => setTouchSteerLeft(true)}
            onPointerUp={() => setTouchSteerLeft(false)}
            onPointerLeave={() => setTouchSteerLeft(false)}
            className="w-12 h-12 rounded-xl bg-stone-800 active:bg-amber-500 active:text-stone-950 text-white font-bold flex items-center justify-center border border-stone-700 shadow-md transition-colors"
          >
            ◀
          </button>
          <button
            onPointerDown={() => setTouchBrake(true)}
            onPointerUp={() => setTouchBrake(false)}
            onPointerLeave={() => setTouchBrake(false)}
            className="w-12 h-12 rounded-xl bg-stone-800 active:bg-rose-500 active:text-white text-white font-bold flex items-center justify-center border border-stone-700 shadow-md transition-colors"
          >
            ▼
          </button>
          <button
            onPointerDown={() => setTouchSteerRight(true)}
            onPointerUp={() => setTouchSteerRight(false)}
            onPointerLeave={() => setTouchSteerRight(false)}
            className="w-12 h-12 rounded-xl bg-stone-800 active:bg-amber-500 active:text-stone-950 text-white font-bold flex items-center justify-center border border-stone-700 shadow-md transition-colors"
          >
            ▶
          </button>
        </div>
      </div>

      {/* CHAT OVERLAY & STREET CONVERSATION COMPONENT */}
      <ChatOverlay
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        activeNpcProximity={activeNpcProximity}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(prev => !prev)}
      />

      {/* SAFARI TELEPHOTO CAMERA VIEWFINDER HUD */}
      {isCameraActive && (
        <WildlifeCameraHUD
          animalInView={animalInView}
          animalDistance={animalDistance}
          onSnapPhoto={handleSnapPhoto}
          onCloseCamera={() => togglePhotoCamera()}
          onZoomChange={(z) => worldSceneRef.current?.setCameraZoom(z)}
          recentPhotos={recentPhotos}
        />
      )}

      {/* MARKET TRADE MODAL */}
      {activeModalMarket && (
        <MarketTradeModal
          market={activeModalMarket}
          playerCash={playerCash}
          playerInventory={playerInventory}
          onClose={() => setActiveModalMarket(null)}
          onBuyItem={handleBuyItem}
          onSellItem={handleSellItem}
        />
      )}

      {/* ECONOMY OVERVIEW & COMMODITY MATRIX */}
      {isEconomyOverviewOpen && (
        <EconomyOverviewModal
          markets={markets}
          playerCash={playerCash}
          totalTrades={totalTrades}
          totalProfit={totalProfit}
          onClose={() => setIsEconomyOverviewOpen(false)}
          onFastTravel={handleFastTravel}
        />
      )}

      {/* VEHICLE GARAGE SELECTOR */}
      {isGarageOpen && (
        <GarageModal
          currentVehicle={currentVehicle}
          onSelectVehicle={handleSelectVehicle}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

      {/* LUXURY DEALERSHIP & AVIATION HANGAR (Cars, Choppers & Private Jets) */}
      {isDealershipOpen && (
        <LuxuryDealershipModal
          vehicles={vehicles}
          currentVehicle={currentVehicle}
          playerCash={playerCash}
          onBuyVehicle={handleBuyVehicle}
          onDeployVehicle={handleDeployVehicle}
          onClose={() => setIsDealershipOpen(false)}
        />
      )}

      {/* REAL ESTATE & ESTATES AGENCY (Mansions, Penthouses & Lodges + Fanicha Furnishing) */}
      {isRealEstateOpen && (
        <RealEstateModal
          properties={properties}
          playerCash={playerCash}
          playerInventory={playerInventory}
          onBuyProperty={handleBuyProperty}
          onFurnishProperty={handleFurnishProperty}
          onCollectRent={handleCollectRent}
          onFastTravel={(pos) => worldSceneRef.current?.teleportTo(pos.x + 4, pos.z + 4)}
          onClose={() => setIsRealEstateOpen(false)}
        />
      )}

      {/* ONLINE PLAYERS LEADERBOARD & SERVER ROSTER */}
      {isOnlinePlayersOpen && (
        <OnlinePlayersModal
          players={onlinePlayers}
          playerUsername={userProfile.username}
          playerNetWorth={playerNetWorth}
          onSendMessageToPlayer={handleSendOnlineMessage}
          onClose={() => setIsOnlinePlayersOpen(false)}
        />
      )}

      {/* USER LOGIN & CITIZEN ID MODAL */}
      {isLoginModalOpen && (
        <LoginModal
          currentUser={userProfile}
          playerCash={playerCash}
          netWorth={playerNetWorth}
          propertiesOwnedCount={properties.filter(p => p.isOwned).length}
          vehiclesOwnedCount={vehicles.filter(v => v.isOwned).length}
          onSaveProfile={handleSaveProfile}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* QUESTS & MISSIONS MODAL */}
      {isQuestsOpen && (
        <QuestsModal
          quests={quests}
          playerInventory={playerInventory}
          recentPhotos={recentPhotos}
          onCompleteQuest={handleCompleteQuest}
          onClose={() => setIsQuestsOpen(false)}
        />
      )}

      {/* FIELD GUIDE & CODEX MODAL */}
      {isFieldGuideOpen && (
        <FieldGuideModal onClose={() => setIsFieldGuideOpen(false)} />
      )}

      {/* WEATHER STATION & FORECAST MODAL */}
      {isWeatherModalOpen && (
        <WeatherModal
          currentWeather={currentWeather}
          onSelectWeather={(wType) => {
            handleSelectWeather(wType);
          }}
          onClose={() => setIsWeatherModalOpen(false)}
        />
      )}
    </div>
  );
}
