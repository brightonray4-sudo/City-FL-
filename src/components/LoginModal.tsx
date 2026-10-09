import React, { useState } from 'react';
import { User, ShieldCheck, Check, Sparkles, LogIn, Award, X } from 'lucide-react';

export interface UserProfile {
  username: string;
  avatar: string;
  title: string;
  joinDate: string;
}

interface LoginModalProps {
  currentUser: UserProfile;
  playerCash: number;
  netWorth: number;
  propertiesOwnedCount: number;
  vehiclesOwnedCount: number;
  onSaveProfile: (profile: UserProfile) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  currentUser,
  playerCash,
  netWorth,
  propertiesOwnedCount,
  vehiclesOwnedCount,
  onSaveProfile,
  onClose,
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [title, setTitle] = useState(currentUser.title);

  const availableAvatars = ['🤠', '👑', '🎩', '👨🏾‍✈️', '🚐', '🧕🏾', '🧔🏾', '🧢'];
  const titles = [
    'Nairobi Urban Hustler',
    'Savannah Safari Pioneer',
    'Westlands Motor Tycoon',
    'Karen Estate Mogul',
    'East Africa High-Flyer (Tajiri)',
  ];

  const handleSave = () => {
    if (!username.trim()) return;
    onSaveProfile({
      username: username.trim(),
      avatar,
      title,
      joinDate: currentUser.joinDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <LogIn size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-display">
                Nairobi Online Citizen & Mogul ID
              </h2>
              <p className="text-xs text-stone-400">
                Log in or customize your Kenyan trader and pilot profile.
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

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          
          {/* Current Profile Summary Card */}
          <div className="p-4 bg-gradient-to-r from-stone-950 to-stone-900 border border-amber-500/30 rounded-xl flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-stone-800 border-2 border-amber-400/80 flex items-center justify-center text-3xl shadow-inner">
              {avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white">{username || 'Anonymous Trader'}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <span className="text-xs text-amber-400 font-semibold block">{title}</span>
              <div className="flex items-center gap-3 mt-1.5 text-[11px] text-stone-400">
                <span>Net Worth: <strong className="text-emerald-400">{netWorth.toLocaleString()} KES</strong></span>
                <span>·</span>
                <span>Estates: <strong className="text-white">{propertiesOwnedCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
              Citizen / Pilot Call-Sign
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="e.g. Captain_Kimani, Boss_Wanjiku..."
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-4 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Avatar Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
              Choose Avatar
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {availableAvatars.map(av => (
                <button
                  key={av}
                  onClick={() => setAvatar(av)}
                  className={`w-11 h-11 rounded-xl text-2xl flex items-center justify-center border transition-all ${
                    avatar === av
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40 scale-105'
                      : 'bg-stone-950 border-stone-800 hover:border-stone-600'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Title Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider block">
              Kenyan Mogul Clan / Title
            </label>
            <select
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-xs text-stone-200 font-semibold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {titles.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Server Connection Badge */}
          <div className="bg-stone-950/80 p-3 rounded-xl border border-stone-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-300">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Nairobi Central Cloud Server (East Africa Region)</span>
            </div>
            <span className="font-mono text-emerald-400 font-bold text-[11px]">CONNECTED · 18ms</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-colors"
          >
            Save & Enter Nairobi
          </button>
        </div>
      </div>
    </div>
  );
};
