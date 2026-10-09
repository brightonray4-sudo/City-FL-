import React, { useState } from 'react';
import { ChatMessage } from '../data/economy';
import { MessageSquare, Send, Radio, Sparkles, Volume2, Users, Compass } from 'lucide-react';

interface ChatOverlayProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, channel: 'all' | 'nairobi_cb' | 'safari_rangers' | 'market_rumors') => void;
  activeNpcProximity: { name: string; role: string; dialogue: string } | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatOverlay: React.FC<ChatOverlayProps> = ({
  messages,
  onSendMessage,
  activeNpcProximity,
  isOpen,
  onToggle,
}) => {
  const [activeChannel, setActiveChannel] = useState<'all' | 'nairobi_cb' | 'safari_rangers' | 'market_rumors'>('all');
  const [inputText, setInputText] = useState('');

  const filteredMessages = messages.filter(
    m => activeChannel === 'all' || m.channel === activeChannel || m.channel === 'all'
  );

  const quickReplies = [
    { label: 'Ask for Lion sighting', text: 'Niaje rangers, simba wameonekana wapi leo porini?', sheng: 'Where are the lions spotted today?' },
    { label: 'Trade Coffee offer', text: 'Niko na Highland Arabica Coffee ya kuuza! Nani anataka?', sheng: 'I have premium coffee to sell!' },
    { label: 'Fanicha inquiry', text: 'Fundi wa Ngong Road yuko wapi? Natafuta meza ya mahogany!', sheng: 'Looking for the mahogany furniture workshops!' },
    { label: 'Nairobi Greeting', text: 'Sasa wasee! Form ni gani hii mtaa leo?', sheng: 'Hey Nairobians, what is the plan today?' },
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;
    onSendMessage(text, activeChannel);
    setInputText('');
  };

  return (
    <>
      {/* Floating Toggle Button when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 left-6 z-40 flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-900/90 hover:bg-stone-800 text-stone-100 border border-amber-500/40 shadow-xl backdrop-blur-md transition-all hover:scale-105 group"
        >
          <div className="relative">
            <Radio size={18} className="text-amber-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <span className="text-xs font-bold tracking-wide">Nairobi CB Radio & Chat</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-400 font-mono">
            {messages.length}
          </span>
        </button>
      )}

      {/* Direct Proximity Banner when walking near an NPC */}
      {activeNpcProximity && !isOpen && (
        <div className="fixed bottom-20 left-6 z-40 max-w-sm p-3.5 bg-stone-900/95 border border-amber-500/50 rounded-2xl shadow-2xl backdrop-blur-md animate-bounce-subtle text-stone-100">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold mb-1">
            <Users size={14} />
            <span>Chatting with {activeNpcProximity.name} ({activeNpcProximity.role})</span>
          </div>
          <p className="text-xs text-stone-200 italic leading-relaxed">
            "{activeNpcProximity.dialogue}"
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-stone-400">Press [T] or click to open Street Chat</span>
            <button
              onClick={onToggle}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[10px] transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      )}

      {/* Full Chat Overlay Modal / Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-40 w-96 max-w-[92vw] h-[520px] flex flex-col bg-stone-900/95 border border-stone-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden text-stone-100">
          {/* Header */}
          <div className="px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={16} className="text-amber-400" />
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Nairobi CB & Street Chatter
                </h3>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
                  Live Frequency 105.5 MHz · EAT
                </span>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors text-xs"
            >
              ✕
            </button>
          </div>

          {/* Channels Selector */}
          <div className="flex border-b border-stone-800 bg-stone-950/40 p-1.5 gap-1 text-[11px]">
            {(
              [
                { id: 'all', label: 'All Feeds' },
                { id: 'nairobi_cb', label: 'Matatus' },
                { id: 'market_rumors', label: 'Markets' },
                { id: 'safari_rangers', label: 'Rangers' },
              ] as const
            ).map(ch => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex-1 py-1.5 px-2 rounded-lg font-medium transition-all ${
                  activeChannel === ch.id
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {filteredMessages.map(msg => {
              const isPlayer = msg.role === 'player';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isPlayer ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-7 h-7 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-sm shrink-0 shadow-sm">
                    {msg.avatar}
                  </div>
                  <div className={`max-w-[80%] rounded-xl p-2.5 text-xs ${
                    isPlayer
                      ? 'bg-amber-500/20 border border-amber-500/40 text-stone-100'
                      : 'bg-stone-800/70 border border-stone-700/60 text-stone-200'
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`font-bold text-[11px] ${
                        msg.role === 'ranger' ? 'text-lime-400' :
                        msg.role === 'merchant' ? 'text-amber-400' :
                        msg.role === 'matatu_crew' ? 'text-cyan-400' :
                        msg.role === 'radio_dj' ? 'text-rose-400' : 'text-stone-300'
                      }`}>
                        {msg.sender}
                      </span>
                      <span className="text-[9px] text-stone-500 font-mono">{msg.timeAgo}</span>
                    </div>
                    <p className="leading-snug">{msg.text}</p>
                    {msg.shengSubtext && (
                      <p className="text-[10px] text-stone-400 mt-1 pt-1 border-t border-stone-700/40 italic">
                        💡 {msg.shengSubtext}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Sheng Replies */}
          <div className="px-3 py-2 bg-stone-950/60 border-t border-stone-800">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block mb-1.5">
              Quick Sheng Broadcasts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickReplies.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qr.text)}
                  className="px-2 py-1 bg-stone-800 hover:bg-stone-700 hover:border-amber-500/40 border border-stone-700 rounded-md text-[10px] text-amber-300 transition-colors truncate max-w-full"
                  title={qr.sheng}
                >
                  {qr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input box */}
          <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Broadcast to Nairobi..."
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 transition-colors"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
