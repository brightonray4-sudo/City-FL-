import { TradeItem, Marketplace, ItemCategory } from '../types/game';

export const TRADE_ITEMS: Record<string, TradeItem> = {
  // Crafts & Curios
  'kisii_soapstone': {
    id: 'kisii_soapstone',
    name: 'Kisii Soapstone Carving',
    swahiliName: 'Kinyago cha Jiwe la Kisii',
    category: 'crafts',
    basePrice: 1200,
    description: 'Intricately polished hand-carved soapstone animal figurines mined from Tabaka hills in Kisii.',
    icon: '🗿',
    weight: 1.2,
    rarity: 'common',
  },
  'maasai_shanga': {
    id: 'maasai_shanga',
    name: 'Beaded Maasai Collar & Bracelet',
    swahiliName: 'Shanga za Kimasai',
    category: 'crafts',
    basePrice: 850,
    description: 'Vibrant geometric glass-bead collar handcrafted by Maasai artisan collectives, symbolizing courage and community.',
    icon: '📿',
    weight: 0.3,
    rarity: 'common',
  },
  'kiondo_basket': {
    id: 'kiondo_basket',
    name: 'Woven Sisal Kiondo Bag',
    swahiliName: 'Kiondo cha Makonge',
    category: 'crafts',
    basePrice: 1600,
    description: 'Durable traditional tote handwoven from natural Machakos sisal fiber and leather straps.',
    icon: '🧺',
    weight: 0.8,
    rarity: 'common',
  },
  'wood_ebony_mask': {
    id: 'wood_ebony_mask',
    name: 'Carved Ebony Ancestral Mask',
    swahiliName: 'Kinyago cha Mpingo',
    category: 'crafts',
    basePrice: 3800,
    description: 'Dense dark African blackwood sculpture polished to a velvet sheen by Wamunyu woodcarvers.',
    icon: '🎭',
    weight: 2.5,
    rarity: 'rare',
  },

  // Food & Spices
  'kenyan_aa_coffee': {
    id: 'kenyan_aa_coffee',
    name: 'Mount Kenya AA Arabica Beans',
    swahiliName: 'Kahawa ya Mlima Kenya',
    category: 'spices_food',
    basePrice: 950,
    description: 'World-renowned volcanic soil coffee beans bursting with bright blackcurrant acidity and honey notes.',
    icon: '☕',
    weight: 1.0,
    rarity: 'uncommon',
  },
  'kericho_black_tea': {
    id: 'kericho_black_tea',
    name: 'Kericho Highland Pure Tea',
    swahiliName: 'Chai ya Kericho',
    category: 'spices_food',
    basePrice: 450,
    description: 'Premium rich CTC black tea grown in emerald rolling plantations of the Great Rift Valley.',
    icon: '🫖',
    weight: 1.0,
    rarity: 'common',
  },
  'swahili_pilau_masala': {
    id: 'swahili_pilau_masala',
    name: 'Coastal Pilau Spices',
    swahiliName: 'Viungo vya Pilau',
    category: 'spices_food',
    basePrice: 350,
    description: 'Aromatic Mombasa blend of crushed cardamom, cumin seed, cinnamon bark, cloves, and black pepper.',
    icon: '🌿',
    weight: 0.4,
    rarity: 'common',
  },
  'mara_wild_honey': {
    id: 'mara_wild_honey',
    name: 'Raw Mara Acacia Forest Honey',
    swahiliName: 'Asali ya Porini',
    category: 'spices_food',
    basePrice: 1400,
    description: 'Golden unfiltered raw comb honey gathered by indigenous honey-hunters along the Mara river gorge.',
    icon: '🍯',
    weight: 1.5,
    rarity: 'uncommon',
  },
  'mahindi_choma': {
    id: 'mahindi_choma',
    name: 'Street Roasted Maize with Chili Lime',
    swahiliName: 'Mahindi Choma na Ndimu',
    category: 'spices_food',
    basePrice: 120,
    description: 'Fresh corn cob roasted over open charcoal embers with crushed red chili and lime juice.',
    icon: '🌽',
    weight: 0.3,
    rarity: 'common',
  },

  // Textiles
  'maasai_shuka': {
    id: 'maasai_shuka',
    name: 'Traditional Red Checkered Shuka',
    swahiliName: 'Shuka ya Kimasai',
    category: 'textiles',
    basePrice: 1500,
    description: 'Iconic thick acrylic blanket woven in radiant scarlet and indigo patterns worn by savannah pastoralists.',
    icon: '🧣',
    weight: 0.9,
    rarity: 'common',
  },
  'kitenge_fabric': {
    id: 'kitenge_fabric',
    name: 'Wax Print Kitenge Roll',
    swahiliName: 'Kitambaa cha Kitenge',
    category: 'textiles',
    basePrice: 2200,
    description: 'High-grade 6-yard cotton wax print bursting with bold African botanical and geometric motifs.',
    icon: '🎨',
    weight: 1.8,
    rarity: 'uncommon',
  },
  'vintage_mitumba_jacket': {
    id: 'vintage_mitumba_jacket',
    name: 'Gikomba Baled Mitumba Denim',
    swahiliName: 'Koti la Mitumba',
    category: 'textiles',
    basePrice: 1800,
    description: 'Prized vintage denim jacket hand-picked directly from fresh shipping bales in Gikomba.',
    icon: '🧥',
    weight: 1.4,
    rarity: 'uncommon',
  },

  // Gemstones & Minerals
  'tsavorite_garnet': {
    id: 'tsavorite_garnet',
    name: 'Tsavo Rough Emerald Garnet',
    swahiliName: 'Kito cha Tsavorite',
    category: 'gemstones',
    basePrice: 9500,
    description: 'Radiant deep emerald-green rare gemstone mined near the foothills of Tsavo and Taita Taveta.',
    icon: '💎',
    weight: 0.1,
    rarity: 'exotic',
  },
  'rift_ruby': {
    id: 'rift_ruby',
    name: 'Baringo Corundum Ruby',
    swahiliName: 'Yakuti ya Bonde la Ufa',
    category: 'gemstones',
    basePrice: 7200,
    description: 'Uncut crystalline red ruby crystal extracted from ancient volcanic fissures of the Great Rift Valley.',
    icon: '🔮',
    weight: 0.1,
    rarity: 'rare',
  },

  // Safari & Ranger Gear
  'ranger_binoculars': {
    id: 'ranger_binoculars',
    name: 'KWS Ranger High-Zoom Binoculars',
    swahiliName: 'Darubini ya Porini',
    category: 'safari_gear',
    basePrice: 4200,
    description: 'Waterproof 12x50 wildlife spotting optics used by Kenya Wildlife Service scouts.',
    icon: '🔭',
    weight: 1.1,
    rarity: 'uncommon',
  },
  'bush_dawa_tincture': {
    id: 'bush_dawa_tincture',
    name: 'Wild Dawa Herbal Health Tonic',
    swahiliName: 'Dawa ya Miti Shamba',
    category: 'safari_gear',
    basePrice: 750,
    description: 'Traditional wellness tonic brewed from wild ginger, Warburgia bark, and raw highland lemons.',
    icon: '🧪',
    weight: 0.5,
    rarity: 'common',
  },

  // Handcrafted Kenyan Fanicha (Furniture & Timber Carpentry)
  'ngong_mahogany_table': {
    id: 'ngong_mahogany_table',
    name: 'Ngong Road Solid Mahogany Coffee Table',
    swahiliName: 'Meza ya Mbao ya Mahogany (Fanicha)',
    category: 'fanicha',
    basePrice: 8500,
    description: 'Masterfully carved solid African mahogany coffee table with beeswax polish and live edge woodgrain, hand-built on Ngong Road.',
    icon: '🪑',
    weight: 14.0,
    rarity: 'uncommon',
  },
  'lamu_carved_chest': {
    id: 'lamu_carved_chest',
    name: 'Lamu Antique Brass-Studded Chest',
    swahiliName: 'Kasha la Mbao la Lamu (Fanicha)',
    category: 'fanicha',
    basePrice: 16500,
    description: 'Heritage Swahili hardwood chest fitted with intricate polished brass corner plates, internal secret drawer, and hand-carved floral rosettes.',
    icon: '🧰',
    weight: 22.0,
    rarity: 'rare',
  },
  'safari_folding_chair': {
    id: 'safari_folding_chair',
    name: 'Classic Teak & Canvas Safari Director Chair',
    swahiliName: 'Kiti cha Safari cha Kukunja (Fanicha)',
    category: 'fanicha',
    basePrice: 4800,
    description: 'Foldable weathered teak and heavy khaki canvas armchair used in luxury Mara safari camps under the stars.',
    icon: '⛺',
    weight: 5.5,
    rarity: 'common',
  },
  'kamukunji_cane_daybed': {
    id: 'kamukunji_cane_daybed',
    name: 'Kamukunji Woven Cane & Wrought Iron Lounger',
    swahiliName: 'Kitanda cha Chuma na Makonge (Fanicha)',
    category: 'fanicha',
    basePrice: 11200,
    description: 'Hand-welded wrought iron frame intertwined with durable natural cane weaving, prized in Nairobi verandahs.',
    icon: '🛋️',
    weight: 18.0,
    rarity: 'uncommon',
  },
  'kisii_stone_stool': {
    id: 'kisii_stone_stool',
    name: 'Kisii Soapstone Mosaic Garden Stool',
    swahiliName: 'Kiti cha Jiwe la Kisii (Fanicha)',
    category: 'fanicha',
    basePrice: 6200,
    description: 'Sculptural garden stool hand-chiseled from pink and cream soapstone boulders with polished geometric facets.',
    icon: '🪨',
    weight: 16.0,
    rarity: 'uncommon',
  },
};

