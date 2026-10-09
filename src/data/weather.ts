import { WeatherCondition, WeatherType } from '../types/game';

export const WEATHER_PRESETS: Record<WeatherType, WeatherCondition> = {
  clear: {
    id: 'clear',
    name: 'Clear & Sunny',
    swahiliName: 'Hali Safi ya Jua',
    icon: '☀️',
    description: 'Crisp equatorial sunshine with pristine views of KICC towers, Nairobi Expressway, and Mount Kenya.',
    ambientLightColor: 0xffffff,
    sunIntensity: 1.25,
    fogDensity: 0.0025,
    fogColor: 0xc8d8e8,
    trafficCongestionMultiplier: 1.0,
    animalActivityModifier: {
      lionSpawnBoost: 1.0,
      elephantSpawnBoost: 1.0,
      photoValueBonus: 0,
    },
    gameplayTip: 'Standard driving grip & baseline traffic flow across Nairobi.',
  },
  heavy_rain: {
    id: 'heavy_rain',
    name: 'Heavy Rain (Masika)',
    swahiliName: 'Mvua Kubwa ya Masika',
    icon: '🌧️',
    description: 'Torrential Nairobi flash downpour. Roads turn slick, traffic grinds to a halt, and bottlenecks swell.',
    ambientLightColor: 0x64748b,
    sunIntensity: 0.45,
    fogDensity: 0.0075,
    fogColor: 0x475569,
    trafficCongestionMultiplier: 1.65, // Traffic congestion +65%!
    animalActivityModifier: {
      lionSpawnBoost: 0.8,
      elephantSpawnBoost: 1.1,
      photoValueBonus: 0.1,
    },
    gameplayTip: 'Roads slick! Jam severity +65%. Take Elevated Expressway or agile Boda Boda.',
  },
  foggy_morning: {
    id: 'foggy_morning',
    name: 'Foggy Morning (Ukungu)',
    swahiliName: 'Ukungu Mzito wa Asubuhi',
    icon: '🌫️',
    description: 'Dense cool highland mist rolling from the Aberdares and Ngong Hills. Elusive predators emerge to stalk.',
    ambientLightColor: 0x94a3b8,
    sunIntensity: 0.65,
    fogDensity: 0.0125, // Very thick fog
    fogColor: 0x94a3b8,
    trafficCongestionMultiplier: 1.2,
    animalActivityModifier: {
      lionSpawnBoost: 2.2, // 2.2x predator activity!
      elephantSpawnBoost: 1.3,
      photoValueBonus: 0.35, // +35% KES Photo bounty bonus!
    },
    gameplayTip: 'Low visibility! Lions & predators on the prowl. Camera photo values boosted +35%!',
  },
  golden_heatwave: {
    id: 'golden_heatwave',
    name: 'Savannah Golden Heat',
    swahiliName: 'Joto Kubwa la Kiangazi',
    icon: '🌤️',
    description: 'Warm amber haze across the savannah. Wildlife herds congregate closely around the southern riverbed waterholes.',
    ambientLightColor: 0xfde047,
    sunIntensity: 1.4,
    fogDensity: 0.003,
    fogColor: 0xfef08a,
    trafficCongestionMultiplier: 1.05,
    animalActivityModifier: {
      lionSpawnBoost: 1.1,
      elephantSpawnBoost: 2.0, // Elephants cluster at watering holes!
      photoValueBonus: 0.15,
    },
    gameplayTip: 'Elephant herds gathering at savannah waterholes. Perfect for group wildlife shots.',
  },
};

export const WEATHER_CYCLE_ORDER: WeatherType[] = [
  'foggy_morning',
  'clear',
  'golden_heatwave',
  'heavy_rain',
];
