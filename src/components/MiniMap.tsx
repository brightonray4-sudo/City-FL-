import React from 'react';
import { Marketplace, WildlifeEntity, TrafficBottleneck } from '../types/game';
import { Compass, AlertTriangle } from 'lucide-react';

interface MiniMapProps {
  playerPos: { x: number; z: number; heading: number };
  markets: Marketplace[];
  wildlife: WildlifeEntity[];
  bottlenecks?: TrafficBottleneck[];
  onMarketClick?: (market: Marketplace) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({
  playerPos,
  markets,
  wildlife,
  bottlenecks = [],
  onMarketClick,
}) => {
  // World bounds: -250 to 180 on X, -250 to 120 on Z
  // MiniMap coordinate mapping
  const mapWidth = 160;
  const mapHeight = 160;
  const worldRadius = 240;

  const toMapCoord = (wx: number, wz: number) => {
    // Relative to player
    const dx = wx - playerPos.x;
    const dz = wz - playerPos.z;

    const mx = (mapWidth / 2) + (dx / worldRadius) * (mapWidth / 2);
    const my = (mapHeight / 2) + (dz / worldRadius) * (mapHeight / 2);

    return { x: Math.max(8, Math.min(mapWidth - 8, mx)), y: Math.max(8, Math.min(mapHeight - 8, my)) };
  };

  return (
    <div className="relative w-44 h-44 rounded-2xl bg-stone-950/85 border-2 border-stone-700/80 shadow-2xl backdrop-blur-md overflow-hidden p-1.5 select-none">
      
      {/* Background Grid & Biome Separation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="w-full h-full border border-stone-600 rounded-xl grid grid-cols-4 grid-rows-4"></div>
      </div>

      {/* Biome label tags */}
      <div className="absolute top-1.5 left-2 text-[9px] font-bold text-amber-500/80 tracking-widest uppercase">
        SAVANNAH
      </div>
      <div className="absolute top-1.5 right-2 text-[9px] font-bold text-cyan-400/80 tracking-widest uppercase">
        NAIROBI
      </div>

      {/* Compass Heading Indicator */}
      <div className="absolute bottom-1 right-2 text-[9px] font-mono text-stone-500">
        N 0°
      </div>

      {/* SVG Canvas for Map Radar */}
      <svg className="w-full h-full" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
        {/* Radar Range Rings */}
        <circle cx={mapWidth / 2} cy={mapHeight / 2} r={35} fill="none" stroke="rgba(255,255,255,0.06)" />
        <circle cx={mapWidth / 2} cy={mapHeight / 2} r={65} fill="none" stroke="rgba(255,255,255,0.06)" />

        {/* Active Localized Traffic Bottlenecks (Pulsing Red Gridlock Zones) */}
        {bottlenecks.filter(b => b.active).map(b => {
          const pt = toMapCoord(b.position.x, b.position.z);
          return (
            <g key={b.id}>
              {/* Outer pulsing congestion aura */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={16}
                fill="rgba(239, 68, 68, 0.22)"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="3 2"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={5}
                fill="#ef4444"
              />
              <text
                x={pt.x}
                y={pt.y - 7}
                fontSize="8"
                fill="#fca5a5"
                textAnchor="middle"
                fontWeight="bold"
              >
                JAM
              </text>
            </g>
          );
        })}

        {/* Wildlife Entities (Animal dots) */}
        {wildlife.map(w => {
          const pt = toMapCoord(w.position.x, w.position.z);
          return (
            <circle
              key={w.id}
              cx={pt.x}
              cy={pt.y}
              r={2.5}
              fill="#fbbf24"
              opacity={0.8}
            >
              <title>{w.swahiliName}</title>
            </circle>
          );
        })}

        {/* Market Places Pins */}
        {markets.map(m => {
          const pt = toMapCoord(m.worldPos.x, m.worldPos.z);
          return (
            <g
              key={m.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => onMarketClick && onMarketClick(m)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={m.color}
                stroke="#ffffff"
                strokeWidth={1}
              />
            </g>
          );
        })}

        {/* Player Cursor & Direction Arrow */}
        <g transform={`translate(${mapWidth / 2}, ${mapHeight / 2}) rotate(${(-playerPos.heading * 180) / Math.PI})`}>
          {/* Direction Cone */}
          <polygon points="0,-10 6,6 -6,6" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          <circle cx="0" cy="0" r="3" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
};