export const INITIAL_MARKETS: Marketplace[] = [
  {
    id: 'gikomba',
    name: 'Gikomba Open-Air Market',
    district: 'Pumwani / East Nairobi',
    tagline: 'East Africa’s largest trade hub & textile beehive',
    description: 'A labyrinth of thousands of bustling open-air stalls along the Nairobi River. Famous for mitumba vintage wear, timber, ironware, and wholesale kitenges.',
    worldPos: { x: 75, z: 45 },
    color: '#F59E0B',
    merchant: {
      name: 'Mama Wanjiku',
      title: 'Queen of Bales & Vintage Wear',
      avatar: '👩🏾‍🦱',
      shengGreeting: 'Niaje mteja! Leo mzigo safi ulishuka kutoka port. Chagua bila hofu!',
      bargainAffinity: 0.7,
      personalityDescription: 'Sharp-witted, generous with regular customers, loves quick turnover and cash deals.',
    },
    specialtyCategory: 'textiles',
    demandBonusMultiplier: {
      textiles: 0.75, // cheap here!
      crafts: 1.1,
      spices_food: 1.15,
      gemstones: 1.3,
      safari_gear: 1.35,
      wildlife_curios: 1.2,
      fanicha: 1.15,
    },
    inventory: {
      'vintage_mitumba_jacket': { itemId: 'vintage_mitumba_jacket', stock: 18, maxStock: 25, currentPrice: 1350, priceTrend: 'down', volatility: 0.08, boughtByPlayer: 0, soldByPlayer: 0 },
      'kitenge_fabric': { itemId: 'kitenge_fabric', stock: 15, maxStock: 20, currentPrice: 1750, priceTrend: 'stable', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'mahindi_choma': { itemId: 'mahindi_choma', stock: 30, maxStock: 30, currentPrice: 100, priceTrend: 'stable', volatility: 0.02, boughtByPlayer: 0, soldByPlayer: 0 },
      'kiondo_basket': { itemId: 'kiondo_basket', stock: 8, maxStock: 15, currentPrice: 1700, priceTrend: 'up', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'bush_dawa_tincture': { itemId: 'bush_dawa_tincture', stock: 5, maxStock: 10, currentPrice: 900, priceTrend: 'up', volatility: 0.09, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'maasai_market',
    name: 'Maasai Cultural Curio Market',
    district: 'CBD / Court Grounds & KICC Esplanade',
    tagline: 'Treasury of authentic handcrafted beadwork & soapstone',
    description: 'Dynamic nomadic artisan market packed with vibrant Maasai women and master sculptors showcasing world-class Kenyan heritage pieces.',
    worldPos: { x: -35, z: -25 },
    color: '#EF4444',
    merchant: {
      name: 'Ole Kiprono',
      title: 'Maasai Elder & Bead Guild Leader',
      avatar: '🧔🏾',
      shengGreeting: 'Supa! Karibu ndugu yangu. Sanaa hii imetengenezwa kwa mikono ya wamama wetu.',
      bargainAffinity: 0.85,
      personalityDescription: 'Dignified, honors honest barter, deeply knowledgeable about Maasai bead colors and folklore.',
    },
    specialtyCategory: 'crafts',
    demandBonusMultiplier: {
      crafts: 0.8, // cheap here!
      textiles: 0.9,
      spices_food: 1.25,
      gemstones: 1.4,
      safari_gear: 1.2,
      wildlife_curios: 0.85,
      fanicha: 1.3,
    },
    inventory: {
      'maasai_shanga': { itemId: 'maasai_shanga', stock: 24, maxStock: 30, currentPrice: 680, priceTrend: 'stable', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'kisii_soapstone': { itemId: 'kisii_soapstone', stock: 16, maxStock: 20, currentPrice: 980, priceTrend: 'down', volatility: 0.07, boughtByPlayer: 0, soldByPlayer: 0 },
      'maasai_shuka': { itemId: 'maasai_shuka', stock: 14, maxStock: 20, currentPrice: 1300, priceTrend: 'stable', volatility: 0.04, boughtByPlayer: 0, soldByPlayer: 0 },
      'wood_ebony_mask': { itemId: 'wood_ebony_mask', stock: 6, maxStock: 8, currentPrice: 3200, priceTrend: 'up', volatility: 0.09, boughtByPlayer: 0, soldByPlayer: 0 },
      'kenyan_aa_coffee': { itemId: 'kenyan_aa_coffee', stock: 5, maxStock: 12, currentPrice: 1250, priceTrend: 'up', volatility: 0.11, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'kariokor',
    name: 'Kariokor Artisan Workshop Guild',
    district: 'Racecourse Road / Ziwani',
    tagline: 'Heartland of leather craft, sisal kiondos & woodcarving',
    description: 'The creative industrial engine where hundreds of cobblers, sisal weavers, and brass smiths fabricate goods exported across the globe.',
    worldPos: { x: 55, z: -85 },
    color: '#10B981',
    merchant: {
      name: 'Mzee Mwangi',
      title: 'Master Leather & Sisal Craftsman',
      avatar: '👴🏾',
      shengGreeting: 'Habari yako kijana! Mikono yetu inafanya kazi halisi. Ubora ndio heshima ya Kariokor.',
      bargainAffinity: 0.65,
      personalityDescription: 'Veteran craftsman, values hard work and bulk buyers, offers steep discounts for bulk orders.',
    },
    specialtyCategory: 'crafts',
    demandBonusMultiplier: {
      crafts: 0.7, // wholesale cheap!
      textiles: 1.1,
      spices_food: 1.2,
      gemstones: 1.35,
      safari_gear: 1.15,
      wildlife_curios: 1.1,
      fanicha: 0.9, // artisan woodcraft connection
    },
    inventory: {
      'kiondo_basket': { itemId: 'kiondo_basket', stock: 22, maxStock: 25, currentPrice: 1150, priceTrend: 'down', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'wood_ebony_mask': { itemId: 'wood_ebony_mask', stock: 9, maxStock: 12, currentPrice: 3000, priceTrend: 'stable', volatility: 0.08, boughtByPlayer: 0, soldByPlayer: 0 },
      'maasai_shanga': { itemId: 'maasai_shanga', stock: 15, maxStock: 20, currentPrice: 720, priceTrend: 'stable', volatility: 0.04, boughtByPlayer: 0, soldByPlayer: 0 },
      'mara_wild_honey': { itemId: 'mara_wild_honey', stock: 4, maxStock: 10, currentPrice: 1750, priceTrend: 'up', volatility: 0.12, boughtByPlayer: 0, soldByPlayer: 0 },
      'kericho_black_tea': { itemId: 'kericho_black_tea', stock: 8, maxStock: 15, currentPrice: 520, priceTrend: 'stable', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'city_market',
    name: 'Historic Nairobi City Market',
    district: 'Muindi Mbingu St / City Centre',
    tagline: 'Highland coffee, kericho tea & exotic produce dome',
    description: 'Iconic art deco vaulted hall completed in 1930. The epicenter for roasted Mount Kenya Arabica beans, highland tea, fresh cut flowers, and fruits.',
    worldPos: { x: -85, z: 15 },
    color: '#3B82F6',
    merchant: {
      name: 'Amina Hassan',
      title: 'Highland Tea & Arabica Connoisseur',
      avatar: '🧕🏾',
      shengGreeting: 'Karibu City Market! Harufu ya kahawa safi kutoka Nyeri itakufurahisha roho leo.',
      bargainAffinity: 0.6,
      personalityDescription: 'Sophisticated gourmet merchant, passionate about fair-trade smallholder cooperatives.',
    },
    specialtyCategory: 'spices_food',
    demandBonusMultiplier: {
      spices_food: 0.75, // cheap highland produce!
      textiles: 1.25,
      crafts: 1.3,
      gemstones: 1.45,
      safari_gear: 1.1,
      wildlife_curios: 1.3,
      fanicha: 1.35,
    },
    inventory: {
      'kenyan_aa_coffee': { itemId: 'kenyan_aa_coffee', stock: 25, maxStock: 30, currentPrice: 760, priceTrend: 'down', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'kericho_black_tea': { itemId: 'kericho_black_tea', stock: 28, maxStock: 35, currentPrice: 340, priceTrend: 'stable', volatility: 0.04, boughtByPlayer: 0, soldByPlayer: 0 },
      'swahili_pilau_masala': { itemId: 'swahili_pilau_masala', stock: 18, maxStock: 25, currentPrice: 280, priceTrend: 'down', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'vintage_mitumba_jacket': { itemId: 'vintage_mitumba_jacket', stock: 5, maxStock: 10, currentPrice: 2200, priceTrend: 'up', volatility: 0.1, boughtByPlayer: 0, soldByPlayer: 0 },
      'tsavorite_garnet': { itemId: 'tsavorite_garnet', stock: 2, maxStock: 4, currentPrice: 12500, priceTrend: 'up', volatility: 0.15, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'mara_trading_post',
    name: 'Mara Border Conservancy Post',
    district: 'Savannah Frontier & Rift Valley Gate',
    tagline: 'Wilderness outpost connecting city to untamed safari plains',
    description: 'Rustic wooden log trading outpost at the wildlife park border. Safari drivers, rangers, and conservationists stock up on bush gear and field rations.',
    worldPos: { x: -160, z: -170 },
    color: '#84CC16',
    merchant: {
      name: 'Ranger Jackson Kiptoo',
      title: 'Senior Wildlife Warden & Outpost Quartermaster',
      avatar: '🤠',
      shengGreeting: 'Jambo! Umefika porini sasa. Hakikisha gari yako ina mafuta na unazo darubini za kutosha!',
      bargainAffinity: 0.5,
      personalityDescription: 'Rugged park warden, rewards players who help photograph wildlife and deter poachers.',
    },
    specialtyCategory: 'safari_gear',
    demandBonusMultiplier: {
      safari_gear: 0.8, // ranger supplies available
      spices_food: 1.45, // city foods are in high demand!
      textiles: 1.3,
      crafts: 1.35,
      gemstones: 1.2,
      wildlife_curios: 1.5,
      fanicha: 1.4, // high demand for safari camp chairs and chests!
    },
    inventory: {
      'ranger_binoculars': { itemId: 'ranger_binoculars', stock: 12, maxStock: 15, currentPrice: 3400, priceTrend: 'stable', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'bush_dawa_tincture': { itemId: 'bush_dawa_tincture', stock: 20, maxStock: 25, currentPrice: 580, priceTrend: 'down', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'mara_wild_honey': { itemId: 'mara_wild_honey', stock: 18, maxStock: 20, currentPrice: 1050, priceTrend: 'down', volatility: 0.07, boughtByPlayer: 0, soldByPlayer: 0 },
      'maasai_shuka': { itemId: 'maasai_shuka', stock: 10, maxStock: 15, currentPrice: 1650, priceTrend: 'up', volatility: 0.08, boughtByPlayer: 0, soldByPlayer: 0 },
      'rift_ruby': { itemId: 'rift_ruby', stock: 3, maxStock: 5, currentPrice: 6100, priceTrend: 'stable', volatility: 0.12, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'ngara_spices',
    name: 'Ngara Street Bazaar & Matatu Stage',
    district: 'Ngara / Park Road Junction',
    tagline: 'Vibrant transport nexus, street snacks & coastal spice merchants',
    description: 'Teeming junction where colorful Rongai and Buruburu matatus refuel. Stalls sizzle with hot mahindi choma, fried samosas, and spice bundles.',
    worldPos: { x: 120, z: -35 },
    color: '#EC4899',
    merchant: {
      name: 'Kev "Kevo" Makanga',
      title: 'Matatu Stage Conductor & Street Mogul',
      avatar: '🧢',
      shengGreeting: 'Oya msee! Nganya ya buru inajaza! Chapa vitu fast fast kabla jam haijashika Thika Road!',
      bargainAffinity: 0.75,
      personalityDescription: 'Fast-talking urban hustle king, connected with every matatu driver and street scout in Nairobi.',
    },
    specialtyCategory: 'spices_food',
    demandBonusMultiplier: {
      spices_food: 0.8,
      textiles: 1.1,
      crafts: 1.15,
      gemstones: 1.4,
      safari_gear: 1.25,
      wildlife_curios: 1.15,
      fanicha: 1.2,
    },
    inventory: {
      'mahindi_choma': { itemId: 'mahindi_choma', stock: 40, maxStock: 40, currentPrice: 90, priceTrend: 'stable', volatility: 0.03, boughtByPlayer: 0, soldByPlayer: 0 },
      'swahili_pilau_masala': { itemId: 'swahili_pilau_masala', stock: 22, maxStock: 25, currentPrice: 290, priceTrend: 'stable', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'kenyan_aa_coffee': { itemId: 'kenyan_aa_coffee', stock: 7, maxStock: 12, currentPrice: 1150, priceTrend: 'up', volatility: 0.08, boughtByPlayer: 0, soldByPlayer: 0 },
      'vintage_mitumba_jacket': { itemId: 'vintage_mitumba_jacket', stock: 12, maxStock: 15, currentPrice: 1600, priceTrend: 'stable', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'kiondo_basket': { itemId: 'kiondo_basket', stock: 6, maxStock: 10, currentPrice: 1850, priceTrend: 'up', volatility: 0.09, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
  {
    id: 'ngong_fanicha_guild',
    name: 'Ngong Road Fanicha Carpentry Guild',
    district: 'Ngong Road / Adams Arcade',
    tagline: 'World-famous open-air timber carpentry, cane & mahogany furniture',
    description: 'Renowned roadside artisan workshops stretching under the jacaranda trees. Master carpenters transform seasoned African mahogany, cedar, and wrought iron into heirloom furniture.',
    worldPos: { x: -30, z: 90 },
    color: '#854D0E',
    merchant: {
      name: 'Fundi Omari & Fundi Njoroge',
      title: 'Master Mahogany Carver & Guild Foreman',
      avatar: '🪵',
      shengGreeting: 'Karibu karakhana ya fanicha! Hapa mbao zote ni seasoned mahogany na cedar. Zidumu miaka hamsini!',
      bargainAffinity: 0.7,
      personalityDescription: 'Veteran woodcarver, takes pride in solid dovetail joints, gives discounts if you transport items yourself.',
    },
    specialtyCategory: 'fanicha',
    demandBonusMultiplier: {
      fanicha: 0.72, // workshop wholesale price!
      crafts: 1.15,
      textiles: 1.2,
      spices_food: 1.25,
      gemstones: 1.3,
      safari_gear: 1.1,
      wildlife_curios: 1.2,
    },
    inventory: {
      'ngong_mahogany_table': { itemId: 'ngong_mahogany_table', stock: 8, maxStock: 10, currentPrice: 7200, priceTrend: 'down', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
      'safari_folding_chair': { itemId: 'safari_folding_chair', stock: 14, maxStock: 18, currentPrice: 3900, priceTrend: 'down', volatility: 0.04, boughtByPlayer: 0, soldByPlayer: 0 },
      'kamukunji_cane_daybed': { itemId: 'kamukunji_cane_daybed', stock: 6, maxStock: 8, currentPrice: 9800, priceTrend: 'stable', volatility: 0.06, boughtByPlayer: 0, soldByPlayer: 0 },
      'lamu_carved_chest': { itemId: 'lamu_carved_chest', stock: 3, maxStock: 5, currentPrice: 14500, priceTrend: 'stable', volatility: 0.08, boughtByPlayer: 0, soldByPlayer: 0 },
      'kisii_stone_stool': { itemId: 'kisii_stone_stool', stock: 10, maxStock: 12, currentPrice: 5200, priceTrend: 'down', volatility: 0.05, boughtByPlayer: 0, soldByPlayer: 0 },
    },
  },
];

/**
 * Calculates current dynamic buying price from market for the player.
 * Player purchases decrease market stock, increasing scarcity & price.
 */
export function calculateBuyPrice(market: Marketplace, itemId: string): number {
  const listing = market.inventory[itemId];
  const item = TRADE_ITEMS[itemId];
  if (!listing || !item) return item?.basePrice ?? 100;

  const stockRatio = listing.stock / Math.max(listing.maxStock, 1);
  // Scarcity factor: if stock is 20%, price rises; if 100%, price discounts
  const scarcityMultiplier = 1.4 - (stockRatio * 0.5); 
  const demandMult = market.demandBonusMultiplier[item.category] || 1.0;

  // Player purchase pressure penalty
  const playerPressure = 1 + Math.min(listing.boughtByPlayer * 0.04, 0.4);

  const finalPrice = Math.round(listing.currentPrice * demandMult * scarcityMultiplier * playerPressure);
  return Math.max(10, finalPrice);
}

/**
 * Calculates selling price when player sells goods to the market.
 * Player sales increase market stock, saturating supply & decreasing price.
 */
export function calculateSellPrice(market: Marketplace, itemId: string): number {
  const listing = market.inventory[itemId];
  const item = TRADE_ITEMS[itemId];
  if (!item) return 50;

  const currentMarketPrice = listing ? listing.currentPrice : item.basePrice;
  const demandMult = market.demandBonusMultiplier[item.category] || 1.0;
  
  // Market takes a cut (spread) + saturation discount if player dumped stock
  const saturationDiscount = listing ? Math.max(0.6, 1 - (listing.soldByPlayer * 0.03)) : 0.85;
  const baseOffer = currentMarketPrice * demandMult * 0.82 * saturationDiscount;

  return Math.max(10, Math.round(baseOffer));
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'citizen' | 'merchant' | 'matatu_crew' | 'ranger' | 'radio_dj' | 'player';
  avatar: string;
  channel: 'all' | 'nairobi_cb' | 'safari_rangers' | 'market_rumors';
  text: string;
  shengSubtext?: string;
  timeAgo: string;
}

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'Radio Maisha DJ Mzazi',
    role: 'radio_dj',
    avatar: '🎙️',
    channel: 'all',
    text: 'Habari Nairobi! Jua kali linawaka juu ya KICC. Bei ya Kahawa kule City Market imeshuka asubuhi hii—wafanyabiashara twende kazi!',
    shengSubtext: 'Morning Nairobi! Great time to buy coffee beans at City Market before prices surge!',
    timeAgo: 'Just now',
  },
  {
    id: 'm2',
    sender: 'Matatu Driver "Fast Eddie"',
    role: 'matatu_crew',
    avatar: '🚐',
    channel: 'nairobi_cb',
    text: 'Uhuru Highway iko wazi leo! Nganya yangu ya Buruburu inapeperuka kwa kasi ya 90km/h. Oya, makanga anasema tuko na abiria!',
    shengSubtext: 'Uhuru Highway is clear! High-speed cruiser rolling into town.',
    timeAgo: '1m ago',
  },
  {
    id: 'm3',
    sender: 'Mama Wanjiku (Gikomba)',
    role: 'merchant',
    avatar: '👩🏾‍🦱',
    channel: 'market_rumors',
    text: 'Kuna bales mpya za vintage denim zimewasili Gikomba! Mtu yeyote anayeleta Kiondo vikapu kutoka Kariokor nitamnunulia kwa bei poa sana.',
    shengSubtext: 'New denim bales landed in Gikomba! High demand for Kariokor sisal baskets here.',
    timeAgo: '2m ago',
  },
  {
    id: 'm4',
    sender: 'KWS Ranger Jackson',
    role: 'ranger',
    avatar: '🤠',
    channel: 'safari_rangers',
    text: 'Simba wawili (pride of lions) wameonekana karibu na bwawa la maji (waterhole) upande wa kusini! Wapiga picha wa safari shikeni kamera zenu.',
    shengSubtext: 'Two lions spotted near the southern savannah waterhole! Photographers get ready.',
    timeAgo: '3m ago',
  },
  {
    id: 'm5',
    sender: 'Boda Rider Brian',
    role: 'citizen',
    avatar: '🛵',
    channel: 'all',
    text: 'Form ni gani leo wazee? Nani anataka lifti ya haraka kutoka Kariokor hadi Maasai Market? Hakuna foleni upande wangu!',
    shengSubtext: 'What is the plan today? Fast boda boda transport available between markets!',
    timeAgo: '4m ago',
  },
];
