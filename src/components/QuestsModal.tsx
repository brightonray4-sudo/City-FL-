import React from 'react';
import { Quest, InventorySlot, WildlifePhoto } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Award, CheckCircle, Clock, MapPin, Package, Camera, X } from 'lucide-react';

interface QuestsModalProps {
  quests: Quest[];
  playerInventory: InventorySlot[];
  recentPhotos: WildlifePhoto[];
  onCompleteQuest: (questId: string) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  quests,
  playerInventory,
  recentPhotos,
  onCompleteQuest,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Nairobi City & Safari Missions
              </h2>
              <p className="text-xs text-stone-400">
                Complete delivery orders, take wildlife photos, and earn high KES payouts!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Quest List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
          {quests.map(q => {
            // Check completion criteria
            let canTurnIn = false;
            if (q.type === 'delivery' && q.targetItemId) {
              const slot = playerInventory.find(i => i.itemId === q.targetItemId);
              canTurnIn = (slot?.quantity || 0) >= (q.targetQuantity || 1);
            } else if (q.type === 'wildlife_photo' && q.targetAnimal) {
              const photo = recentPhotos.find(p => p.animalSpecies.toLowerCase().includes(q.targetAnimal!));
              canTurnIn = !!photo;
            }

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border transition-all ${
                  q.completed
                    ? 'bg-stone-900/40 border-stone-800 opacity-60'
                    : canTurnIn
                    ? 'bg-emerald-950/20 border-emerald-500/60 ring-1 ring-emerald-500/30 shadow-lg'
                    : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {q.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-stone-500">·</span>
                      <span className="text-xs text-stone-400 font-medium">Client: {q.client}</span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-1">{q.title}</h3>
                    <p className="text-xs text-stone-300 leading-relaxed mt-1">
                      {q.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-extrabold text-amber-400">
                      +{q.rewardKES.toLocaleString()} <span className="text-xs text-stone-400">KES</span>
                    </div>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      +{q.rewardReputation} Rep
                    </span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                  <div className="text-xs text-stone-400 flex items-center gap-1.5">
                    {q.type === 'delivery' ? <Package size={14} className="text-amber-400" /> : <Camera size={14} className="text-emerald-400" />}
                    <span>
                      {q.completed ? 'Mission Completed' : canTurnIn ? 'Ready to Deliver / Claim!' : 'In Progress'}
                    </span>
                  </div>

                  {q.completed ? (
                    <span className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onCompleteQuest(q.id);
                        soundManager.playCashRegister();
                      }}
                      disabled={!canTurnIn}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        canTurnIn
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-stone-950 shadow-md'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      {canTurnIn ? 'Claim Reward' : 'Requirements Not Met'}
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
