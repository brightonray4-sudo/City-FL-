import React, { useState } from 'react';
import { Marketplace, TradeItem, InventorySlot } from '../types/game';
import { TRADE_ITEMS, calculateBuyPrice, calculateSellPrice } from '../data/economy';
import { soundManager } from '../audio/soundManager';
import { TrendingUp, TrendingDown, Minus, ShoppingBag, ArrowRightLeft, ShieldCheck, Sparkles, X } from 'lucide-react';

interface MarketTradeModalProps {
  market: Marketplace;
  playerCash: number;
  playerInventory: InventorySlot[];
  onClose: () => void;
  onBuyItem: (itemId: string, quantity: number, pricePerUnit: number) => void;
  onSellItem: (itemId: string, quantity: number, pricePerUnit: number) => void;
}

export const MarketTradeModal: React.FC<MarketTradeModalProps> = ({
  market,
  playerCash,
  playerInventory,
  onClose,
  onBuyItem,
  onSellItem,
}) => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [selectedItemId, setSelectedItemId] = useState<string>(() => {
    const keys = Object.keys(market.inventory);
    return keys[0] || 'kenyan_aa_coffee';
  });
  const [tradeQuantity, setTradeQuantity] = useState<number>(1);
  const [bargainSuccess, setBargainSuccess] = useState<boolean | null>(null);
  const [bargainDiscount, setBargainDiscount] = useState<number>(0);

  const selectedItem: TradeItem | undefined = TRADE_ITEMS[selectedItemId];
  const marketListing = market.inventory[selectedItemId];
  const playerSlot = playerInventory.find(s => s.itemId === selectedItemId);

  // Prices
  const rawBuyPrice = calculateBuyPrice(market, selectedItemId);
  const buyPrice = Math.max(10, Math.round(rawBuyPrice * (1 - bargainDiscount)));
  const sellPrice = calculateSellPrice(market, selectedItemId);

  const maxAffordable = Math.floor(playerCash / Math.max(buyPrice, 1));
  const maxCanBuy = Math.min(marketListing?.stock || 0, maxAffordable);
  const maxCanSell = playerSlot?.quantity || 0;

  const handleBuy = () => {
    if (tradeQuantity <= 0 || tradeQuantity > maxCanBuy) return;
    onBuyItem(selectedItemId, tradeQuantity, buyPrice);
    soundManager.playCashRegister();
    setTradeQuantity(1);
    setBargainSuccess(null);
    setBargainDiscount(0);
  };

  const handleSell = () => {
    if (tradeQuantity <= 0 || tradeQuantity > maxCanSell) return;
    onSellItem(selectedItemId, tradeQuantity, sellPrice);
    soundManager.playCashRegister();
    setTradeQuantity(1);
  };

  const handleBargain = () => {
    const roll = Math.random();
    if (roll < market.merchant.bargainAffinity) {
      const discount = 0.12; // 12% discount
      setBargainDiscount(discount);
      setBargainSuccess(true);
    } else {
      setBargainSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden text-stone-100">
        
        {/* Header with Market District and Merchant Info */}
        <div 
          className="relative px-6 py-5 border-b border-stone-800 flex items-center justify-between"
          style={{ background: `linear-gradient(135deg, ${market.color}22 0%, #1c1917 100%)` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center text-3xl shadow-inner">
              {market.merchant.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-amber-400">
                  {market.district}
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-xs text-stone-400">{market.tagline}</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white font-display">
                {market.name}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5 italic flex items-center gap-1.5">
                <span className="font-semibold text-amber-200">{market.merchant.name} ({market.merchant.title}):</span>
                "{market.merchant.shengGreeting}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right bg-stone-950/80 px-4 py-2 rounded-xl border border-stone-800">
              <span className="text-xs text-stone-400 block font-medium">Your Wallet</span>
              <span className="text-lg font-extrabold text-emerald-400 tracking-tight">
                {playerCash.toLocaleString()} <span className="text-xs font-semibold text-stone-400">KES</span>
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => { setActiveTab('buy'); setTradeQuantity(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === 'buy'
                ? 'bg-stone-900 text-amber-400 border-t-2 border-amber-400'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <ShoppingBag size={16} />
            Buy from Market
          </button>
          <button
            onClick={() => { setActiveTab('sell'); setTradeQuantity(1); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all ${
              activeTab === 'sell'
                ? 'bg-stone-900 text-emerald-400 border-t-2 border-emerald-400'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
            }`}
          >
            <ArrowRightLeft size={16} />
            Sell Player Goods ({playerInventory.reduce((acc, i) => acc + i.quantity, 0)} items)
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-6 p-6">
          
          {/* Left Column: Listings Grid */}
          <div className="md:col-span-7 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              {activeTab === 'buy' ? 'Market Stock & Commodity Prices' : 'Your Inventory in Cargo'}
            </h3>

            {activeTab === 'buy' ? (
              <div className="space-y-2">
                {Object.entries(market.inventory).map(([itemId, listing]) => {
                  const item = TRADE_ITEMS[itemId];
                  if (!item) return null;
                  const itemBuyPrice = calculateBuyPrice(market, itemId);
                  const isSelected = selectedItemId === itemId;
                  const isDiscounted = itemBuyPrice < item.basePrice;

                  return (
                    <div
                      key={itemId}
                      onClick={() => { setSelectedItemId(itemId); setTradeQuantity(1); setBargainSuccess(null); }}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                          : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-lg bg-stone-800 flex items-center justify-center text-2xl">
                          {item.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-stone-100">{item.name}</span>
                            {listing.priceTrend === 'up' && (
                              <span className="flex items-center text-[10px] text-rose-400 font-medium">
                                <TrendingUp size={12} className="mr-0.5" /> High Demand
                              </span>
                            )}
                            {listing.priceTrend === 'down' && (
                              <span className="flex items-center text-[10px] text-emerald-400 font-medium">
                                <TrendingDown size={12} className="mr-0.5" /> Bargain
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400">{item.swahiliName}</span>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500">
                            <span>Stock: <strong className="text-stone-300">{listing.stock}</strong> units</span>
                            <span>·</span>
                            <span>Weight: {item.weight} kg</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-extrabold text-amber-400">
                          {itemBuyPrice.toLocaleString()} <span className="text-xs text-stone-400">KES</span>
                        </div>
                        <span className={`text-[11px] font-medium ${isDiscounted ? 'text-emerald-400' : 'text-stone-400'}`}>
                          Base: {item.basePrice.toLocaleString()} KES
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* SELL TAB: Player Inventory */
              <div className="space-y-2">
                {playerInventory.length === 0 ? (
                  <div className="p-8 text-center bg-stone-950/40 rounded-xl border border-stone-800 text-stone-400">
                    <p className="text-sm">You have no items in cargo. Buy local crafts, spices, or textiles to trade between markets!</p>
                  </div>
                ) : (
                  playerInventory.map(slot => {
                    const item = TRADE_ITEMS[slot.itemId];
                    if (!item) return null;
                    const itemSellPrice = calculateSellPrice(market, slot.itemId);
                    const profitPerUnit = itemSellPrice - slot.avgPurchasePrice;
                    const isProfit = profitPerUnit > 0;
                    const isSelected = selectedItemId === slot.itemId;

                    return (
                      <div
                        key={slot.itemId}
                        onClick={() => { setSelectedItemId(slot.itemId); setTradeQuantity(1); }}
                        className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                            : 'bg-stone-800/40 border-stone-800 hover:bg-stone-800/80 hover:border-stone-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-lg bg-stone-800 flex items-center justify-center text-2xl">
                            {item.icon}
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-stone-100">{item.name}</span>
                            <div className="text-xs text-stone-400 mt-0.5">
                              Quantity in Cargo: <strong className="text-white">{slot.quantity}</strong>
                            </div>
                            <div className="text-[11px] text-stone-500 mt-0.5">
                              Bought avg: {Math.round(slot.avgPurchasePrice)} KES
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-base font-extrabold text-emerald-400">
                            {itemSellPrice.toLocaleString()} <span className="text-xs text-stone-400">KES / unit</span>
                          </div>
                          <span className={`text-[11px] font-semibold flex items-center justify-end gap-0.5 ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? `+${Math.round(profitPerUnit)} KES profit` : `${Math.round(profitPerUnit)} KES margin`}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Right Column: Trade Terminal & Economy Impact */}
          <div className="md:col-span-5 bg-stone-950/60 border border-stone-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
            {selectedItem ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{selectedItem.icon}</span>
                    <div>
                      <h4 className="text-lg font-bold text-white">{selectedItem.name}</h4>
                      <p className="text-xs text-stone-400 italic">{selectedItem.swahiliName}</p>
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 mt-2.5 leading-relaxed bg-stone-900/60 p-2.5 rounded-lg border border-stone-800/80">
                    {selectedItem.description}
                  </p>
                </div>

                {/* Market Price Dynamics & Impact */}
                <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Unit Price:</span>
                    <span className="font-bold text-amber-300">
                      {(activeTab === 'buy' ? buyPrice : sellPrice).toLocaleString()} KES
                    </span>
                  </div>
                  {bargainDiscount > 0 && activeTab === 'buy' && (
                    <div className="flex justify-between items-center text-emerald-400 font-medium">
                      <span>Bargain Discount:</span>
                      <span>-12% ({Math.round(rawBuyPrice * 0.12)} KES off)</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Market Supply Influence:</span>
                    <span className="text-stone-300">
                      {activeTab === 'buy'
                        ? 'Purchases raise local price (+4%)'
                        : 'Sales lower local price (-3%)'}
                    </span>
                  </div>
                </div>

                {/* Bargain Button (Buy tab only) */}
                {activeTab === 'buy' && (
                  <div>
                    <button
                      onClick={handleBargain}
                      disabled={bargainSuccess !== null}
                      className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                        bargainSuccess === true
                          ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                          : bargainSuccess === false
                          ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                          : 'bg-stone-800 hover:bg-stone-700 border-stone-600 text-amber-300'
                      }`}
                    >
                      <Sparkles size={14} />
                      {bargainSuccess === true
                        ? 'Bargain Accepted! "Bei ya kuongea ipo!"'
                        : bargainSuccess === false
                        ? 'Merchant declined: "Hii ni bei ya mwisho ndugu!"'
                        : 'Haggle / Bargain in Sheng with Merchant'}
                    </button>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-stone-400">
                    <span>Trade Quantity:</span>
                    <span>Max: {activeTab === 'buy' ? maxCanBuy : maxCanSell}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setTradeQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center border border-stone-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={tradeQuantity}
                      onChange={e => setTradeQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 h-10 text-center bg-stone-900 border border-stone-700 rounded-lg font-bold text-white text-sm"
                      min={1}
                      max={activeTab === 'buy' ? maxCanBuy : maxCanSell}
                    />
                    <button
                      onClick={() => setTradeQuantity(q => Math.min(activeTab === 'buy' ? maxCanBuy : maxCanSell, q + 1))}
                      className="w-10 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-white font-bold flex items-center justify-center border border-stone-700"
                    >
                      +
                    </button>
                    <button
                      onClick={() => setTradeQuantity(activeTab === 'buy' ? maxCanBuy : maxCanSell)}
                      className="px-3 h-10 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-semibold border border-stone-700"
                    >
                      MAX
                    </button>
                  </div>
                </div>

                {/* Total Cost / Payout */}
                <div className="pt-2 border-t border-stone-800 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-stone-300">Total Transaction:</span>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">
                      {((activeTab === 'buy' ? buyPrice : sellPrice) * tradeQuantity).toLocaleString()}
                    </span>
                    <span className="text-xs text-stone-400 ml-1">KES</span>
                  </div>
                </div>

                {/* Execute Button */}
                {activeTab === 'buy' ? (
                  <button
                    onClick={handleBuy}
                    disabled={maxCanBuy === 0 || tradeQuantity > maxCanBuy}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 transition-all shadow-lg shadow-amber-500/20"
                  >
                    {tradeQuantity > maxAffordable
                      ? 'Insufficient KES Funds'
                      : maxCanBuy === 0
                      ? 'Out of Stock'
                      : `Purchase ${tradeQuantity} ${selectedItem.name}`}
                  </button>
                ) : (
                  <button
                    onClick={handleSell}
                    disabled={maxCanSell === 0 || tradeQuantity > maxCanSell}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {maxCanSell === 0 ? 'No Cargo to Sell' : `Sell ${tradeQuantity} for KES`}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-stone-500 text-xs">
                Select an item on the left to trade
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
