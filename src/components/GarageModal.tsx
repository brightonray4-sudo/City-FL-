import React from 'react';
import { VehicleId } from '../types/game';
import { Truck, Car, Bike, Footprints, Gauge, Sparkles, Volume2, X } from 'lucide-react';
import matatuImg from '../assets/images/kenyan_matatu_art_1791414347069.jpg';
import cruiserImg from '../assets/images/safari_land_cruiser_1791414356912.jpg';

interface GarageModalProps {
  currentVehicle: VehicleId;
  onSelectVehicle: (vehicle: VehicleId) => void;
  onClose: () => void;
}

export const GarageModal: React.FC<GarageModalProps> = ({
  currentVehicle,
  onSelectVehicle,
  onClose,
}) => {
  const vehicles = [
    {
      id: 'matatu' as VehicleId,
      name: 'Custom "Nganya" Matatu',
      shengTitle: 'Route 58 Buruburu VIP Minibus',
      description: 'Loud twin air horns, flashing neon underglow, airbrushed street graffiti, and high road cruising speed along Nairobi expressway.',
      image: matatuImg,
      speedRating: 88,
      accelRating: 75,
      offroadRating: 40,
      cargoCapacity: 120, // kg
      hornSound: 'Twin-Tone High Trumpet Air Horn',
      icon: Truck,
      tag: 'Nairobi Urban Icon',
    },
    {
      id: 'cruiser' as VehicleId,
      name: '4x4 Safari Land Cruiser',
      shengTitle: 'Mara Marauder Expedition 4WD',
      description: 'Heavy duty high-clearance off-roader with open pop-up observation roof hatch for wildlife spotting and camera aiming.',
      image: cruiserImg,
      speedRating: 72,
      accelRating: 68,
      offroadRating: 95,
      cargoCapacity: 160, // kg
      hornSound: 'Deep Safari Horn',
      icon: Car,
      tag: 'Wildlife Safari Specialist',
    },
    {
      id: 'bodaboda' as VehicleId,
      name: 'Boda Boda Motorcycle',
      shengTitle: 'Boxer 150cc Alley Navigator',
      description: 'Ultra-agile two-wheeler. Zips through narrow Gikomba market alleys, dodges traffic jams, and climbs savannah hills with ease.',
      image: null,
      speedRating: 92,
      accelRating: 90,
      offroadRating: 70,
      cargoCapacity: 45, // kg
      hornSound: 'Electric Beeper',
      icon: Bike,
      tag: 'Traffic Slicer',
    },
    {
      id: 'foot' as VehicleId,
      name: 'On Foot / Ranger Mode',
      shengTitle: 'Pedestrian & Scout',
      description: 'Walk or run freely on foot. Maximum stealth when approaching wild lions and giraffes, and easy browsing of market stalls.',
      image: null,
      speedRating: 30,
      accelRating: 95,
      offroadRating: 85,
      cargoCapacity: 25, // kg
      hornSound: 'Voice Whistle',
      icon: Footprints,
      tag: 'Stealth & Exploration',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white font-display">
              Nairobi Motor Depot & Safari Garage
            </h2>
            <p className="text-xs text-stone-400">
              Select your vehicle for navigating Nairobi traffic or exploring the wild savannah.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Vehicle Selection Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map(v => {
            const isSelected = currentVehicle === v.id;
            const Icon = v.icon;

            return (
              <div
                key={v.id}
                className={`relative rounded-xl border p-4 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-xl'
                    : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/80 hover:border-stone-700'
                }`}
              >
                <div>
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      {v.tag}
                    </span>
                    {isSelected && (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Sparkles size={13} /> Active Ride
                      </span>
                    )}
                  </div>

                  {/* Thumbnail / High-Fidelity Asset */}
                  {v.image ? (
                    <div className="w-full h-36 rounded-lg overflow-hidden mb-3 border border-stone-700/60 relative">
                      <img
                        src={v.image}
                        alt={v.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-xs font-bold text-white drop-shadow">{v.shengTitle}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-24 rounded-lg bg-stone-900/80 border border-stone-800 flex items-center justify-center mb-3">
                      <Icon size={36} className="text-amber-400/80" />
                    </div>
                  )}

                  <h3 className="text-base font-bold text-white">{v.name}</h3>
                  <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                    {v.description}
                  </p>

                  {/* Stats Breakdown */}
                  <div className="mt-3 space-y-1.5 text-xs bg-stone-950/60 p-2.5 rounded-lg border border-stone-800">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Top Speed:</span>
                      <div className="w-24 bg-stone-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-amber-400 h-full rounded-full" style={{ width: `${v.speedRating}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-400">Off-Road Traction:</span>
                      <div className="w-24 bg-stone-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${v.offroadRating}%` }}></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-stone-400 pt-1 border-t border-stone-800/60">
                      <span>Cargo Limit: <strong>{v.cargoCapacity} kg</strong></span>
                      <span>Horn: <strong>{v.hornSound}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectVehicle(v.id);
                    onClose();
                  }}
                  disabled={isSelected}
                  className={`mt-4 w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-stone-800 text-stone-500 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                  }`}
                >
                  {isSelected ? 'Currently Deployed' : `Deploy ${v.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
