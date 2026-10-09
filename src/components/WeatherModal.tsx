import React from 'react';
import { WeatherCondition, WeatherType } from '../types/game';
import { WEATHER_PRESETS, WEATHER_CYCLE_ORDER } from '../data/weather';
import { CloudRain, CloudFog, Sun, CloudSun, AlertTriangle, Sparkles, Droplets, Wind, Camera, Gauge, X } from 'lucide-react';

interface WeatherModalProps {
  currentWeather: WeatherCondition;
  onSelectWeather: (weatherType: WeatherType) => void;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  currentWeather,
  onSelectWeather,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 text-xl">
              🌤️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-display">
                  Kenya Meteorological Department & Safari Weather Station
                </h2>
                <span className="text-[10px] bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 px-2 py-0.5 rounded-full font-bold">
                  KMD LIVE
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Idara ya Hali ya Hewa · Real-time Nairobi atmosphere, road gridlock impact & wildlife ecology
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Active Weather Banner */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className={`p-5 rounded-2xl border transition-all ${
            currentWeather.id === 'heavy_rain'
              ? 'bg-gradient-to-r from-blue-950/70 to-slate-900/80 border-blue-500/60 shadow-xl shadow-blue-950/40'
              : currentWeather.id === 'foggy_morning'
              ? 'bg-gradient-to-r from-slate-900/80 to-cyan-950/70 border-cyan-500/60 shadow-xl shadow-cyan-950/40'
              : currentWeather.id === 'golden_heatwave'
              ? 'bg-gradient-to-r from-amber-950/70 to-stone-900/80 border-amber-500/60 shadow-xl shadow-amber-950/40'
              : 'bg-gradient-to-r from-stone-900 to-stone-950 border-emerald-500/40 shadow-xl'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl animate-bounce-subtle">{currentWeather.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-white">{currentWeather.name}</span>
                    <span className="text-xs text-amber-400 font-semibold italic">({currentWeather.swahiliName})</span>
                  </div>
                  <span className="text-xs text-stone-300 block mt-0.5">{currentWeather.description}</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold shrink-0">
                ACTIVE NOW
              </span>
            </div>

            {/* Weather Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-stone-800/80 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
                <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
                  Traffic Gridlock Index
                </span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Gauge size={14} className={currentWeather.trafficCongestionMultiplier > 1.2 ? 'text-rose-400' : 'text-emerald-400'} />
                  {currentWeather.trafficCongestionMultiplier > 1 ? `+${Math.round((currentWeather.trafficCongestionMultiplier - 1) * 100)}% Congestion` : 'Normal Flow'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
                <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
                  Wildlife Photography Bounty
                </span>
                <span className="text-sm font-extrabold text-amber-300 flex items-center gap-1 mt-0.5">
                  <Camera size={14} className="text-amber-400" />
                  {currentWeather.animalActivityModifier.photoValueBonus > 0
                    ? `+${Math.round(currentWeather.animalActivityModifier.photoValueBonus * 100)}% KES Bonus`
                    : 'Standard Value'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-stone-950/60 border border-stone-800/80">
                <span className="text-[10px] text-stone-400 block font-semibold uppercase tracking-wider">
                  Road Traction
                </span>
                <span className="text-sm font-extrabold text-white flex items-center gap-1 mt-0.5">
                  <Droplets size={14} className={currentWeather.id === 'heavy_rain' ? 'text-blue-400' : 'text-emerald-400'} />
                  {currentWeather.id === 'heavy_rain' ? 'Slick (Longer Braking)' : 'High Grip'}
                </span>
              </div>
            </div>

            {/* Gameplay Tip Pill */}
            <div className="mt-3.5 p-3 rounded-xl bg-stone-950/80 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-200">
              <Sparkles size={16} className="text-amber-400 shrink-0" />
              <span>{currentWeather.gameplayTip}</span>
            </div>
          </div>

          {/* Manual Weather Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Simulate & Trigger Weather Condition
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {WEATHER_CYCLE_ORDER.map(wId => {
                const preset = WEATHER_PRESETS[wId];
                const isActive = currentWeather.id === preset.id;

                return (
                  <div
                    key={preset.id}
                    onClick={() => onSelectWeather(preset.id)}
                    className={`cursor-pointer p-4 rounded-xl border flex flex-col justify-between transition-all hover:scale-[1.02] ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                        : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-2xl">{preset.icon}</span>
                        {isActive && (
                          <span className="text-[10px] bg-amber-500 text-stone-950 font-extrabold px-2 py-0.5 rounded-full">
                            CURRENT
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                      <p className="text-[11px] text-amber-300/80 font-medium">{preset.swahiliName}</p>
                      <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-stone-300 font-semibold">
                        {preset.id === 'heavy_rain' ? '🌧️ Traffic Jam +65%' : preset.id === 'foggy_morning' ? '🦁 Lions +35% Photo Bounty' : preset.id === 'golden_heatwave' ? '🐘 Herd Gathering' : '☀️ Standard Flow'}
                      </span>
                      <span className="text-amber-400 font-bold hover:underline">
                        Switch →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Weather cycles automatically every 3 minutes.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold transition-colors"
          >
            Close Forecast
          </button>
        </div>
      </div>
    </div>
  );
};
