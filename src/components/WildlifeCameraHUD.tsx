import React, { useState } from 'react';
import { WildlifeEntity, WildlifePhoto } from '../types/game';
import { soundManager } from '../audio/soundManager';
import { Camera, ZoomIn, ZoomOut, CheckCircle2, Award, Sparkles, Image as ImageIcon, X } from 'lucide-react';

interface WildlifeCameraHUDProps {
  animalInView: WildlifeEntity | null;
  animalDistance: number;
  onSnapPhoto: (photo: WildlifePhoto) => void;
  onCloseCamera: () => void;
  onZoomChange: (zoom: number) => void;
  recentPhotos: WildlifePhoto[];
}

export const WildlifeCameraHUD: React.FC<WildlifeCameraHUDProps> = ({
  animalInView,
  animalDistance,
  onSnapPhoto,
  onCloseCamera,
  onZoomChange,
  recentPhotos,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.5);
  const [lastSnapped, setLastSnapped] = useState<WildlifePhoto | null>(null);
  const [showGallery, setShowGallery] = useState<boolean>(false);

  const handleZoom = (newZoom: number) => {
    const clamped = Math.max(1.0, Math.min(4.5, newZoom));
    setZoomLevel(clamped);
    onZoomChange(clamped);
  };

  const handleSnap = () => {
    soundManager.playCameraShutter();

    if (animalInView) {
      // Calculate quality based on distance and zoom
      // Optimal distance is 15 - 30m with good zoom
      const distanceScore = Math.max(20, Math.min(100, 100 - Math.abs(animalDistance - 20) * 2.5));
      const zoomScore = Math.min(100, zoomLevel * 30);
      const quality = Math.round(distanceScore * 0.7 + zoomScore * 0.3);

      const reward = Math.round(animalInView.basePhotoValue * (quality / 100));

      const newPhoto: WildlifePhoto = {
        id: `photo_${Date.now()}`,
        animalSpecies: animalInView.species.toUpperCase(),
        animalSwahili: animalInView.swahiliName,
        quality,
        kesReward: reward,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Savannah Reserve & Great Rift Horizon',
        notes: animalInView.funFact,
      };

      setLastSnapped(newPhoto);
      onSnapPhoto(newPhoto);
      soundManager.playCashRegister();
    } else {
      // Landscape photo
      const landscapePhoto: WildlifePhoto = {
        id: `photo_${Date.now()}`,
        animalSpecies: 'SAVANNAH LANDSCAPE',
        animalSwahili: 'Mandhari ya Pori la Kenya',
        quality: 65,
        kesReward: 450,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        location: 'Great Rift Valley Plains',
        notes: 'Panoramic golden acacia vista with Mt. Kenya silhouette.',
      };
      setLastSnapped(landscapePhoto);
      onSnapPhoto(landscapePhoto);
      soundManager.playCashRegister();
    }
  };

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-6 select-none animate-fade-in">
      
      {/* Viewfinder Overlay Frame */}
      <div className="absolute inset-4 md:inset-10 border-2 border-white/20 rounded-3xl pointer-events-none overflow-hidden">
        {/* Rule of Thirds Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-20">
          <div className="border-r border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-r border-b border-white"></div>
          <div className="border-b border-white"></div>
          <div className="border-r border-white"></div>
          <div className="border-r border-white"></div>
          <div></div>
        </div>

        {/* Center Autofocus Brackets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-28 h-28 border-2 transition-all duration-300 rounded-xl flex items-center justify-center ${
            animalInView ? 'border-amber-400 scale-105 shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'border-white/40'
          }`}>
            <div className={`w-2 h-2 rounded-full ${animalInView ? 'bg-amber-400 animate-ping' : 'bg-white/40'}`}></div>
          </div>
        </div>

        {/* Corner Viewfinder Markings */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/60"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/60"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/60"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/60"></div>
      </div>

      {/* Top Header HUD Bar */}
      <div className="relative z-10 flex items-center justify-between text-white pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
          <Camera size={18} className="text-amber-400 animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            SAFARI TELEPHOTO OPTICS · 400mm F/2.8
          </span>
          <span className="text-stone-500">|</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">
            ZOOM: {zoomLevel.toFixed(1)}x
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGallery(!showGallery)}
            className="px-3.5 py-2 rounded-xl bg-black/60 hover:bg-stone-800 text-stone-200 border border-white/10 text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-colors"
          >
            <ImageIcon size={16} />
            Photo Gallery ({recentPhotos.length})
          </button>
          <button
            onClick={onCloseCamera}
            className="p-2 rounded-xl bg-black/60 hover:bg-stone-800 text-white border border-white/10 backdrop-blur-md transition-colors"
            title="Exit Viewfinder"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Target Animal Lock-On Display (if in sight) */}
      <div className="relative z-10 flex flex-col items-center">
        {animalInView ? (
          <div className="bg-black/75 backdrop-blur-md border border-amber-400/80 px-6 py-3 rounded-2xl text-center shadow-2xl animate-fade-in pointer-events-auto max-w-md">
            <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-0.5">
              <Sparkles size={14} />
              <span>Target Locked: {animalInView.species.toUpperCase()}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white font-display">
              {animalInView.swahiliName} <span className="text-sm font-normal text-stone-400 italic">({animalInView.scientificName})</span>
            </h3>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-stone-300">
              <span>Distance: <strong className="text-white">{animalDistance}m</strong></span>
              <span>·</span>
              <span>Bounty: <strong className="text-emerald-400">+{animalInView.basePhotoValue} KES</strong></span>
            </div>
            <p className="text-[11px] text-stone-300 mt-2 italic bg-stone-900/60 p-2 rounded-lg border border-stone-800">
              "{animalInView.funFact}"
            </p>
          </div>
        ) : (
          <div className="bg-black/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10 text-[11px] text-stone-300 font-mono">
            Scanning for wildlife... Aim at Lions, Giraffes, Elephants, or Zebras!
          </div>
        )}
      </div>

      {/* Bottom Shutter & Zoom Control Bar */}
      <div className="relative z-10 flex items-center justify-between pointer-events-auto">
        {/* Zoom Controls */}
        <div className="bg-black/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
          <button
            onClick={() => handleZoom(zoomLevel - 0.5)}
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors"
          >
            <ZoomOut size={18} />
          </button>
          <input
            type="range"
            min="1.0"
            max="4.0"
            step="0.2"
            value={zoomLevel}
            onChange={e => handleZoom(parseFloat(e.target.value))}
            className="w-28 accent-amber-500 cursor-pointer"
          />
          <button
            onClick={() => handleZoom(zoomLevel + 0.5)}
            className="p-1.5 hover:bg-stone-800 rounded-lg text-stone-300 hover:text-white transition-colors"
          >
            <ZoomIn size={18} />
          </button>
          <span className="text-xs font-mono font-bold text-amber-300">{zoomLevel.toFixed(1)}x</span>
        </div>

        {/* Big Shutter Trigger Button */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleSnap}
            className="w-20 h-20 rounded-full bg-white hover:bg-stone-200 border-4 border-amber-500 shadow-[0_0_25px_rgba(251,191,36,0.6)] flex items-center justify-center transition-transform active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-full bg-stone-900 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Camera size={26} className="text-amber-400" />
            </div>
          </button>
          <span className="text-[11px] text-stone-300 font-bold uppercase tracking-widest mt-2 drop-shadow">
            Snap Photo [Space]
          </span>
        </div>

        {/* Last Photo Snapped Flash Card */}
        <div className="w-52">
          {lastSnapped && (
            <div className="bg-stone-900/90 border border-emerald-500/50 p-2.5 rounded-xl shadow-xl text-left animate-fade-in text-stone-100">
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                <CheckCircle2 size={12} />
                <span>PHOTO SAVED!</span>
              </div>
              <div className="font-bold text-xs truncate mt-0.5">{lastSnapped.animalSwahili}</div>
              <div className="text-[10px] text-stone-400">Quality: {lastSnapped.quality}%</div>
              <div className="text-xs font-extrabold text-emerald-400 mt-0.5">
                +{lastSnapped.kesReward.toLocaleString()} KES Earned!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showGallery && (
        <div className="fixed inset-0 z-50 pointer-events-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl max-h-[80vh] bg-stone-900 border border-stone-700 rounded-2xl flex flex-col overflow-hidden text-stone-100">
            <div className="px-6 py-4 border-b border-stone-800 flex justify-between items-center bg-stone-950/80">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-amber-400" />
                <h3 className="text-lg font-bold text-white font-display">Wildlife Photography Portfolio</h3>
              </div>
              <button
                onClick={() => setShowGallery(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {recentPhotos.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">
                  No wildlife photos yet. Spot lions, giraffes, elephants, and rhinos to build your safari collection!
                </div>
              ) : (
                recentPhotos.map(p => (
                  <div key={p.id} className="p-4 bg-stone-800/60 border border-stone-700/80 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">{p.animalSwahili}</span>
                        <span className="text-xs text-amber-300 font-mono">[{p.animalSpecies}]</span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1 italic">{p.notes}</p>
                      <span className="text-[10px] text-stone-500 mt-1 block">Taken at {p.location} · {p.timestamp}</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="text-base font-extrabold text-emerald-400">+{p.kesReward} KES</div>
                      <div className="text-xs text-stone-400 font-medium">Rating: {p.quality}%</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
