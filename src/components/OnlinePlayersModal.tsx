import React from 'react';
import { OnlinePlayer } from '../types/game';
import { Users, Shield, Trophy, Radio, MessageSquare, Send, Sparkles, X } from 'lucide-react';

interface OnlinePlayersModalProps {
  players: OnlinePlayer[];
  playerUsername: string;
  playerNetWorth: number;
  onSendMessageToPlayer: (recipient: string) => void;
  onClose: () => void;
}

export const OnlinePlayersModal: React.FC<OnlinePlayersModalProps> = ({
  players,
  playerUsername,
  playerNetWorth,
  onSendMessageToPlayer,
  onClose,
}) => {
  // Sort players by net worth including current player
  const allPlayers = [
    ...players,
    {
      id: 'current_player',
      name: `${playerUsername} (You)`,
      title: 'Active Nairobi Adventurer',
      avatar: '🤠',
      netWorthKES: playerNetWorth,
      currentVehicle: 'matatu' as const,
      propertyCount: 1,
      location: 'Nairobi Central Sector',
      status: 'driving' as const,
      lastAction: 'Exploring open world markets and wildlife',
      isFriend: true,
    },
  ].sort((a, b) => b.netWorthKES - a.netWorthKES);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Matajiri wa Kenya: Online Moguls & Server Roster
              </h2>
              <p className="text-xs text-stone-400">
                Live players roaming Nairobi streets, piloting jets, and trading in Kenya.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-stone-300 font-mono">Server 01 · 64 Online</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Players Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Kenya Wealth Leaderboard (Net Worth in KES)
          </h3>

          <div className="space-y-2.5">
            {allPlayers.map((p, idx) => {
              const isUser = p.id === 'current_player';
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isUser
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40 shadow-md'
                      : 'bg-stone-800/40 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 text-center font-extrabold text-sm text-stone-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {p.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{p.name}</span>
                        {isUser && (
                          <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded font-extrabold">
                            YOU
                          </span>
                        )}
                        <span className="text-stone-500">·</span>
                        <span className="text-xs text-amber-300 font-medium">{p.title}</span>
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-2">
                        <span>{p.location}</span>
                        <span>·</span>
                        <span className="italic text-stone-300">"{p.lastAction}"</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-base font-extrabold text-emerald-400">
                        {p.netWorthKES.toLocaleString()} <span className="text-xs text-stone-400">KES</span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {p.propertyCount} Estates & Hangars
                      </span>
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => {
                          onSendMessageToPlayer(p.name);
                          onClose();
                        }}
                        className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                        title="Send Message / Trade Offer"
                      >
                        <MessageSquare size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
