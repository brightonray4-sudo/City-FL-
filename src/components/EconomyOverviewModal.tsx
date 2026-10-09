import React, { useState } from 'react';
import { Marketplace, TradeItem } from '../types/game';
import { TRADE_ITEMS, calculateBuyPrice, calculateSellPrice } from '../data/economy';
import { TrendingUp, DollarSign, Store, Sparkles, Navigation, ArrowRight, X } from 'lucide-react';

interface EconomyOverviewModalProps {
  markets: Marketplace[];
  playerCash: number;
  totalTrades: number;
  totalProfit: number;
  onClose: () => void;
  onFastTravel: (market: Marketplace) => void;
}

export const EconomyOverviewModal: React.FC<EconomyOverviewModalProps> = ({
  markets,
  playerCash,
  totalTrades,
  totalProfit,
  onClose,
  onFastTravel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const allItems = Object.values(TRADE_ITEMS);
  const categories = [
    { id: 'all', label: 'All Goods' },
    { id: 'fanicha', label: 'Fanicha (Furniture)' },
    { id: 'crafts', label: 'Crafts & Curios' },
    { id: 'spices_food', label: 'Food & Spices' },
    { id: 'textiles', label: 'Textiles' },
    { id: 'safari_gear', label: 'Safari Gear' },
    { id: 'gemstones', label: 'Gemstones' },
  ];

  const filteredItems = allItems.filter(
    item => selectedCategory === 'all' || item.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <TrendingUp size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Nairobi Commodity Exchange & Market Arbitrage
              </h2>
              <p className="text-xs text-stone-400">
                Live prices across 7 Nairobi markets, Fanicha workshops, and Savannah outposts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-stone-400 block">Net Trades</span>
              <span className="text-sm font-bold text-amber-400">{totalTrades} completed</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 px-3.5 py-1.5 rounded-xl text-right">
              <span className="text-[10px] text-stone-400 block">Total Profit</span>
              <span className="text-sm font-bold text-emerald-400">+{totalProfit.toLocaleString()} KES</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-stone-800 bg-stone-950/40">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Arbitrage Recommendations Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-emerald-950/40 border border-amber-500/30">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <Sparkles size={16} />
              <span>TOP ARBITRAGE ROUTES TODAY (HIGH PROFIT MARGINS):</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>🪑 Ngong Fanicha Table</span>
                    <ArrowRight size={12} className="text-stone-400" />
                    <span>Mara Border Gate</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Buy on Ngong Rd ~7,200 KES → Sell in Mara ~11,500 KES
                  </div>
                </div>
                <span className="font-extrabold text-emerald-400 text-sm shrink-0 ml-3">
                  +4,300 KES / unit
                </span>
              </div>

              <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>☕ Mount Kenya AA Coffee</span>
                    <ArrowRight size={12} className="text-stone-400" />
                    <span>Maasai Market / Mara</span>
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    Buy in City Market ~760 KES → Sell in Mara ~1,380 KES
                  </div>
                </div>
                <span className="font-extrabold text-emerald-400 text-sm shrink-0 ml-3">
                  +620 KES / bag (+81%)
                </span>
              </div>
            </div>
          </div>

          {/* Commodity Price Matrix */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Commodity Price Index across Nairobi & Savannah
            </h3>

            <div className="space-y-3">
              {filteredItems.map(item => {
                let bestBuyMarket: { market: Marketplace; price: number } | null = null;
                let bestSellMarket: { market: Marketplace; price: number } | null = null;

                for (const m of markets) {
                  const bPrice = calculateBuyPrice(m, item.id);
                  const sPrice = calculateSellPrice(m, item.id);

                  if (!bestBuyMarket || bPrice < bestBuyMarket.price) {
                    bestBuyMarket = { market: m, price: bPrice };
                  }
                  if (!bestSellMarket || sPrice > bestSellMarket.price) {
                    bestSellMarket = { market: m, price: sPrice };
                  }
                }

                const buyMarketName = bestBuyMarket ? (bestBuyMarket as { market: Marketplace; price: number }).market.name.split(' ')[0] : 'N/A';
                const buyMarketPrice = bestBuyMarket ? (bestBuyMarket as { market: Marketplace; price: number }).price.toLocaleString() : '0';
                const sellMarketName = bestSellMarket ? (bestSellMarket as { market: Marketplace; price: number }).market.name.split(' ')[0] : 'N/A';
                const sellMarketPrice = bestSellMarket ? (bestSellMarket as { market: Marketplace; price: number }).price.toLocaleString() : '0';

                return (
                  <div
                    key={item.id}
                    className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl hover:border-stone-700 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <div className="font-bold text-sm text-white">{item.name}</div>
                          <div className="text-xs text-stone-400 italic">{item.swahiliName}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Cheapest to Buy</span>
                          <span className="font-bold text-amber-300">
                            {buyMarketName} ({buyMarketPrice} KES)
                          </span>
                        </div>
                        <div className="bg-stone-900/90 px-3 py-1.5 rounded-lg border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Best Place to Sell</span>
                          <span className="font-bold text-emerald-400">
                            {sellMarketName} ({sellMarketPrice} KES)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fast Travel / Market Locations Directory */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Trade Hub Directory & Fast Travel
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {markets.map(m => (
                <div
                  key={m.id}
                  className="p-3.5 bg-stone-950/60 border border-stone-800 rounded-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                        {m.district}
                      </span>
                      <span className="text-lg">{m.merchant.avatar}</span>
                    </div>
                    <h4 className="font-bold text-sm text-white mt-1">{m.name}</h4>
                    <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                      {m.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onFastTravel(m);
                      onClose();
                    }}
                    className="mt-3 w-full py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Navigation size={13} />
                    Travel to Market
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
