import React, { useState } from 'react';
import { BuyableVehicle } from '../data/realEstateAndLuxury';
import { VehicleId } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Plane, Compass, Sparkles, Check, Gauge, Shield, DollarSign, X } from 'lucide-react';

interface LuxuryDealershipModalProps {
  vehicles: BuyableVehicle[];
  currentVehicle: VehicleId;
  playerCash: number;
  onBuyVehicle: (vehicle: BuyableVehicle) => void;
  onDeployVehicle: (vehicleId: VehicleId) => void;
  onClose: () => void;
}

export const LuxuryDealershipModal: React.FC<LuxuryDealershipModalProps> = ({
  vehicles,
  currentVehicle,
  playerCash,
  onBuyVehicle,
  onDeployVehicle,
  onClose,
}) => {
  const [filter, setFilter] = useState<'all' | 'car' | 'aircraft' | 'bike'>('all');

  const filteredVehicles = vehicles.filter(
    v => filter === 'all' || v.category === filter || (filter === 'car' && v.category === 'commercial')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Plane size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Westlands Motors & Wilson Airport Aviation Hangar
              </h2>
              <p className="text-xs text-stone-400">
                Acquire luxury vehicles, executive private jets, and safari VIP helicopters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-right">
              <span className="text-[10px] text-stone-400 block font-medium">Available Cash</span>
              <span className="text-base font-extrabold text-emerald-400">
                {playerCash.toLocaleString()} <span className="text-xs text-stone-400">KES</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex gap-2 px-6 py-3 border-b border-stone-800 bg-stone-950/40 text-xs font-semibold">
          {[
            { id: 'all', label: 'All Fleet Models' },
            { id: 'aircraft', label: 'Private Jets & VIP Choppers ✈️' },
            { id: 'car', label: 'Luxury Cars & Matatus 🚙' },
            { id: 'bike', label: 'Boda Bodas 🛵' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                filter === tab.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vehicle Fleet Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVehicles.map(veh => {
            const isCurrentlyActive = currentVehicle === veh.id;
            const canAfford = playerCash >= veh.priceKES;

            return (
              <div
                key={veh.id}
                className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                  isCurrentlyActive
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-xl'
                    : veh.isOwned
                    ? 'bg-stone-800/40 border-stone-700'
                    : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {veh.category.toUpperCase()}
                    </span>
                    {veh.isOwned ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check size={13} /> Owned in Fleet
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-amber-300">
                        {veh.priceKES.toLocaleString()} KES
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white">{veh.name}</h3>
                  <p className="text-xs text-stone-400 italic mt-0.5">{veh.swahiliTitle}</p>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                    {veh.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-[11px] text-stone-300">
                    {veh.features.map((f, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-stone-400">
                        <span className="text-amber-400">✓</span> {f}
                      </div>
                    ))}
                  </div>

                  {/* Specifications */}
                  <div className="mt-3 p-2 bg-stone-950/40 rounded-lg border border-stone-800/80 flex items-center justify-between text-xs text-stone-400">
                    <div className="flex items-center gap-1.5">
                      <Gauge size={14} className="text-amber-400" />
                      <span>Top Speed: <strong className="text-white">{veh.topSpeedKmH} km/h</strong></span>
                    </div>
                    <span>Hangar: <strong className="text-stone-300">{veh.hangarLocation}</strong></span>
                  </div>
                </div>

                {/* Action button */}
                <div className="mt-4 pt-3 border-t border-stone-800/80">
                  {veh.isOwned ? (
                    <button
                      onClick={() => {
                        onDeployVehicle(veh.id);
                        onClose();
                      }}
                      disabled={isCurrentlyActive}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isCurrentlyActive
                          ? 'bg-stone-800 text-stone-500 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
                      }`}
                    >
                      {isCurrentlyActive ? 'Currently Piloting / Driving' : 'Deploy to Nairobi'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyVehicle(veh)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                        canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {canAfford ? `Acquire for ${veh.priceKES.toLocaleString()} KES` : 'Insufficient Funds'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
