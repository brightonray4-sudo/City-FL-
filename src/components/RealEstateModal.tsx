import React, { useState } from 'react';
import { RealEstateProperty, InventorySlot } from '../types/game';
import { TRADE_ITEMS } from '../data/economy';
import { soundManager } from '../audio/soundManager';
import { Home, Sparkles, Navigation, DollarSign, PlusCircle, CheckCircle, Shield, X } from 'lucide-react';

interface RealEstateModalProps {
  properties: RealEstateProperty[];
  playerCash: number;
  playerInventory: InventorySlot[];
  onBuyProperty: (property: RealEstateProperty) => void;
  onFurnishProperty: (propertyId: string, fanichaItemId: string) => void;
  onCollectRent: () => void;
  onFastTravel: (pos: { x: number; z: number }) => void;
  onClose: () => void;
}

export const RealEstateModal: React.FC<RealEstateModalProps> = ({
  properties,
  playerCash,
  playerInventory,
  onBuyProperty,
  onFurnishProperty,
  onCollectRent,
  onFastTravel,
  onClose,
}) => {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || properties[0];
  const totalDailyRent = properties.filter(p => p.isOwned).reduce((acc, p) => acc + p.dailyIncomeKES, 0);

  // Filter player inventory for Fanicha furniture items
  const fanichaInInventory = playerInventory.filter(slot => {
    const item = TRADE_ITEMS[slot.itemId];
    return item && item.category === 'fanicha';
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Home size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Kenya Prime Properties & Estates Agency
              </h2>
              <p className="text-xs text-stone-400">
                Acquire luxury mansions in Karen and Runda, Kilimani penthouses, and Mara safari lodges.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {totalDailyRent > 0 && (
              <button
                onClick={onCollectRent}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <DollarSign size={14} />
                Collect Rent (+{totalDailyRent.toLocaleString()} KES)
              </button>
            )}
            <div className="bg-stone-950 px-4 py-2 rounded-xl border border-stone-800 text-right">
              <span className="text-[10px] text-stone-400 block font-medium">Player Cash</span>
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

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Properties Directory */}
          <div className="md:col-span-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Kenyan Property Portfolio
            </h3>

            <div className="space-y-2.5">
              {properties.map(p => {
                const isSelected = p.id === selectedProperty?.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPropertyId(p.id)}
                    className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-lg'
                        : p.isOwned
                        ? 'bg-emerald-950/20 border-emerald-700/60'
                        : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-amber-400">
                        {p.location}
                      </span>
                      {p.isOwned && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          ✓ Owned Estate
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-white mt-0.5">{p.name}</h4>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-stone-400">
                        Rent: <strong className="text-emerald-400">+{p.dailyIncomeKES.toLocaleString()} KES/day</strong>
                      </span>
                      <span className="font-extrabold text-amber-300">
                        {p.isOwned ? 'Acquired' : `${p.priceKES.toLocaleString()} KES`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Property Details & Furnishing */}
          {selectedProperty && (
            <div className="md:col-span-7 bg-stone-950/60 border border-stone-800 rounded-xl p-5 flex flex-col justify-between space-y-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-amber-400 tracking-wider">
                      {selectedProperty.category.toUpperCase()} · {selectedProperty.location}
                    </span>
                    {selectedProperty.isOwned ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={14} /> Registered in Deeds
                      </span>
                    ) : (
                      <span className="text-base font-extrabold text-white">
                        {selectedProperty.priceKES.toLocaleString()} KES
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1 font-display">
                    {selectedProperty.name}
                  </h3>
                  <p className="text-xs text-stone-400 italic">{selectedProperty.swahiliTitle}</p>
                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                    {selectedProperty.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 text-xs text-stone-300">
                  {selectedProperty.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-stone-300">
                      <span className="text-amber-400">★</span> {f}
                    </div>
                  ))}
                </div>

                {/* Furnished Fanicha Section */}
                <div className="pt-3 border-t border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={14} /> Handcrafted Fanicha Furnishings:
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {selectedProperty.furnishedItems.length} installed (+{selectedProperty.furnishedItems.length * 15}% bonus rent)
                    </span>
                  </div>

                  {/* List of currently installed fanichas */}
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.furnishedItems.length === 0 ? (
                      <div className="text-xs text-stone-500 italic">
                        No custom Fanicha furniture installed yet. Add Ngong mahogany tables or Lamu chests to increase rental dividends!
                      </div>
                    ) : (
                      selectedProperty.furnishedItems.map((fId, idx) => {
                        const item = TRADE_ITEMS[fId];
                        return (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-xs text-stone-200 flex items-center gap-1.5"
                          >
                            <span>{item?.icon || '🪑'}</span>
                            <span className="font-medium">{item?.name || fId}</span>
                          </span>
                        );
                      })
                    )}
                  </div>

                  {/* Available Fanichas in player cargo to install */}
                  {selectedProperty.isOwned && fanichaInInventory.length > 0 && (
                    <div className="mt-2.5 p-3 rounded-lg bg-stone-900/80 border border-amber-500/30">
                      <span className="text-[11px] text-stone-300 block mb-1.5 font-semibold">
                        Install Fanicha from Cargo to boost rent:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {fanichaInInventory.map(slot => {
                          const item = TRADE_ITEMS[slot.itemId];
                          if (!item) return null;
                          return (
                            <button
                              key={slot.itemId}
                              onClick={() => onFurnishProperty(selectedProperty.id, slot.itemId)}
                              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1 transition-colors"
                            >
                              <PlusCircle size={13} />
                              Install {item.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-800 flex items-center gap-3">
                {selectedProperty.isOwned ? (
                  <>
                    <button
                      onClick={() => {
                        onFastTravel(selectedProperty.worldPos);
                        onClose();
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Navigation size={14} /> Fast Travel to Estate
                    </button>
                    <div className="text-right shrink-0 text-xs">
                      <span className="text-stone-400 block">Daily Dividend:</span>
                      <strong className="text-emerald-400 font-extrabold text-sm">
                        +{selectedProperty.dailyIncomeKES.toLocaleString()} KES
                      </strong>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => onBuyProperty(selectedProperty)}
                    disabled={playerCash < selectedProperty.priceKES}
                    className={`w-full py-3 rounded-xl text-xs font-bold transition-all ${
                      playerCash >= selectedProperty.priceKES
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    {playerCash >= selectedProperty.priceKES
                      ? `Purchase ${selectedProperty.name} (${selectedProperty.priceKES.toLocaleString()} KES)`
                      : 'Insufficient KES Funds to Purchase'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
