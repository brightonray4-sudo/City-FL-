import React, { useState, useEffect } from 'react';
import { soundManager } from '../audio/soundManager';
import { Radio, Volume2, VolumeX, Music, SkipForward } from 'lucide-react';

export const RadioPlayer: React.FC = () => {
  const [station, setStation] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const stations = [
    { id: 1, name: 'Radio Maisha 102.7 FM', genre: 'Afrobeat & Benga Groove' },
    { id: 2, name: 'Nairobi Wave 105.5', genre: 'Gengetone & Urban Bass' },
    { id: 3, name: 'Savannah Winds FM', genre: 'Acoustic Kalimba & Nature' },
  ];

  const currentStationInfo = stations.find(s => s.id === station) || stations[0];

  const handleTogglePlay = () => {
    if (isPlaying) {
      soundManager.stopRadio();
      setIsPlaying(false);
    } else {
      soundManager.startRadio(station);
      setIsPlaying(true);
    }
  };

  const handleNextStation = () => {
    const next = (station % 3) + 1;
    setStation(next);
    if (isPlaying) {
      soundManager.startRadio(next);
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMute(nextMuted);
  };

  return (
    <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-stone-900/90 border border-stone-700/80 shadow-2xl backdrop-blur-md text-stone-100 select-none">
      
      {/* Equalizer animation */}
      <button
        onClick={handleTogglePlay}
        className="w-8 h-8 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 flex items-center justify-center transition-colors shrink-0"
        title={isPlaying ? 'Pause Nairobi Radio' : 'Play Nairobi Radio'}
      >
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 bg-amber-400 h-3 animate-pulse"></span>
            <span className="w-0.5 bg-amber-400 h-2 animate-bounce"></span>
            <span className="w-0.5 bg-amber-400 h-3.5 animate-pulse"></span>
          </div>
        ) : (
          <Radio size={15} />
        )}
      </button>

      {/* Station Information */}
      <div className="hidden sm:block min-w-32 max-w-44">
        <div className="text-[11px] font-bold text-white truncate">
          {isPlaying ? currentStationInfo.name : 'Radio Tuner (Off)'}
        </div>
        <div className="text-[9px] text-stone-400 truncate">
          {isPlaying ? currentStationInfo.genre : 'Click play for live beats'}
        </div>
      </div>

      {/* Station switcher */}
      <button
        onClick={handleNextStation}
        className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
        title="Switch Radio Station"
      >
        <SkipForward size={14} />
      </button>

      {/* Mute */}
      <button
        onClick={handleToggleMute}
        className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isMuted ? <VolumeX size={14} className="text-rose-400" /> : <Volume2 size={14} />}
      </button>
    </div>
  );
};
