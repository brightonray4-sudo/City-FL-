import React, { useState } from 'react';
import { BookOpen, Sparkles, MapPin, Feather, X } from 'lucide-react';
import skylineImg from '../assets/images/nairobi_cbd_skyline_1791414326192.jpg';
import savannahImg from '../assets/images/kenya_savannah_wildlife_1791414336751.jpg';

interface FieldGuideModalProps {
  onClose: () => void;
}

export const FieldGuideModal: React.FC<FieldGuideModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'wildlife' | 'nairobi' | 'fanicha' | 'sheng'>('wildlife');

  const wildlifeEntries = [
    {
      name: 'Simba (African Lion)',
      scientific: 'Panthera leo',
      status: 'Vulnerable',
      description: 'The apex predator of the African savannah. Lions live in social prides led by seasoned females and dominant black-maned males. Nairobi National Park is one of the only places on Earth where wild free-ranging lions roam against a modern skyscraper backdrop.',
      tips: 'Photograph lions in early morning or dusk near waterholes. Keep a respectful distance when driving vehicles.',
    },
    {
      name: 'Twiga (Maasai Giraffe)',
      scientific: 'Giraffa camelopardalis tippelskirchi',
      status: 'Endangered',
      description: 'The world’s tallest land mammal, recognized by irregular jagged star-like blotches. With 45-centimeter prehensile tongues, giraffes feed gracefully on thorny umbrella acacia branches.',
      tips: 'Approach in 4x4 Safari Cruiser with pop-up roof for optimal upward photography angles.',
    },
    {
      name: 'Tembo (African Bush Elephant)',
      scientific: 'Loxodonta africana',
      status: 'Endangered',
      description: 'The largest terrestrial animal on Earth. Highly intelligent matriarchal herds navigate ancient migratory corridors across Kenya, communicating via seismic infrasound vibrations.',
      tips: 'Approach with caution; elephants are peaceful grazers but will trumpet and flare ears if cut off by speeding vehicles.',
    },
    {
      name: 'Kifaru (Black Rhinoceros)',
      scientific: 'Diceros bicornis',
      status: 'Critically Endangered',
      description: 'Armored prehistoric browser with a hooked upper lip for grasping woody shrubs. Kenya leads Africa in black rhino conservation sanctuaries.',
      tips: 'Extremely rare. Highest photography bounty rewards if captured in viewfinder!',
    },
  ];

  const shengGlossary = [
    { term: 'Niaje / Supa', translation: 'What’s up? / How are you doing?' },
    { term: 'Form ni gani?', translation: 'What is the plan / deal today?' },
    { term: 'Nganya', translation: 'Custom pimped-out vibrant Nairobi Matatu' },
    { term: 'Fanicha', translation: 'Handcrafted timber and cane furniture' },
    { term: 'Chapa lapa', translation: 'Run fast / make a quick move' },
    { term: 'Bei ya kuongea', translation: 'Negotiable price / good bargain' },
    { term: 'Mahindi Choma', translation: 'Charcoal-roasted corn with lime and chili' },
    { term: 'Kiondo', translation: 'Traditional handwoven sisal tote bag' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-stone-100">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-stone-900 border border-stone-700/80 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-display">
                Kenyan Field Guide & Cultural Codex
              </h2>
              <p className="text-xs text-stone-400">
                Explore Kenya’s wildlife heritage, Nairobi architecture, Fanicha timber crafts, and Sheng dialect.
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

        {/* Tab switcher */}
        <div className="flex border-b border-stone-800 bg-stone-950/40 px-6 pt-2.5 gap-2 text-xs font-semibold">
          {[
            { id: 'wildlife', label: 'Savannah Wildlife' },
            { id: 'nairobi', label: 'Nairobi Landmarks' },
            { id: 'fanicha', label: 'Fanicha & Timber Guilds' },
            { id: 'sheng', label: 'Sheng Street Glossary' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-t-xl transition-all ${
                activeTab === t.id
                  ? 'bg-stone-900 text-amber-400 border-t-2 border-amber-400'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'wildlife' && (
            <div className="space-y-6">
              {/* Feature Landscape Banner */}
              <div className="w-full h-48 rounded-xl overflow-hidden relative border border-stone-700/80">
                <img
                  src={savannahImg}
                  alt="Kenyan Savannah Wildlife"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/30 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">The Great Rift & Maasai Mara Plains</h3>
                    <p className="text-xs text-stone-300">
                      Home to the greatest wildlife spectacles on planet Earth.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wildlifeEntries.map((w, idx) => (
                  <div key={idx} className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm text-white">{w.name}</h4>
                      <span className="text-[10px] text-amber-400 font-mono italic">
                        {w.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-400 block italic">{w.scientific}</span>
                    <p className="text-xs text-stone-300 leading-relaxed">{w.description}</p>
                    <div className="text-[11px] text-emerald-400 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40">
                      💡 <strong>Photography Tip:</strong> {w.tips}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nairobi' && (
            <div className="space-y-6">
              <div className="w-full h-48 rounded-xl overflow-hidden relative border border-stone-700/80">
                <img
                  src={skylineImg}
                  alt="Nairobi Skyline at Sunset"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/30 to-transparent flex items-end p-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Nairobi: The Green City in the Sun</h3>
                    <p className="text-xs text-stone-300">
                      East Africa's economic powerhouse, cultural crossroads, and tech epicenter.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-sm text-white">Kenyatta International Convention Centre (KICC)</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Designed by Karl Henrik Nøstvik and David Mutiso in 1973, its 28-story terracotta ribbed cylinder tower and conical amphitheater reflect traditional African architecture with a 360-degree helipad overlook.
                  </p>
                </div>
                <div className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-sm text-white">Nairobi Expressway & Uhuru Highway</h4>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    A 27-kilometer elevated modern viaduct soaring above the bustling central traffic, connecting Jomo Kenyatta International Airport to Westlands and the Great Rift escarpment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fanicha' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-stone-800/40 border border-stone-800 rounded-xl space-y-2">
                <h3 className="text-sm font-bold text-amber-300">
                  The Kenyan "Fanicha" (Furniture) Carpentry Heritage
                </h3>
                <p className="text-stone-300 leading-relaxed">
                  Across Nairobi, open-air roadside workshops—most famously along Ngong Road, Kamukunji, and Kariokor—are celebrated hubs of artisanal woodcraft. Master carpenters ("Mafundi") transform seasoned African mahogany, cedar, cypress, and wrought iron into heirloom pieces.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                    <strong className="text-white block">Ngong Road Mahogany Tables</strong>
                    <span className="text-stone-400">
                      Hand-chiseled from solid African mahogany with natural beeswax polish.
                    </span>
                  </div>
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                    <strong className="text-white block">Lamu Brass-Studded Chests</strong>
                    <span className="text-stone-400">
                      Centuries-old Swahili coast woodcarving with intricate floral rosettes and secret drawers.
                    </span>
                  </div>
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                    <strong className="text-white block">Teak Safari Director Chairs</strong>
                    <span className="text-stone-400">
                      Foldable heavy canvas and weathered teak armchairs tailored for savannah camps.
                    </span>
                  </div>
                  <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800">
                    <strong className="text-white block">Kamukunji Cane & Iron Daybeds</strong>
                    <span className="text-stone-400">
                      Interwoven natural river cane and hand-welded wrought iron verandah loungers.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sheng' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-400">
                Sheng is Nairobi’s vibrant, ever-evolving urban language blend of Swahili, English, and indigenous Kenyan dialects spoken across matatus, stages, and street markets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {shengGlossary.map((item, idx) => (
                  <div key={idx} className="p-3 bg-stone-800/40 border border-stone-800 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-sm text-amber-300">{item.term}</span>
                    <span className="text-xs text-stone-300 text-right">{item.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
